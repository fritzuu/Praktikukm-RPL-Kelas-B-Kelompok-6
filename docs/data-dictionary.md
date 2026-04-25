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

### Tabel: `teaching_assignments`

**Deskripsi:** Memetakan dosen ke jadwal mata kuliah. Mendukung team teaching (lebih dari satu dosen per jadwal).  
**Relasi FR:** FR-05 | US-04

| Atribut | Tipe Data | Panjang | Constraint | Deskripsi |
|:--------|:----------|:--------|:-----------|:----------|
| `id` | BIGINT UNSIGNED | — | PK, AUTO_INCREMENT, NOT NULL | Identitas unik penugasan |
| `schedule_id` | BIGINT UNSIGNED | — | NOT NULL, FK → schedules(id) ON DELETE CASCADE | Jadwal yang diajarkan |
| `user_id` | BIGINT UNSIGNED | — | NOT NULL, FK → users(id) ON DELETE CASCADE | Dosen pengajar |
| `role_in_class` | ENUM | — | NOT NULL, DEFAULT 'PENGAJAR', VALUES: 'PENGAJAR','ASISTEN' | Peran dosen dalam kelas |
| `assigned_at` | TIMESTAMP | — | NOT NULL, DEFAULT NOW() | Waktu penugasan |

**Index:** `UNIQUE (schedule_id, user_id)` — Satu dosen tidak dapat di-assign dua kali ke jadwal yang sama.

---

### Tabel: `change_requests`

**Deskripsi:** Inti sistem — menyimpan semua pengajuan perubahan jadwal dari mahasiswa. Mencakup tipe Temporary dan Permanent dengan status yang bergerak sepanjang approval pipeline.  
**Relasi FR:** FR-01, FR-02, FR-03, FR-04 | US-01, US-02, US-03 | BL-03, BL-09

| Atribut | Tipe Data | Panjang | Constraint | Deskripsi |
|:--------|:----------|:--------|:-----------|:----------|
| `id` | BIGINT UNSIGNED | — | PK, AUTO_INCREMENT, NOT NULL | Identitas unik request |
| `request_code` | VARCHAR | 20 | NOT NULL, UNIQUE | Kode human-readable: "REQ-2025-047" |
| `requester_id` | BIGINT UNSIGNED | — | NOT NULL, FK → users(id) | Mahasiswa yang mengajukan |
| `schedule_id` | BIGINT UNSIGNED | — | NOT NULL, FK → schedules(id) | Jadwal baseline yang dimohon diubah |
| `semester_id` | BIGINT UNSIGNED | — | NOT NULL, FK → semesters(id) | Semester pengajuan |
| `request_type` | ENUM | — | NOT NULL, VALUES: 'TEMPORARY','PERMANENT' | Jenis perubahan |
| `target_date` | DATE | — | NOT NULL (jika TEMPORARY), NULLABLE (jika PERMANENT) | Tanggal spesifik yang diubah (Temp only) |
| `effective_from_date` | DATE | — | NULLABLE | Tanggal mulai berlaku perubahan permanen |
| `proposed_day` | ENUM | — | NULLABLE, VALUES: 'SENIN',...,'SABTU' | Hari pengganti yang diusulkan |
| `proposed_start_time` | TIME | — | NULLABLE | Jam mulai pengganti |
| `proposed_end_time` | TIME | — | NULLABLE | Jam selesai pengganti |
| `proposed_room_id` | BIGINT UNSIGNED | — | NULLABLE, FK → rooms(id) | Ruangan pengganti yang diusulkan |
| `reason` | TEXT | — | NOT NULL | Alasan pengajuan (min 20 karakter, validated di app layer) |
| `attachment_url` | VARCHAR | 500 | NULLABLE | URL file pendukung (PDF/JPG) |
| `status` | ENUM | — | NOT NULL, DEFAULT 'PENDING_ASLAB' | Status saat ini dalam pipeline |
| `conflict_checked` | BOOLEAN | — | NOT NULL, DEFAULT FALSE | Apakah sistem sudah cek konflik |
| `has_conflict` | BOOLEAN | — | NOT NULL, DEFAULT FALSE | Hasil cek konflik (TRUE = ada bentrok) |
| `created_at` | TIMESTAMP | — | NOT NULL, DEFAULT NOW() | Waktu pengajuan dikirim |
| `updated_at` | TIMESTAMP | — | NOT NULL | Waktu status terakhir berubah |

**Nilai ENUM `status`:**

