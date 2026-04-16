# Software Requirements Specification (SRS)
## Smart Academic Room Scheduler


## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Deskripsi Umum](#2-deskripsi-umum)
3. [Functional Requirements (FR)](#3-functional-requirements)
4. [Non-Functional Requirements (NFR)](#4-non-functional-requirements)
5. [Catatan](#5-catatan)

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen SRS ini mendefinisikan kebutuhan fungsional dan non-fungsional dari **Smart Academic Room Schedule & Room Change System** yang digunakan di lingkungan Prodi Informatika. Dokumen ini menjadi acuan bagi seluruh pemangku kepentingan — mahasiswa, dosen, asisten lab (aslab), dan admin fakultas — dalam proses pengembangan dan validasi sistem.


### 1.2 Ruang Lingkup
Sistem ini mencakup:
- Pengajuan dan pelacakan perubahan jadwal dan ruangan perkuliahan (sementara dan permanen).
- Deteksi konflik ruangan secara real-time.
- Alur validasi bertingkat: Mahasiswa → Aslab → Admin Fakultas.
- Notifikasi push lintas platform (Web & Android).
- Bantuan AI untuk pembuatan komunikasi formal dan pembuatan jadwal serta ruangan.

Sistem ini **tidak** mencakup pengelolaan nilai, absensi, atau modul akademik lainnya di luar manajemen jadwal dan ruangan.

### 1.3 Definisi dan Singkatan
| Istilah / Akronim | Definisi |
| --- | --- |
| **SARS** | Smart Academic Schedule & Room Change System, nama produk perangkat lunak ini. |
| **Baseline** | Jadwal perkuliahan resmi dan rutin per semester yang menjadi acuan dasar sistem. |
| **Override** | Perubahan jadwal yang sedang aktif dan menimpa jadwal baseline pada waktu/ruangan tertentu. |
| **Temporary Change** | Pengajuan perubahan jadwal yang bersifat sementara (hanya berlaku untuk 1 pertemuan spesifik). |
| **Permanent Change** | Pengajuan perubahan jadwal yang bersifat permanen (mengubah template jadwal rutin ke depannya). |
| **Aslab** | Asisten Laboratorium / Asisten Dosen, bertindak sebagai validator tingkat pertama (*gatekeeper*). |
| **FCM** | Firebase Cloud Messaging, layanan untuk mengirimkan *push notification* ke perangkat Android. |


### 1.4 Referensi

- User Stories dan Acceptance Criteria P3: US-01 s.d. US-08 (user-stories.md)
- Modul & PPT Praktikum — Google Classroom

---

## 2. Deskripsi Umum

### 2.1 Perspektif Produk

Sistem ini merupakan aplikasi berbasis **Web dan Android** yang terintegrasi dalam ekosistem akademik Prodi Informatika. Sistem berperan sebagai jembatan antara kebutuhan perubahan jadwal dari mahasiswa/dosen dengan kewenangan persetujuan yang dimiliki Admin Fakultas, dengan Aslab bertindak sebagai filter awal.

### 2.2 Kelompok Pengguna

| Aktor | Peran dalam Sistem |
|---|---|
| **Mahasiswa** | Mengajukan perubahan jadwal, memantau status pengajuan |
| **Dosen Mata Kuliah** | Melihat jadwal terkini, Mendapatkan Push Notification terhadap perubahan jadwal |
| **Asisten Lab (Aslab)** | Memvalidasi atau menolak pengajuan mahasiswa sebelum diteruskan ke Admin |
| **Admin Fakultas** | Menyetujui/menolak pengajuan final, mengelola jadwal baseline semester |

### 2.3 Asumsi dan Ketergantungan

- Sistem membutuhkan koneksi internet aktif untuk fitur notifikasi push dan pengecekan konflik real-time.
- Data jadwal baseline awal dimasukkan oleh Admin pada awal setiap semester.
- Perangkat Android pengguna mendukung penerimaan notifikasi push (Firebase Cloud Messaging atau setara).
- Sistem AI Assistant terhubung melalui API eksternal yang telah dikonfigurasi.

### 2.4 Batasan
Batasan dari sistem SARS berdasarkan kesepakatan spesifikasi saat ini adalah:
*   **Tidak Ada Offline Mode**: Aplikasi Android sangat bergantung pada koneksi internet *real-time*. Tidak disediakan fitur *caching* data agar mahasiswa dapat melihat jadwal tanpa koneksi internet (masuk kategori *Won't-Have*).
*   **Platform Dashboard Admin**: Dashboard untuk manajemen secara utuh (statistik, log, penyetujuan akhir) dikhususkan melalui Frontend Web, sementara platform Android difokuskan bagi alur pengajuan, notifikasi, dan validasi awal.

---

## 4. Kebutuhan Non-Fungsional

* NFR-01 (Performance): Waktu respons (response time) dari endpoint API (Laravel) saat mengambil dan memproses data jadwal tidak boleh melebihi 2000 milidetik pada kondisi pengujian 100 concurrent users.
* NFR-02 (Security): Seluruh sesi autentikasi pada platform Web dan Android diamankan menggunakan token JWT (JSON Web Token) dengan batas kedaluwarsa (expiration time) maksimal 24 jam.
* NFR-03 (Usability): Antarmuka Web Dashboard (React/Next.js) harus mendukung rendering responsif tanpa memecah struktur layout komponen hingga batas ukuran viewport minimum 768px (resolusi standar tablet).
* NFR-04 (Reliability): Aplikasi Mobile Android (Kotlin) harus mencapai tingkat bebas dari penghentian paksa (crash-free rate) minimal 99% dari total seluruh sesi pengguna harian menurut log pemantauan.

---