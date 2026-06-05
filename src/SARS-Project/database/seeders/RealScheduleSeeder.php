<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\TeachingAssignment;
use App\Models\User;
use Illuminate\Database\Seeder;

class RealScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $semester = Semester::where('is_active', true)->first();
        $semId = $semester->id;
        $effectiveFrom = $semester->start_date->format('Y-m-d');

        // ═══════════════════════════════════════════
        // SESSION TIMES
        // ═══════════════════════════════════════════
        $sessionTimesNormal = [
            1  => ['07:30', '08:20'],
            2  => ['08:25', '09:15'],
            3  => ['09:20', '10:10'],
            4  => ['10:15', '11:05'],
            5  => ['11:10', '12:00'],
            6  => ['13:00', '13:50'],
            7  => ['13:55', '14:45'],
            8  => ['15:30', '16:20'],
            9  => ['16:25', '17:15'],
            10 => ['18:00', '18:50'],
            11 => ['18:55', '19:20'],
        ];

        $sessionTimesJumat = [
            1  => ['07:30', '08:20'],
            2  => ['08:25', '09:15'],
            3  => ['09:20', '10:10'],
            4  => ['10:15', '11:05'],
            5  => ['13:00', '13:50'],
            6  => ['13:55', '14:45'],
            7  => ['15:30', '16:20'],
            8  => ['16:25', '17:15'],
            9  => ['18:00', '18:50'],
            10 => ['18:55', '19:20'],
            11 => ['19:25', '20:15'],
        ];

        // ═══════════════════════════════════════════
        // ROOM LOOKUP
        // ═══════════════════════════════════════════
        $rooms = Room::all()->keyBy('code');

        // ═══════════════════════════════════════════
        // COURSE METADATA: [code, credits, description]
        // ═══════════════════════════════════════════
        $courseMeta = [
            'Bahasa Inggris I'                  => ['BIG', 2, 'Semester 1'],
            'Matematika Diskrit I'               => ['MDI', 3, 'Semester 2'],
            'Aljabar Linier'                     => ['ALN', 3, 'Semester 2'],
            'Organisasi Sistem Komputer'         => ['OSK', 3, 'Semester 2'],
            'Pendidikan Kewarganegaraan'         => ['PKN', 2, 'Semester 2'],
            'Kalkulus II'                        => ['KAL', 3, 'Semester 2'],
            'Struktur Data & Algoritma'          => ['SDA', 3, 'Semester 2'],
            'Manajemen Sistem Informasi'         => ['MSI', 2, 'Semester 2'],
            'Pemrograman Web'                    => ['PWB', 3, 'Semester 4'],
            'Jaringan Komputer'                  => ['JKO', 3, 'Semester 4'],
            'Kecerdasan Buatan'                  => ['KCB', 3, 'Semester 4'],
            'Pengembangan Aplikasi'              => ['PAB', 3, 'Semester 4'],
            'Rekayasa Perangkat Lunak'           => ['RPL', 3, 'Semester 4'],
            'Teori Bahasa & Automata'            => ['TBA', 3, 'Semester 4'],
            'Proyek Perangkat Lunak'             => ['PPL', 3, 'Semester 6'],
            'Metode Penelitian'                  => ['MTP', 3, 'Semester 6'],
            'Business Intelligence'              => ['BIN', 3, 'Semester 6'],
            'Cyber Security'                     => ['CSE', 3, 'Semester 6'],
            'Expert System'                      => ['EXS', 3, 'Semester 6'],
            'Teknik Multimedia'                  => ['TMM', 3, 'Semester 6'],
            'Pengamanan Data Multimedia'         => ['PDM', 3, 'Semester 6'],
            'Jaminan Mutu Perangkat Lunak'       => ['JMP', 3, 'Semester 6'],
            'Kapita Selekta Ilmu Komputer'       => ['KSI', 2, 'Semester 6'],
            'Natural Language Processing'        => ['NLP', 3, 'Semester 6'],
            'Komputasi Cloud'                    => ['KCL', 3, 'Semester 6'],
        ];

        // ═══════════════════════════════════════════
        // SCHEDULE DATA
        // Format: [day, session_start, session_end, course_name, class, room_code, note]
        // ═══════════════════════════════════════════
        $scheduleData = [

            // ─────────── SENIN ───────────
            ['SENIN', 1, 3, 'Matematika Diskrit I', 'C', 'B4-10', null],
            ['SENIN', 1, 2, 'Pemrograman Web', 'B', 'B4-11', null],
            ['SENIN', 1, 3, 'Aljabar Linier', 'D', 'B4.06', null],
            ['SENIN', 1, 3, 'Matematika Diskrit I', 'B', 'LAB4-TIK', null],
            ['SENIN', 1, 2, 'Jaringan Komputer', 'C', 'LAB-B4.05', null],
            ['SENIN', 1, 3, 'Proyek Perangkat Lunak', 'A', 'PASCA-1301', null],
            ['SENIN', 1, 3, 'Metode Penelitian', 'B', 'PASCA-1304', null],
            ['SENIN', 3, 5, 'Kecerdasan Buatan', 'D', 'B4-11', null],
            ['SENIN', 4, 5, 'Organisasi Sistem Komputer', 'A', 'B4-10', null],
            ['SENIN', 4, 5, 'Pengembangan Aplikasi', 'C', 'LAB4-TIK', null],
            ['SENIN', 3, 4, 'Pengembangan Aplikasi', 'B', 'LAB3-TIK', null],
            ['SENIN', 4, 5, 'Pendidikan Kewarganegaraan', 'D', 'LAB-B4.04', null],
            ['SENIN', 6, 8, 'Rekayasa Perangkat Lunak', 'D', 'B4-10', null],
            ['SENIN', 6, 8, 'Kalkulus II', 'A', 'B4-11', null],
            ['SENIN', 6, 7, 'Organisasi Sistem Komputer', 'B', 'LAB3-TIK', null],
            ['SENIN', 6, 7, 'Jaringan Komputer', 'A P', 'LAB-B4.04', 'Praktikum'],
            ['SENIN', 6, 6, 'Organisasi Sistem Komputer', 'D P', 'LAB-B4.05', 'Praktikum'],
            ['SENIN', 6, 8, 'Business Intelligence', 'A', 'PASCA-1312', null],
            ['SENIN', 8, 8, 'Rekayasa Perangkat Lunak', 'A P', 'LAB4-TIK', 'Praktikum'],
            ['SENIN', 8, 8, 'Organisasi Sistem Komputer', 'B P', 'LAB3-TIK', 'Praktikum'],
            ['SENIN', 9, 10, 'Bahasa Inggris I', 'A', 'B4-11', 'Khusus mhs angk <=2023 make up EAP'],

            // ─────────── SELASA ───────────
            ['SELASA', 1, 3, 'Aljabar Linier', 'C', 'B4-10', null],
            ['SELASA', 1, 2, 'Pemrograman Web', 'C', 'B4-11', null],
            ['SELASA', 1, 3, 'Metode Penelitian', 'A', 'B4.06', null],
            ['SELASA', 1, 3, 'Matematika Diskrit I', 'A', 'LAB3-TIK', null],
            ['SELASA', 1, 3, 'Matematika Diskrit I', 'D', 'PASCA-1304', null],
            ['SELASA', 1, 2, 'Jaringan Komputer', 'A', 'LAB-B4.04', null],
            ['SELASA', 1, 2, 'Jaringan Komputer', 'D', 'LAB-B4.05', null],
            ['SELASA', 1, 3, 'Proyek Perangkat Lunak', 'B', 'PASCA-1301', null],
            ['SELASA', 3, 4, 'Jaringan Komputer', 'D P', 'LAB-B4.05', 'Praktikum'],
            ['SELASA', 4, 5, 'Pendidikan Kewarganegaraan', 'B', 'B4-10', null],
            ['SELASA', 4, 4, 'Struktur Data & Algoritma', 'D P', 'B4-11', 'Praktikum'],
            ['SELASA', 4, 4, 'Organisasi Sistem Komputer', 'A P', 'PASCA-1304', 'Praktikum'],
            ['SELASA', 4, 5, 'Pendidikan Kewarganegaraan', 'C', 'PASCA-1312', null],
            ['SELASA', 5, 5, 'Pemrograman Web', 'D P', 'LAB-B4.04', 'Praktikum'],
            ['SELASA', 6, 8, 'Kalkulus II', 'B', 'B4-10', null],
            ['SELASA', 6, 8, 'Aljabar Linier', 'A', 'B4-11', null],
            ['SELASA', 6, 6, 'Rekayasa Perangkat Lunak', 'D P', 'B4.06', 'Praktikum'],
            ['SELASA', 6, 8, 'Cyber Security', 'A', 'LAB4-TIK', null],
            ['SELASA', 6, 7, 'Manajemen Sistem Informasi', 'C', 'LAB-B4.05', null],
            ['SELASA', 6, 8, 'Teori Bahasa & Automata', 'A', 'PASCA-1304', null],
            ['SELASA', 6, 8, 'Kalkulus II', 'D', 'PASCA-1312', null],

            // ─────────── RABU ───────────
            ['RABU', 1, 3, 'Struktur Data & Algoritma', 'C', 'B4-10', null],
            ['RABU', 1, 3, 'Kecerdasan Buatan', 'B', 'B4-11', null],
            ['RABU', 1, 2, 'Organisasi Sistem Komputer', 'D', 'LAB4-TIK', null],
            ['RABU', 1, 3, 'Expert System', 'A', 'LAB3-TIK', null],
            ['RABU', 1, 2, 'Pemrograman Web', 'A', 'LAB-B4.04', null],
            ['RABU', 1, 3, 'Struktur Data & Algoritma', 'B', 'PASCA-1312', null],
            ['RABU', 2, 2, 'Pengembangan Aplikasi', 'D P', 'LAB-B4.05', 'Praktikum'],
            ['RABU', 4, 5, 'Manajemen Sistem Informasi', 'D', 'B4-10', null],
            ['RABU', 4, 5, 'Organisasi Sistem Komputer', 'C', 'B4-11', null],
            ['RABU', 4, 4, 'Struktur Data & Algoritma', 'B P', 'LAB3-TIK', 'Praktikum'],
            ['RABU', 4, 4, 'Pengembangan Aplikasi', 'C P', 'LAB-B4.05', 'Praktikum'],
            ['RABU', 5, 5, 'Rekayasa Perangkat Lunak', 'B P', 'LAB4-TIK', 'Praktikum'],
            ['RABU', 6, 8, 'Aljabar Linier', 'B', 'B4-10', null],
            ['RABU', 6, 8, 'Teori Bahasa & Automata', 'C', 'B4-11', null],
            ['RABU', 6, 8, 'Metode Penelitian', 'D', 'B4.06', null],
            ['RABU', 6, 6, 'Organisasi Sistem Komputer', 'C P', 'LAB4-TIK', 'Praktikum'],
            ['RABU', 6, 8, 'Rekayasa Perangkat Lunak', 'B', 'LAB3-TIK', null],
            ['RABU', 6, 8, 'Struktur Data & Algoritma', 'D', 'LAB-B4.04', null],
            ['RABU', 6, 8, 'Kecerdasan Buatan', 'A', 'LAB-B4.05', null],
            ['RABU', 6, 8, 'Pengamanan Data Multimedia', 'A', 'PASCA-1312', null],

            // ─────────── KAMIS ───────────
            ['KAMIS', 1, 3, 'Teknik Multimedia', 'A', 'B4-10', null],
            ['KAMIS', 1, 3, 'Kecerdasan Buatan', 'C', 'B4-11', null],
            ['KAMIS', 1, 1, 'Pemrograman Web', 'A P', 'LAB3-TIK', 'Praktikum'],
            ['KAMIS', 1, 2, 'Manajemen Sistem Informasi', 'B', 'PASCA-1312', null],
            ['KAMIS', 2, 2, 'Pemrograman Web', 'B P', 'LAB-B4.04', 'Praktikum'],
            ['KAMIS', 2, 3, 'Pendidikan Kewarganegaraan', 'A', 'LAB-B4.05', null],
            ['KAMIS', 3, 3, 'Struktur Data & Algoritma', 'C P', 'LAB4-TIK', 'Praktikum'],
            ['KAMIS', 3, 4, 'Pengembangan Aplikasi', 'A', 'PASCA-1304', null],
            ['KAMIS', 4, 5, 'Pemrograman Web', 'D', 'B4-10', null],
            ['KAMIS', 4, 5, 'Kapita Selekta Ilmu Komputer', 'A', 'B4-11', null],
            ['KAMIS', 4, 4, 'Pemrograman Web', 'C P', 'LAB-B4.04', 'Praktikum'],
            ['KAMIS', 4, 5, 'Jaringan Komputer', 'B', 'LAB-B4.05', null],
            ['KAMIS', 5, 5, 'Pengembangan Aplikasi', 'A P', 'LAB3-TIK', 'Praktikum'],
            ['KAMIS', 6, 8, 'Struktur Data & Algoritma', 'A', 'B4-10', null],
            ['KAMIS', 6, 8, 'Jaminan Mutu Perangkat Lunak', 'A', 'B4-11', null],
            ['KAMIS', 6, 6, 'Rekayasa Perangkat Lunak', 'C P', 'B4.06', 'Praktikum'],
            ['KAMIS', 6, 8, 'Rekayasa Perangkat Lunak', 'A', 'LAB4-TIK', null],
            ['KAMIS', 6, 7, 'Jaringan Komputer', 'B P', 'LAB-B4.04', 'Praktikum'],
            ['KAMIS', 6, 8, 'Kalkulus II', 'C', 'PASCA-1312', null],
            ['KAMIS', 8, 8, 'Pengembangan Aplikasi', 'B P', 'LAB3-TIK', 'Praktikum'],

            // ─────────── JUMAT ───────────
            ['JUMAT', 1, 2, 'Pengembangan Aplikasi', 'D', 'B4-11', null],
            ['JUMAT', 2, 4, 'Rekayasa Perangkat Lunak', 'C', 'B4-10', null],
            ['JUMAT', 2, 4, 'Teori Bahasa & Automata', 'B', 'B4.06', null],
            ['JUMAT', 2, 4, 'Metode Penelitian', 'C', 'LAB-B4.05', null],
            ['JUMAT', 2, 4, 'Komputasi Cloud', 'A', 'PASCA-1312', null],
            ['JUMAT', 5, 7, 'Natural Language Processing', 'A', 'B4-10', null],
            ['JUMAT', 5, 7, 'Teori Bahasa & Automata', 'D', 'B4-11', null],
            ['JUMAT', 5, 6, 'Manajemen Sistem Informasi', 'A', 'B4.06', null],
            ['JUMAT', 5, 6, 'Jaringan Komputer', 'C P', 'LAB-B4.05', 'Praktikum'],
            ['JUMAT', 7, 7, 'Struktur Data & Algoritma', 'A P', 'B4.06', 'Praktikum'],
        ];

        // ═══════════════════════════════════════════
        // CREATE COURSES + SCHEDULES
        // ═══════════════════════════════════════════
        $courseCache = [];   // "name|class" => Course model
        $scheduleLookup = []; // "name|class|day|session_start" => Schedule model

        foreach ($scheduleData as $entry) {
            [$day, $sesStart, $sesEnd, $courseName, $class, $roomCode, $note] = $entry;

            // Get or create course
            $cacheKey = "{$courseName}|{$class}";
            if (!isset($courseCache[$cacheKey])) {
                $meta = $courseMeta[$courseName];
                $courseCache[$cacheKey] = Course::firstOrCreate(
                    ['semester_id' => $semId, 'code' => $meta[0], 'class_name' => $class],
                    [
                        'name'        => $courseName,
                        'credits'     => $meta[1],
                        'description' => $meta[2],
                        'is_active'   => true,
                    ]
                );
            }
            $course = $courseCache[$cacheKey];

            // Calculate times
            $times = ($day === 'JUMAT') ? $sessionTimesJumat : $sessionTimesNormal;
            $startTime = $times[$sesStart][0];
            $endTime   = $times[$sesEnd][1];
            $duration  = $sesEnd - $sesStart + 1;

            // Get room
            $room = $rooms[$roomCode];

            // Create schedule
            $schedule = Schedule::create([
                'course_id'        => $course->id,
                'room_id'          => $room->id,
                'semester_id'      => $semId,
                'day_of_week'      => $day,
                'start_time'       => $startTime,
                'end_time'         => $endTime,
                'session_start'    => $sesStart,
                'session_duration' => $duration,
                'effective_from'   => $effectiveFrom,
                'effective_until'  => null,
                'is_active'        => true,
            ]);

            // Store for teaching assignment lookup
            $lookupKey = "{$courseName}|{$class}|{$day}|{$sesStart}";
            $scheduleLookup[$lookupKey] = $schedule;
        }

        // ═══════════════════════════════════════════
        // TEACHING ASSIGNMENTS (Dosen Pengampu)
        // Format: [dosen_email, course_name, class, day, session_start]
        // ═══════════════════════════════════════════
        $teachingData = [
            // ── Umi ──
            ['umi@sars.test', 'Kalkulus II', 'A', 'SENIN', 6],
            ['umi@sars.test', 'Kalkulus II', 'B', 'SELASA', 6],
            ['umi@sars.test', 'Metode Penelitian', 'D', 'RABU', 6],
            ['umi@sars.test', 'Metode Penelitian', 'C', 'JUMAT', 2],

            // ── Heri ──
            ['heri@sars.test', 'Matematika Diskrit I', 'B', 'SENIN', 1],
            ['heri@sars.test', 'Matematika Diskrit I', 'A', 'SELASA', 1],
            ['heri@sars.test', 'Expert System', 'A', 'RABU', 1],
            ['heri@sars.test', 'Teknik Multimedia', 'A', 'KAMIS', 1],
            ['heri@sars.test', 'Pengamanan Data Multimedia', 'A', 'RABU', 6],

            // ── Bambang ──
            ['bambang@sars.test', 'Aljabar Linier', 'D', 'SENIN', 1],
            ['bambang@sars.test', 'Aljabar Linier', 'C', 'SELASA', 1],
            ['bambang@sars.test', 'Cyber Security', 'A', 'SELASA', 6],

            // ── Esti ──
            ['esti@sars.test', 'Aljabar Linier', 'A', 'SELASA', 6],
            ['esti@sars.test', 'Aljabar Linier', 'B', 'RABU', 6],

            // ── Wiranto ──
            ['wiranto@sars.test', 'Struktur Data & Algoritma', 'C', 'RABU', 1],
            ['wiranto@sars.test', 'Struktur Data & Algoritma', 'D', 'RABU', 6],

            // ── Fajar (X) ──
            // ── Dewi (X) ──

            // ── Wisnu ──
            ['wisnu@sars.test', 'Jaringan Komputer', 'C', 'SENIN', 1],
            ['wisnu@sars.test', 'Jaringan Komputer', 'C P', 'JUMAT', 5],

            // ── Aziz ──
            ['aziz@sars.test', 'Jaringan Komputer', 'D', 'SELASA', 1],
            ['aziz@sars.test', 'Jaringan Komputer', 'D P', 'SELASA', 3],

            // ── Herdito ──
            ['herdito@sars.test', 'Jaringan Komputer', 'A', 'SELASA', 1],
            ['herdito@sars.test', 'Jaringan Komputer', 'A P', 'SENIN', 6],
            ['herdito@sars.test', 'Jaringan Komputer', 'B', 'KAMIS', 4],
            ['herdito@sars.test', 'Jaringan Komputer', 'B P', 'KAMIS', 6],
            ['herdito@sars.test', 'Organisasi Sistem Komputer', 'C', 'RABU', 4],
            ['herdito@sars.test', 'Organisasi Sistem Komputer', 'C P', 'RABU', 6],
            ['herdito@sars.test', 'Organisasi Sistem Komputer', 'D', 'RABU', 1],
            ['herdito@sars.test', 'Organisasi Sistem Komputer', 'D P', 'SENIN', 6],
            
            // ── Wiharto ──
            ['wiharto@sars.test', 'Kecerdasan Buatan', 'A', 'RABU', 1],
            ['wiharto@sars.test', 'Kecerdasan Buatan', 'B', 'RABU', 6],
            ['wiharto@sars.test', 'Kecerdasan Buatan', 'C', 'KAMIS', 1],
            ['wiharto@sars.test', 'Kecerdasan Buatan', 'D', 'SENIN', 3],

            // ── Haryono ──
            ['haryono@sars.test', 'Rekayasa Perangkat Lunak', 'B', 'RABU', 6],
            ['haryono@sars.test', 'Rekayasa Perangkat Lunak', 'A P', 'SENIN', 8],
            ['haryono@sars.test', 'Rekayasa Perangkat Lunak', 'A', 'KAMIS', 6],
            ['haryono@sars.test', 'Rekayasa Perangkat Lunak', 'B P', 'RABU', 5],
            
            // ── Zuhdi ──
            ['zuhdi@sars.test', 'Matematika Diskrit I', 'C', 'SENIN', 1],
            ['zuhdi@sars.test', 'Matematika Diskrit I', 'D', 'SELASA', 1],
            ['zuhdi@sars.test', 'Teori Bahasa & Automata', 'A', 'SELASA', 6],
            ['zuhdi@sars.test', 'Teori Bahasa & Automata', 'B', 'JUMAT', 2],

            // ── Ristu ──
            ['ristu@sars.test', 'Metode Penelitian', 'B', 'SENIN', 1],
            ['ristu@sars.test', 'Metode Penelitian', 'A', 'SELASA', 1],
            ['ristu@sars.test', 'Teori Bahasa & Automata', 'C', 'RABU', 6],
            ['ristu@sars.test', 'Teori Bahasa & Automata', 'D', 'JUMAT', 5],
            ['ristu@sars.test', 'Kapita Selekta Ilmiah', 'A', 'KAMIS', 4],
            

            // ── Ery ──
            ['ery@sars.test', 'Proyek Perangkat Lunak', 'A', 'SENIN', 1],
            ['ery@sars.test', 'Proyek Perangkat Lunak', 'B', 'SELASA', 1],
            ['ery@sars.test', 'Komputasi Cloud', 'A', 'JUMAT', 2],

            // ── Brilyan ──
            ['brilyan@sars.test', 'Organisasi Sistem Komputer', 'A', 'SENIN', 4],
            ['brilyan@sars.test', 'Organisasi Sistem Komputer', 'B', 'SENIN', 6],
            ['brilyan@sars.test', 'Organisasi Sistem Komputer', 'A P', 'SELASA', 4],
            ['brilyan@sars.test', 'Organisasi Sistem Komputer', 'B P', 'SENIN', 8],

            // ── Afrizal ──
            ['afrizal@sars.test', 'Pemrograman Web', 'C', 'SELASA', 1],
            ['afrizal@sars.test', 'Pemrograman Web', 'C P', 'KAMIS', 4],
            ['afrizal@sars.test', 'Struktur Data & Algoritma', 'B', 'RABU', 1],
            ['afrizal@sars.test', 'Struktur Data & Algoritma', 'B P', 'RABU', 4],
            ['afrizal@sars.test', 'Pemrograman Web', 'D', 'KAMIS', 4],
            ['afrizal@sars.test', 'Pemrograman Web', 'D P', 'SELASA', 5],
            ['afrizal@sars.test', 'Struktur Data & Algoritma', 'A', 'KAMIS', 6],
            ['afrizal@sars.test', 'Struktur Data & Algoritma', 'A P', 'JUMAT', 7],
            ['afrizal@sars.test', 'Natural Language Processing', 'A', 'JUMAT', 5],

            // ── Rini ──
            ['rini@sars.test', 'Rekayasa Perangkat Lunak', 'D', 'SENIN', 6],
            ['rini@sars.test', 'Rekayasa Perangkat Lunak', 'C', 'JUMAT', 2],
            ['rini@sars.test', 'Rekayasa Perangkat Lunak', 'D P', 'SELASA', 6],
            ['rini@sars.test', 'Rekayasa Perangkat Lunak', 'C P', 'KAMIS', 6],
            ['rini@sars.test', 'Manajemen Sistem Informasi', 'C', 'SELASA', 6],
            ['rini@sars.test', 'Manajemen Sistem Informasi', 'D', 'RABU', 4],
            ['rini@sars.test', 'Jaminan Mutu Perangkat Lunak', 'A', 'KAMIS', 6],
            ['rini@sars.test', 'Manajemen Sistem Informasi', 'B', 'KAMIS', 1],
            ['rini@sars.test', 'Manajemen Sistem Informasi', 'A', 'JUMAT', 5],

            // ── Endra ──
            ['endra@sars.test', 'Business Intelligence', 'A', 'SENIN', 6],

            // ── Arif ──
            ['arif@sars.test', 'Pemrograman Web', 'B', 'SENIN', 1],
            ['arif@sars.test', 'Pemrograman Web', 'B P', 'KAMIS', 2],
            ['arif@sars.test', 'Pengembangan Aplikasi', 'C', 'SENIN', 4],
            ['arif@sars.test', 'Pengembangan Aplikasi', 'C P', 'RABU', 4],
            ['arif@sars.test', 'Pemrograman Web', 'A', 'RABU', 1],
            ['arif@sars.test', 'Pemrograman Web', 'A P', 'KAMIS', 1],
            ['arif@sars.test', 'Pengembangan Aplikasi', 'D', 'JUMAT', 1],
            ['arif@sars.test', 'Pengembangan Aplikasi', 'D P', 'RABU', 2],

            // ── BaWi (X) ──

            // ── Akhmad ──
            ['akhmad@sars.test', 'Proyek Perangkat Lunak', 'A', 'SENIN', 1],
            ['akhmad@sars.test', 'Pengembangan Aplikasi', 'B', 'SENIN', 3],
            ['akhmad@sars.test', 'Pengembangan Aplikasi', 'B P', 'KAMIS', 8],
            ['akhmad@sars.test', 'Proyek Perangkat Lunak', 'B', 'SELASA', 1],
            ['akhmad@sars.test', 'Manajemen Sistem Informasi', 'C', 'SELASA', 6],
            ['akhmad@sars.test', 'Manajemen Sistem Informasi', 'D', 'RABU', 4],
            ['akhmad@sars.test', 'Manajemen Sistem Informasi', 'B', 'KAMIS', 1],
            ['akhmad@sars.test', 'Pengembangan Aplikasi', 'A', 'KAMIS', 3],
            ['akhmad@sars.test', 'Pengembangan Aplikasi', 'A P', 'KAMIS', 5],
            ['akhmad@sars.test', 'Manajemen Sistem Informasi', 'A', 'JUMAT', 5],
            ['akhmad@sars.test', 'Rekayasa Perangkat Lunak', 'D', 'SENIN', 6],
            ['akhmad@sars.test', 'Rekayasa Perangkat Lunak', 'C', 'JUMAT', 2],
            ['akhmad@sars.test', 'Rekayasa Perangkat Lunak', 'D P', 'SELASA', 6],
            ['akhmad@sars.test', 'Rekayasa Perangkat Lunak', 'C P', 'KAMIS', 6],

            // ── Fahmy, Thofiq Odhi, Shofie (X) ──
        ];

        // User email cache
        $userCache = [];

        foreach ($teachingData as $assignment) {
            [$email, $courseName, $class, $day, $sesStart] = $assignment;

            $lookupKey = "{$courseName}|{$class}|{$day}|{$sesStart}";
            $schedule = $scheduleLookup[$lookupKey] ?? null;

            if (!$schedule) {
                continue; // skip unmatched
            }

            if (!isset($userCache[$email])) {
                $userCache[$email] = User::where('email', $email)->first();
            }
            $user = $userCache[$email];

            if (!$user) {
                continue;
            }

            TeachingAssignment::firstOrCreate(
                ['schedule_id' => $schedule->id, 'user_id' => $user->id],
                ['role_in_class' => 'PENGAJAR']
            );
        }
    }
}
