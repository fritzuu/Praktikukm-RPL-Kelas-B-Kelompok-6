<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $schedules = DB::table('schedules')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->join('semesters', 'courses.semester_id', '=', 'semesters.id')
            ->join('rooms', 'schedules.room_id', '=', 'rooms.id')
            ->leftJoin('teaching_assignments', function($join) {
                $join->on('schedules.id', '=', 'teaching_assignments.schedule_id')
                     ->where('teaching_assignments.role_in_class', '=', 'PENGAJAR');
            })
            ->leftJoin('users', 'teaching_assignments.user_id', '=', 'users.id')
            ->select(
                'schedules.id',
                'courses.code as kode',
                'courses.name as nama',
                'courses.class_name as kelas',
                'courses.description as semesterNum',
                'semesters.name as semester',
                'rooms.name as ruangan',
                'users.name as dosen',
                'schedules.day_of_week as hari',
                'schedules.session_start as sesiMulai',
                'schedules.session_duration as durasi',
                'schedules.start_time as jamMulai',
                'schedules.end_time as jamAkhir'
            )
            ->where('schedules.is_active', true)
            ->get()
            ->map(function ($s) {
                $s->hari = strtolower($s->hari);
                $s->tipe = 'resmi';
                $s->dosen = $s->dosen ?? 'Belum Ditentukan';
                return $s;
            });

        $rooms = DB::table('rooms')->pluck('name');

        // ─── Conflict Detection Logic ──────────────────────────────────────────
        // Fetch all active schedules to find overlaps
        $schedulesList = DB::table('schedules')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->join('rooms', 'schedules.room_id', '=', 'rooms.id')
            ->leftJoin('teaching_assignments', function($join) {
                $join->on('schedules.id', '=', 'teaching_assignments.schedule_id')
                     ->where('teaching_assignments.role_in_class', '=', 'PENGAJAR');
            })
            ->leftJoin('users', 'teaching_assignments.user_id', '=', 'users.id')
            ->select(
                'schedules.id',
                'courses.code as kode',
                'courses.name as nama',
                'courses.class_name as kelas',
                'rooms.name as ruangan',
                'schedules.day_of_week as hari',
                'schedules.session_start as sesiMulai',
                'schedules.session_duration as durasi',
                'users.id as dosen_id',
                'users.name as dosen_nama'
            )
            ->where('schedules.is_active', true)
            ->get();

        $konflik = [];
        $checked = [];

        foreach ($schedulesList as $s1) {
            foreach ($schedulesList as $s2) {
                if ($s1->id === $s2->id) continue;
                
                $pairKey = min($s1->id, $s2->id) . '-' . max($s1->id, $s2->id);
                if (in_array($pairKey, $checked)) continue;
                
                $sameDay = strtolower($s1->hari) === strtolower($s2->hari);
                if (!$sameDay) continue;

                $overlap = ($s1->sesiMulai >= $s2->sesiMulai && $s1->sesiMulai < $s2->sesiMulai + $s2->durasi) ||
                           ($s2->sesiMulai >= $s1->sesiMulai && $s2->sesiMulai < $s1->sesiMulai + $s1->durasi);

                if ($overlap) {
                    // 1. Room conflict
                    if ($s1->ruangan === $s2->ruangan) {
                        $checked[] = $pairKey;
                        $konflik[] = [
                            'id' => 'room-' . $pairKey,
                            'judul' => 'Bentrok Ruangan: ' . $s1->ruangan,
                            'deskripsi' => "Mata Kuliah {$s1->kode} ({$s1->nama} - Kelas {$s1->kelas}) bertabrakan dengan {$s2->kode} ({$s2->nama} - Kelas {$s2->kelas}) di Ruangan {$s1->ruangan} pada hari " . ucfirst($s1->hari) . " (Sesi {$s1->sesiMulai}-" . ($s1->sesiMulai + $s1->durasi - 1) . " vs Sesi {$s2->sesiMulai}-" . ($s2->sesiMulai + $s2->durasi - 1) . ").",
                            'tipe' => 'bentrok_ruangan',
                            'aksi' => [
                                ['label' => "Ubah {$s1->kode}", 'variant' => 'primary'],
                                ['label' => "Ubah {$s2->kode}", 'variant' => 'secondary'],
                            ]
                        ];
                    }
                    // 2. Lecturer conflict
                    elseif ($s1->dosen_id && $s2->dosen_id && $s1->dosen_id === $s2->dosen_id) {
                        $checked[] = $pairKey;
                        $konflik[] = [
                            'id' => 'dosen-' . $pairKey,
                            'judul' => 'Bentrok Jadwal Dosen: ' . $s1->dosen_nama,
                            'deskripsi' => "Dosen {$s1->dosen_nama} mengajar dua kelas sekaligus pada hari " . ucfirst($s1->hari) . ": {$s1->kode} ({$s1->nama} - Kelas {$s1->kelas}) di {$s1->ruangan} dan {$s2->kode} ({$s2->nama} - Kelas {$s2->kelas}) di {$s2->ruangan} (Sesi {$s1->sesiMulai}-" . ($s1->sesiMulai + $s1->durasi - 1) . " vs Sesi {$s2->sesiMulai}-" . ($s2->sesiMulai + $s2->durasi - 1) . ").",
                            'tipe' => 'bentrok_jadwal',
                            'aksi' => [
                                ['label' => "Ubah {$s1->kode}", 'variant' => 'primary'],
                                ['label' => "Ubah {$s2->kode}", 'variant' => 'secondary'],
                            ]
                        ];
                    }
                }
            }
        }

        // ─── Database Sync Status Logic ─────────────────────────────────────────
        $latestSchedule = DB::table('schedules')->latest('created_at')->first();
        $lastUpload = 'Belum ada data';
        if ($latestSchedule && $latestSchedule->created_at) {
            $lastUpload = \Carbon\Carbon::parse($latestSchedule->created_at)->timezone('Asia/Jakarta')->translatedFormat('d M Y, H:i');
        }

        $syncStatus = [
            'status' => 'terkini',
            'lastUpload' => $lastUpload === 'Belum ada data' ? 'Belum ada data' : $lastUpload . ' WIB',
            'dbName' => DB::connection()->getDatabaseName()
        ];

        return Inertia::render('Dashboard/Admin', [
            'jadwal' => $schedules,
            'rooms' => $rooms,
            'konflik' => $konflik,
            'syncStatus' => $syncStatus,
        ]);
    }
}
