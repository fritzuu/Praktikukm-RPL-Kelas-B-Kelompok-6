<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\CampusActivityService;
use App\Models\ChangeRequest;
use App\Models\Notification;
use App\Models\NotificationRecipient;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\ScheduleOverride;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MahasiswaController extends Controller
{
    public function __construct(
        private readonly CampusActivityService $campusActivity
    ) {}

    /**
     * Dashboard overview — main page.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $semester = Semester::active();

        // Summary counts for dashboard cards
        $totalRequests    = $semester ? ChangeRequest::where('requester_id', $user->id)->where('semester_id', $semester->id)->count() : 0;
        $pendingRequests  = $semester ? ChangeRequest::where('requester_id', $user->id)->where('semester_id', $semester->id)->whereIn('status', ['PENDING_ASLAB', 'PENDING_ADMIN'])->count() : 0;
        $approvedRequests = $semester ? ChangeRequest::where('requester_id', $user->id)->where('semester_id', $semester->id)->where('status', 'APPROVED')->count() : 0;
        $rejectedRequests = $semester ? ChangeRequest::where('requester_id', $user->id)->where('semester_id', $semester->id)->whereIn('status', ['REJECTED_ASLAB', 'REJECTED_ADMIN'])->count() : 0;

        // Recent requests (latest 5)
        $recentRequests = $semester
            ? ChangeRequest::with(['schedule.course', 'schedule.room', 'proposedRoom'])
                ->where('requester_id', $user->id)
                ->where('semester_id', $semester->id)
                ->latest()
                ->take(5)
                ->get()
            : collect();

        $schedules = $this->getSchedulesData($semester);
        $rooms = Room::where('is_active', true)->orderBy('code')->get(['id', 'code', 'name', 'capacity', 'building']);

        return Inertia::render('Dashboard/Mahasiswa', [
            'semester' => $semester,
            'stats' => [
                'totalRequests'    => $totalRequests,
                'pendingRequests'  => $pendingRequests,
                'approvedRequests' => $approvedRequests,
                'rejectedRequests' => $rejectedRequests,
            ],
            'recentRequests' => $recentRequests,
            'schedules' => $schedules,
            'rooms' => $rooms,
            'campusWidgets' => $this->campusActivity->buildPayload($semester),
        ]);
    }

    /**
     * Helper to get formatted schedules.
     */
    private function getSchedulesData($semester)
    {
        if (!$semester) {
            return collect();
        }

        return Schedule::with([
            'course', 
            'room', 
            'overrides' => fn ($q) => $q->where('is_active', true)->with(['room', 'changeRequest']), 
            'teachingAssignments.user'
        ])
        ->where('semester_id', $semester->id)
        ->where('is_active', true)
        ->get()
        ->map(fn ($s) => [
            'id'         => (string) $s->id,
            'kode'       => $s->course->code,
            'nama'       => $s->course->name,
            'kelas'      => $s->course->class_name,
            'semesterNum'=> $s->course->description,
            'ruangan'    => $s->room->code,
            'hari'       => strtolower($s->day_of_week),
            'sesiMulai'  => $s->session_start,
            'durasi'     => $s->session_duration,
            'dosen'      => $s->teachingAssignments->where('role_in_class', 'PENGAJAR')->first()?->user->name ?? '-',
            'mulai'      => substr($s->start_time, 0, 5),
            'selesai'    => substr($s->end_time, 0, 5),
            'tipe'       => 'resmi',
            'overrides'  => $s->overrides->map(fn ($o) => [
                'id'          => $o->id,
                'tanggal'     => $o->override_date->format('Y-m-d'),
                'hari_baru'   => $o->new_day_of_week ? strtolower($o->new_day_of_week) : null,
                'mulai_baru'  => substr($o->new_start_time, 0, 5),
                'selesai_baru' => substr($o->new_end_time, 0, 5),
                'ruangan_baru' => $o->room->code ?? null,
                'tipe'        => $o->changeRequest?->request_type === 'TEMPORARY' ? 'temp' : 'permanent',
            ]),
        ])
        ->values();
    }

    /**
     * Schedule page — weekly calendar view.
     */
    public function jadwal(Request $request)
    {
        $semester = Semester::active();
        $schedules = $this->getSchedulesData($semester);
        $rooms = Room::where('is_active', true)->orderBy('code')->get(['id', 'code', 'name', 'capacity', 'building']);

        return Inertia::render('Dashboard/Mahasiswa/Jadwal', [
            'schedules' => $schedules,
            'rooms'     => $rooms,
            'semester'  => $semester,
        ]);
    }

    /**
     * Check available room slots for a given day and time range.
     */
    public function cekSlot(Request $request)
    {
        $request->validate([
            'hari'       => 'required|in:SENIN,SELASA,RABU,KAMIS,JUMAT,SABTU',
            'mulai'      => 'required|date_format:H:i',
            'selesai'    => 'required|date_format:H:i|after:mulai',
            'tanggal'    => 'nullable|date',
        ]);

        $semester = Semester::active();
        if (!$semester) {
            return response()->json(['slots' => [], 'message' => 'Tidak ada semester aktif.']);
        }

        $day      = $request->hari;
        $start    = $request->mulai;
        $end      = $request->selesai;
        $date     = $request->tanggal;

        $allRooms = Room::where('is_active', true)->get();

        // Get occupied rooms on this day/time from baseline schedules
        $occupiedRoomIds = Schedule::where('semester_id', $semester->id)
            ->where('is_active', true)
            ->where('day_of_week', $day)
            ->where(function ($q) use ($start, $end) {
                $q->where(function ($inner) use ($start, $end) {
                    $inner->where('start_time', '<', $end)
                          ->where('end_time', '>', $start);
                });
            })
            ->pluck('room_id');

        // If a specific date is given, also check overrides
        $overrideOccupied = collect();
        if ($date) {
            $overrideOccupied = ScheduleOverride::where('is_active', true)
                ->where('override_date', $date)
                ->where(function ($q) use ($start, $end) {
                    $q->where('new_start_time', '<', $end)
                      ->where('new_end_time', '>', $start);
                })
                ->pluck('room_id');
        }

        $busyIds = $occupiedRoomIds->merge($overrideOccupied)->unique();

        $available = $allRooms->filter(fn ($room) => !$busyIds->contains($room->id))
            ->values()
            ->map(fn ($r) => [
                'id'       => $r->id,
                'code'     => $r->code,
                'name'     => $r->name,
                'capacity' => $r->capacity,
                'building' => $r->building,
            ]);

        return response()->json(['slots' => $available]);
    }

    /**
     * Submit a schedule change request (Temporary or Permanent).
     */
    public function submitRequest(Request $request)
    {
        $validated = $request->validate([
            'schedule_id'        => 'required|exists:schedules,id',
            'request_type'       => 'required|in:TEMPORARY,PERMANENT',
            'target_date'        => 'required_if:request_type,TEMPORARY|nullable|date|after_or_equal:today',
            'effective_from_date' => 'required_if:request_type,PERMANENT|nullable|date|after_or_equal:today',
            'proposed_day'       => 'nullable|in:SENIN,SELASA,RABU,KAMIS,JUMAT,SABTU',
            'proposed_start_time' => 'nullable|date_format:H:i',
            'proposed_end_time'  => 'nullable|date_format:H:i|after:proposed_start_time',
            'proposed_room_id'   => 'nullable|exists:rooms,id',
            'reason'             => 'required|string|min:20',
        ]);

        $user = $request->user();
        $semester = Semester::active();

        if (!$semester) {
            return back()->withErrors(['semester' => 'Tidak ada semester aktif.']);
        }

        // Conflict check
        $hasConflict = false;
        $alternatives = [];

        if ($validated['proposed_day'] && $validated['proposed_start_time'] && $validated['proposed_end_time']) {
            $conflicting = Schedule::where('semester_id', $semester->id)
                ->where('is_active', true)
                ->where('day_of_week', $validated['proposed_day'])
                ->where('room_id', $validated['proposed_room_id'] ?? Schedule::find($validated['schedule_id'])->room_id)
                ->where(function ($q) use ($validated) {
                    $q->where('start_time', '<', $validated['proposed_end_time'])
                      ->where('end_time', '>', $validated['proposed_start_time']);
                })
                ->where('id', '!=', $validated['schedule_id'])
                ->exists();

            if ($conflicting) {
                $hasConflict = true;

                // Find 3 alternative slots
                $targetRoomId = $validated['proposed_room_id'] ?? Schedule::find($validated['schedule_id'])->room_id;
                $availableRooms = Room::where('is_active', true)
                    ->where('id', '!=', $targetRoomId)
                    ->get();

                foreach ($availableRooms->take(3) as $room) {
                    $roomConflict = Schedule::where('semester_id', $semester->id)
                        ->where('is_active', true)
                        ->where('day_of_week', $validated['proposed_day'])
                        ->where('room_id', $room->id)
                        ->where(function ($q) use ($validated) {
                            $q->where('start_time', '<', $validated['proposed_end_time'])
                              ->where('end_time', '>', $validated['proposed_start_time']);
                        })
                        ->exists();

                    if (!$roomConflict) {
                        $alternatives[] = [
                            'room_id'   => $room->id,
                            'room_code' => $room->code,
                            'room_name' => $room->name,
                            'day'       => $validated['proposed_day'],
                            'start'     => $validated['proposed_start_time'],
                            'end'       => $validated['proposed_end_time'],
                        ];
                    }
                }
            }
        }

        $changeRequest = ChangeRequest::create([
            'request_code'        => ChangeRequest::generateCode(),
            'requester_id'        => $user->id,
            'schedule_id'         => $validated['schedule_id'],
            'semester_id'         => $semester->id,
            'request_type'        => $validated['request_type'],
            'target_date'         => $validated['target_date'] ?? null,
            'effective_from_date' => $validated['effective_from_date'] ?? null,
            'proposed_day'        => $validated['proposed_day'] ?? null,
            'proposed_start_time' => $validated['proposed_start_time'] ?? null,
            'proposed_end_time'   => $validated['proposed_end_time'] ?? null,
            'proposed_room_id'    => $validated['proposed_room_id'] ?? null,
            'reason'              => $validated['reason'],
            'status'              => 'PENDING_ASLAB',
            'conflict_checked'    => true,
            'has_conflict'        => $hasConflict,
        ]);

        return back()->with([
            'success'      => 'Request berhasil diajukan dengan kode: ' . $changeRequest->request_code,
            'hasConflict'  => $hasConflict,
            'alternatives' => $alternatives,
        ]);
    }

    /**
     * Request history page.
     */
    public function requests(Request $request)
    {
        $user = $request->user();
        $semester = Semester::active();

        $requests = $semester
            ? ChangeRequest::with(['schedule.course', 'schedule.room', 'proposedRoom', 'approvals.actor'])
                ->where('requester_id', $user->id)
                ->where('semester_id', $semester->id)
                ->latest()
                ->paginate(10)
            : collect();

        $schedules = $semester
            ? Schedule::with(['course', 'room'])
                ->where('semester_id', $semester->id)
                ->where('is_active', true)
                ->get()
            : collect();

        $rooms = Room::where('is_active', true)->orderBy('code')->get(['id', 'code', 'name']);

        return Inertia::render('Dashboard/Mahasiswa/Requests', [
            'requests'  => $requests,
            'schedules' => $schedules,
            'rooms'     => $rooms,
            'semester'  => $semester,
        ]);
    }

    /**
     * Notifications page.
     */
    public function notifications(Request $request)
    {
        $user = $request->user();

        $notifications = NotificationRecipient::with(['notification.changeRequest', 'notification.triggeredBy'])
            ->where('recipient_id', $user->id)
            ->whereHas('notification')
            ->latest('notification_id')
            ->paginate(15)
            ->through(fn ($nr) => [
                'id'        => $nr->id,
                'notif_id'  => $nr->notification_id,
                'title'     => $nr->notification->title,
                'body'      => $nr->notification->body,
                'type'      => $nr->notification->type,
                'channel'   => $nr->channel,
                'is_read'   => $nr->is_read,
                'read_at'   => $nr->read_at?->format('Y-m-d H:i'),
                'created_at' => $nr->notification->created_at?->diffForHumans(),
                'request_code' => $nr->notification->changeRequest?->request_code,
            ]);

        return Inertia::render('Dashboard/Mahasiswa/Notifications', [
            'notifications' => $notifications,
        ]);
    }



    /**
     * Settings page.
     */
    public function settings(Request $request)
    {
        return Inertia::render('Dashboard/Mahasiswa/Settings', [
            'user' => [
                'id'         => $request->user()->id,
                'name'       => $request->user()->name,
                'email'      => $request->user()->email,
                'nim_nip'    => $request->user()->nim_nip,
                'avatar_url' => $request->user()->avatar_url,
                'fcm_token'  => $request->user()->fcm_token ? true : false,
            ],
        ]);
    }

    /**
     * Update settings (profile).
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:150',
            'email' => 'required|email|max:191|unique:users,email,' . $request->user()->id,
        ]);

        $request->user()->update($validated);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    /**
     * Update password.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $request->user()->update([
            'password' => bcrypt($validated['password']),
        ]);

        return back()->with('success', 'Password berhasil diubah.');
    }

    /**
     * Dashboard widgets data — empty rooms + live campus stats (JSON refresh).
     */
    public function dashboardWidgets(Request $request)
    {
        $semester = Semester::active();

        return response()->json(
            $this->campusActivity->buildPayload($semester)
        );
    }

    /**
     * AI Assistant - read-only query endpoint.
     */
    public function aiQuery(Request $request)
    {
        $request->validate([
            'query' => 'required|string|max:500',
        ]);

        $query   = strtolower($request->query('query', $request->input('query')));
        $semester = Semester::active();

        // Simple rule-based AI responses for mahasiswa role
        $response = $this->processAiQuery($query, $semester);

        return response()->json([
            'answer' => $response,
            'type'   => 'text',
        ]);
    }

    /**
     * Process AI query with simple rule-based logic.
     */
    private function processAiQuery(string $query, ?Semester $semester): string
    {
        if (!$semester) {
            return 'Maaf, tidak ada semester aktif saat ini. Silakan hubungi admin.';
        }

        if (str_contains($query, 'jadwal') || str_contains($query, 'schedule')) {
            $count = Schedule::where('semester_id', $semester->id)->where('is_active', true)->count();
            return "Pada semester {$semester->name}, terdapat {$count} jadwal aktif. Kamu bisa melihat detailnya di halaman Jadwal.";
        }

        if (str_contains($query, 'slot') || str_contains($query, 'kosong') || str_contains($query, 'ruang')) {
            $roomCount = Room::where('is_active', true)->count();
            return "Saat ini terdapat {$roomCount} ruangan aktif. Gunakan fitur 'Cek Slot Kosong' di halaman Jadwal untuk melihat ketersediaan berdasarkan hari dan waktu.";
        }

        if (str_contains($query, 'request') || str_contains($query, 'pengajuan') || str_contains($query, 'ajukan')) {
            return "Untuk mengajukan perubahan jadwal, buka halaman 'Requests' dan klik 'Ajukan Request Baru'. Kamu bisa memilih tipe Temporary (1x tanggal) atau Permanent (sisa semester).";
        }

        if (str_contains($query, 'status') || str_contains($query, 'tracking')) {
            return "Status request mengikuti pipeline: PENDING_ASLAB → FORWARDED → APPROVED/REJECTED. Kamu bisa memantau semua status di halaman 'Requests'.";
        }

        if (str_contains($query, 'notifikasi') || str_contains($query, 'notification')) {
            return "Notifikasi akan dikirim otomatis saat ada perubahan status request atau perubahan jadwal. Kamu bisa melihat semua notifikasi di halaman 'Notifikasi'.";
        }

        return "Halo! Saya adalah AI Assistant SARS. Saya bisa membantu kamu dengan informasi tentang jadwal, slot kosong, pengajuan request, dan notifikasi. Silakan tanyakan sesuatu yang spesifik!";
    }
}
