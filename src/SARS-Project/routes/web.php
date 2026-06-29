<?php

use App\Http\Controllers\Auth\AuthController;

use App\Http\Controllers\Aslab\AslabDashboardController;
use App\Http\Controllers\Aslab\AslabJadwalController;
use App\Http\Controllers\Aslab\AslabValidationController;
use App\Http\Controllers\Aslab\AslabNotifikasiController;
use App\Http\Controllers\Aslab\AslabSettingController;
use App\Http\Controllers\Dosen\DosenDashboardController;
use App\Http\Controllers\Dosen\DosenJadwalController;
use App\Http\Controllers\Dosen\DosenNotifikasiController;
use App\Http\Controllers\Dosen\DosenSettingController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminJadwalController;
use App\Http\Controllers\Admin\AdminPersetujuanController;
use App\Http\Controllers\Admin\AdminStatistikController;
use App\Http\Controllers\Admin\AdminSettingController;
use App\Http\Controllers\Mahasiswa\MahasiswaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─── Root redirect ──────────────────────────────────────────────────────────
Route::get('/', function () {
    if (auth()->check()) {
        $role = auth()->user()->primaryRole();
        return match ($role) {
            'admin' => redirect()->route('admin.dashboard'),
            'aslab' => redirect()->route('aslab.dashboard'),
            'dosen' => redirect()->route('dosen.dashboard'),
            'mahasiswa' => redirect()->route('mahasiswa.dashboard'),
            default => redirect()->route('login'),
        };
    }
    return redirect()->route('login');
});

// ─── Guest routes (unauthenticated) ─────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
});

