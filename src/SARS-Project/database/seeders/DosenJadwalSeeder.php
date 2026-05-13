<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class DosenJadwalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * NOTE: This seeder adds test notifications for dosen.
     * Schedule data already exists from DatabaseSeeder using:
     * - Semester ID 2 (Genap 2024/2025 - is_active=true)
     * - Existing Courses, Rooms, Schedules, and TeachingAssignments
     */
    public function run(): void
    {
        // Get existing dosen users or use existing ones from DatabaseSeeder
        $dosen2 = User::find(2); // Prof. Siti Rahayu
        $dosen3 = User::find(3); // Dr. Ahmad Fauzi

        if (!$dosen2 || !$dosen3) {
            $this->command->warn('Dosen users not found. Skipping notification seeding.');
            return;
        }

        $now = now();

        // Create sample notifications for Dosen
        $notifications = [
            // For Siti
            [
                'user_id' => $dosen2->id,
                'title' => 'Jadwal Mengajar Dikonfirmasi',
                'message' => 'Jadwal mengajar Anda untuk semester Genap 2024/2025 telah dikonfirmasi oleh akademik.',
                'type' => 'success',
                'category' => 'Schedule',
                'action_url' => '/dosen/jadwal',
                'read_at' => $now->copy()->subHours(12),
            ],
            [
                'user_id' => $dosen2->id,
                'title' => 'Perubahan Ruangan',
                'message' => 'Ada perubahan ruangan untuk mata kuliah IF2101 - Pemrograman Web. Silakan cek detail jadwal Anda.',
                'type' => 'warning',
                'category' => 'Schedule',
                'action_url' => '/dosen/jadwal',
                'read_at' => $now->copy()->subHours(6),
            ],
            [
                'user_id' => $dosen2->id,
                'title' => 'Pengingat: Jadwal Mengajar Hari Ini',
                'message' => 'Anda memiliki 1 jadwal mengajar hari ini. Kelas dimulai pukul 08:00 di Ruang G-201.',
                'type' => 'info',
                'category' => 'Reminder',
                'action_url' => '/dosen/jadwal',
                'read_at' => null,
            ],
            // For Ahmad
            [
                'user_id' => $dosen3->id,
                'title' => 'Absensi Mahasiswa Dicatat',
                'message' => 'Sistem absensi untuk kelas IF2102 - Basis Data Lanjut sudah terintegrasi. Silakan lihat petunjuk penggunaan.',
                'type' => 'info',
                'category' => 'System',
                'action_url' => null,
                'read_at' => $now->copy()->subDays(2),
            ],
            [
                'user_id' => $dosen3->id,
                'title' => 'Maintenance Terjadwal',
                'message' => 'Sistem akan mengalami maintenance pada Sabtu malam pukul 22:00-23:30. Semua data akan tetap aman.',
                'type' => 'info',
                'category' => 'System',
                'action_url' => null,
                'read_at' => null,
            ],
        ];

        foreach ($notifications as $notif) {
            Notification::create($notif);
        }

        $this->command->info('Dosen Jadwal notifications seeded successfully!');
    }
}
