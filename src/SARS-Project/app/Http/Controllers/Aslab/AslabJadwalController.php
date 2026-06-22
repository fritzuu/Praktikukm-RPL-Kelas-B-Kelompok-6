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

        // Get active overrides and convert to schedule items
        $today = Carbon::now()->toDateString();
        $overrides = DB::table('schedule_overrides')
            ->join('schedules', 'schedule_overrides.schedule_id', '=', 'schedules.id')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->join('rooms', 'schedule_overrides.room_id', '=', 'rooms.id')
            ->leftJoin('teaching_assignments', function($join) {
                $join->on('schedules.id', '=', 'teaching_assignments.schedule_id')
                     ->where('teaching_assignments.role_in_class', '=', 'PENGAJAR');
            })
            ->leftJoin('users', 'teaching_assignments.user_id', '=', 'users.id')
            ->select(
                DB::raw("'override_' || schedule_overrides.id as id"),
                'courses.code as kode',
                'courses.name as nama',
                'courses.class_name as kelas',
                DB::raw("REGEXP_REPLACE(courses.description, '[^0-9]', '', 'g') as \"semesterNum\""),
                DB::raw("'Semester ' || schedule_overrides.override_date as semester"),
                'rooms.name as ruangan',
                DB::raw("STRING_AGG(DISTINCT users.name, ' & ' ORDER BY users.name) as dosen"),
                'schedule_overrides.new_day_of_week as hari',
                DB::raw("0 as sesiMulai"),
                DB::raw("0 as durasi"),
                'schedule_overrides.new_start_time as jamMulai',
                'schedule_overrides.new_end_time as jamAkhir'
            )
            ->where('schedule_overrides.is_active', true)
            ->where('schedule_overrides.override_date', '>=', $today)
            ->groupBy(
                'schedule_overrides.id', 'courses.code', 'courses.name', 'courses.class_name',
                'courses.description', 'schedule_overrides.override_date', 'rooms.name',
                'schedule_overrides.new_day_of_week', 'schedule_overrides.new_start_time',
                'schedule_overrides.new_end_time'
            )
            ->get()
            ->map(function ($o) {
                $o->hari = strtolower($o->hari);
                $o->tipe = 'override';
                $o->dosen = $o->dosen ?? 'Belum Ditentukan';
                return $o;
            });

        // Merge baseline + overrides
        $allSchedules = $schedules->concat($overrides);

        $semester = DB::table('semesters')->where('is_active', true)->first();
        $rooms = DB::table('rooms')
            ->whereIn('id', DB::table('schedules')->where('semester_id', $semester->id ?? 0)->where('is_active', true)->pluck('room_id'))
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
