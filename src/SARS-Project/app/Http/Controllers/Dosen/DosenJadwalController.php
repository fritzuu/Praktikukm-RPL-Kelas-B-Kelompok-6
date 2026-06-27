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

        // Baseline schedules assigned to dosen (show all, don't hide)
        $schedulesData = DB::table('schedules')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->join('rooms', 'schedules.room_id', '=', 'rooms.id')
            ->whereIn('schedules.id', $assignedScheduleIds)
            ->where('courses.semester_id', $semester->id)
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

        // Get schedule IDs with APPROVED overrides (to hide baseline)
        $today = Carbon::now()->toDateString();
        $schedulesWithActiveOverrides = DB::table('schedule_overrides')
            ->join('change_requests', 'schedule_overrides.request_id', '=', 'change_requests.id')
            ->where('schedule_overrides.is_active', true)
            ->where('schedule_overrides.override_date', '>=', $today)
            ->where('change_requests.status', 'APPROVED')
            ->pluck('schedule_overrides.schedule_id')
            ->toArray();

        // Filter baseline: hide those with active overrides
        $schedulesData = $schedulesData
            ->filter(function ($s) use ($schedulesWithActiveOverrides) {
                return !in_array((int) $s->id, $schedulesWithActiveOverrides);
            })
            ->map(function ($s) {
                $s->hari = strtolower($s->hari);
                $s->mulai = substr($s->jamMulai, 0, 5);
                $s->selesai = substr($s->jamAkhir, 0, 5);
                $s->tipe = 'resmi';
                return $s;
            });

        // Session time mapping for override calculations
        $sessionTimesNormal = [
            1 => ['07:30', '08:20'], 2 => ['08:25', '09:15'], 3 => ['09:20', '10:10'],
            4 => ['10:15', '11:05'], 5 => ['11:10', '12:00'], 6 => ['13:00', '13:50'],
            7 => ['13:55', '14:45'], 8 => ['15:30', '16:20'], 9 => ['16:25', '17:15'],
            10 => ['18:00', '18:50'], 11 => ['18:55', '19:20'],
        ];
        $sessionTimesJumat = [
            1 => ['07:30', '08:20'], 2 => ['08:25', '09:15'], 3 => ['09:20', '10:10'],
            4 => ['10:15', '11:05'], 5 => ['13:00', '13:50'], 6 => ['13:55', '14:45'],
            7 => ['15:30', '16:20'], 8 => ['16:25', '17:15'], 9 => ['18:00', '18:50'],
            10 => ['18:55', '19:20'], 11 => ['19:25', '20:15'],
        ];

        // Get active overrides with APPROVED status
        $sessionTimesMap = [
            'SENIN'  => [1 => ['07:30', '08:20'], 2 => ['08:25', '09:15'], 3 => ['09:20', '10:10'], 4 => ['10:15', '11:05'], 5 => ['11:10', '12:00'], 6 => ['13:00', '13:50'], 7 => ['13:55', '14:45'], 8 => ['15:30', '16:20'], 9 => ['16:25', '17:15'], 10 => ['18:00', '18:50'], 11 => ['18:55', '19:20']],
            'SELASA' => [1 => ['07:30', '08:20'], 2 => ['08:25', '09:15'], 3 => ['09:20', '10:10'], 4 => ['10:15', '11:05'], 5 => ['11:10', '12:00'], 6 => ['13:00', '13:50'], 7 => ['13:55', '14:45'], 8 => ['15:30', '16:20'], 9 => ['16:25', '17:15'], 10 => ['18:00', '18:50'], 11 => ['18:55', '19:20']],
            'RABU'   => [1 => ['07:30', '08:20'], 2 => ['08:25', '09:15'], 3 => ['09:20', '10:10'], 4 => ['10:15', '11:05'], 5 => ['11:10', '12:00'], 6 => ['13:00', '13:50'], 7 => ['13:55', '14:45'], 8 => ['15:30', '16:20'], 9 => ['16:25', '17:15'], 10 => ['18:00', '18:50'], 11 => ['18:55', '19:20']],
            'KAMIS'  => [1 => ['07:30', '08:20'], 2 => ['08:25', '09:15'], 3 => ['09:20', '10:10'], 4 => ['10:15', '11:05'], 5 => ['11:10', '12:00'], 6 => ['13:00', '13:50'], 7 => ['13:55', '14:45'], 8 => ['15:30', '16:20'], 9 => ['16:25', '17:15'], 10 => ['18:00', '18:50'], 11 => ['18:55', '19:20']],
            'JUMAT'  => [1 => ['07:30', '08:20'], 2 => ['08:25', '09:15'], 3 => ['09:20', '10:10'], 4 => ['10:15', '11:05'], 5 => ['13:00', '13:50'], 6 => ['13:55', '14:45'], 7 => ['15:30', '16:20'], 8 => ['16:25', '17:15'], 9 => ['18:00', '18:50'], 10 => ['18:55', '19:20'], 11 => ['19:25', '20:15']],
        ];

        // Get overrides for ASSIGNED teaching schedules (show in jadwal mengajar section)
        $overridesForAssignedSchedules = DB::table('schedule_overrides')
            ->join('schedules', 'schedule_overrides.schedule_id', '=', 'schedules.id')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->join('rooms', 'schedule_overrides.room_id', '=', 'rooms.id')
            ->join('change_requests', 'schedule_overrides.request_id', '=', 'change_requests.id')
            ->where('schedule_overrides.is_active', true)
            ->where('schedule_overrides.override_date', '>=', $today)
            ->where('change_requests.status', 'APPROVED')
            ->where('courses.semester_id', $semester->id)
            ->whereIn('schedule_overrides.schedule_id', $assignedScheduleIds)
            ->select(
                'schedules.id as schedule_id',
                DB::raw("'override_' || schedule_overrides.id as id"),
                'courses.code as kode',
                'courses.name as nama',
                'courses.class_name as kelas',
                DB::raw("REGEXP_REPLACE(courses.description, '[^0-9]', '', 'g') as \"semesterNum\""),
                'rooms.code as ruangan',
                'rooms.capacity as mahasiswa',
                'schedule_overrides.new_day_of_week as hari',
                'schedule_overrides.new_start_time as jamMulai',
                'schedule_overrides.new_end_time as jamAkhir',
                'schedule_overrides.override_date as tanggal',
                DB::raw("SUBSTR(CAST(schedule_overrides.new_start_time AS TEXT), 1, 5) as mulai"),
                DB::raw("SUBSTR(CAST(schedule_overrides.new_end_time AS TEXT), 1, 5) as selesai")
            )
            ->get()
            ->map(function ($o) use ($sessionTimesMap) {
                $o->hari = strtolower($o->hari);
                $o->mulai = substr($o->jamMulai, 0, 5);
                $o->selesai = substr($o->jamAkhir, 0, 5);
                
                // Calculate session from new override times
                $dayUpper = strtoupper(str_replace('senin', 'SENIN', str_replace('selasa', 'SELASA', str_replace('rabu', 'RABU', str_replace('kamis', 'KAMIS', str_replace('jumat', 'JUMAT', $o->hari))))));
                $times = $sessionTimesMap[$dayUpper] ?? $sessionTimesMap['SENIN'];
                
                $sesiMulai = 1;
                $sesiSelesai = 1;
                foreach ($times as $sess => $range) {
                    if ($range[0] === $o->mulai) $sesiMulai = $sess;
                    if ($range[1] === $o->selesai) $sesiSelesai = $sess;
                }
                
                $o->sesiMulai = $sesiMulai;
                $o->durasi = $sesiSelesai - $sesiMulai + 1;
                $o->tipe = 'override';
                $o->label = 'Jadwal Sementara';
                return $o;
            });

        // Merge baseline teaching schedules + overrides for assigned courses
        $jadwal = $schedulesData->concat($overridesForAssignedSchedules)->values();

        // All campus schedules (baseline only, no overrides)
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

        // Get ALL campus overrides for ketersediaan section (same as aslab/admin)
        $overridesForKetersediaan = DB::table('schedule_overrides')
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
                'schedules.id',
                DB::raw("'override_' || schedule_overrides.id as id"),
                'courses.code as kode',
                'courses.name as nama',
                DB::raw("STRING_AGG(DISTINCT users.name, ' & ' ORDER BY users.name) as dosen"),
                'schedule_overrides.room_id as room_id',
                'rooms.code as ruangan',
                'schedule_overrides.new_day_of_week as hari',
                'schedule_overrides.new_start_time as jamMulai',
                'schedule_overrides.new_end_time as jamAkhir',
                'courses.class_name as kelas',
                DB::raw("REGEXP_REPLACE(courses.description, '[^0-9]', '', 'g') as \"semesterNum\""),
                DB::raw("SUBSTR(CAST(schedule_overrides.new_start_time AS TEXT), 1, 5) as mulai"),
                DB::raw("SUBSTR(CAST(schedule_overrides.new_end_time AS TEXT), 1, 5) as selesai")
            )
            ->groupBy(
                'schedules.id', 'schedule_overrides.id', 'courses.code', 'courses.name', 'courses.class_name',
                'courses.description', 'schedule_overrides.room_id', 'rooms.code',
                'schedule_overrides.new_day_of_week', 'schedule_overrides.new_start_time', 'schedule_overrides.new_end_time'
            )
            ->get()
            ->map(function ($o) use ($sessionTimesMap, $assignedScheduleIds) {
                $o->hari = strtolower($o->hari);
                $o->mulai = substr($o->jamMulai, 0, 5);
                $o->selesai = substr($o->jamAkhir, 0, 5);
                
                // Calculate session from new override times
                $dayUpper = strtoupper(str_ireplace(['senin', 'selasa', 'rabu', 'kamis', 'jumat'], ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'], $o->hari));
                $times = $sessionTimesMap[$dayUpper] ?? $sessionTimesMap['SENIN'];
                
                $sesiMulai = 1;
                $sesiSelesai = 1;
                foreach ($times as $sess => $range) {
                    if ($range[0] === $o->mulai) $sesiMulai = $sess;
                    if ($range[1] === $o->selesai) $sesiSelesai = $sess;
                }
                
                return [
                    'id'        => (string) $o->id,
                    'kode'      => $o->kode,
                    'nama'      => $o->nama,
                    'dosen'     => $o->dosen ?? '-',
                    'ruangan_id'=> $o->room_id,
                    'ruangan'   => $o->ruangan,
                    'hari'      => $o->hari,
                    'sesiMulai' => $sesiMulai,
                    'durasi'    => $sesiSelesai - $sesiMulai + 1,
                    'kelas'     => $o->kelas,
                    'semesterNum'=> $o->semesterNum,
                    'jamMulai'  => $o->jamMulai,
                    'jamAkhir'  => $o->jamAkhir,
                    'mulai'     => $o->mulai,
                    'selesai'   => $o->selesai,
                    'tipe'      => 'override',
                    'isOwn'     => $assignedScheduleIds->contains($o->id),
                ];
            });

        // Merge baseline + overrides for ketersediaan
        $allSchedules = $allSchedules->concat($overridesForKetersediaan)->values();

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
