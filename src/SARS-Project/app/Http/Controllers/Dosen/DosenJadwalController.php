<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\TeachingAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DosenJadwalController extends Controller
{
    /**
     * Display the full schedule page for dosen.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $semester = Semester::active();

        if (!$semester) {
            return Inertia::render('Dosen/Jadwal', [
                'jadwal' => [],
                'stats' => $this->emptyStats(),
                'semester' => null,
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

        // Transform jadwal ke format frontend (semua hari)
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

        // Stats summary
        $stats = [
            'totalMataKuliah' => $schedules->pluck('course_id')->unique()->count(),
            'totalSks'        => $schedules->pluck('course')->unique('id')->sum('credits'),
            'totalJadwal'     => $schedules->count(),
        ];

        return Inertia::render('Dosen/Jadwal', [
            'jadwal'   => $jadwal,
            'stats'    => $stats,
            'semester' => [
                'nama' => $semester->name,
                'tahun' => $semester->academic_year,
            ],
        ]);
    }

    /**
     * Empty stats fallback.
     */
    private function emptyStats(): array
    {
        return [
            'totalMataKuliah' => 0,
            'totalSks'        => 0,
            'totalJadwal'     => 0,
        ];
    }
}
