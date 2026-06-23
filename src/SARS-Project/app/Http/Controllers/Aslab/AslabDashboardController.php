<?php

namespace App\Http\Controllers\Aslab;

use App\Http\Controllers\Controller;
use App\Models\ChangeRequest;
use App\Models\NotificationRecipient;
use App\Models\Schedule;
use App\Models\Semester;
use App\Services\Dashboard\ConflictDetectionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\Room;
use App\Services\AiAssistantService;
use Illuminate\Support\Facades\DB;

class AslabDashboardController extends Controller
{
    public function __construct(
        private readonly AiAssistantService $aiAssistant,
    ) {}

    /**
     * Display the aslab dashboard.
     */
    public function index(Request $request): Response
    {
        $user     = $request->user();
        $semester = Semester::active();

        if (! $semester) {
            return Inertia::render('Dashboard/Aslab', [
                'stats'           => ['pendingVerification' => 0, 'validation' => 0, 'accepted' => 0, 'rejected' => 0],
                'jadwal'          => [],
                'rooms'           => [],
                'notifikasi'      => [],
                'pendingRequests' => [],
                'konflik'         => [],
            ]);
        }

        // All schedules in the active semester (aslab sees everything)
        // Use the same join-based query as AdminJadwalController for data consistency
        $jadwal = \Illuminate\Support\Facades\DB::table('schedules')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->join('semesters', 'courses.semester_id', '=', 'semesters.id')
            ->join('rooms', 'schedules.room_id', '=', 'rooms.id')
            ->leftJoin('teaching_assignments', function($join) {
                $join->on('schedules.id', '=', 'teaching_assignments.schedule_id')
                     ->where('teaching_assignments.role_in_class', '=', 'PENGAJAR');
            })
            ->leftJoin('users', 'teaching_assignments.user_id', '=', 'users.id')
            ->select(
                'schedules.id',
                'courses.code as kode',
                'courses.name as nama',
                'courses.class_name as kelas',
                DB::raw("REGEXP_REPLACE(courses.description, '[^0-9]', '', 'g') as \"semesterNum\""),
                'semesters.name as semester',
                'rooms.name as ruangan',
                DB::raw("STRING_AGG(DISTINCT users.name, ' & ' ORDER BY users.name) as dosen"),
                'schedules.day_of_week as hari',
                'schedules.session_start as sesiMulai',
                'schedules.session_duration as durasi',
                'schedules.start_time as jamMulai',
                'schedules.end_time as jamAkhir'
            )
            ->where('schedules.is_active', true)
            ->where('schedules.semester_id', $semester->id)
            ->groupBy(
                'schedules.id', 'courses.code', 'courses.name', 'courses.class_name',
                'courses.description', 'semesters.name', 'rooms.name',
                'schedules.day_of_week', 'schedules.session_start',
                'schedules.session_duration', 'schedules.start_time', 'schedules.end_time'
            )
            ->get()
            ->map(function ($s) {
                $s->hari = strtolower($s->hari);
                $s->mulai = substr($s->jamMulai, 0, 5);
                $s->selesai = substr($s->jamAkhir, 0, 5);
                $s->tipe = 'resmi';
                $s->dosen = $s->dosen ?? 'Belum Ditentukan';
                return $s;
            });

        // Get active overrides for dashboard
        $today = \Carbon\Carbon::now()->toDateString();
        $overrides = DB::table('schedule_overrides')
            ->join('schedules', 'schedule_overrides.schedule_id', '=', 'schedules.id')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->join('rooms', 'schedule_overrides.room_id', '=', 'rooms.id')
            ->leftJoin('teaching_assignments', function($join) {
                $join->on('schedules.id', '=', 'teaching_assignments.schedule_id')
                     ->where('teaching_assignments.role_in_class', '=', 'PENGAJAR');
            })
            ->leftJoin('users', 'teaching_assignments.user_id', '=', 'users.id')
            ->where('schedule_overrides.is_active', true)
            ->where('schedule_overrides.override_date', '>=', $today)
            ->where('courses.semester_id', $semester->id)
            ->select(
                'schedules.id as schedule_id',
                DB::raw("'override_' || schedule_overrides.id as id"),
                'courses.code as kode',
                'courses.name as nama',
                'courses.class_name as kelas',
                DB::raw("REGEXP_REPLACE(courses.description, '[^0-9]', '', 'g') as \"semesterNum\""),
                DB::raw("'Semester ' || schedule_overrides.override_date as semester"),
                'rooms.name as ruangan',
                DB::raw("STRING_AGG(DISTINCT users.name, ' & ' ORDER BY users.name) as dosen"),
                'schedule_overrides.new_day_of_week as hari',
                'schedules.session_start as sesiMulai',
                'schedules.session_duration as durasi',
                'schedule_overrides.new_start_time as jamMulai',
                'schedule_overrides.new_end_time as jamAkhir',
                'schedule_overrides.override_date as tanggal',
                DB::raw("SUBSTR(CAST(schedule_overrides.new_start_time AS TEXT), 1, 5) as mulai"),
                DB::raw("SUBSTR(CAST(schedule_overrides.new_end_time AS TEXT), 1, 5) as selesai")
            )
            ->groupBy(
                'schedules.id', 'schedule_overrides.id', 'courses.code', 'courses.name', 'courses.class_name',
                'courses.description', 'schedule_overrides.override_date', 'rooms.name',
                'schedule_overrides.new_day_of_week', 'schedule_overrides.new_start_time',
                'schedule_overrides.new_end_time'
            )
            ->get()
            ->map(function ($o) {
                $o->hari = strtolower($o->hari);
                $o->mulai = $o->mulai ?? substr($o->jamMulai, 0, 5);
                $o->selesai = $o->selesai ?? substr($o->jamAkhir, 0, 5);
                $o->tipe = 'override';
                $o->label = 'Jadwal Sementara';
                $o->dosen = $o->dosen ?? 'Belum Ditentukan';
                return $o;
            });

        $jadwal = $jadwal->concat($overrides);

        // Stats
        $statusCounts = ChangeRequest::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $stats = [
            'pendingVerification' => $statusCounts->get('PENDING_ASLAB') ?? 0,
            'validation'          => $statusCounts->get('PENDING_ADMIN') ?? 0,
            'accepted'            => $statusCounts->get('APPROVED') ?? 0,
            'rejected'            => ($statusCounts->get('REJECTED_ASLAB') ?? 0) + ($statusCounts->get('REJECTED_ADMIN') ?? 0) + ($statusCounts->get('REJECTED') ?? 0),
        ];

        
        $rooms = Room::whereIn('id', Schedule::where('semester_id', $semester->id)->where('is_active', true)->pluck('room_id'))->pluck('name');

        // Pending requests from mahasiswa (for RequestAlerts on dashboard)
        $pendingRequests = ChangeRequest::where('status', 'PENDING_ASLAB')
            ->with(['requester', 'schedule.course', 'schedule.room'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($cr) => [
                'id'            => (string) $cr->id,
                'requestCode'   => $cr->request_code,
                'requester'     => [
                    'name'   => $cr->requester->name,
                    'nimNip' => $cr->requester->nim_nip,
                ],
                'schedule'      => [
                    'course' => $cr->schedule->course->name ?? '-',
                    'code'   => $cr->schedule->course->code ?? '-',
                    'room'   => $cr->schedule->room->code ?? '-',
                ],
                'requestType'   => $cr->request_type,
                'proposedDay'   => $cr->proposed_day,
                'proposedTime'  => substr($cr->proposed_start_time, 0, 5) . ' - ' . substr($cr->proposed_end_time, 0, 5),
                'reason'        => $cr->reason,
                'targetDate'    => $cr->target_date,
                'createdAtDiff' => $cr->created_at?->diffForHumans() ?? '-',
                'hasConflict'   => (bool) $cr->has_conflict,
            ])->values();

        // Notifications
        $notifikasi = NotificationRecipient::where('recipient_id', $user->id)
            ->where('channel', 'IN_APP')
            ->with('notification')
            ->orderByDesc('notification_id')
            ->limit(10)
            ->get()
            ->map(fn ($nr) => [
                'id'     => (string) $nr->notification_id,
                'judul'  => $nr->notification->title,
                'pesan'  => $nr->notification->body,
                'waktu'  => $nr->notification->created_at?->diffForHumans() ?? '-',
                'dibaca' => $nr->is_read,
                'tipe'   => strtolower($nr->notification->type) === 'status_change' ? 'jadwal'
                          : (strtolower($nr->notification->type) === 'conflict_alert' ? 'validasi' : 'info'),
            ])->values();

        return Inertia::render('Dashboard/Aslab', [
            'stats'           => $stats,
            'jadwal'          => $jadwal,
            'rooms'           => $rooms,
            'notifikasi'      => $notifikasi,
            'pendingRequests' => $pendingRequests,
            'konflik'         => app(ConflictDetectionService::class)
                                    ->detect($semester->id, [], false),
        ]);
    }

    /**
     * AI Assistant - read-only query endpoint for Aslab.
     * Returns SSE stream when Gemini is available, JSON fallback otherwise.
     */
    public function aiQuery(Request $request)
    {
        $request->validate([
            'query' => 'required|string|max:500',
        ]);

        $query    = strip_tags($request->input('query'));
        $user     = $request->user();
        $semester = Semester::active();

        // Try streaming with Gemini first
        $streamedResponse = $this->aiAssistant->streamAslabQuery($query, $user, $semester);

        if ($streamedResponse) {
            return $streamedResponse;
        }

        // Fallback to simple offline message
        $response = $this->aiAssistant->fallbackAslabResponse($query, $semester, $user);

        return response()->json([
            'answer' => $response,
            'type'   => 'text',
        ]);
    }
}