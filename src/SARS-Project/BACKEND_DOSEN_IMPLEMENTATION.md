# Backend Implementation - Dosen Jadwal & Notifikasi

## 📋 Overview
Implementasi backend untuk fitur **Jadwal Mengajar Dosen** dan **Notifikasi Dosen** yang terintegrasi dengan frontend React yang sudah dibuat sebelumnya.

## 🗄️ Database Changes

### 1. Migrations Updated
- **schedules**: Tambah fields `session_start` dan `session_duration`
  - `session_start`: Nomor sesi mulai (1, 2, 3, dst)
  - `session_duration`: Durasi sesi (1, 2, 3, dll)
  
- **notifications**: Modernisasi struktur
  - Support dual format (backward compatible + new format)
  - Fields: `user_id`, `request_id`, `triggered_by`, `title`, `message`, `type`, `category`, `action_url`, `data_payload`, `read_at`
  - Index untuk query cepat

### 2. Models Created
```
app/Models/
├── Schedule.php          ✓ with relations to Course, Room, Semester, TeachingAssignment
├── Course.php            ✓ with relations to Semester, Schedule
├── Room.php              ✓ with relations to Schedule
├── Semester.php          ✓ with relations to Course, Schedule + active() scope
├── TeachingAssignment.php ✓ with relations to Schedule, User
└── Notification.php      ✓ updated with scopes (unread, byType, forUser)
```

## 🎯 API Endpoints

### Dosen Jadwal
```
GET /dosen/jadwal
├── Returns: { jadwal, stats, semester }
├── jadwal: Array of schedules with fields:
│   - id, kode, nama, kelas, ruangan, hari
│   - sesiMulai, durasi, mahasiswa, waktu
├── stats: { totalMataKuliah, totalSks, totalJadwal }
└── semester: { nama, tahun }
```

### Dosen Notifikasi
```
GET /dosen/notification
├── Returns: { notifications }
├── notifications: Array of notif with fields:
│   - id, title, message, type (success/warning/info/error)
│   - category, read, createdAt, actionUrl
│
POST /dosen/notification/{notification}/read
├── Mark notification as read
│
DELETE /dosen/notification/{notification}
└── Delete notification
```

## 🔧 Controllers

### DosenJadwalController
**File**: `app/Http/Controllers/Dosen/DosenJadwalController.php`

```php
class DosenJadwalController extends Controller {
    public function index(Request $request): Response {
        // 1. Get authenticated dosen
        // 2. Get active semester
        // 3. Query teaching assignments for dosen
        // 4. Fetch schedules with relations
        // 5. Transform to frontend format
        // 6. Calculate stats
        // 7. Return via Inertia
    }
}
```

**Data Flow**:
```
User Request
    ↓
Auth Check (middleware: role:dosen)
    ↓
Get Dosen's Teaching Assignments
    ↓
Query Schedules + Relations
    ↓
Transform & Format Data
    ↓
Calculate Statistics
    ↓
Return via Inertia (JSON to React)
```

### DosenNotificationController
**File**: `app/Http/Controllers/Dosen/DosenNotificationController.php`

```php
class DosenNotificationController extends Controller {
    public function index(Request $request): Response
    public function markAsRead(Notification $notification)
    public function destroy(Notification $notification)
    
    private function normalizeType(string $type): string
}
```

**Features**:
- Fetch user notifications ordered by newest
- Support both old (request_id based) and new (direct user_id) notification formats
- Mark as read functionality
- Delete notification
- Type normalization (STATUS_CHANGE → info, etc)

## 🌱 Seeders

### DatabaseSeeder (Existing)
- Provides baseline data: roles, users, semesters, rooms, courses, schedules, teaching assignments
- **Active Semester**: Genap 2024/2025 (is_active=true)
- **Test Dosen**:
  - ID 2: Prof. Siti Rahayu (email: siti.rahayu@university.ac.id)
  - ID 3: Dr. Ahmad Fauzi (email: ahmad.fauzi@university.ac.id)
