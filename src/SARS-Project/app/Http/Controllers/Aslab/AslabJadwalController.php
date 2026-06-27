<?php

namespace App\Http\Controllers\Aslab;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AslabJadwalController extends Controller
{
    /**
     * Display the full schedule page for aslab (view-only, all schedules).
     * Includes both baseline schedules and active overrides.
     */
    public function index(Request $request): Response
    {
        $semester = DB::table('semesters')->where('is_active', true)->first();

        if (!$semester) {
            return Inertia::render('Aslab/Jadwal', [
                'jadwal'   => [],
                'rooms'    => [],
                'semester' => null,
            ]);
        }

        // Get baseline schedules
        $schedules = DB::table('schedules')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->join('semesters', 'courses.semester_id', '=', 'semesters.id')
            ->join('rooms', 'schedules.room_id', '=', 'rooms.id')
            ->leftJoin('teaching_assignments', function($join) {
                $join->on('schedules.id', '=', 'teaching_assignments.schedule_id')
                     ->where('teaching_assignments.role_in_class', '=', 'PENGAJAR');
            })
            ->leftJoin('users', 'teaching_assignments.user_id', '=', 'users.id')
            ->where('schedules.is_active', true)
            ->where('courses.semester_id', $semester->id)
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
            ->groupBy(
                'schedules.id', 'courses.code', 'courses.name', 'courses.class_name',
                'courses.description', 'semesters.name', 'rooms.name',
                'schedules.day_of_week', 'schedules.session_start',
                'schedules.session_duration', 'schedules.start_time', 'schedules.end_time'
            )
            ->get();

        // Get schedule IDs that have active overrides, with their status
        $today = Carbon::now()->toDateString();
        $schedulesWithActiveOverrides = DB::table('schedule_overrides')
            ->join('change_requests', 'schedule_overrides.request_id', '=', 'change_requests.id')
            ->where('schedule_overrides.is_active', true)
            ->where('schedule_overrides.override_date', '>=', $today)
            ->where('change_requests.status', 'APPROVED')
            ->pluck('schedule_overrides.schedule_id')
            ->toArray();

        // Modify baseline query to exclude schedules with APPROVED overrides
        $baselineSchedules = $schedules
            ->filter(function ($s) use ($schedulesWithActiveOverrides) {
                return !in_array((int) $s->id, $schedulesWithActiveOverrides);
            })
            ->map(function ($s) {
                $s->hari = strtolower($s->hari);
                $s->mulai = substr($s->jamMulai, 0, 5);
                $s->selesai = substr($s->jamAkhir, 0, 5);
                $s->tipe = 'resmi';
                $s->dosen = $s->dosen ?? 'Belum Ditentukan';
                return $s;
            });

        // Get active overrides and convert to schedule items
        $overrides = DB::table('schedule_overrides')
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
                'schedules.session_start',
                'schedules.session_duration',
                DB::raw("'override_' || schedule_overrides.id as id"),
                'courses.code as kode',
                'courses.name as nama',
                'courses.class_name as kelas',
                DB::raw("REGEXP_REPLACE(courses.description, '[^0-9]', '', 'g') as \"semesterNum\""),
                DB::raw("'Semester ' || schedule_overrides.override_date as semester"),
                'rooms.name as ruangan',
                DB::raw("STRING_AGG(DISTINCT users.name, ' & ' ORDER BY users.name) as dosen"),
                'schedule_overrides.new_day_of_week as hari',
                'schedule_overrides.new_start_time as jamMulai',
                'schedule_overrides.new_end_time as jamAkhir',
                'schedule_overrides.override_date as tanggal',
                DB::raw("SUBSTR(CAST(schedule_overrides.new_start_time AS TEXT), 1, 5) as mulai"),
                DB::raw("SUBSTR(CAST(schedule_overrides.new_end_time AS TEXT), 1, 5) as selesai")
            )
            ->groupBy(
                'schedules.id', 'schedule_overrides.id', 'courses.code', 'courses.name', 'courses.class_name',
                'courses.description', 'schedule_overrides.override_date', 'rooms.name',
                'schedule_overrides.new_day_of_week', 'schedule_overrides.new_start_time',
                'schedule_overrides.new_end_time', 'schedules.session_start', 'schedules.session_duration'
            )
            ->get()
            ->map(function ($o) {
                $sessionTimesMap = [
                    'SENIN'  => [1 => ['07:30', '08:20'], 2 => ['08:25', '09:15'], 3 => ['09:20', '10:10'], 4 => ['10:15', '11:05'], 5 => ['11:10', '12:00'], 6 => ['13:00', '13:50'], 7 => ['13:55', '14:45'], 8 => ['15:30', '16:20'], 9 => ['16:25', '17:15'], 10 => ['18:00', '18:50'], 11 => ['18:55', '19:20']],
                    'SELASA' => [1 => ['07:30', '08:20'], 2 => ['08:25', '09:15'], 3 => ['09:20', '10:10'], 4 => ['10:15', '11:05'], 5 => ['11:10', '12:00'], 6 => ['13:00', '13:50'], 7 => ['13:55', '14:45'], 8 => ['15:30', '16:20'], 9 => ['16:25', '17:15'], 10 => ['18:00', '18:50'], 11 => ['18:55', '19:20']],
                    'RABU'   => [1 => ['07:30', '08:20'], 2 => ['08:25', '09:15'], 3 => ['09:20', '10:10'], 4 => ['10:15', '11:05'], 5 => ['11:10', '12:00'], 6 => ['13:00', '13:50'], 7 => ['13:55', '14:45'], 8 => ['15:30', '16:20'], 9 => ['16:25', '17:15'], 10 => ['18:00', '18:50'], 11 => ['18:55', '19:20']],
                    'KAMIS'  => [1 => ['07:30', '08:20'], 2 => ['08:25', '09:15'], 3 => ['09:20', '10:10'], 4 => ['10:15', '11:05'], 5 => ['11:10', '12:00'], 6 => ['13:00', '13:50'], 7 => ['13:55', '14:45'], 8 => ['15:30', '16:20'], 9 => ['16:25', '17:15'], 10 => ['18:00', '18:50'], 11 => ['18:55', '19:20']],
                    'JUMAT'  => [1 => ['07:30', '08:20'], 2 => ['08:25', '09:15'], 3 => ['09:20', '10:10'], 4 => ['10:15', '11:05'], 5 => ['13:00', '13:50'], 6 => ['13:55', '14:45'], 7 => ['15:30', '16:20'], 8 => ['16:25', '17:15'], 9 => ['18:00', '18:50'], 10 => ['18:55', '19:20'], 11 => ['19:25', '20:15']],
                ];
                
                $o->hari = strtolower($o->hari);
                $o->mulai = substr($o->jamMulai, 0, 5);
                $o->selesai = substr($o->jamAkhir, 0, 5);
                
                // Calculate session from new override times
                $dayUpper = strtoupper($o->hari);
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
                $o->dosen = $o->dosen ?? 'Belum Ditentukan';
                return $o;
            });

        // Merge baseline + overrides
        $allSchedules = $baselineSchedules->concat($overrides)->values();

        $rooms = DB::table('rooms')
            ->whereIn('id', DB::table('schedules')->where('semester_id', $semester->id)->where('is_active', true)->pluck('room_id'))
            ->pluck('name');

        return Inertia::render('Aslab/Jadwal', [
            'jadwal'   => $allSchedules,
            'rooms'    => $rooms,
            'semester' => $semester ? [
                'nama'  => $semester->name,
                'tahun' => $semester->academic_year,
            ] : null,
        ]);
    }
}
