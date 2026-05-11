<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\NotificationRecipient;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\TeachingAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DosenDashboardController extends Controller
{
    /**
     * Display the dosen dashboard.
     */
    public function index(Request $request): Response
    {
        $user     = $request->user();
        $semester = Semester::active();

        if (! $semester) {
            return Inertia::render('Dashboard/Dosen', [
                'stats'         => $this->emptyStats(),
                'jadwal'        => [],
                'jadwalHariIni' => [],
                'notifikasi'    => [],
            ]);
        }

        // Ambil semua schedule_id yang ditugaskan ke dosen ini (PENGAJAR)
        $assignedScheduleIds = TeachingAssignment::where('user_id', $user->id)
            ->where('role_in_class', 'PENGAJAR')
            ->pluck('schedule_id');

        // Ambil jadwal lengkap dosen di semester aktif
        $schedules = Schedule::whereIn('id', $assignedScheduleIds)
            ->where('semester_id', $semester->id)
            ->where('is_active', true)
            ->with(['course', 'room'])
            ->get();

        // Transform jadwal ke format frontend
        $jadwal = $schedules->map(fn (Schedule $s) => [
            'id'        => (string) $s->id,
            'kode'      => $s->course->code,
            'nama'      => $s->course->name,
            'kelas'     => $s->course->class_name,
            'ruangan'   => $s->room->code,
            'hari'      => strtolower($s->day_of_week),
            'sesiMulai' => $s->session_start,
            'durasi'    => $s->session_duration,
            'mahasiswa' => $s->room->capacity,
            'tipe'      => 'resmi',
            'waktu'     => substr($s->start_time, 0, 5) . ' - ' . substr($s->end_time, 0, 5),
        ])->values();

        // Jadwal hari ini
        $todayDayName = $this->getTodayDayName();
        $jadwalHariIni = $jadwal->where('hari', $todayDayName)->map(function ($item) {
            $item['status'] = $this->determineScheduleStatus($item['waktu']);
            return $item;
        })->values();

        // Stats
        $uniqueCourses = $schedules->pluck('course_id')->unique();
        $totalSks = $schedules->pluck('course')->unique('id')->sum('credits');

        $stats = [
            'totalMataKuliah'    => $uniqueCourses->count(),
            'totalSks'           => $totalSks,
            'totalMahasiswa'     => $schedules->sum(fn ($s) => $s->room->capacity),
            'jadwalHariIni'      => $jadwalHariIni->count(),
            'pertemuanMingguIni' => $schedules->count(),
        ];

        // Notifikasi terbaru (IN_APP)
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
                'waktu'  => $nr->notification->created_at->diffForHumans(),
                'dibaca' => $nr->is_read,
                'tipe'   => strtolower($nr->notification->type) === 'status_change' ? 'jadwal'
                          : (strtolower($nr->notification->type) === 'conflict_alert' ? 'validasi' : 'info'),
            ])->values();

        return Inertia::render('Dashboard/Dosen', [
            'stats'         => $stats,
            'jadwal'        => $jadwal,
            'jadwalHariIni' => $jadwalHariIni,
            'notifikasi'    => $notifikasi,
        ]);
    }

    /**
     * Get today's day name in lowercase Indonesian.
     */
    private function getTodayDayName(): string
    {
        $dayMap = [
            0 => 'senin',  // Minggu -> default Senin
            1 => 'senin',
            2 => 'selasa',
            3 => 'rabu',
            4 => 'kamis',
            5 => 'jumat',
            6 => 'senin',  // Sabtu -> default Senin
        ];

        return $dayMap[now()->dayOfWeek];
    }

    /**
     * Determine if a schedule is currently running based on time.
     */
    private function determineScheduleStatus(string $waktu): string
    {
        $parts = explode(' - ', $waktu);
        if (count($parts) !== 2) return 'belum_dimulai';

        $now   = now();
        $start = now()->setTimeFromTimeString($parts[0] . ':00');
        $end   = now()->setTimeFromTimeString($parts[1] . ':00');

        if ($now->between($start, $end)) return 'sedang_berlangsung';
        if ($now->gt($end))              return 'selesai';
        return 'belum_dimulai';
    }

    /**
     * Empty stats fallback when no semester is active.
     */
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
}
