<?php

namespace App\Http\Controllers\Aslab;

use App\Http\Controllers\Controller;
use App\Models\ChangeRequest;
use App\Models\NotificationRecipient;
use App\Models\Schedule;
use App\Models\Semester;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\Room;
class AslabDashboardController extends Controller
{
    /**
     * Display the aslab dashboard.
     */
    public function index(Request $request): Response
    {
        $user     = $request->user();
        $semester = Semester::active();

        if (! $semester) {
            return Inertia::render('Dashboard/Aslab', [
                'stats'      => ['pendingVerification' => 0, 'validation' => 0, 'accepted' => 0, 'rejected' => 0],
                'jadwal'     => [],
                'rooms'      => [],
                'notifikasi' => [],
            ]);
        }

        // All schedules in the active semester (aslab sees everything)
        // Use the same join-based query as AdminJadwalController for data consistency
        $jadwal = \Illuminate\Support\Facades\DB::table('schedules')
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
            ->where('schedules.semester_id', $semester->id)
            ->get()
            ->map(function ($s) {
                $s->hari = strtolower($s->hari);
                $s->tipe = 'resmi';
                $s->dosen = $s->dosen ?? 'Belum Ditentukan';
                return $s;
            });

        // Stats
        $pendingVerification = ChangeRequest::where('status', 'PENDING_ASLAB')->count();
        $validation = ChangeRequest::where('status', 'PENDING_ADMIN')->count();
        $accepted = ChangeRequest::where('status', 'APPROVED')->count();
        $rejected = ChangeRequest::where('status', 'REJECTED')->count();
        
        $stats = [
            'pendingVerification' => $pendingVerification,
            'validation' => $validation,
            'accepted' => $accepted,
            'rejected' => $rejected
        ];
        
        $rooms = Room::whereIn('id', Schedule::where('semester_id', $semester->id)->where('is_active', true)->pluck('room_id'))->pluck('name');

        // Notifications
        $notifikasi = NotificationRecipient::where('recipient_id', $user->id)
            ->where('channel', 'IN_APP')
            ->with('notification')
            ->orderByDesc('notification_id')
            ->limit(10)
            ->get()
            ->map(fn ($nr) => [
                'id'     => (string) $nr->notification_id,
                'judul'  => $nr->notification->title,
                'pesan'  => $nr->notification->body,
                'waktu'  => $nr->notification->created_at->diffForHumans(),
                'dibaca' => $nr->is_read,
                'tipe'   => strtolower($nr->notification->type) === 'status_change' ? 'jadwal'
                          : (strtolower($nr->notification->type) === 'conflict_alert' ? 'validasi' : 'info'),
            ])->values();

        return Inertia::render('Dashboard/Aslab', [
            'stats'      => $stats,
            'jadwal'     => $jadwal,
            'rooms'      => $rooms,
            'notifikasi' => $notifikasi,
        ]);
}

}