# Kontrak Tim - Proyek Integrasi (RPL, Pemrograman Web, PAB)

Dokumen ini merupakan kesepakatan kerja sama tim untuk pengembangan proyek akhir yang mencakup mata kuliah Rekayasa Perangkat Lunak (RPL), Pemrograman Web, dan Pengembangan Aplikasi Bergerak (Android Studio/Kotlin). Seluruh anggota tim wajib mematuhi aturan yang tertulis di bawah ini untuk menjaga profesionalisme dan kelancaran proyek.

## 1. Identitas dan Pembagian Peran
Mengingat proyek ini berskala besar (Cross-platform: Web & Mobile), pembagian tugas ditetapkan sebagai berikut:

* **Revan** 
    * **Role:** Project Manager (PM), Frontend, Backend
  * **Tanggung Jawab:** * Memimpin jalannya proyek, memantau *progress* di *task board* (Trello/GitHub Projects), dan memfasilitasi komunikasi tim.
    * Membantu pengembangan antarmuka (Frontend) untuk Web/Android.
  * Membantu pengembangan logika *server* dan *database* (Backend).
* **Faris**
  * **Role:** Backend Developer
  * **Tanggung Jawab:** Merancang arsitektur *database*, membuat dan mengelola RESTful API untuk dikonsumsi oleh platform Web dan aplikasi Android.
* **Bagas**
  * **Role:** Frontend Developer
  * **Tanggung Jawab:** Merancang UI/UX, membangun antarmuka pengguna untuk platform Web dan aplikasi Android (Kotlin), serta melakukan integrasi API ke *view*.
* **Zen**
  * **Role:** Backend Developer & Quality Assurance (QA)
  * **Tanggung Jawab:** * Membantu pembuatan dan optimasi *logic* Backend / API.
    * (QA) Menyusun skenario pengujian (*test case*), melakukan *testing* (Unit & UI Test), mengecek *Pull Request*, dan melaporkan *bug*.

## 2. Saluran Komunikasi
* **Utama (Diskusi Teknis & File):** Server Discord (Terdapat *channel* khusus Frontend, Backend, PR Review, dan *Voice Channel* untuk *meeting*).
* **Darurat & Koordinasi Cepat:** WhatsApp Group.
* **Manajemen Tugas:** GitHub Projects / Trello.
* **Repositori Kode:** GitHub.

## 3. Jadwal Pertemuan Rutin
* **Daily Standup (Asynchronous):** Setiap hari pukul 20.00 WIB via chat Discord. Setiap anggota wajib memberikan *update*: (1) Apa yang dikerjakan hari ini, (2) Apa yang dikerjakan besok, (3) Blocker/Kendala.
* **Weekly Sync** (Synchronous): **Sabtu: 19.30 WIB** via Discord Voice/Google Meet untuk *review sprint* mingguan dan merencanakan tugas minggu depan.

## 4. Aturan Respons (Service Level Agreement / SLA)
* Pesan terkait proyek di grup (WA/Discord) **wajib dibalas maksimal dalam 12 jam** pada hari kerja/kuliah.
* Jika ada anggota yang berhalangan aktif (sakit, acara keluarga, tugas menumpuk), **wajib memberitahu tim minimal H-1** atau sesegera mungkin agar tugas bisa di-*back-up*.

## 5. Standar Git Workflow & Commit Message
* **Branch Utama:** `main` (Production) dan `dev` (Pengembangan/Default Branch).
* **Branch Fitur:** Setiap anggota wajib membuat *branch* baru dari `dev` saat mengerjakan tugas dengan format: 
  * Fitur baru: `feature/[nama-fitur]` (Contoh: `feature/login-api`)
  * Perbaikan bug: `fix/[nama-bug]` (Contoh: `fix/crash-on-dashboard`)
* **Standar Commit:** Menggunakan bahasa Inggris yang deskriptif dan imperatif.
  * `feat: [deskripsi]` untuk fitur baru.
  * `fix: [deskripsi]` untuk perbaikan bug.
  * `docs: [deskripsi]` untuk perubahan dokumentasi/README.
* **Pull Request (PR):** PR tidak boleh di-*merge* sendiri oleh pembuatnya. Wajib mendapat persetujuan (*Approve*) dari minimal 1 anggota lain (diutamakan peran QA/Zen atau PM/Revan).

## 6. Mekanisme Eskalasi dan Sanksi (Penyelesaian Konflik)
Untuk mencegah adanya *free-rider* (anggota pasif), tim menyepakati mekanisme eskalasi berikut:
1. **Teguran Lisan/Personal (Level 1):** Jika anggota tidak memberikan *update* selama 2x24 jam tanpa kabar, Project Manager akan menghubungi secara personal.
2. **Teguran Terbuka (Level 2):** Jika peringatan pertama diabaikan dan mengganggu *timeline* proyek, akan dibahas secara terbuka di rapat mingguan. Tugasnya akan dialihkan ke anggota lain.
3. **Eskalasi Dosen/Asisten (Level 3):** Jika anggota tetap tidak kooperatif dan tidak ada kontribusi *commit* yang berarti di GitHub, seluruh anggota tim sepakat untuk **melaporkan anggota tersebut ke Dosen Pengampu / Asisten Praktikum** untuk dipotong nilainya atau dikeluarkan dari penilaian kelompok proyek akhir.

---
**Persetujuan Kontrak:**
Dengan di-*push*-nya file ini ke repositori, seluruh anggota yang tercantum di atas (Revan, Faris, Bagas, Zen) menyatakan **setuju dan terikat** dengan aturan kontrak tim ini.