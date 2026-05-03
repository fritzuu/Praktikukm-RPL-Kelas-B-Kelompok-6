 # Activity Diagram — SARS
## Alur: Pengajuan Perubahan Jadwal → Validasi → Approval → Notifikasi
---

## Penjelasan Alur Langkah demi Langkah

### Phase 1 — Mahasiswa Mengisi Form (FR-01, FR-02, US-01, US-02)

| # | Langkah | Keterangan |
|---|---|---|
| 1 | Buka Form | Mahasiswa membuka form pengajuan setelah login (UC-01). |
| 2 | Pilih Tipe | Memilih **Temporary** (1 pertemuan) atau **Permanent** (ubah template). |
| 3 | Isi Data | Mengisi hari/tanggal, jam, ruangan baru, dan alasan. |
| 4 | **Decision: Konflik?** | Sistem cek real-time ke DB untuk overlap ruangan + waktu. **(FR-03, US-02)** |
| 4a | *Alt: Konflik* | Tampil peringatan merah + ≥3 rekomendasi. Mahasiswa memilih ulang atau membatalkan. |
| 5 | **Decision: Alasan ≥20?** | Validasi panjang teks alasan sebelum submit. **(FR-01, US-01)** |
| 5a | *Alt: Gagal validasi* | Error ditampilkan; mahasiswa harus memperbaiki. |
| 6 | Submit | Request tersimpan ke DB dengan status `PENDING_ASLAB`. |

### Alur Paralel 1 — Notifikasi Aslab (FR-02)

Setelah submit: (a) record tersimpan ke DB **dan** (b) push notif dikirim ke semua Aslab secara **paralel (fork/join)** — keduanya harus selesai sebelum lanjut.

### Phase 2 — Validasi Aslab (FR-07, FR-08, FR-09, FR-10, US-06, US-07)

| # | Langkah | Keterangan |
|---|---|---|
| 7 | Aslab review | Aslab membaca detail pengajuan dari dashboard. |
| 8 | **Decision: Valid?** | Aslab menilai relevansi alasan. |
| 8a | *Alt: Tidak valid* | Aslab isi alasan penolakan → status `REJECTED_ASLAB` → notif paralel ke mahasiswa. **(FR-09, FR-10)** |
| 9 | Isi Catatan ≥10 karakter | Wajib sebelum forward. Error jika kurang. **(FR-07)** |
| 10 | Forward ke Admin | Status → `FORWARDED`; notif dikirim ke Admin. |

### Phase 3 — Keputusan Admin (FR-08, FR-11, FR-12, FR-13, US-08)

| # | Langkah | Keterangan |
|---|---|---|
| 11 | **Decision: Sistem blokir?** | Sistem cek `checked_by_aslab = TRUE`. Jika FALSE, Admin diblokir. **(FR-08)** |
| 12 | Admin review | Admin baca pengajuan + catatan Aslab. |
| 13 | **Decision: Setuju/Tolak?** | Keputusan final Admin. |
| 13a | *Alt: Tolak* | Status `REJECTED_ADMIN` → notif paralel ke Mahasiswa & Dosen. **(FR-04, FR-06)** |
| 14 | **Decision: Tipe?** | Jika Temporary atau Permanent → logika berbeda. |
| 15T | *Temporary* | Insert ke `schedule_overrides` → notif → sinkron semua platform <5 detik. |
| 15P | *Permanent* | Simpan audit trail ke `schedule_history` **(FR-12)** → update `schedules` **(FR-11)** → notif → sinkron <5 detik **(FR-13)**. |

### Alternative Flows
- **AF-1:** Mahasiswa membatalkan setelah melihat konflik (tidak memilih ruangan baru).
- **AF-2:** Validasi alasan gagal (< 20 karakter) — form dikembalikan.
- **AF-3:** Catatan Aslab gagal (< 10 karakter) — sistem menolak forward.
- **AF-4:** Admin mencoba approve tanpa Aslab — sistem memblokir otomatis.
- **AF-5:** Admin menolak (tidak menyetujui) — request ditutup, notif dikirim.
