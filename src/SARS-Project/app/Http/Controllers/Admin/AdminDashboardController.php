<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AiAssistantService;
use App\Services\Dashboard\ConflictDetectionService;
use App\Models\Semester;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function __construct(
        private readonly AiAssistantService $aiAssistant,
    ) {}

    public function index()
    {
        $schedules = DB::table('schedules')
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
            ->groupBy(
                'schedules.id', 'courses.code', 'courses.name', 'courses.class_name',
                'courses.description', 'semesters.name', 'rooms.name',
                'schedules.day_of_week', 'schedules.session_start',
                'schedules.session_duration', 'schedules.start_time', 'schedules.end_time'
            )
            ->get()
            ->map(function ($s) {
                $s->hari = strtolower($s->hari);
                $s->tipe = 'resmi';
                $s->dosen = $s->dosen ?? 'Belum Ditentukan';
                return $s;
            });

        $schedules = \App\Support\AcademicSessionTimes::applyWeeklyOverrides($schedules);

        $rooms = DB::table('rooms')
            ->whereIn('id', DB::table('schedules')->where('is_active', true)->pluck('room_id'))
            ->pluck('name');

        // ─── Conflict Detection (via shared service) ──────────────────────────
        $semester = Semester::active();
        $konflik = $semester ? app(ConflictDetectionService::class)->detect($semester->id, [], true) : [];

        // ─── Database Sync Status Logic ─────────────────────────────────────────
        $latestSchedule = DB::table('schedules')->latest('created_at')->first();
        $lastUpload = 'Belum ada data';
        if ($latestSchedule && $latestSchedule->created_at) {
            $lastUpload = \Carbon\Carbon::parse($latestSchedule->created_at)->timezone('Asia/Jakarta')->translatedFormat('d M Y, H:i');
        }

        $syncStatus = [
            'status' => 'terkini',
            'lastUpload' => $lastUpload === 'Belum ada data' ? 'Belum ada data' : $lastUpload . ' WIB',
            'dbName' => DB::connection()->getDatabaseName()
        ];

        $countsThisWeek = DB::table('change_requests')
            ->where('updated_at', '>=', now()->subDays(7))
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $insights = [
            'pendingRequests' => DB::table('change_requests')->where('status', 'PENDING_ADMIN')->count(),
            'conflictDetected' => count($konflik),
            'acceptedThisWeek' => $countsThisWeek->get('APPROVED') ?? 0,
            'declinedThisWeek' => ($countsThisWeek->get('REJECTED_ADMIN') ?? 0) + ($countsThisWeek->get('REJECTED_ASLAB') ?? 0) + ($countsThisWeek->get('REJECTED') ?? 0),
        ];


        $aktivitas = DB::table('activities')
            ->join('users', 'activities.user_id', '=', 'users.id')
            ->select(
                'activities.id',
                'users.name as nama',
                'activities.action as aksi',
                'activities.status',
                'activities.created_at'
            )
            ->orderByDesc('activities.created_at')
            ->limit(10)
            ->get()
            ->map(function ($act) {
                $avatarInitial = strtoupper(substr($act->nama, 0, 1));
                $waktu = \Carbon\Carbon::parse($act->created_at)->timezone('Asia/Jakarta')->diffForHumans();
                return [
                    'id' => (string) $act->id,
                    'nama' => $act->nama,
                    'aksi' => $act->aksi,
                    'status' => $act->status,
                    'waktu' => $waktu,
                    'avatarInitial' => $avatarInitial,
                ];
            });

        return Inertia::render('Dashboard/Admin', [
            'jadwal' => $schedules,
            'rooms' => $rooms,
            'konflik' => $konflik,
            'syncStatus' => $syncStatus,
            'insights' => $insights,
            'aktivitas' => $aktivitas,
        ]);
    }

    /**
     * AI Assistant - read-only query endpoint for Admin.
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
        $streamedResponse = $this->aiAssistant->streamAdminQuery($query, $user, $semester);

        if ($streamedResponse) {
            return $streamedResponse;
        }

        // Fallback to rule-based responses
        $response = $this->aiAssistant->fallbackAdminResponse($query, $semester);

        return response()->json([
            'answer' => $response,
            'type'   => 'text',
        ]);
    }
}
