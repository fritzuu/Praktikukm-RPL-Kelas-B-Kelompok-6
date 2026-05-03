# SARS (Sistem Akademik & Ruang Studi) Project

Project ini adalah platform terintegrasi untuk mahasiswa, dosen, asisten lab, dan administrator dalam mengelola jadwal perkuliahan. Dibangun menggunakan Laravel (Backend), React/Inertia.js (Frontend), dan Supabase PostgreSQL (Database).

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
git clone <url-repository-github>
cd SARS-Project
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

### 3. Cara Menjalankan Project (Development Mode)
Setiap kali kamu ingin mengerjakan atau melihat preview aplikasi, kamu perlu membuka **2 tab Terminal** dan menjalankan kedua perintah ini secara bersamaan:

**Terminal 1 (Server Backend Laravel):**
```bash
php artisan serve
```

**Terminal 2 (Server Frontend React/Vite):**
```bash
npm run dev
```

Setelah keduanya berjalan tanpa error, buka browser dan akses URL:
[http://localhost:8000](http://localhost:8000)

---

### 4. Akun Uji Coba (Dummy Accounts)
Gunakan akun berikut untuk menguji fitur login dan dashboard (Password untuk semua akun: `password123`):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@university.ac.id` | `password123` |
| Dosen | `siti.rahayu@university.ac.id` | `password123` |
| Asisten Lab | `reza.pratama@university.ac.id` | `password123` |
| Mahasiswa | `andi.wijaya@student.university.ac.id` | `password123` |
