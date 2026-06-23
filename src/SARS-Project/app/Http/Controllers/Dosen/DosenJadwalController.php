<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\TeachingAssignment;
use App\Models\Room;
use Carbon\Carbon;
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

        // Baseline schedules assigned to dosen
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
                DB::raw("REGEXP_REPLACE(courses.description, '[^0-9]', '', 'g') as \"semesterNum\""),
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

        // Add overrides where dosen is assigned
        $today = Carbon::now()->toDateString();
        $overridesData = DB::table('schedule_overrides')
            ->join('schedules', 'schedule_overrides.schedule_id', '=', 'schedules.id')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->join('rooms', 'schedule_overrides.room_id', '=', 'rooms.id')
            ->whereIn('schedules.id', $assignedScheduleIds)
            ->where('schedule_overrides.is_active', true)
            ->where('schedule_overrides.override_date', '>=', $today)
            ->select(
                'schedules.id as schedule_id',
                'schedule_overrides.id as override_id',
                'schedule_overrides.override_date',
                'courses.code as kode',
                'courses.name as nama',
                'courses.class_name as kelas',
                DB::raw("REGEXP_REPLACE(courses.description, '[^0-9]', '', 'g') as \"semesterNum\""),
                'courses.credits',
                'schedules.course_id',
                'rooms.code as ruangan',
                'rooms.capacity as mahasiswa',
                'schedule_overrides.new_day_of_week as hari',
                DB::raw("0 as sesiMulai"),
                DB::raw("0 as durasi"),
                'schedule_overrides.new_start_time as jamMulai',
                'schedule_overrides.new_end_time as jamAkhir'
            )
            ->get();

        $jadwal = $schedulesData->map(function ($s) {
            return [
                'id'        => (string) $s->id,
                'schedule_id' => (string) $s->id,
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
        })->concat($overridesData->map(function ($o) {
            return [
                'id'        => 'override_' . $o->override_id,
                'schedule_id' => (string) $o->schedule_id,
                'kode'      => $o->kode,
                'nama'      => $o->nama,
                'kelas'     => $o->kelas,
                'semesterNum'=> $o->semesterNum,
                'ruangan'   => $o->ruangan,
                'hari'      => strtolower($o->hari),
                'sesiMulai' => $o->sesiMulai,
                'durasi'    => $o->durasi,
                'mahasiswa' => $o->mahasiswa,
                'tipe'      => 'override',
                'label'     => 'Jadwal Sementara',
                'tanggal'   => $o->override_date ?? null,
                'waktu'     => substr($o->jamMulai, 0, 5) . ' - ' . substr($o->jamAkhir, 0, 5),
            ];
        }))->values();

        // All campus schedules (for grid view) - filter baseline if override exists
        $today = Carbon::now()->toDateString();
        $schedulesWithOverrides = DB::table('schedule_overrides')
            ->where('is_active', true)
            ->where('override_date', '>=', $today)
            ->pluck('schedule_id')
            ->unique();

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
                DB::raw("REGEXP_REPLACE(courses.description, '[^0-9]', '', 'g') as \"semesterNum\""),
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
            ->filter(fn ($s) => !$schedulesWithOverrides->contains((int) $s->id))
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
                    'mulai'     => substr($s->jamMulai, 0, 5),
                    'selesai'   => substr($s->jamAkhir, 0, 5),
                    'tipe'      => 'resmi',
                    'isOwn'     => $assignedScheduleIds->contains($s->id),
                ];
            });

        // Add overrides to grid
        $allSchedules = $allSchedules->concat(DB::table('schedule_overrides')
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
                DB::raw("STRING_AGG(DISTINCT users.name, ' & ' ORDER BY users.name) as dosen"),
                'schedule_overrides.room_id',
                'rooms.code as ruangan',
                'schedule_overrides.new_day_of_week as hari',
                DB::raw("0 as sesiMulai"),
                DB::raw("0 as durasi"),
                'courses.class_name as kelas',
                DB::raw("REGEXP_REPLACE(courses.description, '[^0-9]', '', 'g') as \"semesterNum\""),
                'schedule_overrides.new_start_time as jamMulai',
                'schedule_overrides.new_end_time as jamAkhir',
                'schedule_overrides.override_date as tanggal'
            )
            ->groupBy(
                'schedules.id', 'schedule_overrides.id', 'courses.code', 'courses.name',
                'schedule_overrides.room_id', 'rooms.code',
                'schedule_overrides.new_day_of_week', 'courses.class_name',
                'courses.description', 'schedule_overrides.new_start_time', 'schedule_overrides.new_end_time',
                'schedule_overrides.override_date'
            )
            ->get()
            ->map(function ($o) use ($assignedScheduleIds) {
                return [
                    'id'        => $o->id,
                    'schedule_id' => (string) $o->schedule_id,
                    'kode'      => $o->kode,
                    'nama'      => $o->nama,
                    'dosen'     => $o->dosen ?? '-',
                    'ruangan_id'=> $o->room_id,
                    'ruangan'   => $o->ruangan,
                    'hari'      => strtolower($o->hari),
                    'sesiMulai' => $o->sesiMulai,
                    'durasi'    => $o->durasi,
                    'kelas'     => $o->kelas,
                    'semesterNum'=> $o->semesterNum,
                    'jamMulai'  => $o->jamMulai,
                    'jamAkhir'  => $o->jamAkhir,
                    'mulai'     => substr($o->jamMulai, 0, 5),
                    'selesai'   => substr($o->jamAkhir, 0, 5),
                    'tipe'      => 'override',
                    'label'     => 'Jadwal Sementara',
                    'tanggal'   => $o->tanggal,
                    'isOwn'     => false,
                ];
            })
        );

        $rooms = DB::table('rooms')
            ->whereIn('id', DB::table('schedules')->where('semester_id', $semester->id)->where('is_active', true)->pluck('room_id'))
            ->get(['id', 'code', 'name']);

        $stats = [
            'totalMataKuliah' => $schedulesData->pluck('course_id')->unique()->count(),
            'totalSks'        => $schedulesData->unique('course_id')->sum('credits'),
            'totalJadwal'     => $schedulesData->count() + $overridesData->count(),
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
