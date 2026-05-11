<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Dosen\DosenDashboardController;
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
        Route::get('/jadwal',    fn () => Inertia::render('Dashboard/Dosen'))->name('jadwal');
        Route::get('/notifikasi', fn () => Inertia::render('Dashboard/Dosen'))->name('notifikasi');
        Route::get('/pengaturan', fn () => Inertia::render('Dashboard/Dosen'))->name('pengaturan');
    });

    // Mahasiswa dashboard
    Route::middleware('role:mahasiswa')
        ->get('/mahasiswa/dashboard', fn () => Inertia::render('Dashboard/Mahasiswa'))
        ->name('mahasiswa.dashboard');
});

