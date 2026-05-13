<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DosenDashboardController extends Controller
{
    /**
     * Display the dosen dashboard.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Dashboard/Dosen');
    }
}
