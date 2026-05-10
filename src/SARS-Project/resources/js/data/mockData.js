// ─── Mock Data for Admin Dashboard ──────────────────────────────────────────
// Semua data mock terpusat di sini. Komponen menggunakan data ini sebagai fallback
// ketika props dari backend belum tersedia.

export const MOCK_USER = {
    name: 'Dr. Budi Santoso',
    email: 'admin@university.ac.id',
    primaryRole: 'admin',
};

export const MOCK_SYNC_STATUS = {
    status: 'terkini',       // 'terkini' | 'tertunda' | 'gagal'
    lastUpload: 'Hari ini, 08:42',
};

export const MOCK_ROOMS = [
    'B4-11',
    'Lab 3 TIK Lt.3',
    'Lab .4 TIK Lt.4',
    'Lab B4.04',
    'B4.06',
    'Lab B4.05',
    'B4-10',
    'Pasca 1301',
    'Pasca 1312',
    'Pasca 1304'
];

export const MOCK_JADWAL = [
    // Senin
    {
        id: '1',
        kode: 'IF-101',
        nama: 'Pengantar Informatika',
        ruangan: 'B4-11',
        dosen: 'Dr. Aris',
        hari: 'senin',
        sesiMulai: 1,
        durasi: 3,
        tipe: 'resmi',
    },
    {
        id: '2',
        kode: 'MAT-202',
        nama: 'Kalkulus II',
        ruangan: 'B4-11',
        dosen: 'Prof. Miller',
        hari: 'senin',
        sesiMulai: 6,
        durasi: 3,
        tipe: 'resmi',
    },
    {
        id: '9',
        kode: 'FIS-302',
        nama: 'Fisika Kuantum',
        ruangan: 'B4-11',
        dosen: 'Dr. Rahman',
        hari: 'senin',
        sesiMulai: 1,
        durasi: 2,
        tipe: 'konflik',
    },
    // Selasa
    {
        id: '3',
        kode: 'FIS-302',
        nama: 'Fisika Kuantum',
        ruangan: 'Lab 3 TIK Lt.3',
        dosen: 'Dr. Rahman',
        hari: 'selasa',
        sesiMulai: 4,
        durasi: 2,
        tipe: 'konflik',
    },
    // Rabu
    {
        id: '4',
        kode: 'IF-101',
        nama: 'Pengantar Informatika',
        ruangan: 'B4-11',
        dosen: 'Dr. Aris',
        hari: 'rabu',
        sesiMulai: 1,
        durasi: 3,
        tipe: 'resmi',
    },
    {
        id: '5',
        kode: 'MAT-202',
        nama: 'Kalkulus II',
        ruangan: 'Pasca 1312',
        dosen: 'Prof. Miller',
        hari: 'rabu',
        sesiMulai: 1,
        durasi: 3,
        tipe: 'resmi',
    },
    // Kamis
    {
        id: '6',
        kode: 'IF-301',
        nama: 'Basis Data Lanjut',
        ruangan: 'Lab B4.05',
        dosen: 'Dr. Sari',
        hari: 'kamis',
        sesiMulai: 4,
        durasi: 3,
        tipe: 'override',
    },
    // Jumat
    {
        id: '7',
        kode: 'IF-205',
        nama: 'Pemrograman Web',
        ruangan: 'Lab .4 TIK Lt.4',
        dosen: 'Reza, S.Kom',
        hari: 'jumat',
        sesiMulai: 1,
        durasi: 3,
        tipe: 'resmi',
    },
    {
        id: '8',
        kode: 'IF-210',
        nama: 'Struktur Data',
        ruangan: 'B4.06',
        dosen: 'Dr. Andi',
        hari: 'jumat',
        sesiMulai: 6,
        durasi: 2,
        tipe: 'override',
    },
];

export const MOCK_KONFLIK = [
    {
        id: '1',
        judul: 'Fisika Kuantum vs. Ruang 402B',
        deskripsi:
            'IF-401 dan FIS-302 meminta Ruang 402B untuk Kamis, 14:00 - 16:00.',
        tipe: 'bentrok_ruangan',
        aksi: [
            { label: 'Pindahkan FIS-302', variant: 'primary' },
            { label: 'Abaikan', variant: 'secondary' },
        ],
    },
    {
        id: '2',
        judul: 'Jadwal Lab 1 Tumpang Tindih',
        deskripsi:
            'IF-205 dan IF-210 memiliki jadwal yang bertabrakan di Lab 1 pada Jumat, 13:00 - 15:00.',
        tipe: 'bentrok_jadwal',
        aksi: [
            { label: 'Ubah IF-210', variant: 'primary' },
            { label: 'Abaikan', variant: 'secondary' },
        ],
    },
];

export const MOCK_AKTIVITAS = [
    {
        id: '1',
        nama: 'Prof. Sarah Indira',
        aksi: 'Mengajukan Perubahan Jadwal',
        status: 'disetujui',
        waktu: '2 menit lalu',
        avatarInitial: 'S',
    },
    {
        id: '2',
        nama: 'Dr. Michael Chen',
        aksi: 'Mengajukan Pindah Ruangan 102A',
        status: 'tertunda',
        waktu: '14 menit lalu',
        avatarInitial: 'M',
    },
    {
        id: '3',
        nama: 'Reza Pratama',
        aksi: 'Validasi Permintaan Mahasiswa',
        status: 'disetujui',
        waktu: '32 menit lalu',
        avatarInitial: 'R',
    },
    {
        id: '4',
        nama: 'Andi Wijaya',
        aksi: 'Mengajukan Pindah Jadwal Kuliah',
        status: 'ditolak',
        waktu: '1 jam lalu',
        avatarInitial: 'A',
    },
];

export const MOCK_AI_ANALYSIS = {
    text: 'Saya mendeteksi kemungkinan konflik tinggi untuk Minggu UAS mendatang. 6 ujian jurusan bertabrakan dengan ketersediaan tempat duduk di Aula A.',
    rekomendasi:
        'Pindahkan Kimia 101 ke Sabtu Pagi untuk membebaskan 120 kursi.',
};

export const MOCK_METRIK = {
    utilisasiRuangan: 92,
    waktuTunggu: '1.2j',
};

export const MOCK_TUGAS_PENDING = [
    'Setujui 14 permintaan perubahan',
    'Selesaikan bentrok Lab 301',
    'Konfirmasi logistik Pembicara Tamu',
];

export const MOCK_NOTIFIKASI = [
    {
        id: '1',
        judul: 'Jadwal IF-201 diperbarui',
        waktu: '5 menit lalu',
        dibaca: false,
    },
    {
        id: '2',
        judul: 'Permintaan pindah ruang disetujui',
        waktu: '1 jam lalu',
        dibaca: false,
    },
    {
        id: '3',
        judul: 'Konflik baru terdeteksi',
        waktu: '3 jam lalu',
        dibaca: true,
    },
];
