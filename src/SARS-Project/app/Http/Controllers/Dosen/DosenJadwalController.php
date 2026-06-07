<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\TeachingAssignment;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        $assignedScheduleIds = DB::table('teaching_assignments')
            ->where('user_id', $user->id)
            ->where('role_in_class', 'PENGAJAR')
            ->pluck('schedule_id');

        $schedulesData = DB::table('schedules')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->join('rooms', 'schedules.room_id', '=', 'rooms.id')
            ->whereIn('schedules.id', $assignedScheduleIds)
            ->where('schedules.semester_id', $semester->id)
            ->where('schedules.is_active', true)
            ->select(
                'schedules.id',
                'courses.code as kode',
                'courses.name as nama',
                'courses.class_name as kelas',
                DB::raw("REGEXP_REPLACE(courses.description, '[^0-9]', '') as semesterNum"),
                'courses.credits',
                'schedules.course_id',
                'rooms.code as ruangan',
                'rooms.capacity as mahasiswa',
                'schedules.day_of_week as hari',
                'schedules.session_start as sesiMulai',
                'schedules.session_duration as durasi',
                'schedules.start_time as jamMulai',
                'schedules.end_time as jamAkhir'
            )
            ->get();

        $jadwal = $schedulesData->map(function ($s) {
            return [
                'id'        => (string) $s->id,
                'kode'      => $s->kode,
                'nama'      => $s->nama,
                'kelas'     => $s->kelas,
                'semesterNum'=> $s->semesterNum,
                'ruangan'   => $s->ruangan,
                'hari'      => strtolower($s->hari),
                'sesiMulai' => $s->sesiMulai,
                'durasi'    => $s->durasi,
                'mahasiswa' => $s->mahasiswa,
                'tipe'      => 'resmi',
                'waktu'     => substr($s->jamMulai, 0, 5) . ' - ' . substr($s->jamAkhir, 0, 5),
            ];
        })->values();

        $allSchedules = DB::table('schedules')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->join('rooms', 'schedules.room_id', '=', 'rooms.id')
            ->leftJoin('teaching_assignments', function($join) {
                $join->on('schedules.id', '=', 'teaching_assignments.schedule_id')
                     ->where('teaching_assignments.role_in_class', '=', 'PENGAJAR');
            })
            ->leftJoin('users', 'teaching_assignments.user_id', '=', 'users.id')
            ->where('schedules.semester_id', $semester->id)
            ->where('schedules.is_active', true)
            ->select(
                'schedules.id',
                'courses.code as kode',
                'courses.name as nama',
                DB::raw("STRING_AGG(DISTINCT users.name, ' & ' ORDER BY users.name) as dosen"),
                'schedules.room_id',
                'rooms.code as ruangan',
                'schedules.day_of_week as hari',
                'schedules.session_start as sesiMulai',
                'schedules.session_duration as durasi',
                'courses.class_name as kelas',
                DB::raw("REGEXP_REPLACE(courses.description, '[^0-9]', '') as semesterNum"),
                'schedules.start_time as jamMulai',
                'schedules.end_time as jamAkhir'
            )
            ->groupBy(
                'schedules.id', 'courses.code', 'courses.name',
                'schedules.room_id', 'rooms.code',
                'schedules.day_of_week', 'schedules.session_start',
                'schedules.session_duration', 'courses.class_name',
                'courses.description', 'schedules.start_time', 'schedules.end_time'
            )
            ->get()
            ->map(function ($s) use ($assignedScheduleIds) {
                return [
                    'id'        => (string) $s->id,
                    'kode'      => $s->kode,
                    'nama'      => $s->nama,
                    'dosen'     => $s->dosen ?? '-',
                    'ruangan_id'=> $s->room_id,
                    'ruangan'   => $s->ruangan,
                    'hari'      => strtolower($s->hari),
                    'sesiMulai' => $s->sesiMulai,
                    'durasi'    => $s->durasi,
                    'kelas'     => $s->kelas,
                    'semesterNum'=> $s->semesterNum,
                    'jamMulai'  => $s->jamMulai,
                    'jamAkhir'  => $s->jamAkhir,
                    'isOwn'     => $assignedScheduleIds->contains($s->id),
                ];
            });

        $rooms = DB::table('rooms')
            ->whereIn('id', DB::table('schedules')->where('semester_id', $semester->id)->where('is_active', true)->pluck('room_id'))
            ->get(['id', 'code', 'name']);

        $stats = [
            'totalMataKuliah' => $schedulesData->pluck('course_id')->unique()->count(),
            'totalSks'        => $schedulesData->unique('course_id')->sum('credits'),
            'totalJadwal'     => $schedulesData->count(),
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
