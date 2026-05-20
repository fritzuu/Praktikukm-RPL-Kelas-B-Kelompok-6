<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class RealScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // Ensure we have a semester to use (e.g., Genap 2024/2025)
        $semesterId = DB::table('semesters')->where('term', 'GENAP')->first()->id ?? DB::table('semesters')->insertGetId([
            'name' => 'Semester Genap 2024/2025',
            'academic_year' => '2024/2025',
            'term' => 'GENAP',
            'start_date' => '2025-02-10',
            'end_date' => '2025-06-30',
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $rawData = <<<EOT
📅 Senin
Sesi 1-3: Matematika Diskrit I (semester 2) (kelas C) (Ruang: B4-10)
Sesi 1-2: Pemrograman Web (semester 4) (kelas B) (Ruang: B4-11)
Sesi 1-3: Aljabar Linier (semester 2) (kelas D) (Ruang: B4.06)
Sesi 1-3: Matematika Diskrit I (semester 2) (kelas B) (Ruang: Lab .4 TIK Lt.4)
Sesi 1-2: Jaringan Komputer (semester 4) (kelas C) (Ruang: Lab B4.05)
Sesi 1-3: Proyek Perangkat Lunak (semester 6) (kelas A) (Ruang: Pasca 1301)
Sesi 1-3: Metode Penelitian (semester 6) (kelas B) (Ruang: Pasca 1304)
Sesi 3-5: Kecerdasan Buatan (semester 4) (kelas D) (Ruang: B4-11)
Sesi 3-4: Pengembangan Aplikasi (semester 4) (kelas B) (Ruang: Lab 3 TIK Lt.3)
Sesi 4-5: Organisasi Sistem Komputer (semester 2) (kelas A) (Ruang: B4-10)
Sesi 4-5: Pengembangan Aplikasi (semester 4) (kelas C) (Ruang: Lab .4 TIK Lt.4)
Sesi 4-5: Pendidikan Kewarganegaraan (semester 2) (kelas D) (Ruang: Lab B4.04)
Sesi 6-8: Rekayasa Perangkat Lunak (semester 4) (kelas D) (Ruang: B4-10)
Sesi 6-8: Kalkulus II (semester 2) (kelas A) (Ruang: B4-11)
Sesi 6-7: Organisasi Sistem Komputer (semester 2) (kelas B) (Ruang: Lab 3 TIK Lt.3)
Sesi 6-7: Jaringan Komputer (semester 4) (kelas A) P (Ruang: Lab B4.04)
Sesi 6: Organisasi Sistem Komputer (semester 2) (kelas D) P (Ruang: Lab B4.05)
Sesi 6-8: Business Intelligence (semester 6) (kelas A) (Ruang: Pasca 1312)
Sesi 8: Rekayasa Perangkat Lunak (semester 4) (kelas A) P (Ruang: Lab .4 TIK Lt.4)
Sesi 8: Organisasi Sistem Komputer (semester 2) (kelas B) P (Ruang: Lab 3 TIK Lt.3)
Sesi 9-10: Bahasa Inggris I (semester 1) (kelas A) khusus mhs angk <=2023 yang make up EAP (Ruang: B4-11)

📅 Selasa
Sesi 1-3: Aljabar Linier (semester 2) (kelas C) (Ruang: B4-10)
Sesi 1-2: Pemrograman Web (semester 4) (kelas C) (Ruang: B4-11)
Sesi 1-3: Metode Penelitian (semester 6) (kelas A) (Ruang: B4.06)
Sesi 1-3: Matematika Diskrit I (semester 2) (kelas A) (Ruang: Lab 3 TIK Lt.3)
Sesi 1-2: Jaringan Komputer (semester 4) (kelas A) (Ruang: Lab B4.04)
Sesi 1-2: Jaringan Komputer (semester 4) (kelas D) (Ruang: Lab B4.05)
Sesi 1-3: Proyek Perangkat Lunak (semester 6) (kelas B) (Ruang: Pasca 1301)
Sesi 1-3: Matematika Diskrit I (semester 2) (kelas D) (Ruang: Pasca 1304)
Sesi 3-4: Jaringan Komputer (semester 4) (kelas D) P (Ruang: Lab B4.05)
Sesi 4-5: Pendidikan Kewarganegaraan (semester 2) (kelas B) (Ruang: B4-10)
Sesi 4: Struktur Data & Algoritma (semester 2) (kelas D) P (Ruang: B4-11)
Sesi 4: Organisasi Sistem Komputer (semester 2) (kelas A) P (Ruang: Pasca 1304)
Sesi 4-5: Pendidikan Kewarganegaraan (semester 2) (kelas C) (Ruang: Pasca 1312)
Sesi 5: Pemrograman Web (semester 4) (kelas D) P (Ruang: Lab B4.04)
Sesi 6-8: Kalkulus II (semester 2) (kelas B) (Ruang: B4-10)
Sesi 6-8: Aljabar Linier (semester 2) (kelas A) (Ruang: B4-11)
Sesi 6: Rekayasa Perangkat Lunak (semester 4) (kelas D) P (Ruang: B4.06)
Sesi 6-8: Cyber Security (semester 6) (kelas A) (Ruang: Lab .4 TIK Lt.4)
Sesi 6-7: Manajemen Sistem Informasi (semester 2) (kelas C) (Ruang: Lab B4.05)
Sesi 6-8: Teori Bahasa & Automata (semester 4) (kelas A) (Ruang: Pasca 1304)
Sesi 6-8: Kalkulus II (semester 2) (kelas D) (Ruang: Pasca 1312)

📅 Rabu
Sesi 1-3: Struktur Data & Algoritma (semester 2) (kelas C) (Ruang: B4-10)
Sesi 1-3: Kecerdasan Buatan (semester 4) (kelas B) (Ruang: B4-11)
Sesi 1-2: Organisasi Sistem Komputer (semester 2) (kelas D) (Ruang: Lab .4 TIK Lt.4)
Sesi 1-3: Expert System (semester 6) (kelas A) (Ruang: Lab 3 TIK Lt.3)
Sesi 1-2: Pemrograman Web (semester 4) (kelas A) (Ruang: Lab B4.04)
Sesi 1-3: Struktur Data & Algoritma (semester 2) (kelas B) (Ruang: Pasca 1312)
Sesi 2: Pengembangan Aplikasi (semester 4) (kelas D) P (Ruang: Lab B4.05)
Sesi 4-5: Manajemen Sistem Informasi (semester 2) (kelas D) (Ruang: B4-10)
Sesi 4-5: Organisasi Sistem Komputer (semester 2) (kelas C) (Ruang: B4-11)
Sesi 4: Struktur Data & Algoritma (semester 2) (kelas B) P (Ruang: Lab 3 TIK Lt.3)
Sesi 4: Pengembangan Aplikasi (semester 4) (kelas C)P (Ruang: Lab B4.05)
Sesi 5: Rekayasa Perangkat Lunak (semester 4) (kelas B) P (Ruang: Lab .4 TIK Lt.4)
Sesi 6-8: Aljabar Linier (semester 2) (kelas B) (Ruang: B4-10)
Sesi 6-8: Teori Bahasa & Automata (semester 4) (kelas C) (Ruang: B4-11)
Sesi 6-8: Metode Penelitian (semester 6) (kelas D) (Ruang: B4.06)
Sesi 6: Organisasi Sistem Komputer (semester 2) (kelas C) P (Ruang: Lab .4 TIK Lt.4)
Sesi 6-8: Rekayasa Perangkat Lunak (semester 4) (kelas B) (Ruang: Lab 3 TIK Lt.3)
Sesi 6-8: Struktur Data & Algoritma (semester 2) (kelas D) (Ruang: Lab B4.04)
Sesi 6-8: Kecerdasan Buatan (semester 4) (kelas A) (Ruang: Lab B4.05)
Sesi 6-8: Pengamanan Data Multimedia (semester 6) (kelas A) (Ruang: Pasca 1312)

📅 Kamis
Sesi 1-3: Teknik Multimedia (semester 6) (kelas A) (Ruang: B4-10)
Sesi 1-3: Kecerdasan Buatan (semester 4) (kelas C) (Ruang: B4-11)
Sesi 1: Pemrograman Web (semester 4) (kelas A) P (Ruang: Lab 3 TIK Lt.3)
Sesi 1-2: Manajemen Sistem Informasi (semester 2) (kelas B) (Ruang: Pasca 1312)
Sesi 2: Pemrograman Web (semester 4) (kelas B) P (Ruang: Lab B4.04)
Sesi 2-3: Pendidikan Kewarganegaraan (semester 2) (kelas A) (Ruang: Lab B4.05)
Sesi 3: Struktur Data & Algoritma (semester 2) (kelas C) P (Ruang: Lab .4 TIK Lt.4)
Sesi 3-4: Pengembangan Aplikasi (semester 4) (kelas A) (Ruang: Pasca 1304)
Sesi 4-5: Pemrograman Web (semester 4) (kelas D) (Ruang: B4-10)
Sesi 4-5: Kapita Selekta Ilmu Komputer (semester 6) (kelas A) (Ruang: B4-11)
Sesi 4: Pemrograman Web (semester 4) (kelas C) P (Ruang: Lab B4.04)
Sesi 4-5: Jaringan Komputer (semester 4) (kelas B) (Ruang: Lab B4.05)
Sesi 5: Pengembangan Aplikasi (semester 4) (kelas A) P (Ruang: Lab 3 TIK Lt.3)
Sesi 6-8: Struktur Data & Algoritma (semester 2) (kelas A) (Ruang: B4-10)
Sesi 6-8: Jaminan Mutu Perangkat Lunak (semester 6) (kelas A) (Ruang: B4-11)
Sesi 6: Rekayasa Perangkat Lunak (semester 4) (kelas C) P (Ruang: B4.06)
Sesi 6-8: Rekayasa Perangkat Lunak (semester 4) (kelas A) (Ruang: Lab .4 TIK Lt.4)
Sesi 6-7: Jaringan Komputer (semester 4) (kelas B) P (Ruang: Lab B4.04)
Sesi 6-8: Kalkulus II (semester 2) (kelas C) (Ruang: Pasca 1312)
Sesi 8: Pengembangan Aplikasi (semester 4) (kelas B) P (Ruang: Lab 3 TIK Lt.3)

📅 Jumat
Sesi 1-2: Pengembangan Aplikasi (semester 4) (kelas D) (Ruang: B4-11)
Sesi 2-4: Rekayasa Perangkat Lunak (semester 4) (kelas C) (Ruang: B4-10)
Sesi 2-4: Teori Bahasa & Automata (semester 4) (kelas B) (Ruang: B4.06)
Sesi 2-4: Metode Penelitian (semester 6) (kelas C) (Ruang: Lab B4.05)
Sesi 2-4: Komputasi Cloud (semester 6) (kelas A) (Ruang: Pasca 1312)
Sesi 5-7: Natural Language Processing (semester 6) (kelas A) (Ruang: B4-10)
Sesi 5-7: Teori Bahasa & Automata (semester 4) (kelas D) (Ruang: B4-11)
Sesi 5-6: Manajemen Sistem Informasi (semester 2) (kelas A) (Ruang: B4.06)
Sesi 5-6: Jaringan Komputer (semester 4) (kelas C) P (Ruang: Lab B4.05)
Sesi 6-8: di pinjam kelas kecerdasan buatan (Ruang: Lab B4.04)
Sesi 7: Struktur Data & Algoritma (semester 2) (kelas A) P (Ruang: B4.06)
EOT;

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

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (str_starts_with($line, '📅')) {
                $dayStr = trim(str_replace('📅', '', $line));
                $currentDay = strtoupper($dayStr);
                continue;
            }

            // Sesi 1-3: Matematika Diskrit I (semester 2) (kelas C) (Ruang: B4-10)
            // Sesi 6: Organisasi Sistem Komputer (semester 2) (kelas D) P (Ruang: Lab B4.05)
            // Sesi 6-8: di pinjam kelas kecerdasan buatan (Ruang: Lab B4.04)

            if (str_starts_with($line, 'Sesi')) {
                // Extract session
                preg_match('/Sesi\s+([0-9]+)(?:-([0-9]+))?:/', $line, $sessionMatch);
                if (!$sessionMatch) continue;

                $startSession = (int)$sessionMatch[1];
                $endSession = isset($sessionMatch[2]) ? (int)$sessionMatch[2] : $startSession;
                $sessionDuration = $endSession - $startSession + 1;

                $timesArr = ($currentDay === 'JUMAT') ? $sessionTimesJumat : $sessionTimesNormal;
                $startTime = $timesArr[$startSession][0] ?? '00:00';
                $endTime = $timesArr[$endSession][1] ?? '00:00';

                // Extract room
                preg_match('/\(Ruang:\s*(.*?)\)$/', $line, $roomMatch);
                $roomName = $roomMatch ? trim($roomMatch[1]) : 'Unknown Room';
                $roomName = strtoupper($roomName);

                // Check room type
                $roomType = 'KELAS';
                if (stripos($roomName, 'Lab') !== false) {
                    $roomType = 'LABORATORIUM';
                }

                $roomCode = strtoupper(substr(Str::slug($roomName), 0, 20));
                $roomId = DB::table('rooms')->where('code', $roomCode)->value('id');
                if (!$roomId) {
                    $roomId = DB::table('rooms')->insertGetId([
                        'code' => $roomCode,
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
                    continue; // Skip borrowed classes
                }

                // Extract course details
                // Example: Matematika Diskrit I (semester 2) (kelas C) P
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

                    // Create or find course
                    $courseCode = substr('MK-' . strtoupper(Str::slug($courseName)), 0, 20);
                    $courseId = DB::table('courses')->where('name', $courseName)->where('class_name', $className)->value('id');
                    
                    if (!$courseId) {
                        $courseId = DB::table('courses')->insertGetId([
                            'semester_id' => $semesterId,
                            'code' => $courseCode,
                            'name' => $courseName,
                            'credits' => $sessionDuration, // assumption
                            'class_name' => $className,
                            'description' => 'Semester ' . $courseSemester,
                            'is_active' => true,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                    }

                    // Create schedule
                    DB::table('schedules')->insert([
                        'course_id' => $courseId,
                        'room_id' => $roomId,
                        'semester_id' => $semesterId,
                        'day_of_week' => $currentDay,
                        'start_time' => $startTime,
                        'end_time' => $endTime,
                        'session_start' => $startSession,
                        'session_duration' => $sessionDuration,
                        'effective_from' => '2025-02-10', // matching genap
                        'is_active' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                } else {
                    // Specific cases like "Bahasa Inggris I (semester 1) (kelas A) khusus mhs angk <=2023 yang make up EAP"
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
                                'credits' => $sessionDuration, // assumption
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
                            'effective_from' => '2025-02-10', // matching genap
                            'is_active' => true,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                    }
                }
            }
        }
    }
}