// ─── Authenticated routes ────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Shared Notification routes (new shared notification center)
    Route::get('/notifications', [\App\Http\Controllers\Notification\NotificationCenterController::class, 'index'])
        ->name('notifications.center');

    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Notification\NotificationCenterController::class, 'markAsRead'])
        ->name('notifications.read');

    Route::delete('/notifications/{id}', [\App\Http\Controllers\Notification\NotificationCenterController::class, 'delete'])
        ->name('notifications.destroy');

    Route::get('/notifications/{id}/detail', [\App\Http\Controllers\Notification\NotificationCenterController::class, 'detail'])
        ->name('notifications.detail');

    // Compatibility route (existing mark-all read)
    Route::post('/notifications/read-all', [\App\Http\Controllers\Notification\NotificationCenterController::class, 'markAllAsRead'])->name('notifications.readAll');

    // ── Lightweight polling endpoint ─────────────────────────────────────────
    Route::get('/api/poll', [\App\Http\Controllers\Notification\NotificationCenterController::class, 'poll'])
        ->name('notifications.poll');

    // ── Notification list for live refresh (used by NotificationListPage) ────
    // Fetch the full archive as JSON — role-agnostic, no Inertia router.reload needed.
    Route::get('/api/notifications/list', [\App\Http\Controllers\Notification\NotificationCenterController::class, 'list'])
        ->name('notifications.list');


    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])
            ->name('dashboard');
        Route::get('/jadwal', [AdminJadwalController::class, 'index'])
            ->name('jadwal');
        Route::post('/jadwal/import', [AdminJadwalController::class, 'import'])
            ->name('jadwal.import');
        Route::delete('/jadwal/{id}', [AdminJadwalController::class, 'destroy'])
            ->name('jadwal.destroy');
        Route::post('/jadwal/resolve-conflicts', [AdminJadwalController::class, 'resolveAllConflicts'])
            ->name('jadwal.resolve-conflicts');

        // Persetujuan (Approval) routes
        Route::get('/persetujuan', [AdminPersetujuanController::class, 'index'])
            ->name('persetujuan');
        Route::post('/persetujuan/{id}/approve', [AdminPersetujuanController::class, 'approve'])
            ->name('persetujuan.approve');
        Route::post('/persetujuan/{id}/reject', [AdminPersetujuanController::class, 'reject'])
            ->name('persetujuan.reject');

        // Statistik routes
        Route::get('/statistik', [AdminStatistikController::class, 'index'])
            ->name('statistik');

        // Notifikasi routes
        Route::get('/notifikasi', [\App\Http\Controllers\Admin\AdminNotifikasiController::class, 'index'])
            ->name('notifikasi');
        Route::post('/notifikasi/{notification}/read', [\App\Http\Controllers\Admin\AdminNotifikasiController::class, 'markAsRead'])
            ->name('notifikasi.read');
        Route::post('/notifikasi/read-all', [\App\Http\Controllers\Admin\AdminNotifikasiController::class, 'markAllAsRead'])
            ->name('notifikasi.readAll');
        Route::delete('/notifikasi/{notification}', [\App\Http\Controllers\Admin\AdminNotifikasiController::class, 'destroy'])
            ->name('notifikasi.destroy');

        // Pengaturan (Setting) routes
        Route::get('/pengaturan', [AdminSettingController::class, 'index'])
            ->name('pengaturan');
        Route::post('/pengaturan', [AdminSettingController::class, 'updateProfile'])
            ->name('pengaturan.update');

        // AI Assistant route
        Route::post('/ai-query', [AdminDashboardController::class, 'aiQuery'])
            ->name('aiQuery');
    });

    // ── Aslab routes ─────────────────────────────────────────────────────────
    Route::middleware('role:aslab')->prefix('aslab')->name('aslab.')->group(function () {
        Route::get('/dashboard', [AslabDashboardController::class, 'index'])->name('dashboard');
        Route::get('/jadwal', [AslabJadwalController::class, 'index'])->name('jadwal');
        Route::get('/validasi', [AslabValidationController::class, 'index'])->name('validasi');
        Route::post('/validasi/{id}/forward', [AslabValidationController::class, 'forward'])->name('validasi.forward');
        Route::post('/validasi/{id}/reject', [AslabValidationController::class, 'reject'])->name('validasi.reject');
        Route::get('/notifikasi', [AslabNotifikasiController::class, 'index'])->name('notifikasi');
        Route::post('/notifikasi/{id}/read', [AslabNotifikasiController::class, 'markAsRead'])->name('notifikasi.read');
        Route::post('/notifikasi/read-all', [AslabNotifikasiController::class, 'markAllAsRead'])->name('notifikasi.readAll');
        Route::delete('/notifikasi/{id}', [AslabNotifikasiController::class, 'destroy'])->name('notifikasi.destroy');
        Route::get('/pengaturan', [AslabSettingController::class, 'index'])->name('pengaturan');
        Route::post('/pengaturan', [AslabSettingController::class, 'updateProfile'])->name('pengaturan.update');
        Route::post('/ai-query', [AslabDashboardController::class, 'aiQuery'])->name('aiQuery');
    });

    // ── Dosen routes ─────────────────────────────────────────────────────────
    Route::middleware('role:dosen')->prefix('dosen')->name('dosen.')->group(function () {
        Route::get('/dashboard', [DosenDashboardController::class, 'index'])->name('dashboard');
        Route::get('/jadwal', [DosenJadwalController::class, 'index'])->name('jadwal');
        Route::get('/pengaturan', [DosenSettingController::class, 'index'])->name('pengaturan');
        Route::post('/pengaturan', [DosenSettingController::class, 'updateProfile'])->name('pengaturan.update');

        // ── Notifikasi ──────────────────────────────────────────────────────
        Route::get('/notifikasi', [DosenNotifikasiController::class, 'index'])->name('notifikasi');
        Route::post('/notifikasi/{id}/read', [DosenNotifikasiController::class, 'markAsRead'])->name('notifikasi.read');
        Route::post('/notifikasi/read-all', [DosenNotifikasiController::class, 'markAllAsRead'])->name('notifikasi.readAll');
        Route::delete('/notifikasi/{id}', [DosenNotifikasiController::class, 'destroy'])->name('notifikasi.destroy');

        // ── AI Assistant ─────────────────────────────────────────────────────
        Route::post('/ai-query', [DosenDashboardController::class, 'aiQuery'])->name('aiQuery');
    });

    // ─── Mahasiswa routes ────────────────────────────────────────────────
    Route::middleware('role:mahasiswa')->prefix('mahasiswa')->group(function () {
        Route::get('/dashboard',      [MahasiswaController::class, 'dashboard'])->name('mahasiswa.dashboard');
        Route::get('/jadwal',         [MahasiswaController::class, 'jadwal'])->name('mahasiswa.jadwal');
        Route::get('/requests',       [MahasiswaController::class, 'requests'])->name('mahasiswa.requests');
        Route::post('/requests',      [MahasiswaController::class, 'submitRequest'])->name('mahasiswa.requests.submit');
        Route::delete('/requests',    [MahasiswaController::class, 'deleteRequests'])->name('mahasiswa.requests.delete');
        Route::get('/requests/list',  [MahasiswaController::class, 'requestsList'])->name('mahasiswa.requests.list');
        Route::get('/notifications',  [MahasiswaController::class, 'notifications'])->name('mahasiswa.notifications');

        // ── Notification actions (delegate to shared NotificationCenterController) ──
        Route::get('/notifications/{id}/detail', [\App\Http\Controllers\Notification\NotificationCenterController::class, 'detail'])
            ->name('mahasiswa.notifications.detail');
        Route::post('/notifications/{id}/read', [\App\Http\Controllers\Notification\NotificationCenterController::class, 'markAsRead'])
            ->name('mahasiswa.notifications.read');
        Route::post('/notifications/read-all', [\App\Http\Controllers\Notification\NotificationCenterController::class, 'markAllAsRead'])
            ->name('mahasiswa.notifications.readAll');
        Route::delete('/notifications/{id}', [\App\Http\Controllers\Notification\NotificationCenterController::class, 'delete'])
            ->name('mahasiswa.notifications.destroy');

        Route::get('/settings',       [MahasiswaController::class, 'settings'])->name('mahasiswa.settings');
        Route::post('/settings',      [MahasiswaController::class, 'updateSettings'])->name('mahasiswa.settings.update');

        // API-style endpoints (JSON)
        Route::post('/cek-slot',              [MahasiswaController::class, 'cekSlot'])->name('mahasiswa.cekSlot');
        Route::get('/dashboard-widgets',      [MahasiswaController::class, 'dashboardWidgets'])->name('mahasiswa.dashboardWidgets');
        Route::post('/ai-query',              [MahasiswaController::class, 'aiQuery'])->name('mahasiswa.aiQuery');
        Route::post('/recommend-schedule',    [MahasiswaController::class, 'recommendSchedules'])->name('mahasiswa.recommendSchedules');
        Route::post('/cek-sesi-availabilitas', [MahasiswaController::class, 'cekSesiAvailabilitas'])->name('mahasiswa.cekSesiAvailabilitas');
        Route::post('/meeting-dates',          [MahasiswaController::class, 'meetingDates'])->name('mahasiswa.meetingDates');
        Route::post('/available-rooms',        [MahasiswaController::class, 'availableRoomsForSlot'])->name('mahasiswa.availableRooms');
        Route::post('/matrix-availability',    [MahasiswaController::class, 'matrixAvailabilityBulk'])->name('mahasiswa.matrixAvailability');
        Route::post('/cek-ketersediaan-slot',  [MahasiswaController::class, 'cekKetersediaanSlot'])->name('mahasiswa.cekKetersediaanSlot');
    });
});
