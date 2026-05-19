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
        $schedules = Schedule::where('semester_id', $semester->id)
            ->where('is_active', true)
            ->with(['course', 'room'])
            ->get();

        // All schedules formatted for day-tab ScheduleGrid
        $jadwal = $schedules->map(fn (Schedule $s) => [
            'id'        => (string) $s->id,
            'kode'      => $s->course->code,
            'nama'      => $s->course->name,
            'kelas'     => $s->course->class_name,
            'ruangan_id'=> $s->room_id,
            'ruangan'   => $s->room->code,
            'hari'      => strtolower($s->day_of_week),
            'sesiMulai' => $s->session_start,
            'durasi'    => $s->session_duration,
            'mahasiswa' => $s->room->capacity,
            'waktu'     => substr($s->start_time, 0, 5) . ' - ' . substr($s->end_time, 0, 5),
        ])->values();

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
        
        $rooms = Room::all();

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