<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Services\AiAssistantService;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\TeachingAssignment;
use App\Services\Dashboard\ConflictDetectionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DosenDashboardController extends Controller
{
    public function __construct(
        private readonly AiAssistantService $aiAssistant,
    ) {}

    /**
     * Display the dosen dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $semester = Semester::active();

        if (!$semester) {
            return Inertia::render('Dashboard/Dosen', [
                'jadwal' => [],
                'stats' => $this->emptyStats(),
                'jadwalHariIni' => [],
            ]);
        }

        // 1. Ambil semua schedule_id yang ditugaskan ke dosen ini (PENGAJAR)
        $assignedScheduleIds = TeachingAssignment::where('user_id', $user->id)
            ->where('role_in_class', 'PENGAJAR')
            ->pluck('schedule_id');

        // 2. Ambil jadwal lengkap dosen di semester aktif
        $schedules = Schedule::whereIn('id', $assignedScheduleIds)
            ->where('semester_id', $semester->id)
            ->where('is_active', true)
            ->with(['course', 'room'])
            ->get();

        // 3. Format jadwal untuk ScheduleGrid (mingguan)
        $jadwal = $schedules->map(fn (Schedule $s) => [
            'id'        => (string) $s->id,
            'kode'      => $s->course->code,
            'nama'      => $s->course->name,
            'kelas'     => $s->course->class_name,
            'semesterNum'=> preg_replace('/[^0-9]/', '', $s->course->description),
            'ruangan'   => $s->room->code,
            'hari'      => strtolower($s->day_of_week),
            'sesiMulai' => $s->session_start,
            'durasi'    => $s->session_duration,
            'mahasiswa' => $s->room->capacity,
            'tipe'      => 'resmi',
            'waktu'     => substr($s->start_time, 0, 5) . ' - ' . substr($s->end_time, 0, 5),
        ])->values();

        // 4. Filter jadwal HARI INI
        // Karena data dummy menggunakan nama hari Indonesia (SENIN, dll)
        $hariIniMap = [
            0 => 'MINGGU', 1 => 'SENIN', 2 => 'SELASA', 3 => 'RABU',
            4 => 'KAMIS', 5 => 'JUMAT', 6 => 'SABTU'
        ];
        // Untuk keperluan demo/testing, kalau hari ini Minggu, kita mock jadi Senin agar tidak kosong
        $dayIndex = Carbon::now()->dayOfWeek;
        $hariIniString = $dayIndex == 0 ? 'SENIN' : $hariIniMap[$dayIndex];
        
        $schedulesToday = $schedules->filter(fn($s) => strtoupper($s->day_of_week) === $hariIniString);
        
        $jadwalHariIni = $schedulesToday->map(function(Schedule $s) {
            // Tentukan status (mock simple logic)
            $nowTime = Carbon::now()->format('H:i:s');
            $status = 'belum_dimulai';
            if ($nowTime >= $s->start_time && $nowTime <= $s->end_time) {
                $status = 'sedang_berlangsung';
            } elseif ($nowTime > $s->end_time) {
                $status = 'selesai';
            }

            return [
                'id'        => 'th' . $s->id,
                'kode'      => $s->course->code,
                'nama'      => $s->course->name,
                'kelas'     => $s->course->class_name,
                'ruangan'   => $s->room->code,
                'waktu'     => substr($s->start_time, 0, 5) . ' - ' . substr($s->end_time, 0, 5),
                'sesi'      => 'Sesi ' . $s->session_start . '-' . ($s->session_start + $s->session_duration - 1),
                'mahasiswa' => $s->room->capacity,
                'status'    => $status,
            ];
        })->values();

        // 5. Hitung Statistik (Stats)
        $totalMahasiswa = $schedules->sum(fn($s) => $s->room->capacity); // Asumsi sederhana kapasitas kelas = mhs

        $stats = [
            'totalMataKuliah'    => $schedules->pluck('course_id')->unique()->count(),
            'totalSks'           => $schedules->pluck('course')->unique('id')->sum('credits'),
            'totalMahasiswa'     => $totalMahasiswa,
            'jadwalHariIni'      => $schedulesToday->count(),
            'pertemuanMingguIni' => $schedules->count(),
        ];

        return Inertia::render('Dashboard/Dosen', [
            'jadwal'        => $jadwal,
            'stats'         => $stats,
            'jadwalHariIni' => $jadwalHariIni,
            'konflik'       => app(ConflictDetectionService::class)
                                ->detect($semester->id, $assignedScheduleIds->toArray(), false),
        ]);
    }

    private function emptyStats(): array
    {
        return [
            'totalMataKuliah'    => 0,
            'totalSks'           => 0,
            'totalMahasiswa'     => 0,
            'jadwalHariIni'      => 0,
            'pertemuanMingguIni' => 0,
        ];
    }

    /**
     * AI Assistant - read-only query endpoint for Dosen.
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
        $streamedResponse = $this->aiAssistant->streamDosenQuery($query, $user, $semester);

        if ($streamedResponse) {
            return $streamedResponse;
        }

        // Fallback to rule-based responses
        $response = $this->aiAssistant->fallbackDosenResponse($query, $semester, $user);

        return response()->json([
            'answer' => $response,
            'type'   => 'text',
        ]);
    }
}
