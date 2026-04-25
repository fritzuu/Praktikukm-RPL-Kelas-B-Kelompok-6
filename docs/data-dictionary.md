## Data Dictionary

### Tabel: `roles`

**Deskripsi:** Master data role/peran dalam sistem. Digunakan untuk RBAC (Role-Based Access Control).  
**Relasi FR:** FR-01 (Multi-role auth)

| Atribut | Tipe Data | Panjang | Constraint | Deskripsi |
|:--------|:----------|:--------|:-----------|:----------|
| `id` | BIGINT UNSIGNED | — | PK, AUTO_INCREMENT, NOT NULL | Identitas unik role |
| `name` | VARCHAR | 50 | NOT NULL | Nama tampilan role (e.g., "Admin Fakultas") |
| `slug` | VARCHAR | 20 | NOT NULL, UNIQUE | Identifier kode role: `admin`, `aslab`, `mahasiswa`, `dosen` |
| `description` | TEXT | — | NULLABLE | Deskripsi singkat tanggung jawab role |
| `created_at` | TIMESTAMP | — | NOT NULL, DEFAULT NOW() | Waktu data dibuat |
| `updated_at` | TIMESTAMP | — | NOT NULL | Waktu data terakhir diubah |

**Nilai Slug yang Valid:**
- `admin` — Admin Fakultas
- `aslab` — Asisten Lab / Asisten Dosen
- `mahasiswa` — Mahasiswa
- `dosen` — Dosen Mata Kuliah

---

### Tabel: `users`

**Deskripsi:** Menyimpan semua pengguna sistem. Satu user bisa memiliki beberapa role via tabel `user_roles`.  
**Relasi FR:** FR-01, FR-02 | US-01, US-04, US-06, US-08

| Atribut | Tipe Data | Panjang | Constraint | Deskripsi |
|:--------|:----------|:--------|:-----------|:----------|
| `id` | BIGINT UNSIGNED | — | PK, AUTO_INCREMENT, NOT NULL | Identitas unik pengguna |
| `name` | VARCHAR | 150 | NOT NULL | Nama lengkap pengguna |
| `email` | VARCHAR | 191 | NOT NULL, UNIQUE | Email institusi (login credential) |
| `password` | VARCHAR | 255 | NOT NULL | Password ter-hash (bcrypt) |
| `nim_nip` | VARCHAR | 20 | NULLABLE, UNIQUE | NIM (mahasiswa) atau NIP (dosen/staff) |
| `avatar_url` | VARCHAR | 500 | NULLABLE | URL foto profil pengguna |
| `fcm_token` | VARCHAR | 255 | NULLABLE | Firebase Cloud Messaging token untuk push notif Android |
| `email_verified_at` | TIMESTAMP | — | NULLABLE | Waktu verifikasi email; NULL = belum terverifikasi |
| `is_active` | BOOLEAN | — | NOT NULL, DEFAULT TRUE | Status akun aktif/nonaktif |
| `created_at` | TIMESTAMP | — | NOT NULL, DEFAULT NOW() | Waktu akun dibuat |
| `updated_at` | TIMESTAMP | — | NOT NULL | Waktu akun terakhir diubah |

**Catatan:**
- `fcm_token` diperbarui setiap kali user login di perangkat Android baru (BL-10).
- `nim_nip` bersifat UNIQUE agar tidak ada duplikasi identitas akademik.

---

### Tabel: `user_roles`

**Deskripsi:** Junction table relasi M:N antara `users` dan `roles`. Satu user dapat memiliki lebih dari satu role (e.g., dosen yang juga aslab).  
**Relasi FR:** FR-01

| Atribut | Tipe Data | Panjang | Constraint | Deskripsi |
|:--------|:----------|:--------|:-----------|:----------|
| `id` | BIGINT UNSIGNED | — | PK, AUTO_INCREMENT, NOT NULL | Identitas unik assignment |
| `user_id` | BIGINT UNSIGNED | — | NOT NULL, FK → users(id) ON DELETE CASCADE | Referensi ke pengguna |
| `role_id` | BIGINT UNSIGNED | — | NOT NULL, FK → roles(id) ON DELETE RESTRICT | Referensi ke role |
| `assigned_at` | TIMESTAMP | — | NOT NULL, DEFAULT NOW() | Waktu role diberikan ke user |
| `assigned_by` | BIGINT UNSIGNED | — | NULLABLE, FK → users(id) | User (admin) yang memberikan role |

**Index:** `UNIQUE (user_id, role_id)` — Mencegah duplikasi assignment role yang sama ke user yang sama.

---

### Tabel: `semesters`

**Deskripsi:** Master data semester akademik. Jadwal, MK, dan request terikat ke semester tertentu.  
**Relasi FR:** FR-09 (manajemen baseline per semester) | US-08

| Atribut | Tipe Data | Panjang | Constraint | Deskripsi |
|:--------|:----------|:--------|:-----------|:----------|
| `id` | BIGINT UNSIGNED | — | PK, AUTO_INCREMENT, NOT NULL | Identitas unik semester |
| `name` | VARCHAR | 100 | NOT NULL | Nama tampilan, e.g., "Semester Genap 2024/2025" |
| `academic_year` | VARCHAR | 9 | NOT NULL | Format: "2024/2025" |
| `term` | ENUM | — | NOT NULL, VALUES: 'GANJIL','GENAP' | Semester ganjil atau genap |
| `start_date` | DATE | — | NOT NULL | Tanggal mulai semester |
| `end_date` | DATE | — | NOT NULL | Tanggal akhir semester |
| `is_active` | BOOLEAN | — | NOT NULL, DEFAULT FALSE | Hanya satu semester yang aktif sekaligus |
| `created_at` | TIMESTAMP | — | NOT NULL, DEFAULT NOW() | Waktu data dibuat |
| `updated_at` | TIMESTAMP | — | NOT NULL | Waktu data terakhir diubah |