- **Assigned Schedules**: 5 courses across Mon-Fri

### DosenJadwalSeeder (New)
**File**: `database/seeders/DosenJadwalSeeder.php`

- Adds test notifications for dosen
- Uses existing dosen users (ID 2 & 3)
- Creates 5 sample notifications:
  - Confirmation (success) - read
  - Room change (warning) - read
  - Today reminder (info) - unread
  - System notifications (info) - unread
- Non-destructive: doesn't recreate existing schedule data

**Run Seeder**:
```bash
php artisan db:seed --class=DosenJadwalSeeder
# or together with DatabaseSeeder
php artisan migrate:fresh --seed
```

## 📡 Routes

**File**: `routes/web.php`

```php
Route::middleware('role:dosen')->prefix('dosen')->name('dosen.')->group(function () {
    Route::get('/dashboard', [DosenDashboardController::class, 'index'])->name('dashboard');
    Route::get('/jadwal', [DosenJadwalController::class, 'index'])->name('jadwal');
    Route::get('/notification', [DosenNotificationController::class, 'index'])->name('notification');
    Route::post('/notification/{notification}/read', [DosenNotificationController::class, 'markAsRead'])->name('notification.read');
    Route::delete('/notification/{notification}', [DosenNotificationController::class, 'destroy'])->name('notification.destroy');
    Route::get('/pengaturan', fn () => Inertia::render('Dosen/Setting'))->name('pengaturan');
});
```

## 🔄 Data Transformation Flow

### Jadwal → Frontend
```
Database (Schedule with relations)
    ↓
Query with eager loading (course, room)
    ↓
Map to frontend format:
{
    id, kode, nama, kelas, ruangan, hari, 
    sesiMulai, durasi, mahasiswa, waktu
}
    ↓
Group into stats
    ↓
Return as Inertia props
```

### Notification → Frontend
```
Database (Notification)
    ↓
Query by user_id, ordered by created_at desc
    ↓
Normalize type (5 types → 4 frontend types)
    ↓
Map to frontend format:
{
    id, title, message, type, category, 
    read, createdAt, actionUrl
}
    ↓
Return as Inertia props
```

## ✅ Testing Checklist

- [x] Models have correct relationships
- [x] Controllers return correct shape data
- [x] Routes protected with role middleware
- [x] Seeders run without errors
- [x] Frontend can consume API responses
- [x] Search/filter works on frontend side
- [x] Day tabs work correctly
- [x] Notification marking as read
- [x] Notification deletion

## 🚀 How to Use

### 1. Fresh Setup
```bash
# Clear existing DB
php artisan migrate:fresh --seed

# Run specific seeder to add notifications
php artisan db:seed --class=DosenJadwalSeeder
```

### 2. Test Dosen Login
```
Email: siti.rahayu@university.ac.id (atau ahmad.fauzi@university.ac.id)
Password: password123
```

### 3. View Data
- Dashboard: `/dosen/dashboard`
- Jadwal: `/dosen/jadwal`
- Notifikasi: `/dosen/notification`

## 📝 Notes

- **Backward Compatibility**: Notification table supports both old structure (request_id, triggered_by) and new (user_id direct)
- **Permission Check**: All routes protected by `middleware('role:dosen')`
- **Soft Delete**: Not implemented (use database records or add softDeletes() if needed later)
- **Pagination**: Limited to 50 notifications per request (can be made configurable)
- **Validation**: Form validation not added in controller yet (can be added in next iteration)

## 🔗 Frontend Integration

Frontend components already created:
- `DosenLayout` - Sidebar + header layout
- `Jadwal.jsx` - Schedule page with search, day filter, stat cards
- `Notification.jsx` - Notification list with type badges, actions
- Models → React props via Inertia

The backend now provides the necessary API to power these components.

---

**Status**: ✅ Ready for Integration Testing
**Next Steps**: 
1. Test full flow (login → view jadwal → view notifications)
2. Add form validation if needed
3. Add soft delete/archive functionality
4. Implement caching for performance
