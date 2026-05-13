// ─── Mock Data for Dosen Dashboard ──────────────────────────────────────────
// Data mock khusus dosen. Perspektif berbeda dari admin:
// - Jadwal pribadi dosen, bukan seluruh prodi
// - Notifikasi personal
// - AI assistant untuk analisis mengajar

export const MOCK_DOSEN_USER = {
    name: 'Dr. Aris Prasetyo, M.Kom',
    email: 'aris.prasetyo@university.ac.id',
    nip: '198503152010011002',
    primaryRole: 'dosen',
    department: 'Teknik Informatika',
    avatar: null,
};

export const MOCK_DOSEN_STATS = {
    totalMataKuliah: 4,
    totalSks: 12,
    totalMahasiswa: 156,
    jadwalHariIni: 2,
    pertemuanMingguIni: 8,
};

export const MOCK_DOSEN_JADWAL = [
    // Senin
    {
        id: 'd1',
        kode: 'IF-101',
        nama: 'Pengantar Informatika',
        kelas: 'A',
        ruangan: 'B4-11',
        hari: 'senin',
        sesiMulai: 1,
        durasi: 3,
        mahasiswa: 42,
        tipe: 'resmi',
    },
    {
        id: 'd2',
        kode: 'IF-101',
        nama: 'Pengantar Informatika',
        kelas: 'B',
        ruangan: 'B4.06',
        hari: 'senin',
        sesiMulai: 6,
        durasi: 3,
        mahasiswa: 38,
        tipe: 'resmi',
    },
    // Selasa
    {
        id: 'd3',
        kode: 'IF-305',
        nama: 'Kecerdasan Buatan',
        kelas: 'A',
        ruangan: 'Lab 3 TIK Lt.3',
        hari: 'selasa',
        sesiMulai: 1,
        durasi: 3,
        mahasiswa: 35,
        tipe: 'resmi',
    },
    // Rabu
    {
        id: 'd4',
        kode: 'IF-101',
        nama: 'Pengantar Informatika',
        kelas: 'C',
        ruangan: 'B4-11',
        hari: 'rabu',
        sesiMulai: 4,
        durasi: 3,
        mahasiswa: 41,
        tipe: 'resmi',
    },
    // Kamis
    {
        id: 'd5',
        kode: 'IF-305',
        nama: 'Kecerdasan Buatan',
        kelas: 'B',
        ruangan: 'Lab .4 TIK Lt.4',
        hari: 'kamis',
        sesiMulai: 1,
        durasi: 3,
        mahasiswa: 40,
        tipe: 'resmi',
    },
    {
        id: 'd6',
        kode: 'IF-490',
        nama: 'Seminar Proposal',
        kelas: '-',
        ruangan: 'Pasca 1301',
        hari: 'kamis',
        sesiMulai: 6,
        durasi: 2,
        mahasiswa: 12,
        tipe: 'override',
    },
    // Jumat
    {
        id: 'd7',
        kode: 'IF-490',
        nama: 'Seminar Proposal',
        kelas: '-',
        ruangan: 'Pasca 1304',
        hari: 'jumat',
        sesiMulai: 1,
        durasi: 3,
        mahasiswa: 15,
        tipe: 'resmi',
    },
];



export const MOCK_DOSEN_NOTIFIKASI = [
    {
        id: 'n1',
        judul: 'Jadwal Pengantar Informatika diperbarui oleh admin',
        pesan: 'Ruangan B4-11 diganti ke B4.06 untuk pertemuan 10.',
        waktu: '5 menit lalu',
        dibaca: false,
        tipe: 'jadwal',
    },
    {
        id: 'n2',
        judul: 'Rapat dosen jurusan besok pukul 09:00',
        pesan: 'Agenda: evaluasi tengah semester dan pembagian kelas baru.',
        waktu: '1 jam lalu',
        dibaca: false,
        tipe: 'info',
    },
    {
        id: 'n3',
        judul: 'Permintaan pindah ruangan disetujui admin',
        pesan: 'Ruangan Lab 3 TIK Lt.3 tersedia untuk Kecerdasan Buatan.',
        waktu: '3 jam lalu',
        dibaca: true,
        tipe: 'jadwal',
    },
    {
        id: 'n4',
        judul: 'Deadline input nilai: 15 Juni 2026',
        pesan: 'Pastikan semua nilai sudah terinput sebelum batas waktu.',
        waktu: '1 hari lalu',
        dibaca: true,
        tipe: 'info',
    },
];

