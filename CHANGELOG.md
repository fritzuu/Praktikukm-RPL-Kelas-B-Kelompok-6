# Changelog

Semua perubahan penting pada proyek **Smart Academic Schedule & Room Change System (SARS)** didokumentasikan di file ini. Format ini didasarkan pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

---

## [Unreleased] - 2026-06-27

### Added
- **Konfigurasi Hari Awal Minggu**: Menambahkan konfigurasi awal minggu (*week rollover*) global menggunakan Carbon ke hari **Sabtu** di `AppServiceProvider`.
- **Navigasi Konfig Baru**: Menambahkan konfigurasi navigasi baru (`AslabNavConfig.js`, `DosenNavConfig.js`, `MahasiswaNavConfig.js`) untuk penyatuan layout menu.

### Changed
- **Penyatuan Layout (Layout Unification)**:
  - Melakukan refaktorisasi `AslabLayout`, `MahasiswaLayout`, dan `DosenLayout` agar menggunakan dan membungkus `AppLayout` secara terpadu melalui objek konfigurasi navigasi.
  - Memperbarui `AppLayout` dan `Shared/Sidebar.jsx` untuk menangani indikator jumlah validasi aslab yang belum diproses (`pendingAslabCount`).
  - Mengembalikan tombol aksi *"New Request"* di Topbar pada `MahasiswaLayout`.
- **Penyesuaian Rollover Mingguan**:
  - Memperbarui pemetaan tanggal kandidat jadwal di `MahasiswaController` untuk mendukung hari Sabtu sebagai awal minggu.
  - Memperbarui helper `getWeekDate` di `Requests.jsx` agar melakukan rollover/pergantian minggu pada hari Sabtu.
- **Konsolidasi Notifikasi**:
  - Menyatukan rute notifikasi di `routes/web.php` untuk mengarah ke `NotificationCenterController`.

### Removed
- **Redundant Sidebar Components**:
  - Menghapus komponen sidebar spesifik per-role yang sudah tidak digunakan: `Aslab/Sidebar.jsx`, `Mahasiswa/Sidebar.jsx`, dan `Dosen/Sidebar.jsx`.
- **Legacy Components & Templates**:
  - Menghapus file view Laravel bawaan `welcome.blade.php`.
  - Menghapus komponen Aslab yang tidak terpakai lagi: `ScheduleGrid`, `FullScheduleGrid`, dan `TodaySchedule`.
  - Menghapus komponen Mahasiswa yang tidak terpakai lagi: `NotificationDropdown` dan file kosong `resources/js/app.js`.
  - Menghapus komponen Dosen yang tidak terpakai lagi: `ValidationQueue.jsx`.
  - Menghapus controller notifikasi lama `app/Http/Controllers/NotificationController.php`.

---

## [1.1.0] - 2026-06-23 / 2026-06-24

### Added
- **Tampilan Jadwal Sementara (Override)**:
  - Menambahkan tampilan jadwal sementara (override) di kalender/grid jadwal untuk peran **Aslab** dan **Admin**.
  - Menampilkan waktu pelaksanaan (jam mulai/selesai) pada kartu jadwal Mahasiswa agar serupa dengan tampilan Aslab.

### Changed
- **Standarisasi Format Data Jadwal**:
  - Melakukan standarisasi format data jadwal di seluruh controller utama (`MahasiswaController`, `AslabJadwalController`, `AdminJadwalController`, dan `DosenJadwalController`).
  - Menyederhanakan modal detail jadwal Mahasiswa agar memiliki desain yang identik dengan modal milik Aslab.
- **Format Kode Request Baru**:
  - Mengubah awalan format kode pengajuan (request code) dari `CR-` menjadi `REQ-` untuk keselarasan dengan aplikasi mobile Android.
- **Optimasi Endpoint Mahasiswa**:
  - Mengembalikan fungsi `getSchedulesData` di `MahasiswaController` menggunakan Eloquent + Mapping data agar performanya lebih optimal dan format datanya sesuai.
  - Menambahkan join `course_students` di `MahasiswaController` untuk memastikan jadwal kuliah mahasiswa yang bersangkutan tampil dengan benar.

### Fixed
- **Filter Konflik Jadwal (Baseline vs Override)**:
  - Menyaring jadwal baseline agar otomatis disembunyikan jika terdapat jadwal override yang sedang aktif pada hari dan sesi yang sama untuk mencegah tumpang tindih data.
  - Memperbaiki filtering override di controller Admin dan Aslab yang sebelumnya sempat menyebabkan halaman jadwal kosong/blank.
- **Query Override Dosen**:
  - Memperbaiki query pencarian jadwal override Dosen dengan mengganti nilai sesi yang sebelumnya hardcoded menjadi nilai dinamis (`session_start` dan `session_duration`).
- **Session & Nilai Kosong (Null Handling)**:
  - Memperbaiki bug nilai session tidak terdefinisi (`undefined session`).
  - Memperbaiki nilai `semesterNum` yang bernilai `null` pada data override di `MahasiswaController` dengan melakukan casting ke default value.
- **Perbaikan Parse Error**:
  - Menghapus baris duplikat yang menyebabkan error sintaksis PHP di `AslabValidationController`.

### Removed
- **SSO Login Options**:
  - Menghapus opsi login menggunakan Google dan SSO pada halaman Sign In untuk menyederhanakan alur masuk pengguna.

---

## [1.0.0] - 2026-06-11 / 2026-06-18

### Added
- **Unit Testing**:
  - Penambahan unit test menggunakan pola AAA (Arrange-Act-Assert) untuk menguji fungsi-fungsi kritis.
  - Penambahan dokumentasi pengujian `test-case.md` ke dalam folder `docs/`.

### Changed / Optimized
- **Optimasi Query & Database**:
  - Optimasi query database dan penambahan database index yang hilang untuk meningkatkan performa sistem.
  - Optimasi conflict resolver dengan melakukan batching lookup untuk dosen team teaching.

### Fixed
- **Null Safety & Seeders**:
  - Penanganan nilai `null` pada kolom `created_at` di pengajuan perubahan jadwal (*change requests*).
  - Pembaruan *seeder* jadwal (*schedule seeder*) untuk menjamin konsistensi data baseline.

---

## [0.9.0-beta] - 2026-06-10

### Added
- **Logika Persetujuan Admin**:
  - Implementasi logika persetujuan tingkat Admin untuk perubahan jadwal permanen dan sementara (temporary) beserta cakupan pengujian unit yang menyeluruh.
- **AI Assistant Persistence**:
  - Menambahkan fitur penyimpanan riwayat obrolan AI (`AiAssistantPanel`) di penyimpanan lokal (*local storage*) serta tombol hapus riwayat obrolan (*clear chat*).
- **Websocket Realtime Sync**:
  - Integrasi websocket realtime sync untuk sinkronisasi instan data persetujuan jadwal.

### Changed
- **Peningkatan Konfigurasi AI**:
  - Meningkatkan batas token maksimum Gemini (`max_tokens`) menjadi 6000 token.
  - Optimasi efisiensi penggunaan token dan penguatan keamanan asisten AI terhadap *prompt injection*.
- **Refaktorisasi Sistem Notifikasi**:
  - Melakukan refaktorisasi sistem notifikasi untuk semua role (Admin, Aslab, Dosen, Mahasiswa).

### Fixed
- **Bug Realtime & Web Sockets**:
  - Memperbaiki bug sinkronisasi realtime pada antrean validasi Aslab, penandaan status notifikasi terbaca (*mark read*), dan perbaikan leak folder.
