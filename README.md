# Smart Academic Schedule & Room Change System (SARS)
### Sistem Integrasi Jadwal Kampus + Request Perubahan + AI Assistant

Smart Academic Schedule & Room Change System (SARS) adalah sistem manajemen jadwal akademik terintegrasi yang dirancang khusus untuk lingkungan Prodi Informatika. Sistem ini memungkinkan mahasiswa mengajukan perubahan jadwal atau ruangan secara formal melalui alur validasi berlapis: Mahasiswa → Aslab → Admin, dilengkapi dengan AI Assistant berbasis peran untuk mendukung pengambilan keputusan.

## Anggota Kelompok
| Nama | NIM | Role |
| :--- | :--- | :--- |
| **Revan Alifian Zhafran** | L0124154 | Project Manager & Tech Lead |
| **Bagas Aditama Suryo Nugroho** | L0124042 | Frontend Developer |
| **Mufti Faris Murtadho** | L0124133 | Backend Developer |
| **Zendinan Okbah Hasan** | L0124126 | Backend Developer / QA |

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

## Panduan Setup untuk Developer Baru

Ikuti langkah-langkah di bawah ini untuk menjalankan project ini di laptop/komputer kamu.

### 1. Prasyarat (Prerequisites)
Pastikan kamu sudah menginstal perangkat lunak berikut:
- **PHP** (Minimal versi 8.2 ke atas)
- **Composer** (Package manager untuk PHP / Laravel)
- **Node.js** (Minimal versi 18 ke atas, sudah termasuk **npm**)
- **Git** (Untuk mengambil *source code* dari repositori)
- **Teks Editor** (VS Code disarankan)

*(Catatan: Project ini menggunakan database Supabase secara online yang dikonfigurasi melalui `.env`, jadi kamu **tidak perlu** menginstal database lokal seperti XAMPP/MySQL/PostgreSQL, kecuali kamu ingin setup database lokal sendiri).*

---

### 2. Langkah-Langkah Setup
Buka Terminal / Command Prompt dan jalankan langkah-langkah berikut secara berurutan:

**Langkah 1: Clone Project**
```bash
git clone https://github.com/fritzuu/Praktikum-RPL-Kelas-B-Kelompok-6
cd src/SARS-Project
```

**Langkah 2: Install Dependencies Backend (PHP/Laravel)**
```bash
composer install
```

**Langkah 3: Install Dependencies Frontend (Node/React)**
```bash
npm install
```

**Langkah 4: Setup File Environment (.env)**
File konfigurasi database tidak diunggah ke GitHub karena berisi kredensial rahasia.
1. Salin file `.env.example` menjadi `.env`.
   ```bash
   cp .env.example .env
   ```
2. Buka file `.env` tersebut.
3. Minta detail konfigurasi database (terutama bagian `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, dll) kepada teman satu timmu yang sudah memilikinya, dan masukkan ke file `.env` kamu.

**Langkah 5: Generate Application Key**
```bash
php artisan key:generate
```

*(Penting: Jika kalian menggunakan Supabase yang sama secara bersama-sama, kamu **tidak perlu** menjalankan perintah migrasi database `php artisan migrate:fresh --seed`. Tabel dan data uji (seperti akun dummy) sudah tersedia. Menjalankan perintah tersebut akan mereset database tim kalian).*

---

### 3. Setup Laravel Reverb (Realtime WebSocket)
Project ini menggunakan Laravel Reverb untuk fitur realtime sync database. Setup sekali saja saat pertama kali:

**Install Laravel Reverb Package:**
```bash
composer require laravel/reverb
```

**Install Reverb Configuration:**
```bash
php artisan reverb:install
```

**Install Frontend WebSocket Dependencies:**
```bash
npm install --save laravel-echo pusher-js
```

**Create Cache & Queue Tables (PENTING!):**
```bash
php artisan cache:table
php artisan queue:table
php artisan migrate
```

Setelah setup ini selesai, kredensial Reverb sudah otomatis ada di file `.env` kamu. Tidak perlu mengubah apapun.

---

### 4. Cara Menjalankan Project (Development Mode)
Setiap kali kamu ingin mengerjakan atau melihat preview aplikasi, kamu perlu membuka **4 tab Terminal** dan menjalankan keempat perintah ini secara bersamaan:

**Terminal 1 (Server Backend Laravel):**
```bash
php artisan serve
```

**Terminal 2 (WebSocket Server - Reverb):**
```bash
php artisan reverb:start
```

**Terminal 3 (Queue Worker untuk Broadcasting):**
```bash
php artisan queue:work
```

**Terminal 4 (Server Frontend React/Vite):**
```bash
npm run dev
```

Setelah keempatnya berjalan tanpa error, buka browser dan akses URL:
[http://localhost:8000](http://localhost:8000)

**Catatan Penting:**
- **Terminal 1** menjalankan server Laravel (API & web server)
- **Terminal 2** menjalankan WebSocket server untuk realtime sync
- **Terminal 3** memproses antrian broadcast event (jangan ditutup)
- **Terminal 4** menjalankan frontend React development server

Jika kamu menutup salah satu terminal, fitur realtime tidak akan berfungsi dengan baik.

---

### 5. Akun Uji Coba (Dummy Accounts)
Gunakan akun berikut untuk menguji fitur login dan dashboard (Password untuk semua akun: `password`):

| Role | Email | Password |
|---|---|---|
| Admin | `revan@sars.test` | `password` |
| Dosen | `bagas@sars.test` | `password` |
| Asisten Lab | `faris@sars.test` | `password` |
| Mahasiswa | `zendin@sars.test` | `password` |

---

### 6. Troubleshooting & FAQ

**Q: Error "relation cache does not exist" saat reverb:start atau queue:work**
- Tables cache/queue belum ada. Run:
  ```bash
  php artisan cache:table
  php artisan queue:table
  php artisan migrate
  php artisan config:clear
  ```

**Q: Error "Connection refused" saat akses http://localhost:8000**
- Pastikan Terminal 1 (`php artisan serve`) masih running
- Check port 8000 tidak dipakai aplikasi lain

**Q: Realtime sync tidak bekerja / data tidak auto-update**
- Pastikan semua 4 terminal berjalan (Laravel, Reverb, Queue Worker, Vite)
- Buka Console browser (F12) check error WebSocket
- Pastikan Terminal 2 (Reverb) dan Terminal 3 (Queue Worker) tidak error

**Q: Error "npm ERR!" saat npm install**
- Hapus folder `node_modules` dan file `package-lock.json`
- Run ulang `npm install`

**Q: Error "Class not found" atau "Composer autoload"**
- Run: `composer dump-autoload`
- Run: `php artisan config:clear`
- Run: `php artisan cache:clear`

**Q: Reverb WebSocket tidak konek**
- Pastikan `.env` ada config:
  ```
  BROADCAST_CONNECTION=reverb
  REVERB_HOST="localhost"
  REVERB_PORT=8080
  ```
- Restart Terminal 2 (Reverb server)
- Clear browser cache dan refresh

**Q: Queue worker stuck / broadcast tidak jalan**
- Stop Terminal 3 (Ctrl+C)
- Clear queue: `php artisan queue:flush`
- Restart: `php artisan queue:work`

**Q: Perlu reset database lokal?**
⚠️ **Hati-hati!** Jika pakai Supabase bersama tim, command ini **reset database semua orang**:
```bash
php artisan migrate:fresh --seed
```
Koordinasi dengan tim dulu!

---