// ── Notifikasi Page (expanded data for full notification page) ────────────
export const MOCK_NOTIFIKASI_PAGE = [
    {
        id: 'np1',
        judul: 'Jadwal Pengantar Informatika diperbarui oleh admin',
        pesan: 'Ruangan B4-11 diganti ke B4.06 untuk pertemuan 10. Perubahan berlaku mulai minggu depan. Silakan periksa kembali jadwal Anda.',
        waktu: '5 menit lalu',
        tanggal: '11 Mei 2026',
        dibaca: false,
        tipe: 'jadwal',
    },
    {
        id: 'np2',
        judul: 'Pengumuman: Libur Nasional Hari Raya Waisak',
        pesan: 'Kegiatan perkuliahan diliburkan pada tanggal 12 Mei 2026. Jadwal pengganti akan diinformasikan kemudian.',
        waktu: '30 menit lalu',
        tanggal: '11 Mei 2026',
        dibaca: false,
        tipe: 'sistem',
    },
    {
        id: 'np3',
        judul: 'Rapat dosen jurusan besok pukul 09:00',
        pesan: 'Agenda: evaluasi tengah semester dan pembagian kelas baru untuk semester ganjil 2026/2027. Kehadiran wajib.',
        waktu: '1 jam lalu',
        tanggal: '11 Mei 2026',
        dibaca: false,
        tipe: 'info',
    },
    {
        id: 'np4',
        judul: 'Jadwal Kecerdasan Buatan dipindah sementara',
        pesan: 'Lab 3 TIK Lt.3 dalam maintenance. Kelas dipindah ke Lab 4 TIK Lt.4 untuk 2 minggu ke depan.',
        waktu: '2 jam lalu',
        tanggal: '11 Mei 2026',
        dibaca: false,
        tipe: 'jadwal',
    },
    {
        id: 'np5',
        judul: 'Permintaan pindah ruangan disetujui admin',
        pesan: 'Ruangan Lab 3 TIK Lt.3 tersedia untuk Kecerdasan Buatan mulai pertemuan 12.',
        waktu: '3 jam lalu',
        tanggal: '11 Mei 2026',
        dibaca: true,
        tipe: 'jadwal',
    },
    {
        id: 'np6',
        judul: 'Reminder: Batas akhir upload RPS semester ini',
        pesan: 'RPS untuk semua mata kuliah yang Anda ampu harus sudah terupload di SIAKAD sebelum tanggal 20 Mei 2026.',
        waktu: '5 jam lalu',
        tanggal: '11 Mei 2026',
        dibaca: true,
        tipe: 'sistem',
    },
    {
        id: 'np7',
        judul: 'Jadwal Seminar Proposal ditambahkan',
        pesan: 'Admin menambahkan jadwal baru: Seminar Proposal hari Kamis Sesi 6-7 di Pasca 1301.',
        waktu: '1 hari lalu',
        tanggal: '10 Mei 2026',
        dibaca: true,
        tipe: 'jadwal',
    },
    {
        id: 'np8',
        judul: 'Deadline input nilai: 15 Juni 2026',
        pesan: 'Pastikan semua nilai UTS dan tugas sudah terinput di SIAKAD sebelum batas waktu. Keterlambatan akan dikenakan sanksi administratif.',
        waktu: '1 hari lalu',
        tanggal: '10 Mei 2026',
        dibaca: true,
        tipe: 'info',
    },
    {
        id: 'np9',
        judul: 'Hasil evaluasi dosen semester lalu tersedia',
        pesan: 'Hasil survei evaluasi mahasiswa terhadap perkuliahan semester ganjil 2025/2026 sudah dapat diakses di portal dosen.',
        waktu: '2 hari lalu',
        tanggal: '9 Mei 2026',
        dibaca: true,
        tipe: 'info',
    },
    {
        id: 'np10',
        judul: 'Pemeliharaan server SIAKAD malam ini',
        pesan: 'Server SIAKAD akan mengalami downtime untuk maintenance pada pukul 23:00-02:00 WIB. Mohon selesaikan aktivitas sebelum waktu tersebut.',
        waktu: '3 hari lalu',
        tanggal: '8 Mei 2026',
        dibaca: true,
        tipe: 'sistem',
    },
    {
        id: 'np11',
        judul: 'Jadwal Pengantar Informatika Kelas C ditambahkan',
        pesan: 'Admin menambahkan kelas paralel baru: IF-101 Kelas C hari Rabu Sesi 4-6 di B4-11. Anda ditugaskan sebagai pengajar.',
        waktu: '4 hari lalu',
        tanggal: '7 Mei 2026',
        dibaca: true,
        tipe: 'jadwal',
    },
    {
        id: 'np12',
        judul: 'Undangan: Workshop Kurikulum Merdeka Belajar',
        pesan: 'Fakultas menyelenggarakan workshop penyusunan kurikulum OBE pada tanggal 25 Mei 2026 di Aula Utama. Pendaftaran melalui link terlampir.',
        waktu: '5 hari lalu',
        tanggal: '6 Mei 2026',
        dibaca: true,
        tipe: 'info',
    },
];

export const MOCK_JADWAL_HARI_INI = [
    {
        id: 'th1',
        kode: 'IF-101',
        nama: 'Pengantar Informatika',
        kelas: 'A',
        ruangan: 'B4-11',
        waktu: '07:00 - 09:30',
        sesi: 'Sesi 1-3',
        mahasiswa: 42,
        status: 'sedang_berlangsung',
    },
    {
        id: 'th2',
        kode: 'IF-101',
        nama: 'Pengantar Informatika',
        kelas: 'B',
        ruangan: 'B4.06',
        waktu: '12:30 - 15:00',
        sesi: 'Sesi 6-8',
        mahasiswa: 38,
        status: 'belum_dimulai',
    },
];

export const MOCK_DOSEN_AI_ANALYSIS = {
    text: 'Berdasarkan analisis kehadiran mahasiswa 3 minggu terakhir, kelas IF-101 A memiliki rata-rata kehadiran 87%. Terdapat 5 mahasiswa yang sering tidak hadir.',
    rekomendasi: 'Pertimbangkan untuk menghubungi mahasiswa yang absensi > 3x untuk konsultasi akademik.',
};

export const MOCK_DOSEN_METRIK = {
    kehadiranRataRata: 89,
    tugasDinilai: '23/28',
};

export const MOCK_DOSEN_TUGAS = [
    'Input nilai UTS Kecerdasan Buatan',
    'Konfirmasi jadwal Seminar Proposal',
    'Upload materi pertemuan 9 ke LMS',
];
