<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Aslab\AslabDashboardController;
use App\Http\Controllers\Aslab\AslabJadwalController;
use App\Http\Controllers\Aslab\AslabValidationController;
use App\Http\Controllers\Aslab\AslabNotifikasiController;
use App\Http\Controllers\Aslab\AslabSettingController;
use App\Http\Controllers\Dosen\DosenDashboardController;
use App\Http\Controllers\Dosen\DosenJadwalController;
use App\Http\Controllers\Dosen\DosenNotificationController;
use App\Http\Controllers\Dosen\DosenNotifikasiController;
use App\Http\Controllers\Dosen\DosenSettingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─── Root redirect ──────────────────────────────────────────────────────────
Route::get('/', function () {
    if (auth()->check()) {
        $role = auth()->user()->primaryRole();
        return match ($role) {
            'admin'     => redirect()->route('admin.dashboard'),
            'aslab'     => redirect()->route('aslab.dashboard'),
            'dosen'     => redirect()->route('dosen.dashboard'),
            'mahasiswa' => redirect()->route('mahasiswa.dashboard'),
            default     => redirect()->route('login'),
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

    // Admin routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])
            ->name('admin.dashboard');
        Route::get('/admin/jadwal', [\App\Http\Controllers\Admin\AdminJadwalController::class, 'index'])
            ->name('admin.jadwal');
        Route::post('/admin/jadwal/import', [\App\Http\Controllers\Admin\AdminJadwalController::class, 'import'])
            ->name('admin.jadwal.import');
        Route::delete('/admin/jadwal/{id}', [\App\Http\Controllers\Admin\AdminJadwalController::class, 'destroy'])
            ->name('admin.jadwal.destroy');
        Route::post('/admin/jadwal/resolve-conflicts', [\App\Http\Controllers\Admin\AdminJadwalController::class, 'resolveAllConflicts'])
            ->name('admin.jadwal.resolve-conflicts');
    });

    // ── Aslab routes ─────────────────────────────────────────────────────────
    Route::middleware('role:aslab')->prefix('aslab')->name('aslab.')->group(function () {
        Route::get('/dashboard',             [AslabDashboardController::class, 'index'])->name('dashboard');
        Route::get('/jadwal',                [AslabJadwalController::class, 'index'])->name('jadwal');
        Route::get('/validasi',              [AslabValidationController::class, 'index'])->name('validasi');
        Route::post('/validasi/{id}/forward',[AslabValidationController::class, 'forward'])->name('validasi.forward');
        Route::post('/validasi/{id}/reject', [AslabValidationController::class, 'reject'])->name('validasi.reject');
        Route::get('/notifikasi',            [AslabNotifikasiController::class, 'index'])->name('notifikasi');
        Route::post('/notifikasi/{id}/read', [AslabNotifikasiController::class, 'markAsRead'])->name('notifikasi.read');
        Route::post('/notifikasi/read-all',  [AslabNotifikasiController::class, 'markAllAsRead'])->name('notifikasi.readAll');
        Route::delete('/notifikasi/{id}',    [AslabNotifikasiController::class, 'destroy'])->name('notifikasi.destroy');
        Route::get('/pengaturan',            [AslabSettingController::class, 'index'])->name('pengaturan');
        Route::post('/pengaturan',           [AslabSettingController::class, 'updateProfile'])->name('pengaturan.update');
    });

    // ── Dosen routes ─────────────────────────────────────────────────────────
    Route::middleware('role:dosen')->prefix('dosen')->name('dosen.')->group(function () {
        Route::get('/dashboard', [DosenDashboardController::class, 'index'])->name('dashboard');
        Route::get('/jadwal',    [DosenJadwalController::class, 'index'])->name('jadwal');
        Route::post('/jadwal/request', [DosenJadwalController::class, 'storeRequest'])->name('jadwal.request');
        Route::get('/pengaturan', [DosenSettingController::class, 'index'])->name('pengaturan');
        Route::post('/pengaturan', [DosenSettingController::class, 'updateProfile'])->name('pengaturan.update');

        // ── Notifications (Jadwal Branch) ────────────────────────────────────
        Route::get('/notification', [DosenNotificationController::class, 'index'])->name('notification');
        Route::post('/notification/{notification}/read', [DosenNotificationController::class, 'markAsRead'])->name('notification.read');
        Route::delete('/notification/{notification}', [DosenNotificationController::class, 'destroy'])->name('notification.destroy');

        // ── Notifikasi (Notification Branch) ──────────────────────────────────
        Route::get('/notifikasi',                        [DosenNotifikasiController::class, 'index'])->name('notifikasi');
        Route::post('/notifikasi/{id}/read',             [DosenNotifikasiController::class, 'markAsRead'])->name('notifikasi.read');
        Route::post('/notifikasi/read-all',              [DosenNotifikasiController::class, 'markAllAsRead'])->name('notifikasi.readAll');
        Route::delete('/notifikasi/{id}',                [DosenNotifikasiController::class, 'destroy'])->name('notifikasi.destroy');
    });

    // Mahasiswa dashboard
    Route::middleware('role:mahasiswa')
        ->get('/mahasiswa/dashboard', fn () => Inertia::render('Dashboard/Mahasiswa'))
        ->name('mahasiswa.dashboard');
});
