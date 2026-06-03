<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Approval;
use App\Models\ChangeRequest;
use App\Models\Notification;
use App\Models\ScheduleOverride;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminPersetujuanController extends Controller
{
    /**
     * Display the admin approval/persetujuan page.
     *
     * Returns PENDING_ADMIN requests + recent admin decisions + insight stats.
     */
    public function index()
    {
        // ── Pending: awaiting admin decision ──────────────────────────
        $pending = ChangeRequest::where('status', 'PENDING_ADMIN')
            ->with([
                'requester',
                'schedule.course',
                'schedule.room',
                'proposedRoom',
                'approvals' => fn ($q) => $q->where('stage', 'ASLAB_CHECK'),
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($cr) {
                $aslabApproval = $cr->approvals->first();

                return [
                    'id'            => (string) $cr->id,
                    'requestCode'   => $cr->request_code,
                    'requestType'   => $cr->request_type,
                    'createdAtDiff' => $cr->created_at->diffForHumans(),
                    'requester'     => [
                        'name'   => $cr->requester->name,
                        'nimNip' => $cr->requester->nim_nip,
                        'email'  => $cr->requester->email,
                    ],
                    'schedule'      => [
                        'course' => $cr->schedule->course->name ?? '-',
                        'code'   => $cr->schedule->course->code ?? '-',
                        'room'   => $cr->schedule->room->code ?? '-',
                        'day'    => $cr->schedule->day_of_week,
                        'time'   => substr($cr->schedule->start_time, 0, 5)
                                  . ' - '
                                  . substr($cr->schedule->end_time, 0, 5),
                    ],
                    'proposedDay'   => $cr->proposed_day,
                    'proposedTime'  => $cr->proposed_start_time
                        ? substr($cr->proposed_start_time, 0, 5) . ' - ' . substr($cr->proposed_end_time, 0, 5)
                        : null,
                    'proposedRoom'  => $cr->proposedRoom->code ?? null,
                    'targetDate'    => $cr->target_date?->toDateString(),
                    'reason'        => $cr->reason,
                    'hasConflict'   => $cr->has_conflict,
                    'conflictDetails' => null,
                    'aslabValidation' => $aslabApproval ? [
                        'validatedBy' => $aslabApproval->actor->name ?? '-',
                        'validatedAt' => Carbon::parse($aslabApproval->decided_at)
                                            ->translatedFormat('d M Y, H:i'),
                        'notes'       => $aslabApproval->notes,
                    ] : null,
                ];
            })->values();

        // ── Recent: admin decisions in last 30 days ────────────────────
        $recent = Approval::where('stage', 'ADMIN_DECISION')
            ->with(['changeRequest.requester', 'changeRequest.schedule.course'])
            ->orderByDesc('decided_at')
            ->limit(20)
            ->get()
            ->map(fn ($a) => [
                'id'          => (string) $a->id,
                'requestCode' => $a->changeRequest->request_code,
                'student'     => $a->changeRequest->requester->name,
                'course'      => $a->changeRequest->schedule->course->name ?? '-',
                'requestType' => $a->changeRequest->request_type,
                'decision'    => $a->decision,
                'notes'       => $a->notes,
                'decidedAt'   => Carbon::parse($a->decided_at)->translatedFormat('d M Y, H:i'),
            ])->values();

        // ── Insight stats ──────────────────────────────────────────────
        $weekStart = Carbon::now()->startOfWeek();
        $insights  = [
            'pendingRequests'  => ChangeRequest::where('status', 'PENDING_ADMIN')->count(),
            'conflictDetected' => ChangeRequest::where('status', 'PENDING_ADMIN')
                ->where('has_conflict', true)->count(),
            'acceptedThisWeek' => Approval::where('stage', 'ADMIN_DECISION')
                ->where('decision', 'APPROVED')
                ->where('decided_at', '>=', $weekStart)->count(),
            'declinedThisWeek' => Approval::where('stage', 'ADMIN_DECISION')
                ->where('decision', 'REJECTED_ADMIN')
                ->where('decided_at', '>=', $weekStart)->count(),
        ];

        return Inertia::render('Admin/Persetujuan', compact('pending', 'recent', 'insights'));
    }

    /**
     * Approve a change request.
     *
     * - Creates ADMIN_DECISION / APPROVED approval record.
     * - TEMPORARY → inserts ScheduleOverride row.
     * - PERMANENT → updates Schedule fields + snapshots to schedule_history.
     * - Updates change_request.status = APPROVED.
     */
    public function approve(Request $request, int $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $cr = ChangeRequest::with(['schedule', 'proposedRoom'])->findOrFail($id);

        if ($cr->status !== 'PENDING_ADMIN') {
            return back()->with('error', 'Request ini sudah tidak dalam status PENDING_ADMIN.');
        }

        DB::transaction(function () use ($cr, $request) {
            // 1. Create approval record
            Approval::create([
                'request_id' => $cr->id,
                'actor_id'   => $request->user()->id,
                'stage'      => 'ADMIN_DECISION',
                'decision'   => 'APPROVED',
                'notes'      => $request->notes ?? 'Disetujui oleh Admin.',
                'decided_at' => Carbon::now(),
            ]);

            // 2. Apply schedule change
            if ($cr->request_type === 'TEMPORARY') {
                // Insert override row for the specific date
                ScheduleOverride::create([
                    'schedule_id'    => $cr->schedule_id,
                    'request_id'     => $cr->id,
                    'room_id'        => $cr->proposed_room_id ?? $cr->schedule->room_id,
                    'override_date'  => $cr->target_date,
                    'new_day_of_week'=> $cr->proposed_day,
                    'new_start_time' => $cr->proposed_start_time,
                    'new_end_time'   => $cr->proposed_end_time,
                    'is_active'      => true,
                ]);
            } elseif ($cr->request_type === 'PERMANENT') {
                $schedule = $cr->schedule;

                // Snapshot current state before mutating
                DB::table('schedule_history')->insert([
                    'schedule_id'   => $schedule->id,
                    'request_id'    => $cr->id,
                    'changed_by'    => $request->user()->id,
                    'snapshot_data' => json_encode([
                        'day_of_week' => $schedule->day_of_week,
                        'start_time'  => $schedule->start_time,
                        'end_time'    => $schedule->end_time,
                        'room_id'     => $schedule->room_id,
                    ]),
                    'change_reason' => $cr->reason,
                    'changed_at'    => Carbon::now(),
                ]);

                // Apply permanent change
                $schedule->update([
                    'day_of_week' => $cr->proposed_day   ?? $schedule->day_of_week,
                    'start_time'  => $cr->proposed_start_time ?? $schedule->start_time,
                    'end_time'    => $cr->proposed_end_time   ?? $schedule->end_time,
                    'room_id'     => $cr->proposed_room_id    ?? $schedule->room_id,
                    'effective_from' => $cr->effective_from_date ?? Carbon::now()->toDateString(),
                ]);
            }

            // 3. Mark request as approved
            $cr->update(['status' => 'APPROVED']);
        });

        Notification::create([
            'user_id'      => $cr->requester_id,
            'request_id'   => $cr->id,
            'triggered_by' => $request->user()->id,
            'title'        => 'Request Disetujui Admin',
            'message'      => "Pengajuan perubahan jadwal {$cr->request_code} telah disetujui oleh Admin.",
            'type'         => 'system',
            'category'     => 'change_request',
            'action_url'   => route('mahasiswa.requests'),
        ]);

        // Notify lecturers assigned to the schedule
        $lecturerIds = \DB::table('teaching_assignments')
            ->where('schedule_id', $cr->schedule_id)
            ->pluck('user_id');

        foreach ($lecturerIds as $lecturerId) {
            Notification::create([
                'user_id'      => $lecturerId,
                'request_id'   => $cr->id,
                'triggered_by' => $request->user()->id,
                'title'        => 'Perubahan Jadwal Kelas',
                'message'      => "Jadwal kelas {$cr->schedule->course->name} ({$cr->schedule->course->class_name}) telah diubah oleh Admin.",
                'type'         => 'system',
                'category'     => 'change_request',
                'action_url'   => route('dosen.jadwal'),
            ]);
        }

        return back()->with('success', 'Pengajuan berhasil disetujui.');
    }

    /**
     * Reject a change request.
     *
     * - Creates ADMIN_DECISION / REJECTED_ADMIN approval record.
     * - Updates change_request.status = REJECTED_ADMIN.
     */
    public function reject(Request $request, int $id)
    {
        $request->validate([
            'notes' => 'required|string|min:5|max:1000',
        ]);

        $cr = ChangeRequest::findOrFail($id);

        if ($cr->status !== 'PENDING_ADMIN') {
            return back()->with('error', 'Request ini sudah tidak dalam status PENDING_ADMIN.');
        }

        Approval::create([
            'request_id' => $cr->id,
            'actor_id'   => $request->user()->id,
            'stage'      => 'ADMIN_DECISION',
            'decision'   => 'REJECTED_ADMIN',
            'notes'      => $request->notes,
            'decided_at' => Carbon::now(),
        ]);

        $cr->update(['status' => 'REJECTED_ADMIN']);

        Notification::create([
            'user_id'      => $cr->requester_id,
            'request_id'   => $cr->id,
            'triggered_by' => $request->user()->id,
            'title'        => 'Request Ditolak Admin',
            'message'      => "Pengajuan perubahan jadwal {$cr->request_code} ditolak oleh Admin. Alasan: {$request->notes}",
            'type'         => 'system',
            'category'     => 'change_request',
            'action_url'   => route('mahasiswa.requests'),
        ]);

        return back()->with('success', 'Pengajuan berhasil ditolak.');
    }
}