| Status | Tahap | Deskripsi |
|:-------|:------|:----------|
| `PENDING_ASLAB` | Awal | Baru dikirim, menunggu validasi Aslab |
| `REJECTED_ASLAB` | Terminal | Ditolak Aslab, tidak diteruskan ke Admin |
| `PENDING_ADMIN` | Tengah | Sudah divalidasi Aslab, menunggu keputusan Admin |
| `APPROVED` | Terminal | Disetujui Admin, jadwal sudah diubah |
| `REJECTED_ADMIN` | Terminal | Ditolak Admin setelah validasi Aslab |
| `CANCELLED` | Terminal | Dibatalkan oleh mahasiswa sebelum diproses |

**Index:**
- `INDEX (requester_id, status)` — Dashboard mahasiswa
- `INDEX (semester_id, status)` — Dashboard Aslab & Admin
- `INDEX (schedule_id)` — Terkait jadwal tertentu

---

### Tabel: `approvals`

**Deskripsi:** Merekam setiap keputusan dalam approval pipeline. Setiap request bisa memiliki maksimal 2 record (Aslab + Admin). Mendukung audit trail lengkap.  
**Relasi FR:** FR-06, FR-07, FR-08, FR-09, FR-10, FR-11 | US-06, US-07, US-08 | BL-04

| Atribut | Tipe Data | Panjang | Constraint | Deskripsi |
|:--------|:----------|:--------|:-----------|:----------|
| `id` | BIGINT UNSIGNED | — | PK, AUTO_INCREMENT, NOT NULL | Identitas unik approval record |
| `request_id` | BIGINT UNSIGNED | — | NOT NULL, FK → change_requests(id) ON DELETE CASCADE | Request yang diputuskan |
| `actor_id` | BIGINT UNSIGNED | — | NOT NULL, FK → users(id) | Aslab atau Admin yang mengambil keputusan |
| `stage` | ENUM | — | NOT NULL, VALUES: 'ASLAB_CHECK','ADMIN_DECISION' | Tahap dalam pipeline |
| `decision` | ENUM | — | NOT NULL, VALUES: 'FORWARDED','APPROVED','REJECTED_ASLAB','REJECTED_ADMIN' | Keputusan yang diambil |
| `notes` | TEXT | — | NULLABLE | Catatan wajib saat tolak; catatan opsional saat approve/forward |
| `decided_at` | TIMESTAMP | — | NOT NULL, DEFAULT NOW() | Waktu keputusan diambil |

**Constraint Bisnis:**
- Satu request hanya bisa memiliki SATU record per stage: `UNIQUE (request_id, stage)`
- Admin tidak dapat membuat record `ADMIN_DECISION` jika belum ada record `ASLAB_CHECK` untuk request yang sama (enforced di application layer — FR-06, US-06)

---

### Tabel: `schedule_overrides`

**Deskripsi:** Menyimpan penggantian jadwal sementara (Temporary) yang aktif. Override ini hanya berlaku untuk satu tanggal spesifik dan tidak mengubah tabel `schedules`.  
**Relasi FR:** FR-10, FR-11, FR-12 | US-03, US-04, US-08 | BL-06

| Atribut | Tipe Data | Panjang | Constraint | Deskripsi |
|:--------|:----------|:--------|:-----------|:----------|
| `id` | BIGINT UNSIGNED | — | PK, AUTO_INCREMENT, NOT NULL | Identitas unik override |
| `schedule_id` | BIGINT UNSIGNED | — | NOT NULL, FK → schedules(id) | Jadwal baseline yang di-override |
| `request_id` | BIGINT UNSIGNED | — | NOT NULL, UNIQUE, FK → change_requests(id) | Request yang memicu override ini |
| `room_id` | BIGINT UNSIGNED | — | NOT NULL, FK → rooms(id) | Ruangan pengganti aktual |
| `override_date` | DATE | — | NOT NULL | Tanggal spesifik override berlaku |
| `new_day_of_week` | ENUM | — | NULLABLE, VALUES: 'SENIN',...,'SABTU' | Hari pengganti (jika berbeda) |
| `new_start_time` | TIME | — | NOT NULL | Jam mulai pengganti |
| `new_end_time` | TIME | — | NOT NULL | Jam selesai pengganti |
| `is_active` | BOOLEAN | — | NOT NULL, DEFAULT TRUE | Override masih berlaku |
| `created_at` | TIMESTAMP | — | NOT NULL, DEFAULT NOW() | Waktu override dibuat (saat Admin approve) |

**Index:** `INDEX (override_date, room_id)` — Untuk conflict check pada tanggal dan ruangan tertentu.

---

### Tabel: `schedule_history`

