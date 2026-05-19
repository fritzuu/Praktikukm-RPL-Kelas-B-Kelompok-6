<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AdminJadwalController extends Controller
{
    public function index()
    {
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
                'courses.description as semesterNum',
                'semesters.name as semester',
                'rooms.name as ruangan',
                'users.name as dosen',
                'schedules.day_of_week as hari',
                'schedules.session_start as sesiMulai',
                'schedules.session_duration as durasi',
                'schedules.start_time as jamMulai',
                'schedules.end_time as jamAkhir'
            )
            ->where('schedules.is_active', true)
            ->get()
            ->map(function ($s) {
                $s->hari = strtolower($s->hari);
                $s->tipe = 'resmi';
                $s->dosen = $s->dosen ?? 'Belum Ditentukan';
                return $s;
            });

        $rooms = DB::table('rooms')->pluck('name');

        return Inertia::render('Admin/Jadwal', [
            'jadwal' => $schedules,
            'rooms' => $rooms,
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'raw_text' => 'required|string',
            'overwrite' => 'nullable|boolean'
        ]);

        $rawData = $request->input('raw_text');
        $overwrite = $request->input('overwrite', false);

        DB::beginTransaction();
        try {
            if ($overwrite) {
                // Clear existing schedules and courses
                DB::table('teaching_assignments')->delete();
                DB::table('schedules')->delete();
                DB::table('courses')->delete();
            }

            $now = Carbon::now();

            // Find or create active semester
            $semesterId = DB::table('semesters')->where('is_active', true)->value('id');
            if (!$semesterId) {
                $semesterId = DB::table('semesters')->insertGetId([
                    'name' => 'Semester Genap 2024/2025',
                    'academic_year' => '2024/2025',
                    'term' => 'GENAP',
                    'start_date' => '2025-02-10',
                    'end_date' => '2025-06-30',
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            $lines = explode("\n", $rawData);
            $currentDay = null;

            $sessionTimesNormal = [
                1 => ['07:30', '08:20'],
                2 => ['08:25', '09:15'],
                3 => ['09:20', '10:10'],
                4 => ['10:15', '11:05'],
                5 => ['11:10', '12:00'],
                6 => ['13:00', '13:50'],
                7 => ['13:55', '14:45'],
                8 => ['15:30', '16:20'],
                9 => ['16:25', '17:15'],
                10 => ['18:00', '18:50'],
                11 => ['18:55', '19:20'],
            ];

            $sessionTimesJumat = [
                1 => ['07:30', '08:20'],
                2 => ['08:25', '09:15'],
                3 => ['09:20', '10:10'],
                4 => ['10:15', '11:05'],
                5 => ['13:00', '13:50'],
                6 => ['13:55', '14:45'],
                7 => ['15:30', '16:20'],
                8 => ['16:25', '17:15'],
                9 => ['18:00', '18:50'],
                10 => ['18:55', '19:20'],
                11 => ['19:25', '20:15'],
            ];

            $importedCount = 0;

            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line)) continue;

                if (str_contains($line, 'Senin') || str_contains($line, '📅 Senin')) {
                    $currentDay = 'SENIN';
                    continue;
                } else if (str_contains($line, 'Selasa') || str_contains($line, '📅 Selasa')) {
                    $currentDay = 'SELASA';
                    continue;
                } else if (str_contains($line, 'Rabu') || str_contains($line, '📅 Rabu')) {
                    $currentDay = 'RABU';
                    continue;
                } else if (str_contains($line, 'Kamis') || str_contains($line, '📅 Kamis')) {
                    $currentDay = 'KAMIS';
                    continue;
                } else if (str_contains($line, 'Jumat') || str_contains($line, '📅 Jumat')) {
                    $currentDay = 'JUMAT';
                    continue;
                }

                if (!$currentDay) continue;

                if (str_starts_with($line, 'Sesi')) {
                    // Extract session
                    preg_match('/Sesi\s+([0-9]+)(?:-([0-9]+))?:/', $line, $sessionMatch);
                    if (!$sessionMatch) continue;

                    $startSession = (int)$sessionMatch[1];
                    $endSession = isset($sessionMatch[2]) ? (int)$sessionMatch[2] : $startSession;
                    $sessionDuration = $endSession - $startSession + 1;

                    $timesArr = ($currentDay === 'JUMAT') ? $sessionTimesJumat : $sessionTimesNormal;
                    $startTime = $timesArr[$startSession][0] ?? '07:30';
                    $endTime = $timesArr[$endSession][1] ?? '08:20';

                    // Extract room
                    preg_match('/\(Ruang:\s*(.*?)\)$/', $line, $roomMatch);
                    $roomName = $roomMatch ? trim($roomMatch[1]) : 'Unknown Room';

                    $roomType = 'KELAS';
                    if (stripos($roomName, 'Lab') !== false) {
                        $roomType = 'LABORATORIUM';
                    }

                    $roomId = DB::table('rooms')->where('name', $roomName)->value('id');
                    if (!$roomId) {
                        $roomId = DB::table('rooms')->insertGetId([
                            'code' => substr(Str::slug($roomName), 0, 20),
                            'name' => $roomName,
                            'capacity' => 40,
                            'building' => 'Unknown',
                            'type' => $roomType,
                            'is_active' => true,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                    }

                    if (str_contains(strtolower($line), 'di pinjam kelas')) {
                        continue;
                    }

                    // Extract course details
                    $content = preg_replace('/Sesi\s+[0-9]+(?:-[0-9]+)?:\s*/', '', $line);
                    $content = preg_replace('/\(Ruang:.*?\)$/', '', $content);
                    $content = trim($content);

                    preg_match('/(.*?) \(semester (.*?)\) \(kelas (.*?)\)( P)?/', $content, $courseMatch);
                    
                    if ($courseMatch) {
                        $courseName = trim($courseMatch[1]);
                        $courseSemester = trim($courseMatch[2]);
                        $className = trim($courseMatch[3]);
                        $isPraktikum = !empty($courseMatch[4]) || stripos($line, ' P ') !== false || str_ends_with($content, 'P');

                        if ($isPraktikum) {
                            $className .= ' P';
                            $courseName .= ' (Praktikum)';
                        }

                        $courseCode = substr('MK-' . strtoupper(Str::slug($courseName)), 0, 20);
                        $courseId = DB::table('courses')->where('name', $courseName)->where('class_name', $className)->value('id');
                        
                        if (!$courseId) {
                            $courseId = DB::table('courses')->insertGetId([
                                'semester_id' => $semesterId,
                                'code' => $courseCode,
                                'name' => $courseName,
                                'credits' => $sessionDuration,
                                'class_name' => $className,
                                'description' => 'Semester ' . $courseSemester,
                                'is_active' => true,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);
                        }

                        DB::table('schedules')->insert([
                            'course_id' => $courseId,
                            'room_id' => $roomId,
                            'semester_id' => $semesterId,
                            'day_of_week' => $currentDay,
                            'start_time' => $startTime,
                            'end_time' => $endTime,
                            'session_start' => $startSession,
                            'session_duration' => $sessionDuration,
                            'effective_from' => '2025-02-10',
                            'is_active' => true,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                        $importedCount++;
                    } else {
                        preg_match('/(.*?) \(semester (.*?)\) \(kelas (.*?)\)/', $content, $courseMatchSpecific);
                        if ($courseMatchSpecific) {
                            $courseName = trim($courseMatchSpecific[1]);
                            $className = trim($courseMatchSpecific[3]);

                            $courseCode = substr('MK-' . strtoupper(Str::slug($courseName)), 0, 20);
                            $courseId = DB::table('courses')->where('name', $courseName)->where('class_name', $className)->value('id');
                            
                            if (!$courseId) {
                                $courseId = DB::table('courses')->insertGetId([
                                    'semester_id' => $semesterId,
                                    'code' => $courseCode,
                                    'name' => $courseName,
                                    'credits' => $sessionDuration,
                                    'class_name' => $className,
                                    'description' => 'Semester ' . trim($courseMatchSpecific[2]),
                                    'is_active' => true,
                                    'created_at' => $now,
                                    'updated_at' => $now,
                                ]);
                            }

                            DB::table('schedules')->insert([
                                'course_id' => $courseId,
                                'room_id' => $roomId,
                                'semester_id' => $semesterId,
                                'day_of_week' => $currentDay,
                                'start_time' => $startTime,
                                'end_time' => $endTime,
                                'session_start' => $startSession,
                                'session_duration' => $sessionDuration,
                                'effective_from' => '2025-02-10',
                                'is_active' => true,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);
                            $importedCount++;
                        }
                    }
                }
            }

            DB::commit();
            return redirect()->route('admin.jadwal')->with('success', "Berhasil mengimpor {$importedCount} jadwal perkuliahan!");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('admin.jadwal')->with('error', "Gagal mengimpor jadwal: " . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            DB::table('teaching_assignments')->where('schedule_id', $id)->delete();
            DB::table('schedules')->where('id', $id)->delete();
            
            DB::commit();
            return redirect()->back()->with('success', 'Jadwal berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menghapus jadwal: ' . $e->getMessage());
        }
    }
}
