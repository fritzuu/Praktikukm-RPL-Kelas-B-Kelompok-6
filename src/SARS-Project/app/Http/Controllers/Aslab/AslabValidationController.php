<?php

namespace App\Http\Controllers\Aslab;

use App\Http\Controllers\Controller;
use App\Models\Approval;
use App\Models\ChangeRequest;
use App\Models\Notification;
use App\Models\NotificationRecipient;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AslabValidationController extends Controller
{
    /**
     * Display the validation queue for aslab.
     */
    public function index(Request $request): Response
    {
        // Pending requests waiting for aslab validation
        $pending = ChangeRequest::where('status', 'PENDING_ASLAB')
            ->with(['requester', 'schedule.course', 'schedule.room'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($cr) => [
                'id'            => (string) $cr->id,
                'requestCode'   => $cr->request_code,
                'requester'     => [
                    'name'   => $cr->requester->name,
                    'nimNip' => $cr->requester->nim_nip,
                    'email'  => $cr->requester->email,
                ],
                'schedule'      => [
                    'course' => $cr->schedule->course->name ?? '-',
                    'code'   => $cr->schedule->course->code ?? '-',
                    'room'   => $cr->schedule->room->code ?? '-',
                ],
                'requestType'   => $cr->request_type,
                'proposedDay'   => $cr->proposed_day,
                'proposedTime'  => substr($cr->proposed_start_time, 0, 5) . ' - ' . substr($cr->proposed_end_time, 0, 5),
                'reason'        => $cr->reason,
                'targetDate'    => $cr->target_date,
                'createdAt'     => $cr->created_at->translatedFormat('d M Y'),
                'createdAtDiff' => $cr->created_at->diffForHumans(),
                'hasConflict'   => (bool) $cr->has_conflict,
            ])->values();

        // Recently validated (forwarded or rejected by aslab)
        $recentApprovals = Approval::where('actor_id', $request->user()->id)
            ->where('stage', 'ASLAB_CHECK')
            ->with(['changeRequest.requester', 'changeRequest.schedule.course', 'changeRequest.schedule.room'])
            ->orderByDesc('decided_at')
            ->limit(20)
            ->get()
            ->map(fn ($a) => [
                'id'          => (string) $a->id,
                'requestCode' => $a->changeRequest->request_code,
                'student'     => $a->changeRequest->requester->name,
                'course'      => $a->changeRequest->schedule->course->name ?? '-',
                'room'        => $a->changeRequest->schedule->room->code ?? '-',
                'decision'    => $a->decision,
                'notes'       => $a->notes,
                'decidedAt'   => Carbon::parse($a->decided_at)->translatedFormat('d M Y, H:i'),
            ])->values();

        return Inertia::render('Aslab/Validation', [
            'pending'  => $pending,
            'recent'   => $recentApprovals,
        ]);
    }

    /**
     * Forward a change request to admin.
     */
    public function forward(Request $request, int $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $cr = ChangeRequest::findOrFail($id);

        if ($cr->status !== 'PENDING_ASLAB') {
            return redirect()->back()->with('error', 'Request ini sudah tidak dalam status PENDING_ASLAB.');
        }

        // Create/update approval record (idempotent per unique(request_id, stage))
        Approval::updateOrCreate(
            [
                'request_id' => $cr->id,
                'stage'      => 'ASLAB_CHECK',
            ],
            [
                'actor_id'   => $request->user()->id,
                'decision'   => 'FORWARDED',
                'notes'      => $request->notes ?? 'Diteruskan ke Admin untuk keputusan akhir.',
                'decided_at' => Carbon::now(),
            ]
        );

        // Update change request status
        $cr->update(['status' => 'PENDING_ADMIN']);

        // Build shared data_payload for detail modal
        $schedule = $cr->schedule()->with(['course', 'room'])->first();
        $proposedRoom = $cr->proposed_room_id
            ? \App\Models\Room::find($cr->proposed_room_id)
            : null;

        $oldSessionFwd = null;
        if ($schedule && $schedule->session_start) {
            $dur = $schedule->session_duration ?? 1;
            $oldSessionFwd = $dur > 1
                ? 'Sesi ' . $schedule->session_start . '–' . ($schedule->session_start + $dur - 1)
                : 'Sesi ' . $schedule->session_start;
        }

        $notifPayload = [
            'request_code'   => $cr->request_code,
            'course_name'    => $schedule?->course?->name,
            'class_name'     => $schedule?->course?->class_name,
            'request_type'   => $cr->request_type,
            'student_reason' => $cr->reason,
            'old_day'        => $schedule?->day_of_week,
            'old_time'       => ($schedule && $schedule->start_time && $schedule->end_time)
                                    ? substr($schedule->start_time, 0, 5) . ' – ' . substr($schedule->end_time, 0, 5)
                                    : null,
            'old_room'       => $schedule?->room?->code,
            'old_room_name'  => $schedule?->room?->name,
            'old_session'    => $oldSessionFwd,
            'new_day'        => $cr->proposed_day,
            'new_time'       => ($cr->proposed_start_time && $cr->proposed_end_time)
                                    ? substr($cr->proposed_start_time, 0, 5) . ' – ' . substr($cr->proposed_end_time, 0, 5)
                                    : null,
            'new_room'       => $proposedRoom?->code ?? $schedule?->room?->code,
            'new_room_name'  => $proposedRoom?->name ?? $schedule?->room?->name,
        ];

        // Notify mahasiswa
        $notif = \App\Models\Notification::create([
            'request_id'   => $cr->id,
            'triggered_by' => $request->user()->id,
            'type'         => 'REQUEST_FORWARDED',
            'title'        => 'Request Diteruskan',
            'message'      => "Pengajuan {$cr->request_code} telah divalidasi Aslab.",
            'body'         => 'Sedang menunggu persetujuan Admin.',
            'data_payload' => $notifPayload,
        ]);

        \App\Models\NotificationRecipient::create([
            'notification_id' => $notif->id,
            'recipient_id'    => $cr->requester_id,
            'channel'         => 'IN_APP',
            'is_sent'         => true,
            'sent_at'         => Carbon::now(),
        ]);

        // Notify all Admin users
        $adminRole = \App\Models\Role::where('slug', 'admin')->first();
        $adminUsers = \App\Models\User::whereHas('roles', fn($q) => $q->where('role_id', $adminRole->id))->get();
        
        foreach ($adminUsers as $admin) {
            $notifAdmin = \App\Models\Notification::create([
                'request_id'   => $cr->id,
                'triggered_by' => $request->user()->id,
                'type'         => 'REQUEST_FORWARDED',
                'title'        => 'Request Menunggu Persetujuan',
                'message'      => "Request {$cr->request_code} telah divalidasi Aslab.",
                'body'         => 'Menunggu keputusan akhir Anda.',
                'data_payload' => $notifPayload,
            ]);

            \App\Models\NotificationRecipient::create([
                'notification_id' => $notifAdmin->id,
                'recipient_id'    => $admin->id,
                'channel'         => 'IN_APP',
                'is_sent'         => true,
                'sent_at'         => Carbon::now(),
            ]);
        }

        return redirect()->back()->with('success', 'Request berhasil diteruskan ke Admin.');
    }

    /**
     * Reject a change request.
     */
    public function reject(Request $request, int $id)
    {
        $request->validate([
            'notes' => 'required|string|min:5|max:500',
        ]);

        $cr = ChangeRequest::findOrFail($id);

        if ($cr->status !== 'PENDING_ASLAB') {
            return redirect()->back()->with('error', 'Request ini sudah tidak dalam status PENDING_ASLAB.');
        }

        // Create/update approval record (idempotent per unique(request_id, stage))
        Approval::updateOrCreate(
            [
                'request_id' => $cr->id,
                'stage'      => 'ASLAB_CHECK',
            ],
            [
                'actor_id'   => $request->user()->id,
                'decision'   => 'REJECTED_ASLAB',
                'notes'      => $request->notes,
                'decided_at' => Carbon::now(),
            ]
        );

        $cr->update(['status' => 'REJECTED_ASLAB']);

        // Build data_payload for detail modal
        $scheduleForReject = $cr->schedule()->with(['course', 'room'])->first();
        $proposedRoomForReject = $cr->proposed_room_id
            ? \App\Models\Room::find($cr->proposed_room_id)
            : null;

        $oldSessionRej = null;
        if ($scheduleForReject && $scheduleForReject->session_start) {
            $dur = $scheduleForReject->session_duration ?? 1;
            $oldSessionRej = $dur > 1
                ? 'Sesi ' . $scheduleForReject->session_start . '–' . ($scheduleForReject->session_start + $dur - 1)
                : 'Sesi ' . $scheduleForReject->session_start;
        }

        $rejectPayload = [
            'request_code'   => $cr->request_code,
            'course_name'    => $scheduleForReject?->course?->name,
            'class_name'     => $scheduleForReject?->course?->class_name,
            'request_type'   => $cr->request_type,
            'student_reason' => $cr->reason,
            'old_day'        => $scheduleForReject?->day_of_week,
            'old_time'       => ($scheduleForReject && $scheduleForReject->start_time && $scheduleForReject->end_time)
                                    ? substr($scheduleForReject->start_time, 0, 5) . ' – ' . substr($scheduleForReject->end_time, 0, 5)
                                    : null,
            'old_room'       => $scheduleForReject?->room?->code,
            'old_room_name'  => $scheduleForReject?->room?->name,
            'old_session'    => $oldSessionRej,
            'new_day'        => $cr->proposed_day,
            'new_time'       => ($cr->proposed_start_time && $cr->proposed_end_time)
                                    ? substr($cr->proposed_start_time, 0, 5) . ' – ' . substr($cr->proposed_end_time, 0, 5)
                                    : null,
            'new_room'       => $proposedRoomForReject?->code ?? $scheduleForReject?->room?->code,
            'new_room_name'  => $proposedRoomForReject?->name ?? $scheduleForReject?->room?->name,
        ];

        $notif = \App\Models\Notification::create([
            'request_id'   => $cr->id,
            'triggered_by' => $request->user()->id,
            'type'         => 'REQUEST_REJECTED',
            'title'        => 'Request Ditolak Aslab',
            'message'      => "Pengajuan {$cr->request_code} ditolak.",
            'body'         => "Alasan: {$request->notes}",
            'data_payload' => $rejectPayload,
        ]);

        \App\Models\NotificationRecipient::create([
            'notification_id' => $notif->id,
            'recipient_id'    => $cr->requester_id,
            'channel'         => 'IN_APP',
            'is_sent'         => true,
            'sent_at'         => Carbon::now(),
        ]);

        return redirect()->back()->with('success', 'Request berhasil ditolak.');
    }
}
