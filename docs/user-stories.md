## **1. Kelompok Mahasiswa (Requester)**

### **US-01: Pengajuan Perubahan Jadwal Sementara**
* **User Story:** Sebagai **Mahasiswa**, saya ingin **mengajukan perubahan jadwal sementara (Temporary Change)** untuk satu tanggal spesifik, sehingga **perkuliahan dapat menyesuaikan kondisi mendadak tanpa mengacaukan jadwal rutin di minggu berikutnya.**
* **Acceptance Criteria:**
    1. Sistem memvalidasi bahwa kolom "Alasan" diisi minimal 20 karakter sebelum pengajuan dapat dikirim.
    2. Setelah dikirim, status pengajuan berubah menjadi `PENDING_ASLAB` dan sistem mengirimkan notifikasi push ke semua Asisten Lab terkait.

### **US-02: Deteksi Konflik Ruangan Real-time**
* **User Story:** Sebagai **Mahasiswa**, saya ingin **melihat peringatan konflik dan saran slot kosong saat mengisi form**, sehingga **saya tidak membuang waktu mengajukan request yang pasti ditolak karena bentrok dengan jadwal lain.**
* **Acceptance Criteria:**
    1. Sistem melakukan pengecekan konflik otomatis saat mahasiswa memilih kombinasi hari, jam, dan ruangan di form pengajuan.
    2. Jika terjadi bentrok, sistem menampilkan pesan peringatan berwarna merah dan memberikan minimal 3 rekomendasi ruangan lain yang masih kosong di jam tersebut.

### **US-03: Transparansi Status Validasi**
* **User Story:** Sebagai **Mahasiswa**, saya ingin **memantau riwayat dan status pengajuan saya melalui dashboard**, sehingga **saya mengetahui apakah kendala saya sedang diproses oleh Aslab atau sudah sampai di tahap persetujuan Admin.**
* **Acceptance Criteria:**
    1. Dashboard menampilkan timeline status pengajuan secara jelas (contoh: `Submitted` -> `Checked by Aslab` -> `Forwarded` -> `Approved/Rejected`).
    2. Mahasiswa menerima notifikasi instan di Android saat status berubah dari `Forwarded` menjadi keputusan final dari Admin.


## **2. Kelompok Dosen**

### **US-04: Akses Jadwal Akurat & Terkini**
* **User Story:** Sebagai **Dosen Mata Kuliah**, saya ingin **melihat jadwal mengajar per semester yang mencakup semua perubahan aktif (Temporary & Permanent)**, sehingga **saya selalu datang ke ruangan yang benar dan pada waktu yang tepat.**
* **Acceptance Criteria:**
    * Halaman jadwal dosen harus membedakan tampilan antara jadwal rutin (baseline) dan jadwal yang telah mengalami perubahan sementara (override).
    * Dosen menerima notifikasi push segera setelah ada perubahan status jadwal yang melibatkan mata kuliah pengampunya.

### **US-05: Bantuan AI untuk Komunikasi Formal**
* **User Story:** Sebagai **Dosen Mata Kuliah**, saya ingin **meminta bantuan AI Assistant untuk membuat draf pesan permintaan perubahan jadwal yang profesional**, sehingga **saya dapat mengomunikasikan kebutuhan perubahan ke Admin secara formal tanpa menyusun kalimat dari nol.**
* **Acceptance Criteria:**
    * Sistem menyediakan fitur AI yang dapat menghasilkan teks permintaan perubahan berdasarkan parameter mata kuliah dan alasan yang diberikan dosen.
    * Output AI harus dalam format pesan formal yang siap dikirim melalui kanal komunikasi resmi.

### **Kelompok Asisten Lab / Asisten Dosen**

**US-06: Validasi Awal & Filtrasi**
* **User Story:** Sebagai **Asisten Lab (Aslab)**, saya ingin **menjadi gatekeeper dengan memfilter request mahasiswa sebelum diteruskan ke Admin**, sehingga **Admin hanya menerima pengajuan yang valid dan memiliki alasan yang masuk akal.**
* **Acceptance Criteria:**
    * Aslab dapat mengubah status pengajuan menjadi `FORWARDED` dengan kewajiban mengisi catatan validasi minimal 10 karakter.
    * Sistem memblokir Admin dari menyetujui request yang belum melewati tahap pemeriksaan (checked_by_aslab = TRUE) oleh Aslab.

**US-07: Penolakan Request Tidak Valid**
* **User Story:** Sebagai **Asisten Lab (Aslab)**, saya ingin **menolak langsung pengajuan yang tidak relevan atau bersifat "troll"**, sehingga **beban kerja Admin berkurang dan sistem tidak dipenuhi data sampah.**
* **Acceptance Criteria:**
    * Saat menolak, status pengajuan berubah menjadi `REJECTED_ASLAB` dan tidak akan diteruskan ke dashboard Admin.
    * Sistem harus mengirimkan notifikasi beserta teks alasan penolakan dari Aslab langsung kepada mahasiswa pemohon.

### **Kelompok Admin Fakultas**

**US-08: Manajemen Baseline & Perubahan Permanen (Admin)**
* **User Story:** Sebagai **Admin Fakultas**, saya ingin **menyetujui perubahan jadwal Permanent yang secara otomatis memperbarui template jadwal semester**, sehingga **seluruh data akademik di Prodi Informatika tetap konsisten hingga akhir semester.**
* **Acceptance Criteria:**
    * Saat perubahan permanen disetujui, sistem harus menyimpan snapshot jadwal lama ke dalam tabel `schedule_history` sebagai audit trail.
    * Sistem harus melakukan update pada tabel utama (`schedules`) sesuai data baru dan menyinkronkan tampilan di semua platform (Web & Android) dalam < 5 detik.