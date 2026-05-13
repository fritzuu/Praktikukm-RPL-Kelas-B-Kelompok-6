<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\TeachingAssignment;
use App\Models\Room;
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
                'allSchedules' => [],
                'rooms' => [],
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

        // Ambil SEMUA jadwal di semester aktif untuk grid ketersediaan (Full Schedule)
        $allSchedules = Schedule::where('semester_id', $semester->id)
            ->where('is_active', true)
            ->with(['course', 'room', 'teachingAssignments.user'])
            ->get()
            ->map(fn (Schedule $s) => [
                'id'        => (string) $s->id,
                'kode'      => $s->course->code,
                'nama'      => $s->course->name,
                'dosen'     => $s->teachingAssignments->where('role_in_class', 'PENGAJAR')->first()?->user->name ?? '-',
                'ruangan_id'=> $s->room_id,
                'hari'      => strtolower($s->day_of_week),
                'sesiMulai' => $s->session_start,
                'durasi'    => $s->session_duration,
                'isOwn'     => $assignedScheduleIds->contains($s->id), // Tandai jika ini jadwal milik dosen yg login
            ]);

        $rooms = Room::all(['id', 'code', 'name']);

        // Stats summary
        $stats = [
            'totalMataKuliah' => $schedules->pluck('course_id')->unique()->count(),
            'totalSks'        => $schedules->pluck('course')->unique('id')->sum('credits'),
            'totalJadwal'     => $schedules->count(),
        ];

        return Inertia::render('Dosen/Jadwal', [
            'jadwal'       => $jadwal,
            'allSchedules' => $allSchedules,
            'rooms'        => $rooms,
            'stats'        => $stats,
            'semester'     => [
                'nama' => $semester->name,
                'tahun' => $semester->academic_year,
            ],
        ]);
    }

    /**
     * Store a new schedule change request.
     */
    public function storeRequest(Request $request)
    {
        $request->validate([
            'schedule_id'         => 'required|exists:schedules,id',
            'request_type'        => 'required|in:RESCHEDULE,EXCHANGE,MAKEUP',
            'proposed_day'        => 'required|string',
            'proposed_start_time' => 'required',
            'proposed_end_time'   => 'required',
            'reason'              => 'required|string|min:10',
        ]);

        $user = $request->user();
        $semester = Semester::active();

        \App\Models\ChangeRequest::create([
            'request_code'        => 'REQ-' . strtoupper(bin2hex(random_bytes(4))),
            'requester_id'        => $user->id,
            'schedule_id'         => $request->schedule_id,
            'semester_id'         => $semester->id,
            'request_type'        => $request->request_type,
            'proposed_day'        => strtoupper($request->proposed_day),
            'proposed_start_time' => $request->proposed_start_time,
            'proposed_end_time'   => $request->proposed_end_time,
            'reason'              => $request->reason,
            'status'              => 'PENDING',
        ]);

        return redirect()->back()->with('success', 'Pengajuan perubahan jadwal berhasil dikirim.');
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
