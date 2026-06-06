<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AiAssistantService;
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
                DB::raw("REGEXP_REPLACE(courses.description, '[^0-9]', '') as semesterNum"),
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

        $rooms = DB::table('rooms')
            ->whereIn('id', DB::table('schedules')->where('is_active', true)->pluck('room_id'))
            ->pluck('name');

        // ─── Conflict Detection Logic ──────────────────────────────────────────
        // Fetch all active schedules to find overlaps
        $schedulesList = DB::table('schedules')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
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
                'rooms.name as ruangan',
                'schedules.day_of_week as hari',
                'schedules.session_start as sesiMulai',
                'schedules.session_duration as durasi',
                'users.id as dosen_id',
                'users.name as dosen_nama'
            )
            ->where('schedules.is_active', true)
            ->get();

        // Pre-compute team-teaching schedules (schedules with >1 PENGAJAR)
        $teamTeachingScheduleIds = DB::table('teaching_assignments')
            ->where('role_in_class', 'PENGAJAR')
            ->groupBy('schedule_id')
            ->havingRaw('COUNT(DISTINCT user_id) > 1')
            ->pluck('schedule_id')
            ->toArray();

        $konflik = [];
        $checked = [];

        foreach ($schedulesList as $s1) {
            foreach ($schedulesList as $s2) {
                if ($s1->id === $s2->id) continue;
                
                $pairKey = min($s1->id, $s2->id) . '-' . max($s1->id, $s2->id);
                if (in_array($pairKey, $checked)) continue;
                
                $sameDay = strtolower($s1->hari) === strtolower($s2->hari);
                if (!$sameDay) continue;

                $overlap = ($s1->sesiMulai >= $s2->sesiMulai && $s1->sesiMulai < $s2->sesiMulai + $s2->durasi) ||
                           ($s2->sesiMulai >= $s1->sesiMulai && $s2->sesiMulai < $s1->sesiMulai + $s1->durasi);

                if ($overlap) {
                    // 1. Room conflict
                    if ($s1->ruangan === $s2->ruangan) {
                        $checked[] = $pairKey;
                        $konflik[] = [
                            'id' => 'room-' . $pairKey,
                            'judul' => 'Bentrok Ruangan: ' . $s1->ruangan,
                            'deskripsi' => "Mata Kuliah {$s1->kode} ({$s1->nama} - Kelas {$s1->kelas}) bertabrakan dengan {$s2->kode} ({$s2->nama} - Kelas {$s2->kelas}) di Ruangan {$s1->ruangan} pada hari " . ucfirst($s1->hari) . " (Sesi {$s1->sesiMulai}-" . ($s1->sesiMulai + $s1->durasi - 1) . " vs Sesi {$s2->sesiMulai}-" . ($s2->sesiMulai + $s2->durasi - 1) . ").",
                            'tipe' => 'bentrok_ruangan',
                            'aksi' => [
                                ['label' => "Hapus {$s1->kode} (Kelas {$s1->kelas})", 'variant' => 'primary', 'schedule_id' => $s1->id],
                                ['label' => "Hapus {$s2->kode} (Kelas {$s2->kelas})", 'variant' => 'secondary', 'schedule_id' => $s2->id],
                            ]
                        ];
                    }
                    // 2. Lecturer conflict
                    elseif ($s1->dosen_id && $s2->dosen_id && $s1->dosen_id === $s2->dosen_id) {
                        // Skip if either schedule is team-taught (co-lecturer can cover)
                        $isTeamTeaching1 = in_array($s1->id, $teamTeachingScheduleIds);
                        $isTeamTeaching2 = in_array($s2->id, $teamTeachingScheduleIds);
                        if ($isTeamTeaching1 || $isTeamTeaching2) {
                            continue; // Ignore conflict — team teaching
                        }

                        // Check if conflict should be ignored (practicum rules)
                        $isP1 = $this->isPracticumCourse($s1->nama, $s1->kelas);
                        $isP2 = $this->isPracticumCourse($s2->nama, $s2->kelas);
                        
                        $isBothPracticum = $isP1 && $isP2;
                        $isAnyPracticum = $isP1 || $isP2;
                        $isRoomDifferent = $s1->ruangan !== $s2->ruangan;
                        
                        if ($isBothPracticum || ($isAnyPracticum && $isRoomDifferent)) {
                            continue; // Ignore conflict
                        }

                        $checked[] = $pairKey;
                        $konflik[] = [
                            'id' => 'dosen-' . $pairKey,
                            'judul' => 'Bentrok Jadwal Dosen: ' . $s1->dosen_nama,
                            'deskripsi' => "Dosen {$s1->dosen_nama} mengajar dua kelas sekaligus pada hari " . ucfirst($s1->hari) . ": {$s1->kode} ({$s1->nama} - Kelas {$s1->kelas}) di {$s1->ruangan} dan {$s2->kode} ({$s2->nama} - Kelas {$s2->kelas}) di {$s2->ruangan} (Sesi {$s1->sesiMulai}-" . ($s1->sesiMulai + $s1->durasi - 1) . " vs Sesi {$s2->sesiMulai}-" . ($s2->sesiMulai + $s2->durasi - 1) . ").",
                            'tipe' => 'bentrok_jadwal',
                            'aksi' => [
                                ['label' => "Hapus {$s1->kode} (Kelas {$s1->kelas})", 'variant' => 'primary', 'schedule_id' => $s1->id],
                                ['label' => "Hapus {$s2->kode} (Kelas {$s2->kelas})", 'variant' => 'secondary', 'schedule_id' => $s2->id],
                            ]
                        ];
                    }
                }
            }
        }

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

        $insights = [
            'pendingRequests' => DB::table('change_requests')->where('status', 'PENDING_ADMIN')->count(),
            'conflictDetected' => count($konflik),
            'acceptedThisWeek' => DB::table('change_requests')->where('status', 'APPROVED')->where('updated_at', '>=', now()->subDays(7))->count(),
            'declinedThisWeek' => DB::table('change_requests')->where('status', 'REJECTED')->where('updated_at', '>=', now()->subDays(7))->count(),
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

    private function isPracticumCourse($courseName, $className): bool
    {
        return (stripos($courseName, 'praktikum') !== false) || 
               (stripos($className ?? '', 'P') !== false) || 
               (str_ends_with(strtoupper($courseName), ' P'));
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

        $query    = $request->input('query');
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
