# Smart Academic Schedule & Room Change System (SARS)
### Sistem Integrasi Jadwal Kampus + Request Perubahan + AI Assistant

Smart Academic Schedule & Room Change System (SARS) adalah sistem manajemen jadwal akademik terintegrasi yang dirancang khusus untuk lingkungan Prodi Informatika. Sistem ini memungkinkan mahasiswa mengajukan perubahan jadwal atau ruangan secara formal melalui alur validasi berlapis: Mahasiswa → Aslab → Admin, dilengkapi dengan AI Assistant berbasis peran untuk mendukung pengambilan keputusan.

## Anggota Kelompok
| Nama | NIM | Role |
| :--- | :--- | :--- |
| **Revan Alifian Zhafran** | L0124154 | Project Manager & Tech Lead |
| **Bagas Aditama Suryo Nugroho** | L0124137 | Frontend Developer |
| **Mufti Faris Murtadho** | L0124133 | Backend Developer |
| **Zendina Okbah Hasan** | L0124126 | Backend Developer / QA |

## Fitur Utama
1. **Import Jadwal Kampus**: Admin memasukkan jadwal resmi Prodi Informatika per semester yang menjadi baseline sistem dengan fitur conflict check otomatis.
2. **Request Perubahan (3 Tahap)**: Alur validasi yang memastikan setiap request disaring oleh Aslab sebelum mendapat keputusan final dari Admin.
3. **Notifikasi Otomatis**: Pengiriman push notification real-time ke device Android Dosen dan Mahasiswa saat jadwal berubah via FCM dan untuk bagian website notifkasi masuk ke email .
4. **AI Assistant Berbasis Peran**: AI bertindak sebagai asisten informasi yang konteksnya dibatasi sesuai role pengguna (Admin, Aslab, Mahasiswa, Dosen).
5. **Overview Jadwal & Slot Kosong**: Kalender mingguan interaktif dengan highlight slot kosong (hijau), jadwal resmi (merah), dan jadwal override aktif (kuning).

## Tech Stack Utama
* **Backend API**: Laravel / Node.js Express — Pure REST API + JWT Auth.
* **Database**: PostgreSQL / MySQL — Relational Database.
* **Frontend Web**: React / Next.js / Vue + Tailwind CSS — Khusus Admin Web.
* **Mobile Android**: Android Studio — Kotlin + Retrofit + MVVM + FCM.

## Struktur Repository & Branching
Repository ini menggunakan format penamaan `praktikum-rpl-[kelas]-[nomor]`.
Branch `dev` wajib dijadikan default branch di pengaturan GitHub.

* `docs/`: Berisi dokumen kontrak tim, SRS, ERD, API Spec, dan Wireframe.
* `src/backend/`: Source code server API.
* `src/frontend/`: Source code web dashboard Admin.
* `src/android/`: Source code aplikasi mobile.
