<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $now = Carbon::now();

        // =============================================
        // 1. ROLES
        // =============================================
        DB::table('roles')->insert([
            ['name' => 'Admin Fakultas',            'slug' => 'admin',     'description' => 'Administrator fakultas dengan akses penuh ke manajemen jadwal', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Asisten Lab / Asisten Dosen','slug' => 'aslab',     'description' => 'Asisten laboratorium yang memvalidasi pengajuan perubahan jadwal', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Mahasiswa',                  'slug' => 'mahasiswa', 'description' => 'Mahasiswa yang dapat mengajukan perubahan jadwal', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dosen Mata Kuliah',          'slug' => 'dosen',     'description' => 'Dosen pengajar mata kuliah', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // =============================================
        // 2. USERS
        // =============================================
        $password = Hash::make('password123');

        DB::table('users')->insert([
            // ID 1 - Admin
            [
                'name' => 'Dr. Budi Santoso',
                'email' => 'admin@university.ac.id',
                'password' => $password,
                'nim_nip' => '198501012010011001',
                'avatar_url' => null,
                'fcm_token' => null,
                'email_verified_at' => $now,
                'is_active' => true,
                'remember_token' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // ID 2 - Dosen 1
            [
                'name' => 'Prof. Siti Rahayu, M.Kom',
                'email' => 'siti.rahayu@university.ac.id',
                'password' => $password,
                'nim_nip' => '197803152005012001',
                'avatar_url' => null,
                'fcm_token' => null,
                'email_verified_at' => $now,
                'is_active' => true,
                'remember_token' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // ID 3 - Dosen 2
            [
                'name' => 'Dr. Ahmad Fauzi, S.T., M.T.',
                'email' => 'ahmad.fauzi@university.ac.id',
                'password' => $password,
                'nim_nip' => '198206202008011002',
                'avatar_url' => null,
                'fcm_token' => null,
                'email_verified_at' => $now,
                'is_active' => true,
                'remember_token' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // ID 4 - Aslab
            [
                'name' => 'Reza Pratama',
                'email' => 'reza.pratama@university.ac.id',
                'password' => $password,
                'nim_nip' => '2023001001',
                'avatar_url' => null,
                'fcm_token' => null,
                'email_verified_at' => $now,
                'is_active' => true,
                'remember_token' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // ID 5 - Mahasiswa 1
            [
                'name' => 'Andi Wijaya',
                'email' => 'andi.wijaya@student.university.ac.id',
                'password' => $password,
                'nim_nip' => '2023001010',
                'avatar_url' => null,
                'fcm_token' => null,
                'email_verified_at' => $now,
                'is_active' => true,
                'remember_token' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // ID 6 - Mahasiswa 2
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi.lestari@student.university.ac.id',
                'password' => $password,
                'nim_nip' => '2023001011',
                'avatar_url' => null,
                'fcm_token' => null,
                'email_verified_at' => $now,
                'is_active' => true,
                'remember_token' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // ID 7 - Mahasiswa 3
            [
                'name' => 'Fajar Nugroho',
                'email' => 'fajar.nugroho@student.university.ac.id',
                'password' => $password,
                'nim_nip' => '2023001012',
                'avatar_url' => null,
                'fcm_token' => null,
                'email_verified_at' => $now,
                'is_active' => true,
                'remember_token' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // =============================================
        // 3. USER_ROLES
        // =============================================
        DB::table('user_roles')->insert([
            ['user_id' => 1, 'role_id' => 1, 'assigned_at' => $now, 'assigned_by' => null],  // Budi = Admin
            ['user_id' => 2, 'role_id' => 4, 'assigned_at' => $now, 'assigned_by' => 1],     // Siti = Dosen
            ['user_id' => 3, 'role_id' => 4, 'assigned_at' => $now, 'assigned_by' => 1],     // Ahmad = Dosen
            ['user_id' => 4, 'role_id' => 2, 'assigned_at' => $now, 'assigned_by' => 1],     // Reza = Aslab
            ['user_id' => 4, 'role_id' => 3, 'assigned_at' => $now, 'assigned_by' => 1],     // Reza juga Mahasiswa
            ['user_id' => 5, 'role_id' => 3, 'assigned_at' => $now, 'assigned_by' => 1],     // Andi = Mahasiswa
            ['user_id' => 6, 'role_id' => 3, 'assigned_at' => $now, 'assigned_by' => 1],     // Dewi = Mahasiswa
            ['user_id' => 7, 'role_id' => 3, 'assigned_at' => $now, 'assigned_by' => 1],     // Fajar = Mahasiswa
        ]);

        // =============================================
        // 4. SEMESTERS
        // =============================================
        DB::table('semesters')->insert([
            [
                'name' => 'Semester Ganjil 2024/2025',
                'academic_year' => '2024/2025',
                'term' => 'GANJIL',
                'start_date' => '2024-09-02',
                'end_date' => '2025-01-31',
                'is_active' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Semester Genap 2024/2025',
                'academic_year' => '2024/2025',
                'term' => 'GENAP',
                'start_date' => '2025-02-10',
                'end_date' => '2025-06-30',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // =============================================
        // 5. ROOMS
        // =============================================
        DB::table('rooms')->insert([
            ['code' => 'LAB-A101', 'name' => 'Lab Komputer 1',   'capacity' => 40, 'building' => 'Gedung A', 'floor' => 1, 'type' => 'LABORATORIUM', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'LAB-A102', 'name' => 'Lab Komputer 2',   'capacity' => 40, 'building' => 'Gedung A', 'floor' => 1, 'type' => 'LABORATORIUM', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'G-201',    'name' => 'Ruang Kelas 201',   'capacity' => 60, 'building' => 'Gedung G', 'floor' => 2, 'type' => 'KELAS',        'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'G-202',    'name' => 'Ruang Kelas 202',   'capacity' => 60, 'building' => 'Gedung G', 'floor' => 2, 'type' => 'KELAS',        'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'AULA-B1',  'name' => 'Aula Utama',        'capacity' => 200,'building' => 'Gedung B', 'floor' => 1, 'type' => 'AULA',         'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'SEM-C301', 'name' => 'Ruang Seminar 301', 'capacity' => 80, 'building' => 'Gedung C', 'floor' => 3, 'type' => 'SEMINAR',      'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // =============================================
        // 6. COURSES (Semester Genap 2024/2025 = semester_id 2)
        // =============================================
        $semesterId = 2;

        DB::table('courses')->insert([
            ['semester_id' => $semesterId, 'code' => 'IF2101', 'name' => 'Pemrograman Web',             'credits' => 3, 'class_name' => 'IF-A 2023', 'description' => 'Mata kuliah pemrograman web dengan PHP dan Laravel',      'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['semester_id' => $semesterId, 'code' => 'IF2102', 'name' => 'Basis Data Lanjut',            'credits' => 3, 'class_name' => 'IF-A 2023', 'description' => 'Mata kuliah basis data lanjutan: indexing, tuning, NoSQL', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['semester_id' => $semesterId, 'code' => 'IF2103', 'name' => 'Rekayasa Perangkat Lunak',     'credits' => 3, 'class_name' => 'IF-B 2023', 'description' => 'Prinsip dan metodologi pengembangan perangkat lunak',      'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['semester_id' => $semesterId, 'code' => 'IF2104', 'name' => 'Jaringan Komputer',            'credits' => 3, 'class_name' => 'IF-A 2023', 'description' => 'Dasar-dasar jaringan komputer dan protokol',               'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['semester_id' => $semesterId, 'code' => 'IF2105', 'name' => 'Praktikum Pemrograman Web',    'credits' => 1, 'class_name' => 'IF-A 2023', 'description' => 'Praktikum pendamping Pemrograman Web',                    'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // =============================================
        // 7. SCHEDULES (Baseline jadwal semester genap)
        // =============================================
        DB::table('schedules')->insert([
            // Pemrograman Web - Senin 08:00-10:00 di Kelas G-201
            ['course_id' => 1, 'room_id' => 3, 'semester_id' => $semesterId, 'day_of_week' => 'SENIN',  'start_time' => '08:00', 'end_time' => '10:00', 'effective_from' => '2025-02-10', 'effective_until' => null, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            // Basis Data Lanjut - Selasa 10:00-12:00 di Kelas G-202
            ['course_id' => 2, 'room_id' => 4, 'semester_id' => $semesterId, 'day_of_week' => 'SELASA', 'start_time' => '10:00', 'end_time' => '12:00', 'effective_from' => '2025-02-10', 'effective_until' => null, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            // RPL - Rabu 13:00-15:00 di Kelas G-201
            ['course_id' => 3, 'room_id' => 3, 'semester_id' => $semesterId, 'day_of_week' => 'RABU',   'start_time' => '13:00', 'end_time' => '15:00', 'effective_from' => '2025-02-10', 'effective_until' => null, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            // Jaringan Komputer - Kamis 08:00-10:00 di Kelas G-202
            ['course_id' => 4, 'room_id' => 4, 'semester_id' => $semesterId, 'day_of_week' => 'KAMIS',  'start_time' => '08:00', 'end_time' => '10:00', 'effective_from' => '2025-02-10', 'effective_until' => null, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            // Praktikum Web - Jumat 08:00-10:00 di Lab A101
            ['course_id' => 5, 'room_id' => 1, 'semester_id' => $semesterId, 'day_of_week' => 'JUMAT',  'start_time' => '08:00', 'end_time' => '10:00', 'effective_from' => '2025-02-10', 'effective_until' => null, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // =============================================
        // 8. TEACHING ASSIGNMENTS
        // =============================================
        DB::table('teaching_assignments')->insert([
            ['schedule_id' => 1, 'user_id' => 2, 'role_in_class' => 'PENGAJAR', 'assigned_at' => $now], // Siti -> Pemrograman Web
            ['schedule_id' => 2, 'user_id' => 3, 'role_in_class' => 'PENGAJAR', 'assigned_at' => $now], // Ahmad -> Basis Data
            ['schedule_id' => 3, 'user_id' => 2, 'role_in_class' => 'PENGAJAR', 'assigned_at' => $now], // Siti -> RPL
            ['schedule_id' => 4, 'user_id' => 3, 'role_in_class' => 'PENGAJAR', 'assigned_at' => $now], // Ahmad -> Jarkom
            ['schedule_id' => 5, 'user_id' => 2, 'role_in_class' => 'PENGAJAR', 'assigned_at' => $now], // Siti -> Praktikum Web (pengajar)
            ['schedule_id' => 5, 'user_id' => 4, 'role_in_class' => 'ASISTEN',  'assigned_at' => $now], // Reza -> Praktikum Web (asisten)
        ]);

        // =============================================
        // 9. CHANGE REQUESTS (sample data)
        // =============================================
        DB::table('change_requests')->insert([
            // Request 1: Andi minta pindah Pemrograman Web tanggal tertentu (Temporary) - APPROVED
            [
                'request_code' => 'REQ-2025-001',
                'requester_id' => 5,
                'schedule_id' => 1,
                'semester_id' => $semesterId,
                'request_type' => 'TEMPORARY',
                'target_date' => '2025-03-17',
                'effective_from_date' => null,
                'proposed_day' => 'RABU',
                'proposed_start_time' => '10:00',
                'proposed_end_time' => '12:00',
                'proposed_room_id' => 4,
                'reason' => 'Bentrok dengan kegiatan UKM tingkat universitas yang wajib diikuti pada hari Senin tersebut.',
                'attachment_url' => null,
                'status' => 'APPROVED',
                'conflict_checked' => true,
                'has_conflict' => false,
                'created_at' => $now->copy()->subDays(10),
                'updated_at' => $now->copy()->subDays(8),
            ],
            // Request 2: Dewi minta perubahan permanen Jarkom (Permanent) - PENDING_ADMIN
            [
                'request_code' => 'REQ-2025-002',
                'requester_id' => 6,
                'schedule_id' => 4,
                'semester_id' => $semesterId,
                'request_type' => 'PERMANENT',
                'target_date' => null,
                'effective_from_date' => '2025-04-01',
                'proposed_day' => 'JUMAT',
                'proposed_start_time' => '13:00',
                'proposed_end_time' => '15:00',
                'proposed_room_id' => 3,
                'reason' => 'Jadwal Kamis pagi bentrok dengan mata kuliah pilihan yang hanya dibuka semester ini dan sangat dibutuhkan untuk kelulusan.',
                'attachment_url' => null,
                'status' => 'PENDING_ADMIN',
                'conflict_checked' => true,
                'has_conflict' => false,
                'created_at' => $now->copy()->subDays(5),
                'updated_at' => $now->copy()->subDays(3),
            ],
            // Request 3: Fajar minta pindah Basis Data (Temporary) - PENDING_ASLAB
            [
                'request_code' => 'REQ-2025-003',
                'requester_id' => 7,
                'schedule_id' => 2,
                'semester_id' => $semesterId,
                'request_type' => 'TEMPORARY',
                'target_date' => '2025-04-08',
                'effective_from_date' => null,
                'proposed_day' => 'KAMIS',
                'proposed_start_time' => '13:00',
                'proposed_end_time' => '15:00',
                'proposed_room_id' => 3,
                'reason' => 'Izin sakit pada hari Selasa, mohon bisa mengikuti kelas pengganti di hari lain agar tidak tertinggal materi.',
                'attachment_url' => null,
                'status' => 'PENDING_ASLAB',
                'conflict_checked' => false,
                'has_conflict' => false,
                'created_at' => $now->copy()->subDays(1),
                'updated_at' => $now->copy()->subDays(1),
            ],
        ]);

        // =============================================
        // 10. APPROVALS
        // =============================================
        DB::table('approvals')->insert([
            // REQ-2025-001: Aslab forwarded, then Admin approved
            ['request_id' => 1, 'actor_id' => 4, 'stage' => 'ASLAB_CHECK',     'decision' => 'FORWARDED', 'notes' => 'Alasan valid, tidak ada konflik jadwal. Diteruskan ke Admin.', 'decided_at' => $now->copy()->subDays(9)],
            ['request_id' => 1, 'actor_id' => 1, 'stage' => 'ADMIN_DECISION',  'decision' => 'APPROVED',  'notes' => 'Disetujui. Ruangan tersedia.',                                'decided_at' => $now->copy()->subDays(8)],
            // REQ-2025-002: Aslab forwarded, waiting Admin
            ['request_id' => 2, 'actor_id' => 4, 'stage' => 'ASLAB_CHECK',     'decision' => 'FORWARDED', 'notes' => 'Permintaan valid, konflik sudah dicek sistem.',               'decided_at' => $now->copy()->subDays(3)],
        ]);

        // =============================================
        // 11. SCHEDULE OVERRIDES (from approved REQ-2025-001)
        // =============================================
        DB::table('schedule_overrides')->insert([
            [
                'schedule_id' => 1,
                'request_id' => 1,
                'room_id' => 4,
                'override_date' => '2025-03-17',
                'new_day_of_week' => 'RABU',
                'new_start_time' => '10:00',
                'new_end_time' => '12:00',
                'is_active' => true,
                'created_at' => $now->copy()->subDays(8),
            ],
        ]);

        // =============================================
        // 12. NOTIFICATIONS
        // =============================================
        DB::table('notifications')->insert([
            // Notif 1: REQ-2025-001 approved to requester
            [
                'user_id' => 5,
                'request_id' => 1,
                'triggered_by' => 1,
                'type' => 'STATUS_CHANGE',
                'title' => 'Pengajuan REQ-2025-001 Disetujui',
                'body' => 'Pengajuan perubahan jadwal Pemrograman Web tanggal 17 Maret 2025 telah disetujui oleh Admin.',
                'data_payload' => json_encode(['request_id' => 1, 'action' => 'view_request']),
                'read_at' => $now->copy()->subDays(7),
                'created_at' => $now->copy()->subDays(8),
            ],
            // Notif 2: REQ-2025-002 forwarded to requester
            [
                'user_id' => 6,
                'request_id' => 2,
                'triggered_by' => 4,
                'type' => 'STATUS_CHANGE',
                'title' => 'Pengajuan REQ-2025-002 Diteruskan ke Admin',
                'body' => 'Pengajuan perubahan jadwal Jaringan Komputer telah divalidasi Aslab dan diteruskan ke Admin untuk keputusan akhir.',
                'data_payload' => json_encode(['request_id' => 2, 'action' => 'view_request']),
                'read_at' => $now->copy()->subDays(2),
                'created_at' => $now->copy()->subDays(3),
            ],
            // Notif 3: REQ-2025-003 new request for aslab
            [
                'user_id' => 4,
                'request_id' => 3,
                'triggered_by' => 7,
                'type' => 'STATUS_CHANGE',
                'title' => 'Pengajuan Baru: REQ-2025-003',
                'body' => 'Fajar Nugroho mengajukan perubahan jadwal Basis Data Lanjut. Menunggu validasi Aslab.',
                'data_payload' => json_encode(['request_id' => 3, 'action' => 'review_request']),
                'read_at' => null,
                'created_at' => $now->copy()->subDays(1),
            ],
        ]);
    }
}