**Constraint Bisnis:** Hanya boleh ada SATU record dengan `is_active = TRUE` pada saat yang sama (diimplementasikan via trigger atau application logic).

---

### Tabel: `rooms`

**Deskripsi:** Master data ruangan dan laboratorium yang tersedia untuk penjadwalan.  
**Relasi FR:** FR-04 (conflict detection), FR-05 (jadwal view) | US-02

| Atribut | Tipe Data | Panjang | Constraint | Deskripsi |
|:--------|:----------|:--------|:-----------|:----------|
| `id` | BIGINT UNSIGNED | — | PK, AUTO_INCREMENT, NOT NULL | Identitas unik ruangan |
| `code` | VARCHAR | 20 | NOT NULL, UNIQUE | Kode singkat ruangan, e.g., "LAB-A101", "G-201" |
| `name` | VARCHAR | 100 | NOT NULL | Nama lengkap ruangan |
| `capacity` | SMALLINT UNSIGNED | — | NOT NULL | Kapasitas maksimum pengguna |
| `building` | VARCHAR | 50 | NOT NULL | Gedung tempat ruangan berada |
| `floor` | TINYINT | — | NULLABLE | Lantai ruangan |
| `type` | ENUM | — | NOT NULL, VALUES: 'KELAS','LABORATORIUM','AULA','SEMINAR' | Jenis ruangan |
| `is_active` | BOOLEAN | — | NOT NULL, DEFAULT TRUE | Ruangan tersedia/tidak untuk dijadwalkan |
| `created_at` | TIMESTAMP | — | NOT NULL, DEFAULT NOW() | Waktu data dibuat |
| `updated_at` | TIMESTAMP | — | NOT NULL | Waktu terakhir diubah |

---

### Tabel: `courses`

**Deskripsi:** Master data mata kuliah yang ditawarkan pada semester tertentu.  
**Relasi FR:** FR-01, FR-05 | US-01, US-04

| Atribut | Tipe Data | Panjang | Constraint | Deskripsi |
|:--------|:----------|:--------|:-----------|:----------|
| `id` | BIGINT UNSIGNED | — | PK, AUTO_INCREMENT, NOT NULL | Identitas unik mata kuliah |
| `semester_id` | BIGINT UNSIGNED | — | NOT NULL, FK → semesters(id) | Semester MK ditawarkan |
| `code` | VARCHAR | 20 | NOT NULL | Kode MK resmi, e.g., "IF2101" |
| `name` | VARCHAR | 150 | NOT NULL | Nama MK, e.g., "Pemrograman Web" |
| `credits` | TINYINT UNSIGNED | — | NOT NULL | Jumlah SKS |
| `class_name` | VARCHAR | 20 | NOT NULL | Nama kelas, e.g., "Informatika A 2023" |
| `description` | TEXT | — | NULLABLE | Deskripsi MK |
| `is_active` | BOOLEAN | — | NOT NULL, DEFAULT TRUE | Status MK aktif pada semester ini |
| `created_at` | TIMESTAMP | — | NOT NULL, DEFAULT NOW() | Waktu data dibuat |
| `updated_at` | TIMESTAMP | — | NOT NULL | Waktu terakhir diubah |

**Index:** `INDEX (semester_id, code)` — Pencarian cepat MK per semester.

---

### Tabel: `schedules`

**Deskripsi:** Jadwal baseline/rutin yang menjadi template utama per semester. Jadwal ini tidak berubah kecuali ada Permanent Change yang disetujui Admin.  
**Relasi FR:** FR-05, FR-09, FR-10, FR-11 | US-04, US-08 | BL-01, BL-05, BL-06

| Atribut | Tipe Data | Panjang | Constraint | Deskripsi |
|:--------|:----------|:--------|:-----------|:----------|
| `id` | BIGINT UNSIGNED | — | PK, AUTO_INCREMENT, NOT NULL | Identitas unik jadwal |
| `course_id` | BIGINT UNSIGNED | — | NOT NULL, FK → courses(id) | Mata kuliah yang dijadwalkan |
| `room_id` | BIGINT UNSIGNED | — | NOT NULL, FK → rooms(id) | Ruangan utama |
| `semester_id` | BIGINT UNSIGNED | — | NOT NULL, FK → semesters(id) | Semester berlaku |
| `day_of_week` | ENUM | — | NOT NULL, VALUES: 'SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU' | Hari dalam seminggu |
| `start_time` | TIME | — | NOT NULL | Jam mulai, e.g., "08:00:00" |
| `end_time` | TIME | — | NOT NULL | Jam selesai, e.g., "10:00:00" |
| `effective_from` | DATE | — | NOT NULL | Tanggal jadwal ini mulai berlaku |
| `effective_until` | DATE | — | NULLABLE | Tanggal jadwal ini berakhir (NULL = sampai akhir semester) |
| `is_active` | BOOLEAN | — | NOT NULL, DEFAULT TRUE | Jadwal aktif atau tidak |
| `created_at` | TIMESTAMP | — | NOT NULL, DEFAULT NOW() | Waktu data dibuat (oleh Admin) |
| `updated_at` | TIMESTAMP | — | NOT NULL | Waktu terakhir diubah |

**Constraint Bisnis:** Sistem harus memvalidasi tidak ada dua jadwal aktif di ruangan yang sama, hari yang sama, dan jam yang overlap (diimplementasikan via Conflict Detection — FR-04).

**Index:**
- `INDEX (semester_id, day_of_week)` — Query kalender mingguan
- `INDEX (room_id, day_of_week, start_time)` — Conflict check cepat

---