<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Dosen\DosenDashboardController;
use App\Http\Controllers\Dosen\DosenJadwalController;
use App\Http\Controllers\Dosen\DosenNotificationController;
use App\Http\Controllers\Dosen\DosenNotifikasiController;
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

    // Admin dashboard
    Route::middleware('role:admin')
        ->get('/admin/dashboard', fn () => Inertia::render('Dashboard/Admin'))
        ->name('admin.dashboard');

    // Aslab dashboard
    Route::middleware('role:aslab')
        ->get('/aslab/dashboard', fn () => Inertia::render('Dashboard/Aslab'))
        ->name('aslab.dashboard');

    // ── Dosen routes ─────────────────────────────────────────────────────────
    Route::middleware('role:dosen')->prefix('dosen')->name('dosen.')->group(function () {
        Route::get('/dashboard', [DosenDashboardController::class, 'index'])->name('dashboard');
        Route::get('/jadwal',    [DosenJadwalController::class, 'index'])->name('jadwal');
        Route::post('/jadwal/request', [DosenJadwalController::class, 'storeRequest'])->name('jadwal.request');
        Route::get('/pengaturan', fn () => Inertia::render('Dosen/Setting'))->name('pengaturan');

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
