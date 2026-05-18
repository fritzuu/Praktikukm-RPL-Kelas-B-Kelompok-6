// ─── Mock Data for Aslab Dashboard ──────────────────────────────────────────
// Fallback data when the backend doesn't provide real data.

export const MOCK_ASLAB_STATS = {
    pendingValidasi: 3,
    jadwalHariIni: 5,
    totalRuangan: 6,
    totalMataKuliah: 5,
};

export const MOCK_ASLAB_NOTIFIKASI = [
    {
        id: 'n1',
        judul: 'Pengajuan baru dari Fajar Nugroho',
        pesan: 'Permintaan perubahan jadwal Basis Data Lanjut menunggu validasi.',
        waktu: '5 menit lalu',
        dibaca: false,
        tipe: 'jadwal',
    },
    {
        id: 'n2',
        judul: 'Permintaan REQ-2025-001 disetujui Admin',
        pesan: 'Pengajuan perubahan jadwal Pemrograman Web telah disetujui oleh Admin.',
        waktu: '2 jam lalu',
        dibaca: false,
        tipe: 'jadwal',
    },
    {
        id: 'n3',
        judul: 'Pengumuman: Jadwal Praktikum diperbarui',
        pesan: 'Jadwal praktikum Lab A101 telah diperbarui untuk minggu depan.',
        waktu: '1 hari lalu',
        dibaca: true,
        tipe: 'info',
    },
];

export const MOCK_ASLAB_AI_ANALYSIS = {
    text: 'Terdapat 3 pengajuan menunggu validasi. 1 pengajuan berpotensi konflik dengan jadwal Lab A101 hari Jumat.',
    rekomendasi: 'Prioritaskan validasi REQ-2025-003 karena sudah menunggu lebih dari 24 jam.',
};

export const MOCK_ASLAB_METRIK = {
    validasiMingguIni: 5,
    rataRataWaktuRespon: '4 jam',
};

export const MOCK_ASLAB_TUGAS = [
    'Validasi pengajuan REQ-2025-003 dari Fajar Nugroho',
    'Cek ketersediaan Lab A102 untuk minggu depan',
    'Konfirmasi jadwal praktikum bersama Dosen',
];

export const MOCK_ASLAB_JADWAL_HARI_INI = [
    {
        id: 'th1',
        kode: 'IF2101',
        nama: 'Pemrograman Web',
        kelas: 'IF-A 2023',
        ruangan: 'G-201',
        waktu: '08:00 - 10:00',
        mahasiswa: 60,
        status: 'sedang_berlangsung',
    },
    {
        id: 'th2',
        kode: 'IF2102',
        nama: 'Basis Data Lanjut',
        kelas: 'IF-A 2023',
        ruangan: 'G-202',
        waktu: '10:00 - 12:00',
        mahasiswa: 60,
        status: 'belum_dimulai',
    },
    {
        id: 'th3',
        kode: 'IF2103',
        nama: 'Rekayasa Perangkat Lunak',
        kelas: 'IF-B 2023',
        ruangan: 'G-201',
        waktu: '13:00 - 15:00',
        mahasiswa: 60,
        status: 'belum_dimulai',
    },
];

export const MOCK_NOTIFIKASI_PAGE_ASLAB = [
    {
        id: 'np1',
        judul: 'Pengajuan baru dari Fajar Nugroho',
        pesan: 'Fajar Nugroho mengajukan perubahan jadwal Basis Data Lanjut. Alasan: izin sakit pada hari Selasa. Mohon segera divalidasi.',
        waktu: '5 menit lalu',
        tanggal: '18 Mei 2026',
        dibaca: false,
        tipe: 'jadwal',
    },
    {
        id: 'np2',
        judul: 'Permintaan REQ-2025-001 disetujui Admin',
        pesan: 'Pengajuan perubahan jadwal Pemrograman Web tanggal 17 Maret 2025 telah disetujui oleh Admin setelah validasi Anda.',
        waktu: '2 jam lalu',
        tanggal: '18 Mei 2026',
        dibaca: false,
        tipe: 'jadwal',
    },
    {
        id: 'np3',
        judul: 'Pengumuman: Jadwal Praktikum diperbarui',
        pesan: 'Jadwal praktikum Lab A101 telah diperbarui untuk minggu depan. Silakan cek kembali ketersediaan ruangan.',
        waktu: '1 hari lalu',
        tanggal: '17 Mei 2026',
        dibaca: true,
        tipe: 'info',
    },
    {
        id: 'np4',
        judul: 'Permintaan REQ-2025-002 diteruskan ke Admin',
        pesan: 'Permintaan perubahan jadwal Jaringan Komputer dari Dewi Lestari telah Anda teruskan ke Admin untuk keputusan akhir.',
        waktu: '2 hari lalu',
        tanggal: '16 Mei 2026',
        dibaca: true,
        tipe: 'jadwal',
    },
    {
        id: 'np5',
        judul: 'Pemeliharaan server SIAKAD malam ini',
        pesan: 'Server SIAKAD akan mengalami downtime untuk maintenance pada pukul 23:00-02:00 WIB.',
        waktu: '3 hari lalu',
        tanggal: '15 Mei 2026',
        dibaca: true,
        tipe: 'sistem',
    },
    {
        id: 'np6',
        judul: 'Reminder: Cek ketersediaan Lab minggu depan',
        pesan: 'Pastikan jadwal lab A101 dan A102 tidak bentrok untuk praktikum minggu depan.',
        waktu: '4 hari lalu',
        tanggal: '14 Mei 2026',
        dibaca: true,
        tipe: 'info',
    },
];
