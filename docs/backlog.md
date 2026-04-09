# Product Backlog - Smart Academic Schedule & Room Change System (SARS)

**Proyek:** Smart Academic Schedule & Room Change System (SARS)  
**Versi:** 2.0 (Revisi)  
**Metode Prioritas:** MoSCoW (Must-have, Should-have, Could-have, Won't-have)

---

## 1. Must-Have (Prioritas Utama / MVP)
*Fitur yang wajib selesai semester ini agar sistem dapat berjalan (Minimum Viable Product).*

| ID | Item / User Story | Deskripsi Tugas | Platform |
|:---|:---|:---|:---|
| **BL-01** | **Database Setup** | Implementasi 14 tabel database sesuai skema (users, schedules, requests, dll) menggunakan Laravel Migrations. | Backend |
| **BL-02** | **Auth & Role Access** | Sistem login Multi-role (Admin, Aslab, Mahasiswa, Dosen) menggunakan JWT-Auth. | Web & Android |
| **BL-03** | **Submit Request** | Form pengajuan perubahan jadwal untuk tipe **Temporary** (1x pertemuan) dan **Permanent** (ubah template). | Web & Android |
| **BL-04** | **Approval Pipeline** | Alur validasi: Mahasiswa -> Aslab (Forward/Reject) -> Admin (Approve/Reject). | Web & Android |
| **BL-05** | **Schedule View** | Menampilkan jadwal mingguan (Baseline) dan perubahan yang sedang aktif (Override). | Web & Android |
| **BL-06** | **Core Logic Approve** | Logika otomatis: Insert ke tabel `schedule_overrides` jika Temp, atau Update tabel `schedules` jika Permanent. | Backend |
| **BL-07** | **Admin Dashboard** | Ringkasan statistik jumlah request pending, konflik aktif, dan log sistem. | Web |
| **BL-08** | **Profile Management** | Fitur update foto profil, reset password, dan pengaturan akun pengguna. | Web & Android |

---

## 2. Should-Have (Penting)
*Fitur penting yang diusahakan ada untuk meningkatkan fungsionalitas utama.*

| ID | Item / User Story | Deskripsi Tugas | Platform |
|:---|:---|:---|:---|
| **BL-09** | **Conflict Detection** | Algoritma pengecekan bentrok ruangan dan waktu secara real-time sebelum mahasiswa submit request. | Backend |
| **BL-10** | **Push Notifications** | Pengiriman notifikasi status request (Approved/Rejected) menggunakan Firebase Cloud Messaging (FCM). | Android |
| **BL-11** | **Search & Filter** | Pencarian slot ruangan kosong berdasarkan hari, tanggal, dan jam tertentu. | Web & Android |

---

## 3. Could-Have (Opsional / Nilai Tambah)
*Fitur tambahan yang akan dikerjakan jika waktu pengerjaan utama masih tersedia.*

| ID | Item / User Story | Deskripsi Tugas | Platform |
|:---|:---|:---|:---|
| **BL-12** | **AI Assistant Panel** | Sidebar AI untuk membantu Admin menganalisis konflik atau membantu Mahasiswa bertanya jadwal. | Web & Android |
| **BL-13** | **Bulk Import CSV** | Fitur import jadwal massal dari file CSV untuk setup jadwal rutin secara cepat. | Web Only |
| **BL-14** | **Export Audit Log** | Fitur ekspor riwayat perubahan jadwal ke format PDF atau Excel untuk keperluan akreditasi/laporan. | Web Only |

---

## 4. Won't-Have (Masa Depan)
*Fitur yang diputuskan tidak dikerjakan pada semester ini atau iterasi sekarang.*

| ID | Item / User Story | Deskripsi Tugas | Platform |
|:---|:---|:---|:---|
| **BL-15** | **Offline Mode** | Fitur caching data jadwal agar mahasiswa tetap bisa melihat jadwal tanpa koneksi internet. | Android |