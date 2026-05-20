<?php

namespace App\Http\Controllers\Aslab;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AslabJadwalController extends Controller
{
    /**
     * Display the full schedule page for aslab (view-only, all schedules).
     */
    public function index(Request $request): Response
    {
        $semester = Semester::active();

        if (!$semester) {
            return Inertia::render('Aslab/Jadwal', [
                'allSchedules' => [],
                'rooms'        => [],
                'semester'     => null,
            ]);
        }

        // Fetch ALL schedules in the active semester (aslab sees everything)
        $allSchedules = Schedule::where('semester_id', $semester->id)
            ->where('is_active', true)
            ->with(['course', 'room', 'teachingAssignments.user'])
            ->get()
            ->map(fn (Schedule $s) => [
                'id'         => (string) $s->id,
                'kode'       => $s->course->code,
                'nama'       => $s->course->name,
                'dosen'      => $s->teachingAssignments->where('role_in_class', 'PENGAJAR')->first()?->user->name ?? '-',
                'ruangan_id' => $s->room_id,
                'hari'       => strtolower($s->day_of_week),
                'sesiMulai'  => $s->session_start,
                'durasi'     => $s->session_duration,
                'isOwn'      => false, // Aslab doesn't own any schedule
            ]);

        $rooms = Room::whereIn('id', Schedule::where('semester_id', $semester->id)->where('is_active', true)->pluck('room_id'))
            ->get(['id', 'code', 'name']);

        return Inertia::render('Aslab/Jadwal', [
            'allSchedules' => $allSchedules,
            'rooms'        => $rooms,
            'semester'     => [
                'nama'  => $semester->name,
                'tahun' => $semester->academic_year,
            ],
        ]);
    }
}
