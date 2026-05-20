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
        // 5. CALL REAL SCHEDULE SEEDER
        // =============================================
        $this->call([
            RealScheduleSeeder::class,
        ]);

        // =============================================
        // 6. ASSIGN SOME SCHEDULES TO DOSEN (For testing)
        // =============================================
        // We will assign a few schedules so that the Dosen login will have data
        $schedules = DB::table('schedules')->pluck('id')->toArray();
        if (count($schedules) >= 5) {
            DB::table('teaching_assignments')->insert([
                ['schedule_id' => $schedules[0], 'user_id' => 2, 'role_in_class' => 'PENGAJAR', 'assigned_at' => $now], // Siti
                ['schedule_id' => $schedules[1], 'user_id' => 3, 'role_in_class' => 'PENGAJAR', 'assigned_at' => $now], // Ahmad
                ['schedule_id' => $schedules[2], 'user_id' => 2, 'role_in_class' => 'PENGAJAR', 'assigned_at' => $now], // Siti
                ['schedule_id' => $schedules[3], 'user_id' => 3, 'role_in_class' => 'PENGAJAR', 'assigned_at' => $now], // Ahmad
                ['schedule_id' => $schedules[4], 'user_id' => 2, 'role_in_class' => 'PENGAJAR', 'assigned_at' => $now], // Siti
                ['schedule_id' => $schedules[4], 'user_id' => 4, 'role_in_class' => 'ASISTEN',  'assigned_at' => $now], // Reza Aslab
            ]);
        }
    }
}
