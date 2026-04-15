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