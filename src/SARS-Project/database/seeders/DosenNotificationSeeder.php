<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DosenNotificationSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $sitiId = 2; // Prof. Siti Rahayu

        // Notifications from MOCK_NOTIFIKASI_PAGE
        $notifications = [
            [
                'triggered_by' => 1,
                'type' => 'STATUS_CHANGE',
                'title' => 'Jadwal Pengantar Informatika diperbarui oleh admin',
                'body' => 'Ruangan B4-11 diganti ke B4.06 untuk pertemuan 10. Perubahan berlaku mulai minggu depan. Silakan periksa kembali jadwal Anda.',
                'data_payload' => json_encode(['action' => 'view_schedule']),
                'created_at' => $now->copy()->subMinutes(5),
                'is_read' => false,
            ],
            [
                'triggered_by' => 1,
                'type' => 'SYSTEM',
                'title' => 'Pengumuman: Libur Nasional Hari Raya Waisak',
                'body' => 'Kegiatan perkuliahan diliburkan pada tanggal 12 Mei 2026. Jadwal pengganti akan diinformasikan kemudian.',
                'data_payload' => json_encode(['action' => 'view_announcement']),
                'created_at' => $now->copy()->subMinutes(30),
                'is_read' => false,
            ],
            [
                'triggered_by' => 1,
                'type' => 'REMINDER',
                'title' => 'Rapat dosen jurusan besok pukul 09:00',
                'body' => 'Agenda: evaluasi tengah semester dan pembagian kelas baru untuk semester ganjil 2026/2027. Kehadiran wajib.',
                'data_payload' => json_encode(['action' => 'view_agenda']),
                'created_at' => $now->copy()->subHours(1),
                'is_read' => false,
            ],
            [
                'triggered_by' => 1,
                'type' => 'STATUS_CHANGE',
                'title' => 'Jadwal Kecerdasan Buatan dipindah sementara',
                'body' => 'Lab 3 TIK Lt.3 dalam maintenance. Kelas dipindah ke Lab 4 TIK Lt.4 untuk 2 minggu ke depan.',
                'data_payload' => json_encode(['action' => 'view_schedule']),
                'created_at' => $now->copy()->subHours(2),
                'is_read' => false,
            ],
            [
                'triggered_by' => 1,
                'type' => 'STATUS_CHANGE',
                'title' => 'Permintaan pindah ruangan disetujui admin',
                'body' => 'Ruangan Lab 3 TIK Lt.3 tersedia untuk Kecerdasan Buatan mulai pertemuan 12.',
                'data_payload' => json_encode(['action' => 'view_schedule']),
                'created_at' => $now->copy()->subHours(3),
                'is_read' => true,
            ],
            [
                'triggered_by' => 1,
                'type' => 'SYSTEM',
                'title' => 'Reminder: Batas akhir upload RPS semester ini',
                'body' => 'RPS untuk semua mata kuliah yang Anda ampu harus sudah terupload di SIAKAD sebelum tanggal 20 Mei 2026.',
                'data_payload' => json_encode(['action' => 'view_system']),
                'created_at' => $now->copy()->subHours(5),
                'is_read' => true,
            ],
            [
                'triggered_by' => 1,
                'type' => 'STATUS_CHANGE',
                'title' => 'Jadwal Seminar Proposal ditambahkan',
                'body' => 'Admin menambahkan jadwal baru: Seminar Proposal hari Kamis Sesi 6-7 di Pasca 1301.',
                'data_payload' => json_encode(['action' => 'view_schedule']),
                'created_at' => $now->copy()->subDays(1),
                'is_read' => true,
            ],
            [
                'triggered_by' => 1,
                'type' => 'REMINDER',
                'title' => 'Deadline input nilai: 15 Juni 2026',
                'body' => 'Pastikan semua nilai UTS dan tugas sudah terinput di SIAKAD sebelum batas waktu. Keterlambatan akan dikenakan sanksi administratif.',
                'data_payload' => json_encode(['action' => 'view_info']),
                'created_at' => $now->copy()->subDays(1)->subHours(2),
                'is_read' => true,
            ],
            [
                'triggered_by' => 1,
                'type' => 'REMINDER',
                'title' => 'Hasil evaluasi dosen semester lalu tersedia',
                'body' => 'Hasil survei evaluasi mahasiswa terhadap perkuliahan semester ganjil 2025/2026 sudah dapat diakses di portal dosen.',
                'data_payload' => json_encode(['action' => 'view_info']),
                'created_at' => $now->copy()->subDays(2),
                'is_read' => true,
            ],
            [
                'triggered_by' => 1,
                'type' => 'SYSTEM',
                'title' => 'Pemeliharaan server SIAKAD malam ini',
                'body' => 'Server SIAKAD akan mengalami downtime untuk maintenance pada pukul 23:00-02:00 WIB. Mohon selesaikan aktivitas sebelum waktu tersebut.',
                'data_payload' => json_encode(['action' => 'view_system']),
                'created_at' => $now->copy()->subDays(3),
                'is_read' => true,
            ],
            [
                'triggered_by' => 1,
                'type' => 'STATUS_CHANGE',
                'title' => 'Jadwal Pengantar Informatika Kelas C ditambahkan',
                'body' => 'Admin menambahkan kelas paralel baru: IF-101 Kelas C hari Rabu Sesi 4-6 di B4-11. Anda ditugaskan sebagai pengajar.',
                'data_payload' => json_encode(['action' => 'view_schedule']),
                'created_at' => $now->copy()->subDays(4),
                'is_read' => true,
            ],
            [
                'triggered_by' => 1,
                'type' => 'REMINDER',
                'title' => 'Undangan: Workshop Kurikulum Merdeka Belajar',
                'body' => 'Fakultas menyelenggarakan workshop penyusunan kurikulum OBE pada tanggal 25 Mei 2026 di Aula Utama. Pendaftaran melalui link terlampir.',
                'data_payload' => json_encode(['action' => 'view_info']),
                'created_at' => $now->copy()->subDays(5),
                'is_read' => true,
            ],
        ];

        foreach ($notifications as $n) {
            $isRead = $n['is_read'];
            unset($n['is_read']);
            
            $notifId = DB::table('notifications')->insertGetId($n);
            
            DB::table('notification_recipients')->insert([
                'notification_id' => $notifId,
                'recipient_id' => $sitiId,
                'channel' => 'IN_APP',
                'is_sent' => true,
                'sent_at' => $n['created_at'],
                'is_read' => $isRead,
                'read_at' => $isRead ? $n['created_at']->copy()->addMinutes(10) : null,
            ]);
        }
    }
}
