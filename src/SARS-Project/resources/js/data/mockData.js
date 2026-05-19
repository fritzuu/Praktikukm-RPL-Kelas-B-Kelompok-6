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

// Insight cards untuk Admin Dashboard
// Diisi backend partner via Inertia props — nilai di bawah hanya mock
export const MOCK_INSIGHTS = {
    pendingRequests: 14,      // Total pengajuan menunggu keputusan admin
    conflictDetected: 2,      // Konflik jadwal/ruangan yang terdeteksi saat ini
    acceptedThisWeek: 9,      // Pengajuan yang disetujui dalam 7 hari terakhir
    declinedThisWeek: 3,      // Pengajuan yang ditolak dalam 7 hari terakhir
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

// ─── Mock Data for Admin Persetujuan (Approval) Page ────────────────────────

/**
 * Pending requests that have been validated by Aslab (status: PENDING_ADMIN).
 * Used as fallback when backend data is not yet available.
 */
export const MOCK_ADMIN_PENDING = [
    {
        id: 101,
        requestCode: 'REQ-2025-047',
        requestType: 'TEMPORARY',
        createdAtDiff: '2 jam yang lalu',
        requester: { name: 'Andi Wijaya', nimNip: '2241720001' },
        schedule: {
            code: 'IF-205',
            course: 'Pemrograman Web',
            room: 'Lab .4 TIK Lt.4',
            day: 'Jumat',
            time: '07:00 - 09:30',
        },
        proposedDay: 'Rabu',
        proposedTime: '10:00 - 12:30',
        proposedRoom: 'B4-11',
        targetDate: '2025-06-05',
        reason: 'Bentrok dengan ujian susulan Kalkulus II yang dijadwalkan oleh bagian akademik pada hari yang sama.',
        hasConflict: false,
        conflictDetails: null,
        aslabValidation: {
            validatedBy: 'Reza Pratama',
            validatedAt: '19 May 2025, 10:30',
            notes: 'Alasan valid, jadwal pengganti tersedia dan tidak bentrok.',
        },
    },
    {
        id: 102,
        requestCode: 'REQ-2025-048',
        requestType: 'PERMANENT',
        createdAtDiff: '5 jam yang lalu',
        requester: { name: 'Siti Nurhaliza', nimNip: '2241720015' },
        schedule: {
            code: 'MAT-202',
            course: 'Kalkulus II',
            room: 'B4-11',
            day: 'Senin',
            time: '13:00 - 15:30',
        },
        proposedDay: 'Selasa',
        proposedTime: '13:00 - 15:30',
        proposedRoom: 'B4-11',
        targetDate: null,
        reason: 'Jadwal Senin sore terlalu padat untuk mahasiswa semester 4 — 3 mata kuliah berturut tanpa jeda.',
        hasConflict: true,
        conflictDetails: 'Ruangan B4-11 sudah digunakan oleh IF-301 Basis Data Lanjut pada Selasa 13:00-15:30.',
        aslabValidation: {
            validatedBy: 'Reza Pratama',
            validatedAt: '19 May 2025, 08:15',
            notes: 'Alasan akademik valid. Namun ada potensi konflik ruangan — mohon dicek Admin.',
        },
    },
    {
        id: 103,
        requestCode: 'REQ-2025-050',
        requestType: 'TEMPORARY',
        createdAtDiff: '1 hari yang lalu',
        requester: { name: 'Budi Santoso', nimNip: '2241720022' },
        schedule: {
            code: 'IF-101',
            course: 'Pengantar Informatika',
            room: 'B4-11',
            day: 'Senin',
            time: '07:00 - 09:30',
        },
        proposedDay: 'Kamis',
        proposedTime: '07:00 - 09:30',
        proposedRoom: 'Pasca 1301',
        targetDate: '2025-06-12',
        reason: 'Dosen pengampu berhalangan hadir pada tanggal 12 Juni karena undangan seminar nasional.',
        hasConflict: false,
        conflictDetails: null,
        aslabValidation: {
            validatedBy: 'Dewi Lestari',
            validatedAt: '18 May 2025, 16:45',
            notes: 'Sudah dikonfirmasi dengan dosen bersangkutan. Request valid.',
        },
    },
    {
        id: 104,
        requestCode: 'REQ-2025-051',
        requestType: 'PERMANENT',
        createdAtDiff: '2 hari yang lalu',
        requester: { name: 'Fajar Rahman', nimNip: '2241720033' },
        schedule: {
            code: 'FIS-302',
            course: 'Fisika Kuantum',
            room: 'Lab 3 TIK Lt.3',
            day: 'Selasa',
            time: '10:00 - 12:30',
        },
        proposedDay: 'Kamis',
        proposedTime: '10:00 - 12:30',
        proposedRoom: 'Lab 3 TIK Lt.3',
        targetDate: null,
        reason: 'Mayoritas peserta kelas mengeluhkan bentrok dengan praktikum Pemrograman Web di hari Selasa.',
        hasConflict: false,
        conflictDetails: null,
        aslabValidation: {
            validatedBy: 'Reza Pratama',
            validatedAt: '17 May 2025, 14:20',
            notes: 'Petisi ditandatangani 28 dari 35 mahasiswa. Diteruskan untuk pertimbangan Admin.',
        },
    },
];

/**
 * Recently decided requests (APPROVED / REJECTED_ADMIN).
 * Used for the decision history table.
 */
export const MOCK_ADMIN_RECENT = [
    {
        id: 201,
        requestCode: 'REQ-2025-040',
        student: 'Dewi Anggraini',
        course: 'Aljabar Linier',
        requestType: 'TEMPORARY',
        room: 'B4-10',
        decision: 'APPROVED',
        decidedAt: '18 May 2025, 14:00',
        notes: 'Disetujui — ruangan pengganti tersedia.',
    },
    {
        id: 202,
        requestCode: 'REQ-2025-038',
        student: 'Rizky Maulana',
        course: 'Struktur Data',
        requestType: 'PERMANENT',
        room: 'B4.06',
        decision: 'REJECTED_ADMIN',
        decidedAt: '17 May 2025, 11:30',
        notes: 'Alasan tidak cukup kuat untuk perubahan permanen.',
    },
    {
        id: 203,
        requestCode: 'REQ-2025-035',
        student: 'Maya Putri',
        course: 'Pemrograman Web',
        requestType: 'TEMPORARY',
        room: 'Lab .4 TIK Lt.4',
        decision: 'APPROVED',
        decidedAt: '16 May 2025, 09:15',
        notes: '',
    },
    {
        id: 204,
        requestCode: 'REQ-2025-033',
        student: 'Ahmad Fauzi',
        course: 'Basis Data Lanjut',
        requestType: 'PERMANENT',
        room: 'Lab B4.05',
        decision: 'APPROVED',
        decidedAt: '15 May 2025, 16:45',
        notes: 'Perubahan permanen disetujui, jadwal baseline diperbarui.',
    },
    {
        id: 205,
        requestCode: 'REQ-2025-030',
        student: 'Lina Kusuma',
        course: 'Kalkulus II',
        requestType: 'TEMPORARY',
        room: 'B4-11',
        decision: 'REJECTED_ADMIN',
        decidedAt: '14 May 2025, 10:00',
        notes: 'Tanggal yang diajukan sudah lewat.',
    },
];