**Deskripsi:** Audit trail — menyimpan snapshot jadwal baseline sebelum diubah oleh Permanent Change. Memastikan riwayat jadwal dapat ditelusuri untuk kebutuhan akreditasi.  
**Relasi FR:** FR-11, FR-13 | US-08 | BL-06

| Atribut | Tipe Data | Panjang | Constraint | Deskripsi |
|:--------|:----------|:--------|:-----------|:----------|
| `id` | BIGINT UNSIGNED | — | PK, AUTO_INCREMENT, NOT NULL | Identitas unik history record |
| `schedule_id` | BIGINT UNSIGNED | — | NOT NULL, FK → schedules(id) | Jadwal yang diubah |
| `request_id` | BIGINT UNSIGNED | — | NOT NULL, FK → change_requests(id) | Request yang memicu perubahan |
| `changed_by` | BIGINT UNSIGNED | — | NOT NULL, FK → users(id) | Admin yang menyetujui perubahan |
| `snapshot_data` | JSON | — | NOT NULL | Snapshot lengkap record schedules sebelum diubah |
| `change_reason` | TEXT | — | NOT NULL | Alasan perubahan permanen |
| `changed_at` | TIMESTAMP | — | NOT NULL, DEFAULT NOW() | Waktu perubahan dilakukan |

**Format `snapshot_data` (JSON):**
```json
{
  "course_id": 5,
  "room_id": 3,
  "day_of_week": "SENIN",
  "start_time": "08:00:00",
  "end_time": "10:00:00",
  "effective_from": "2025-01-01",
  "effective_until": null
}
```

---

### Tabel: `notifications`

**Deskripsi:** Menyimpan semua notifikasi yang dibuat sistem. Setiap perubahan status request memicu satu notifikasi dengan banyak penerima via `notification_recipients`.  
**Relasi FR:** FR-08 | US-01, US-03, US-07 | BL-10

| Atribut | Tipe Data | Panjang | Constraint | Deskripsi |
|:--------|:----------|:--------|:-----------|:----------|
| `id` | BIGINT UNSIGNED | — | PK, AUTO_INCREMENT, NOT NULL | Identitas unik notifikasi |
| `request_id` | BIGINT UNSIGNED | — | NULLABLE, FK → change_requests(id) | Request terkait (NULL jika notif sistem) |
| `triggered_by` | BIGINT UNSIGNED | — | NULLABLE, FK → users(id) | User yang memicu notifikasi |
| `type` | ENUM | — | NOT NULL, VALUES: 'STATUS_CHANGE','CONFLICT_ALERT','SYSTEM','REMINDER' | Jenis notifikasi |
| `title` | VARCHAR | 200 | NOT NULL | Judul notifikasi |
| `body` | TEXT | — | NOT NULL | Isi pesan notifikasi |
| `data_payload` | JSON | — | NULLABLE | Data tambahan untuk deep link di Android |
| `created_at` | TIMESTAMP | — | NOT NULL, DEFAULT NOW() | Waktu notifikasi dibuat |

---

### Tabel: `notification_recipients`

**Deskripsi:** Junction table M:N antara `notifications` dan `users`. Merekam status pengiriman dan pembacaan notifikasi per penerima per kanal.  
**Relasi FR:** FR-08 | US-01, US-03, US-04, US-07 | BL-10

| Atribut | Tipe Data | Panjang | Constraint | Deskripsi |
|:--------|:----------|:--------|:-----------|:----------|
| `id` | BIGINT UNSIGNED | — | PK, AUTO_INCREMENT, NOT NULL | Identitas unik record |
| `notification_id` | BIGINT UNSIGNED | — | NOT NULL, FK → notifications(id) ON DELETE CASCADE | Notifikasi terkait |
| `recipient_id` | BIGINT UNSIGNED | — | NOT NULL, FK → users(id) ON DELETE CASCADE | Penerima notifikasi |
| `channel` | ENUM | — | NOT NULL, VALUES: 'PUSH','EMAIL','IN_APP' | Kanal pengiriman |
| `is_sent` | BOOLEAN | — | NOT NULL, DEFAULT FALSE | Apakah notif sudah terkirim |
| `sent_at` | TIMESTAMP | — | NULLABLE | Waktu notif terkirim |
| `is_read` | BOOLEAN | — | NOT NULL, DEFAULT FALSE | Status sudah dibaca (untuk IN_APP) |
| `read_at` | TIMESTAMP | — | NULLABLE | Waktu notif dibaca |

**Index:** `INDEX (recipient_id, is_read)` — Menampilkan notif belum dibaca per user (badge counter).