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
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MahasiswaController extends Controller
{
    private const SESSION_TIMES_NORMAL = [
        1 => ['07:30', '08:20'],
        2 => ['08:25', '09:15'],
        3 => ['09:20', '10:10'],
        4 => ['10:15', '11:05'],
        5 => ['11:10', '12:00'],
        6 => ['13:00', '13:50'],
        7 => ['13:55', '14:45'],
        8 => ['15:30', '16:20'],
        9 => ['16:25', '17:15'],
        10 => ['18:00', '18:50'],
        11 => ['18:55', '19:20'],
    ];

    private const SESSION_TIMES_JUMAT = [
        1 => ['07:30', '08:20'],
        2 => ['08:25', '09:15'],
        3 => ['09:20', '10:10'],
        4 => ['10:15', '11:05'],
        5 => ['13:00', '13:50'],
        6 => ['13:55', '14:45'],
        7 => ['15:30', '16:20'],
        8 => ['16:25', '17:15'],
        9 => ['18:00', '18:50'],
        10 => ['18:55', '19:20'],
        11 => ['19:25', '20:15'],
    ];

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
            'proposed_day'       => 'nullable|in:SENIN,SELASA,RABU,KAMIS,JUMAT',
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
            $targetRoomId = $validated['proposed_room_id'] ?? Schedule::find($validated['schedule_id'])->room_id;
            
            $conflictReason = $this->checkSlotConflict(
                $validated['schedule_id'],
                $semester->id,
                $validated['proposed_day'],
                $validated['proposed_start_time'],
                $validated['proposed_end_time'],
                $targetRoomId,
                $validated['target_date'] ?? null
            );

            if ($conflictReason) {
                $hasConflict = true;

                // Find 3 alternative slots using other rooms
                $availableRooms = Room::where('is_active', true)
                    ->where('id', '!=', $targetRoomId)
                    ->get();

                foreach ($availableRooms->take(3) as $room) {
                    $conflict = $this->checkSlotConflict(
                        $validated['schedule_id'],
                        $semester->id,
                        $validated['proposed_day'],
                        $validated['proposed_start_time'],
                        $validated['proposed_end_time'],
                        $room->id,
                        $validated['target_date'] ?? null
                    );

                    if (!$conflict) {
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
            ? Schedule::with(['course', 'room', 'teachingAssignments.user'])
                ->where('semester_id', $semester->id)
                ->where('is_active', true)
                ->get()
            : collect();

        $rooms = Room::where('is_active', true)->orderBy('code')->get(['id', 'code', 'name', 'capacity', 'building', 'type']);

        return Inertia::render('Dashboard/Mahasiswa/Requests', [
            'requests'  => $requests,
            'schedules' => $schedules,
            'rooms'     => $rooms,
            'semester'  => $semester,
        ]);
    }

    /**
     * Generate meeting dates for a given schedule.
     * Returns all dates matching the schedule's day_of_week within the active semester range.
     */
    public function meetingDates(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
        ]);

        $semester = Semester::active();
        if (!$semester) {
            return response()->json(['dates' => [], 'message' => 'Tidak ada semester aktif.']);
        }

        $schedule = Schedule::with('course')->findOrFail($request->schedule_id);
        $dayOfWeek = $schedule->day_of_week;

        // Map day names to Carbon day constants
        $dayMap = [
            'SENIN' => Carbon::MONDAY,
            'SELASA' => Carbon::TUESDAY,
            'RABU' => Carbon::WEDNESDAY,
            'KAMIS' => Carbon::THURSDAY,
            'JUMAT' => Carbon::FRIDAY,
        ];

        $carbonDay = $dayMap[$dayOfWeek] ?? null;
        if (!$carbonDay) {
            return response()->json(['dates' => []]);
        }

        $today = Carbon::today();
        $semesterStart = Carbon::parse($semester->start_date);
        $semesterEnd = Carbon::parse($semester->end_date);

        // Start from whichever is later: today or semester start
        $start = $today->greaterThan($semesterStart) ? $today->copy() : $semesterStart->copy();

        // Find the first matching day of week from start
        $current = $start->copy();
        while ($current->dayOfWeek !== $carbonDay) {
            $current->addDay();
        }

        $dates = [];
        $months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        $dayNames = [
            'SENIN' => 'Senin', 'SELASA' => 'Selasa', 'RABU' => 'Rabu',
            'KAMIS' => 'Kamis', 'JUMAT' => 'Jumat',
        ];
        $dayLabel = $dayNames[$dayOfWeek] ?? $dayOfWeek;

        while ($current->lte($semesterEnd)) {
            $dates[] = [
                'date' => $current->format('Y-m-d'),
                'label' => $dayLabel . ', ' . $current->day . ' ' . $months[$current->month - 1] . ' ' . $current->year,
            ];
            $current->addWeek();
        }

        return response()->json(['dates' => $dates]);
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
            'user' => $request->user(),
        ]);
    }

    /**
     * Update settings (profile + photo).
     */
    public function updateSettings(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'  => 'required|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user->name = $request->name;

        if ($request->hasFile('photo')) {
            if ($user->avatar_url && str_contains($user->avatar_url, '/storage/avatars/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar_url));
            }

            $path = $request->file('photo')->store('avatars', 'public');
            $user->avatar_url = Storage::url($path);
        }

        $user->save();

        return redirect()->back()->with('success', 'Profil berhasil diperbarui.');
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

    /**
     * Checks if a proposed slot has conflicts.
     * Returns null if clean, or a string describing the conflict reason if there is one.
     *
     * Bug fixes applied:
     * - Time values normalized to HH:MM:SS for consistent SQL comparison
     * - Outgoing overrides: baseline schedules that are overridden OUT of the room
     *   on the given $date are skipped (they no longer occupy the original slot)
     */
    private function checkSlotConflict(
        int $scheduleId,
        int $semesterId,
        string $day,
        string $startTime,
        string $endTime,
        int $roomId,
        ?string $date = null
    ): ?string {
        // Normalize times to HH:MM:SS for consistent DB comparison
        $startTime = $this->normalizeTimeToFull($startTime);
        $endTime = $this->normalizeTimeToFull($endTime);

        $schedule = Schedule::with('course')->findOrFail($scheduleId);

        // Build list of schedule IDs that have outgoing overrides on this date
        // (these baselines are moved AWAY from their original room/day, so they don't conflict)
        $outgoingOverrideIds = [];
        if ($date) {
            $outgoingOverrideIds = ScheduleOverride::where('is_active', true)
                ->where('override_date', $date)
                ->pluck('schedule_id')
                ->toArray();
        }

        // 1. Room conflict check
        $roomConflictQuery = Schedule::where('semester_id', $semesterId)
            ->where('is_active', true)
            ->where('room_id', $roomId)
            ->where('day_of_week', $day)
            ->where('id', '!=', $scheduleId)
            ->where(function ($q) use ($startTime, $endTime) {
                $q->where('start_time', '<', $endTime)
                  ->where('end_time', '>', $startTime);
            });

        // Skip baselines that are overridden out on this date
        if (!empty($outgoingOverrideIds)) {
            $roomConflictQuery->whereNotIn('id', $outgoingOverrideIds);
        }

        $roomConflict = $roomConflictQuery->first();

        if ($roomConflict) {
            return "Bentrok Ruangan: digunakan oleh {$roomConflict->course->name} ({$roomConflict->course->class_name})";
        }

        if ($date) {
            $roomOverrideConflict = ScheduleOverride::where('is_active', true)
                ->where('room_id', $roomId)
                ->where('override_date', $date)
                ->where('schedule_id', '!=', $scheduleId)
                ->where(function ($q) use ($startTime, $endTime) {
                    $q->where('new_start_time', '<', $endTime)
                      ->where('new_end_time', '>', $startTime);
                })
                ->first();

            if ($roomOverrideConflict) {
                return "Bentrok Ruangan: digunakan oleh {$roomOverrideConflict->schedule->course->name} (Override)";
            }
        }

        // 2. Lecturer conflict check
        $lecturerIds = DB::table('teaching_assignments')
            ->where('schedule_id', $scheduleId)
            ->pluck('user_id');

        if ($lecturerIds->isNotEmpty()) {
            $lecturerConflictQuery = Schedule::where('semester_id', $semesterId)
                ->where('is_active', true)
                ->where('day_of_week', $day)
                ->where('id', '!=', $scheduleId)
                ->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
                })
                ->whereHas('teachingAssignments', function ($q) use ($lecturerIds) {
                    $q->whereIn('user_id', $lecturerIds);
                });

            if (!empty($outgoingOverrideIds)) {
                $lecturerConflictQuery->whereNotIn('id', $outgoingOverrideIds);
            }

            $lecturerConflict = $lecturerConflictQuery->first();

            if ($lecturerConflict) {
                return "Bentrok Dosen: mengajar {$lecturerConflict->course->name} ({$lecturerConflict->course->class_name})";
            }

            if ($date) {
                $lecturerOverrideConflict = ScheduleOverride::where('is_active', true)
                    ->where('override_date', $date)
                    ->where('schedule_id', '!=', $scheduleId)
                    ->where(function ($q) use ($startTime, $endTime) {
                        $q->where('new_start_time', '<', $endTime)
                          ->where('new_end_time', '>', $startTime);
                    })
                    ->whereHas('schedule.teachingAssignments', function ($q) use ($lecturerIds) {
                        $q->whereIn('user_id', $lecturerIds);
                    })
                    ->first();

                if ($lecturerOverrideConflict) {
                    return "Bentrok Dosen: mengajar {$lecturerOverrideConflict->schedule->course->name} (Override)";
                }
            }
        }

        // 3. Student / Class conflict check
        $course = $schedule->course;
        if ($course && $course->description && $course->class_name) {
            $classConflictQuery = Schedule::where('semester_id', $semesterId)
                ->where('is_active', true)
                ->where('day_of_week', $day)
                ->where('id', '!=', $scheduleId)
                ->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
                })
                ->whereHas('course', function ($q) use ($course) {
                    $q->where('description', $course->description)
                      ->where('class_name', $course->class_name);
                });

            if (!empty($outgoingOverrideIds)) {
                $classConflictQuery->whereNotIn('id', $outgoingOverrideIds);
            }

            $classConflict = $classConflictQuery->first();

            if ($classConflict) {
                return "Bentrok Kelas: jadwal untuk {$classConflict->course->name} ({$classConflict->course->class_name})";
            }

            if ($date) {
                $classOverrideConflict = ScheduleOverride::where('is_active', true)
                    ->where('override_date', $date)
                    ->where('schedule_id', '!=', $scheduleId)
                    ->where(function ($q) use ($startTime, $endTime) {
                        $q->where('new_start_time', '<', $endTime)
                          ->where('new_end_time', '>', $startTime);
                    })
                    ->whereHas('schedule.course', function ($q) use ($course) {
                        $q->where('description', $course->description)
                          ->where('class_name', $course->class_name);
                    })
                    ->first();

                if ($classOverrideConflict) {
                    return "Bentrok Kelas: jadwal untuk {$classOverrideConflict->schedule->course->name} (Override)";
                }
            }
        }

        return null;
    }

    private function getSessionTimes(string $day, int $sessionStart, int $duration): array
    {
        $times = ($day === 'JUMAT') ? self::SESSION_TIMES_JUMAT : self::SESSION_TIMES_NORMAL;
        $start = $times[$sessionStart][0] ?? '00:00';
        $end = $times[$sessionStart + $duration - 1][1] ?? '00:00';
        return [$start, $end];
    }

    /**
     * Normalize time to HH:MM:SS for consistent SQL comparison.
     */
    private function normalizeTimeToFull(string $time): string
    {
        if (strlen($time) === 5) {
            return $time . ':00';
        }
        return $time;
    }

    /**
     * Endpoint to check session availability (1 to 11) for a given day, date, and room.
     */
    public function cekSesiAvailabilitas(Request $request)
    {
        $request->validate([
            'schedule_id'      => 'required|exists:schedules,id',
            'proposed_day'     => 'required|in:SENIN,SELASA,RABU,KAMIS,JUMAT',
            'target_date'      => 'nullable|date',
            'proposed_room_id' => 'required|exists:rooms,id',
        ]);

        $semester = Semester::active();
        if (!$semester) {
            return response()->json(['error' => 'Tidak ada semester aktif.'], 400);
        }

        $scheduleId = $request->schedule_id;
        $day = $request->proposed_day;
        $date = $request->target_date;
        $roomId = $request->proposed_room_id;

        $originalSchedule = Schedule::findOrFail($scheduleId);
        $duration = $originalSchedule->session_duration;

        $results = [];

        for ($s = 1; $s <= 11; $s++) {
            list($start, $end) = $this->getSessionTimes($day, $s, 1);
            $conflict = $this->checkSlotConflict($scheduleId, $semester->id, $day, $start, $end, $roomId, $date);

            $results[] = [
                'session' => $s,
                'is_occupied' => !is_null($conflict),
                'reason' => $conflict,
                'time_range' => "{$start} - {$end}",
            ];
        }

        return response()->json(['sessions' => $results]);
    }

    /**
     * Full-range availability check endpoint.
     * Checks conflict using actual time range from session_start to session_start + duration - 1
     * in a single query, instead of per-session individual checks.
     * This avoids missing conflicts that span session boundaries.
     */
    public function cekKetersediaanSlot(Request $request)
    {
        $request->validate([
            'schedule_id'      => 'required|exists:schedules,id',
            'proposed_day'     => 'required|in:SENIN,SELASA,RABU,KAMIS,JUMAT',
            'target_date'      => 'nullable|date',
            'proposed_room_id' => 'required|exists:rooms,id',
            'session_start'    => 'required|integer|min:1|max:11',
        ]);

        $semester = Semester::active();
        if (!$semester) {
            return response()->json(['error' => 'Tidak ada semester aktif.'], 400);
        }

        $scheduleId = $request->schedule_id;
        $day = $request->proposed_day;
        $date = $request->target_date;
        $roomId = $request->proposed_room_id;
        $sessionStart = $request->session_start;

        $originalSchedule = Schedule::findOrFail($scheduleId);
        $duration = $originalSchedule->session_duration;

        // Get full time range for the entire duration block
        list($startTime, $endTime) = $this->getSessionTimes($day, $sessionStart, $duration);

        if ($startTime === '00:00' || $endTime === '00:00') {
            return response()->json([
                'available' => false,
                'reason' => 'Sesi yang dipilih melampaui batas sesi yang tersedia.',
            ]);
        }

        $conflict = $this->checkSlotConflict(
            $scheduleId,
            $semester->id,
            $day,
            $startTime,
            $endTime,
            $roomId,
            $date
        );

        return response()->json([
            'available' => is_null($conflict),
            'reason' => $conflict,
            'time_range' => "{$startTime} - {$endTime}",
            'session_start' => $sessionStart,
            'session_end' => $sessionStart + $duration - 1,
        ]);
    }

    /**
     * Normalize a time value to HH:MM format for consistent comparisons.
     * Handles both HH:MM and HH:MM:SS formats from DB and constants.
     */
    private function normalizeTime(string $time): string
    {
        return substr($time, 0, 5);
    }

    /**
     * Check if two time ranges overlap using normalized HH:MM comparison.
     */
    private function timesOverlap(string $startA, string $endA, string $startB, string $endB): bool
    {
        return $this->normalizeTime($startA) < $this->normalizeTime($endB)
            && $this->normalizeTime($endA) > $this->normalizeTime($startB);
    }

    /**
     * Endpoint to automatically find recommendations for a schedule replacement.
     *
     * Searches ALL days globally (Mon-Sat), not just the original day.
     * For TEMPORARY requests, scans target week + next week to ensure
     * every day-of-week has a candidate date.
     *
     * Uses additive scoring:
     *   +40 Room Available (no room conflict)
     *   +30 No Lecturer Conflict
     *   +20 No Class/Student Conflict
     *   +10 Same Day as original schedule
     *   +5  Same Room as original schedule
     *   +5  Session Proximity (closer to original session = higher)
     *   +5  Target Date match (TEMPORARY: candidate is on the exact target date)
     *   ───
     *   115 max → normalized to 0-100
     *
     * Diversity-aware selection: max 2 candidates per day to ensure
     * cross-day coverage. Returns up to 5 ranked candidates.
     */
    public function recommendSchedules(Request $request)
    {
        $request->validate([
            'schedule_id'      => 'required|exists:schedules,id',
            'request_type'     => 'required|in:TEMPORARY,PERMANENT',
            'target_date'      => 'nullable|date',
            'effective_from_date' => 'nullable|date',
            'is_flexible_room' => 'boolean',
            'proposed_room_id' => 'nullable|exists:rooms,id',
        ]);

        $semester = Semester::active();
        if (!$semester) {
            return response()->json(['error' => 'Tidak ada semester aktif.'], 400);
        }

        $scheduleId = $request->schedule_id;
        $requestType = $request->request_type;
        $date = ($requestType === 'TEMPORARY') ? $request->target_date : $request->effective_from_date;
        $isFlexible = $request->input('is_flexible_room', true);
        $preferredRoomId = $request->proposed_room_id;

        $originalSchedule = Schedule::with(['room', 'course'])->findOrFail($scheduleId);
        $duration = $originalSchedule->session_duration;
        $originalRoom = $originalSchedule->room;
        $course = $originalSchedule->course;

        // Lecturer IDs
        $lecturerIds = DB::table('teaching_assignments')
            ->where('schedule_id', $scheduleId)
            ->pluck('user_id')
            ->toArray();

        // Fetch all active schedules in this semester once to run checks in-memory
        $allSchedules = Schedule::with(['course', 'teachingAssignments'])
            ->where('semester_id', $semester->id)
            ->where('is_active', true)
            ->get();

        // Target Date Map for target week + next week (if TEMPORARY)
        // Include ALL days across both weeks so the recommendation engine
        // can search globally instead of being constrained to only future
        // days in the target week.
        $days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
        $targetWeekDateMap = [];
        $weekDates = [];
        if ($requestType === 'TEMPORARY' && $date) {
            $targetCarbon = Carbon::parse($date);
            $today = Carbon::today();

            // Collect dates from the target week AND the next week
            // so the engine can recommend across a wider time window.
            $weeksToScan = [
                $targetCarbon->copy()->startOfWeek(),           // target week
                $targetCarbon->copy()->startOfWeek()->addWeek(), // next week
            ];

            foreach ($weeksToScan as $weekStart) {
                foreach ($days as $day) {
                    $dayIndex = array_search($day, $days);
                    $dayDate = $weekStart->copy()->addDays($dayIndex)->format('Y-m-d');

                    // Skip only dates that are truly in the past (before today),
                    // not dates before the target date — those are still valid
                    // recommendation candidates on other days.
                    if (Carbon::parse($dayDate)->lt($today)) {
                        continue;
                    }

                    // Use the first available date for each day-of-week
                    // (target week takes priority over next week)
                    if (!isset($targetWeekDateMap[$day])) {
                        $targetWeekDateMap[$day] = $dayDate;
                        $weekDates[] = $dayDate;
                    }
                }
            }
        }

        // Fetch overrides for the target week once (if TEMPORARY)
        $allOverrides = collect();
        if ($requestType === 'TEMPORARY' && count($weekDates) > 0) {
            $allOverrides = ScheduleOverride::with(['schedule.course', 'schedule.teachingAssignments'])
                ->where('is_active', true)
                ->whereIn('override_date', $weekDates)
                ->get();
        }

        // Always search flexibly across all rooms for best coverage
        $allRooms = Room::where('is_active', true)->get();
        $sameTypeRooms = $allRooms->filter(fn($r) => $r->type === $originalRoom->type);
        $otherRooms = $allRooms->filter(fn($r) => $r->type !== $originalRoom->type);
        $rooms = $sameTypeRooms->merge($otherRooms);

        $candidates = [];

        // Check if original course is a practicum
        $isPracticum = false;
        if ($course) {
            $isPracticum = (stripos($course->name, 'praktikum') !== false) || 
                           (stripos($course->class_name, 'P') !== false) || 
                           (str_ends_with(strtoupper($course->name), ' P'));
        }

        $maxRawScore = 115; // 40+30+20+10+5+5+5
        if ($isPracticum) {
            $maxRawScore += 5; // +5 for LAB room bonus
        }

        foreach ($days as $day) {
            $dayDate = $targetWeekDateMap[$day] ?? null;
            if ($requestType === 'TEMPORARY' && $date && is_null($dayDate)) {
                continue;
            }

            for ($s = 1; $s <= 11 - $duration + 1; $s++) {
                list($start, $end) = $this->getSessionTimes($day, $s, $duration);

                foreach ($rooms as $room) {
                    // NEVER recommend the original schedule itself (regardless of date/type)
                    $isOriginalDay = ($day === $originalSchedule->day_of_week);
                    $isOriginalSession = ($s === $originalSchedule->session_start);
                    $isOriginalRoom = ($room->id === $originalRoom->id);

                    if ($isOriginalDay && $isOriginalSession && $isOriginalRoom) {
                        continue;
                    }

                    // Additive scoring: start at 0, earn points for each clean check
                    $score = 0;
                    $hasConflict = false;

                    // 1. Room conflict check (+40 if clean)
                    $roomConflict = $allSchedules->first(function ($sched) use ($room, $day, $start, $end, $scheduleId) {
                        return $sched->room_id === $room->id &&
                               $sched->day_of_week === $day &&
                               $sched->id !== $scheduleId &&
                               $this->timesOverlap($sched->start_time, $sched->end_time, $start, $end);
                    });

                    $roomOverrideConflict = null;
                    if ($dayDate) {
                        $roomOverrideConflict = $allOverrides->first(function ($ov) use ($room, $dayDate, $start, $end, $scheduleId) {
                            return $ov->room_id === $room->id &&
                                   $ov->override_date->format('Y-m-d') === $dayDate &&
                                   $ov->schedule_id !== $scheduleId &&
                                   $this->timesOverlap($ov->new_start_time, $ov->new_end_time, $start, $end);
                        });
                    }

                    if (!$roomConflict && !$roomOverrideConflict) {
                        $score += 40;
                    } else {
                        $hasConflict = true;
                    }

                    // 2. Lecturer conflict check (+30 if clean)
                    if (!empty($lecturerIds)) {
                        $lecturerConflict = $allSchedules->first(function ($sched) use ($day, $start, $end, $scheduleId, $lecturerIds) {
                            if ($sched->id === $scheduleId || $sched->day_of_week !== $day) {
                                return false;
                            }
                            if (!$this->timesOverlap($sched->start_time, $sched->end_time, $start, $end)) {
                                return false;
                            }
                            return $sched->teachingAssignments->whereIn('user_id', $lecturerIds)->isNotEmpty();
                        });

                        $lecturerOverrideConflict = null;
                        if ($dayDate) {
                            $lecturerOverrideConflict = $allOverrides->first(function ($ov) use ($dayDate, $start, $end, $scheduleId, $lecturerIds) {
                                if ($ov->schedule_id === $scheduleId || $ov->override_date->format('Y-m-d') !== $dayDate) {
                                    return false;
                                }
                                if (!$this->timesOverlap($ov->new_start_time, $ov->new_end_time, $start, $end)) {
                                    return false;
                                }
                                return $ov->schedule->teachingAssignments->whereIn('user_id', $lecturerIds)->isNotEmpty();
                            });
                        }

                        if (!$lecturerConflict && !$lecturerOverrideConflict) {
                            $score += 30;
                        } else {
                            $hasConflict = true;
                        }
                    } else {
                        $score += 30;
                    }

                    // 3. Class/Student conflict check (+20 if clean)
                    if ($course && $course->description && $course->class_name) {
                        $classConflict = $allSchedules->first(function ($sched) use ($day, $start, $end, $scheduleId, $course) {
                            return $sched->day_of_week === $day &&
                                   $sched->id !== $scheduleId &&
                                   $this->timesOverlap($sched->start_time, $sched->end_time, $start, $end) &&
                                   $sched->course->description === $course->description &&
                                   $sched->course->class_name === $course->class_name;
                        });

                        $classOverrideConflict = null;
                        if ($dayDate) {
                            $classOverrideConflict = $allOverrides->first(function ($ov) use ($dayDate, $start, $end, $scheduleId, $course) {
                                return $ov->override_date->format('Y-m-d') === $dayDate &&
                                       $ov->schedule_id !== $scheduleId &&
                                       $this->timesOverlap($ov->new_start_time, $ov->new_end_time, $start, $end) &&
                                       $ov->schedule->course->description === $course->description &&
                                       $ov->schedule->course->class_name === $course->class_name;
                            });
                        }

                        if (!$classConflict && !$classOverrideConflict) {
                            $score += 20;
                        } else {
                            $hasConflict = true;
                        }
                    } else {
                        $score += 20;
                    }

                    // Only keep conflict-free candidates
                    if ($hasConflict) {
                        continue;
                    }

                    // 4. Proximity bonuses (+10 same day, +5 same room, +5 session proximity)
                    if ($day === $originalSchedule->day_of_week) {
                        $score += 10;
                    }
                    if ($room->id === $originalRoom->id) {
                        $score += 5;
                    }

                    // 5. Session proximity bonus
                    $originalSessionStart = $originalSchedule->session_start;
                    $sessionDistance = abs($s - $originalSessionStart);
                    $sessionProximityBonus = max(0, 5 - $sessionDistance);
                    $score += $sessionProximityBonus;

                    // 6. Target date bonus
                    if ($requestType === 'TEMPORARY' && $date && $dayDate === $date) {
                        $score += 5;
                    }

                    // 7. Practicum room type bonus (soft preference)
                    if ($isPracticum && $room->type === 'LABORATORIUM') {
                        $score += 5;
                    }

                    // Normalize score
                    $normalizedScore = (int) round(($score / $maxRawScore) * 100);

                    $candidates[] = [
                        'day' => $day,
                        'date' => $dayDate,
                        'session_start' => $s,
                        'session_end' => $s + $duration - 1,
                        'room' => [
                            'id' => $room->id,
                            'code' => $room->code,
                            'name' => $room->name,
                        ],
                        'score' => $normalizedScore,
                        'start_time' => $start,
                        'end_time' => $end,
                    ];
                }
            }
        }

        // Sort candidates
        usort($candidates, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        // Diversity-aware selection using a multi-pass approach
        $recommendations = [];
        $selectedKeys = [];
        $limit = 5;

        // Pass 1: Strict diversity (Max 1 per room, Max 1 per day, Max 1 per session start)
        foreach ($candidates as $key => $c) {
            if (count($recommendations) >= $limit) break;

            $roomCode = $c['room']['code'];
            $day = $c['day'];
            $sessStart = $c['session_start'];

            $roomSelected = false;
            $daySelected = false;
            $sessionSelected = false;

            foreach ($recommendations as $r) {
                if ($r['room']['code'] === $roomCode) {
                    $roomSelected = true;
                }
                if ($r['day'] === $day) {
                    $daySelected = true;
                }
                if ($r['session_start'] === $sessStart) {
                    $sessionSelected = true;
                }
            }

            if (!$roomSelected && !$daySelected && !$sessionSelected) {
                $recommendations[] = $c;
                $selectedKeys[] = $key;
            }
        }

        // Pass 2: Moderate diversity (Relax session start, allow Max 1 per room, Max 2 per day)
        if (count($recommendations) < $limit) {
            foreach ($candidates as $key => $c) {
                if (in_array($key, $selectedKeys)) continue;
                if (count($recommendations) >= $limit) break;

                $roomCode = $c['room']['code'];
                $day = $c['day'];

                $roomCount = 0;
                $dayCount = 0;
                foreach ($recommendations as $r) {
                    if ($r['room']['code'] === $roomCode) {
                        $roomCount++;
                    }
                    if ($r['day'] === $day) {
                        $dayCount++;
                    }
                }

                if ($roomCount < 1 && $dayCount < 2) {
                    $recommendations[] = $c;
                    $selectedKeys[] = $key;
                }
            }
        }

        // Pass 3: Relax room constraint to Max 2 per room, Max 2 per day
        if (count($recommendations) < $limit) {
            foreach ($candidates as $key => $c) {
                if (in_array($key, $selectedKeys)) continue;
                if (count($recommendations) >= $limit) break;

                $roomCode = $c['room']['code'];
                $day = $c['day'];

                $roomCount = 0;
                $dayCount = 0;
                foreach ($recommendations as $r) {
                    if ($r['room']['code'] === $roomCode) {
                        $roomCount++;
                    }
                    if ($r['day'] === $day) {
                        $dayCount++;
                    }
                }

                if ($roomCount < 2 && $dayCount < 2) {
                    $recommendations[] = $c;
                    $selectedKeys[] = $key;
                }
            }
        }

        // Pass 4: Relax to Max 3 per room, Max 3 per day
        if (count($recommendations) < $limit) {
            foreach ($candidates as $key => $c) {
                if (in_array($key, $selectedKeys)) continue;
                if (count($recommendations) >= $limit) break;

                $roomCode = $c['room']['code'];
                $day = $c['day'];

                $roomCount = 0;
                $dayCount = 0;
                foreach ($recommendations as $r) {
                    if ($r['room']['code'] === $roomCode) {
                        $roomCount++;
                    }
                    if ($r['day'] === $day) {
                        $dayCount++;
                    }
                }

                if ($roomCount < 3 && $dayCount < 3) {
                    $recommendations[] = $c;
                    $selectedKeys[] = $key;
                }
            }
        }

        // Pass 5: Absolute fallback (take whatever is left)
        if (count($recommendations) < $limit) {
            foreach ($candidates as $key => $c) {
                if (in_array($key, $selectedKeys)) continue;
                if (count($recommendations) >= $limit) break;

                $recommendations[] = $c;
                $selectedKeys[] = $key;
            }
        }

        // Format final recommendations for response
        $formattedRecommendations = [];
        foreach ($recommendations as $index => $c) {
            $dayName = $this->formatDayNameIndo($c['day']);
            $dateStr = $c['date'] ? Carbon::parse($c['date'])->translatedFormat('d M Y') : null;
            $isBest = ($index === 0);

            $formattedRecommendations[] = [
                'day' => $c['day'],
                'date' => $c['date'],
                'date_label' => $dateStr,
                'session_start' => $c['session_start'],
                'session_end' => $c['session_end'],
                'session_label' => $c['session_start'] === $c['session_end']
                    ? "Sesi {$c['session_start']}"
                    : "Sesi {$c['session_start']}-{$c['session_end']}",
                'room' => $c['room'],
                'start_time' => $c['start_time'],
                'end_time' => $c['end_time'],
                'is_best' => $isBest,
                'label' => $dayName . ($dateStr ? " ({$dateStr})" : '') . " • Sesi " . $c['session_start'] . ($c['session_start'] !== $c['session_end'] ? "-{$c['session_end']}" : ''),
            ];
        }

        return response()->json([
            'recommendations' => $formattedRecommendations,
        ]);
    }

    private function formatDayNameIndo(string $day): string
    {
        $days = [
            'SENIN' => 'Senin',
            'SELASA' => 'Selasa',
            'RABU' => 'Rabu',
            'KAMIS' => 'Kamis',
            'JUMAT' => 'Jumat',
            'SABTU' => 'Sabtu',
        ];
        return $days[strtoupper($day)] ?? $day;
    }

    private function sessionTimeToIndex(string $day, string $time, string $type): int
    {
        $times = ($day === 'JUMAT') ? self::SESSION_TIMES_JUMAT : self::SESSION_TIMES_NORMAL;
        $formattedTime = substr($time, 0, 5);
        foreach ($times as $s => $range) {
            if ($type === 'start' && $range['start'] === $formattedTime) {
                return $s;
            }
            if ($type === 'end' && $range['end'] === $formattedTime) {
                return $s;
            }
        }
        return 1;
    }

    /**
     * Return only available rooms for a given day/session/date combination.
     * Used by the Room Explorer modal to show available-only view.
     *
     * OPTIMIZED: Uses bulk queries instead of per-room checkSlotConflict.
     * Reduces ~N×7 DB queries to ~6 total queries.
     */
    public function availableRoomsForSlot(Request $request)
    {
        $request->validate([
            'schedule_id'    => 'required|exists:schedules,id',
            'day'            => 'required|in:SENIN,SELASA,RABU,KAMIS,JUMAT',
            'session_start'  => 'required|integer|min:1|max:11',
            'target_date'    => 'nullable|date',
        ]);

        $semester = Semester::active();
        if (!$semester) {
            return response()->json(['rooms' => [], 'error' => 'Tidak ada semester aktif.'], 400);
        }

        $scheduleId = $request->schedule_id;
        $day = $request->day;
        $sessionStart = $request->session_start;
        $targetDate = $request->target_date;

        $originalSchedule = Schedule::with(['room', 'course'])->findOrFail($scheduleId);
        $duration = $originalSchedule->session_duration;
        $course = $originalSchedule->course;

        list($startTime, $endTime) = $this->getSessionTimes($day, $sessionStart, $duration);

        $allRooms = Room::where('is_active', true)->orderBy('code')->get();

        // ── Bulk query 1: Room conflicts (baseline schedules) ────────────
        $occupiedRoomIds = Schedule::where('semester_id', $semester->id)
            ->where('is_active', true)
            ->where('day_of_week', $day)
            ->where('id', '!=', $scheduleId)
            ->where(function ($q) use ($startTime, $endTime) {
                $q->where('start_time', '<', $endTime)
                  ->where('end_time', '>', $startTime);
            })
            ->pluck('room_id')
            ->unique();

        // ── Bulk query 2: Room conflicts (overrides on target date) ──────
        $overrideOccupiedRoomIds = collect();
        if ($targetDate) {
            $overrideOccupiedRoomIds = ScheduleOverride::where('is_active', true)
                ->where('override_date', $targetDate)
                ->where('schedule_id', '!=', $scheduleId)
                ->where(function ($q) use ($startTime, $endTime) {
                    $q->where('new_start_time', '<', $endTime)
                      ->where('new_end_time', '>', $startTime);
                })
                ->pluck('room_id')
                ->unique();
        }

        $busyRoomIds = $occupiedRoomIds->merge($overrideOccupiedRoomIds)->unique();

        // ── Bulk query 3: Lecturer conflict check ────────────────────────
        $lecturerIds = DB::table('teaching_assignments')
            ->where('schedule_id', $scheduleId)
            ->pluck('user_id');

        $lecturerBusy = false;
        if ($lecturerIds->isNotEmpty()) {
            $lecturerConflict = Schedule::where('semester_id', $semester->id)
                ->where('is_active', true)
                ->where('day_of_week', $day)
                ->where('id', '!=', $scheduleId)
                ->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
                })
                ->whereHas('teachingAssignments', function ($q) use ($lecturerIds) {
                    $q->whereIn('user_id', $lecturerIds);
                })
                ->exists();

            if (!$lecturerConflict && $targetDate) {
                $lecturerConflict = ScheduleOverride::where('is_active', true)
                    ->where('override_date', $targetDate)
                    ->where('schedule_id', '!=', $scheduleId)
                    ->where(function ($q) use ($startTime, $endTime) {
                        $q->where('new_start_time', '<', $endTime)
                          ->where('new_end_time', '>', $startTime);
                    })
                    ->whereHas('schedule.teachingAssignments', function ($q) use ($lecturerIds) {
                        $q->whereIn('user_id', $lecturerIds);
                    })
                    ->exists();
            }

            $lecturerBusy = $lecturerConflict;
        }

        // ── Bulk query 4: Class/Student conflict check ───────────────────
        $classBusy = false;
        if ($course && $course->description && $course->class_name) {
            $classConflict = Schedule::where('semester_id', $semester->id)
                ->where('is_active', true)
                ->where('day_of_week', $day)
                ->where('id', '!=', $scheduleId)
                ->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
                })
                ->whereHas('course', function ($q) use ($course) {
                    $q->where('description', $course->description)
                      ->where('class_name', $course->class_name);
                })
                ->exists();

            if (!$classConflict && $targetDate) {
                $classConflict = ScheduleOverride::where('is_active', true)
                    ->where('override_date', $targetDate)
                    ->where('schedule_id', '!=', $scheduleId)
                    ->where(function ($q) use ($startTime, $endTime) {
                        $q->where('new_start_time', '<', $endTime)
                          ->where('new_end_time', '>', $startTime);
                    })
                    ->whereHas('schedule.course', function ($q) use ($course) {
                        $q->where('description', $course->description)
                          ->where('class_name', $course->class_name);
                    })
                    ->exists();
            }

            $classBusy = $classConflict;
        }

        // If lecturer or class is busy, NO room is available (global conflict)
        if ($lecturerBusy || $classBusy) {
            return response()->json([
                'rooms' => [],
                'total' => 0,
                'context' => [
                    'day' => $day,
                    'session_start' => $sessionStart,
                    'session_end' => $sessionStart + $duration - 1,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                ],
            ]);
        }

        // Filter rooms — only exclude rooms with room-level conflicts
        $availableRooms = [];
        foreach ($allRooms as $room) {
            if ($busyRoomIds->contains($room->id)) {
                continue;
            }

            $isRecommended = ($room->type === $originalSchedule->room->type);
            $isPracticum = $course && (
                (stripos($course->name, 'praktikum') !== false) ||
                (stripos($course->class_name ?? '', 'P') !== false)
            );
            if ($isPracticum && $room->type === 'LABORATORIUM') {
                $isRecommended = true;
            }

            $availableRooms[] = [
                'id'             => $room->id,
                'code'           => $room->code,
                'name'           => $room->name,
                'capacity'       => $room->capacity,
                'building'       => $room->building,
                'type'           => $room->type,
                'is_recommended' => $isRecommended,
            ];
        }

        usort($availableRooms, function ($a, $b) {
            if ($a['is_recommended'] !== $b['is_recommended']) {
                return $b['is_recommended'] <=> $a['is_recommended'];
            }
            return strcmp($a['code'], $b['code']);
        });

        return response()->json([
            'rooms' => $availableRooms,
            'total' => count($availableRooms),
            'context' => [
                'day' => $day,
                'session_start' => $sessionStart,
                'session_end' => $sessionStart + $duration - 1,
                'start_time' => $startTime,
                'end_time' => $endTime,
            ],
        ]);
    }

    /**
     * Bulk matrix availability endpoint.
     * Returns availability for ALL 5 days × 11 sessions in a single request.
     *
     * Shows actual ROOM OCCUPANCY (consistent with the schedule grid),
     * plus separate lecturer/class conflict flags for the selected schedule.
     */
    public function matrixAvailabilityBulk(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'room_id'     => 'required|exists:rooms,id',
            'dates'       => 'required|array|size:5',
            'dates.*'     => 'date',
        ]);

        $semester = Semester::active();
        if (!$semester) {
            return response()->json(['error' => 'Tidak ada semester aktif.'], 400);
        }

        $scheduleId = $request->schedule_id;
        $roomId = $request->room_id;
        $dates = $request->dates;

        $originalSchedule = Schedule::with('course')->findOrFail($scheduleId);
        $course = $originalSchedule->course;
        $days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];

        // ── Query 1: ALL baseline schedules for this room (show everything) ──
        $roomSchedules = Schedule::with('course')
            ->where('semester_id', $semester->id)
            ->where('is_active', true)
            ->where('room_id', $roomId)
            ->whereIn('day_of_week', $days)
            ->get();

        // ── Query 2: ALL overrides that MOVE schedules INTO this room on target dates ──
        $roomOverrides = ScheduleOverride::with('schedule.course')
            ->where('is_active', true)
            ->where('room_id', $roomId)
            ->whereIn('override_date', $dates)
            ->get();

        // ── Query 3: ALL overrides that MOVE schedules OUT of this room (they free up baseline slots) ──
        $outgoingOverrideMap = [];
        $outgoing = ScheduleOverride::where('is_active', true)
            ->whereIn('override_date', $dates)
            ->whereHas('schedule', function ($q) use ($semester, $roomId) {
                $q->where('semester_id', $semester->id)
                  ->where('is_active', true)
                  ->where('room_id', $roomId);
            })
            ->get();
        foreach ($outgoing as $ov) {
            $outgoingOverrideMap[$ov->override_date->format('Y-m-d')][] = $ov->schedule_id;
        }

        // ── Query 4: Lecturer conflicts (for warning indicator) ──
        $lecturerIds = DB::table('teaching_assignments')
            ->where('schedule_id', $scheduleId)
            ->pluck('user_id');

        $lecturerSchedules = collect();
        if ($lecturerIds->isNotEmpty()) {
            $lecturerSchedules = Schedule::with('course')
                ->where('semester_id', $semester->id)
                ->where('is_active', true)
                ->where('id', '!=', $scheduleId)
                ->whereIn('day_of_week', $days)
                ->whereHas('teachingAssignments', function ($q) use ($lecturerIds) {
                    $q->whereIn('user_id', $lecturerIds);
                })
                ->get();
        }

        // ── Query 5: Class conflicts (for warning indicator) ──
        $classSchedules = collect();
        if ($course && $course->description && $course->class_name) {
            $classSchedules = Schedule::with('course')
                ->where('semester_id', $semester->id)
                ->where('is_active', true)
                ->where('id', '!=', $scheduleId)
                ->whereIn('day_of_week', $days)
                ->whereHas('course', function ($q) use ($course) {
                    $q->where('description', $course->description)
                      ->where('class_name', $course->class_name);
                })
                ->get();
        }

        // ── Build the 5×11 matrix in memory ──────────────────────────────
        $result = [];

        foreach ($days as $dayIndex => $day) {
            $dateForDay = $dates[$dayIndex];
            $isFriday = ($day === 'JUMAT');
            $times = $isFriday ? self::SESSION_TIMES_JUMAT : self::SESSION_TIMES_NORMAL;

            // Schedule IDs overridden OUT of this room on this date
            $overriddenOutIds = $outgoingOverrideMap[$dateForDay] ?? [];

            $sessions = [];

            for ($s = 1; $s <= 11; $s++) {
                $startT = $times[$s][0] ?? null;
                $endT = $times[$s][1] ?? null;
                if (!$startT || !$endT) {
                    $sessions[] = ['session' => $s, 'is_occupied' => false, 'reason' => null, 'conflict' => null, 'time_range' => ''];
                    continue;
                }

                $roomOccupant = null;

                // Check baseline room schedules (skip if overridden out on this date)
                foreach ($roomSchedules as $rs) {
                    if ($rs->day_of_week === $day && !in_array($rs->id, $overriddenOutIds)) {
                        $rsStart = $this->normalizeTime($rs->start_time);
                        $rsEnd = $this->normalizeTime($rs->end_time);
                        if ($rsStart < $endT && $rsEnd > $startT) {
                            $roomOccupant = "{$rs->course->name} ({$rs->course->class_name})";
                            break;
                        }
                    }
                }

                // Check overrides that moved INTO this room on this date
                if (!$roomOccupant) {
                    foreach ($roomOverrides as $ro) {
                        if ($ro->override_date->format('Y-m-d') === $dateForDay) {
                            $roStart = $this->normalizeTime($ro->new_start_time);
                            $roEnd = $this->normalizeTime($ro->new_end_time);
                            if ($roStart < $endT && $roEnd > $startT) {
                                $roomOccupant = "{$ro->schedule->course->name} ({$ro->schedule->course->class_name}) [Override]";
                                break;
                            }
                        }
                    }
                }

                // Check lecturer/class conflicts separately (only when room is free)
                $conflictWarning = null;
                if (!$roomOccupant) {
                    if ($lecturerIds->isNotEmpty()) {
                        foreach ($lecturerSchedules as $ls) {
                            if ($ls->day_of_week === $day) {
                                $lsStart = $this->normalizeTime($ls->start_time);
                                $lsEnd = $this->normalizeTime($ls->end_time);
                                if ($lsStart < $endT && $lsEnd > $startT) {
                                    $conflictWarning = "Dosen mengajar {$ls->course->name} ({$ls->course->class_name})";
                                    break;
                                }
                            }
                        }
                    }
                    if (!$conflictWarning && $course && $course->description && $course->class_name) {
                        foreach ($classSchedules as $cs) {
                            if ($cs->day_of_week === $day) {
                                $csStart = $this->normalizeTime($cs->start_time);
                                $csEnd = $this->normalizeTime($cs->end_time);
                                if ($csStart < $endT && $csEnd > $startT) {
                                    $conflictWarning = "Kelas {$cs->course->class_name} ada jadwal {$cs->course->name}";
                                    break;
                                }
                            }
                        }
                    }
                }

                $sessions[] = [
                    'session'     => $s,
                    'is_occupied' => !is_null($roomOccupant),
                    'reason'      => $roomOccupant,
                    'conflict'    => $conflictWarning,
                    'time_range'  => "{$startT} - {$endT}",
                ];
            }

            $result[$day] = $sessions;
        }

        return response()->json(['matrix' => $result]);
    }
}
