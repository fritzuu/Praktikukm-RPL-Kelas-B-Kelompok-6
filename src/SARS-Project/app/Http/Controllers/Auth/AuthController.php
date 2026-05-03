<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Show the login page.
     */
    public function showLogin(): Response
    {
        // If already authenticated, redirect to their dashboard
        if (Auth::check()) {
            return Inertia::render('Auth/Login'); // will be redirected below
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Handle login form submission.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
            'role'     => ['required', 'string', 'in:mahasiswa,dosen,aslab,admin'],
        ]);

        $submittedRole = $request->input('role');

        if (! Auth::attempt(
            ['email' => $credentials['email'], 'password' => $credentials['password']],
            $request->boolean('remember')
        )) {
            return back()->withErrors([
                'email' => 'Email atau password yang Anda masukkan tidak valid.',
            ])->onlyInput('email');
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (! $user->is_active) {
            Auth::logout();
            return back()->withErrors([
                'email' => 'Akun Anda tidak aktif. Silakan hubungi administrator.',
            ])->onlyInput('email');
        }

        // Validate that the selected role matches the user's actual role in DB
        if (! $user->hasRole($submittedRole)) {
            Auth::logout();
            $roleLabels = [
                'mahasiswa' => 'Mahasiswa',
                'dosen'     => 'Dosen',
                'aslab'     => 'Asisten Lab',
                'admin'     => 'Admin',
            ];
            return back()->withErrors([
                'role' => 'Akun Anda tidak terdaftar sebagai ' . ($roleLabels[$submittedRole] ?? $submittedRole) . '. Silakan pilih role yang sesuai.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();

        return match ($submittedRole) {
            'admin'     => redirect()->route('admin.dashboard'),
            'aslab'     => redirect()->route('aslab.dashboard'),
            'dosen'     => redirect()->route('dosen.dashboard'),
            'mahasiswa' => redirect()->route('mahasiswa.dashboard'),
            default     => redirect()->route('login')->withErrors([
                'email' => 'Akun Anda belum memiliki role yang valid.',
            ]),
        };
    }

    /**
     * Handle logout.
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
