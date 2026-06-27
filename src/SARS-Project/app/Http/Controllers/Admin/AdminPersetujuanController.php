<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Approval;
use App\Models\ChangeRequest;
use App\Models\Notification;
use App\Models\NotificationRecipient;
use App\Models\ScheduleOverride;
use App\Models\Semester;
use App\Traits\ChecksConflicts;
use App\Traits\CalculatesSessionRange;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminPersetujuanController extends Controller
{
    use ChecksConflicts, CalculatesSessionRange;
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
                    'createdAtDiff' => $cr->created_at?->diffForHumans() ?? '-',
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
                    'durationMins'  => $cr->proposed_start_time && $cr->proposed_end_time
                        ? (int) (\Carbon\Carbon::parse($cr->proposed_end_time)->diffInMinutes(\Carbon\Carbon::parse($cr->proposed_start_time)))
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

        $changeRequestStats = ChangeRequest::where('status', 'PENDING_ADMIN')
            ->selectRaw('count(*) as total, sum(case when has_conflict = true then 1 else 0 end) as conflicts')
            ->first();

        $approvalStats = Approval::where('stage', 'ADMIN_DECISION')
            ->where('decided_at', '>=', $weekStart)
            ->select('decision', DB::raw('count(*) as count'))
            ->groupBy('decision')
            ->pluck('count', 'decision');

        $insights  = [
            'pendingRequests'  => (int) ($changeRequestStats->total ?? 0),
            'conflictDetected' => (int) ($changeRequestStats->conflicts ?? 0),
            'acceptedThisWeek' => $approvalStats->get('APPROVED') ?? 0,
            'declinedThisWeek' => $approvalStats->get('REJECTED_ADMIN') ?? 0,
        ];


        return Inertia::render('Admin/Persetujuan', compact('pending', 'recent', 'insights'));
    }

    /**
     * Approve a change request.
     *
     * - Runs conflict detection BEFORE approval
     * - If conflict detected, blocks approval with error message
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

        // Perform conflict detection before approval
        $hasConflict = false;
        $conflictReason = null;

        if ($cr->proposed_day && $cr->proposed_start_time && $cr->proposed_end_time) {
            $semester = Semester::active();
            if ($semester) {
                $targetRoomId = $cr->proposed_room_id ?? $cr->schedule->room_id;
                $conflictReason = $this->checkSlotConflict(
                    $cr->schedule_id,
                    $semester->id,
                    $cr->proposed_day,
                    $cr->proposed_start_time,
                    $cr->proposed_end_time,
                    $targetRoomId,
                    $cr->target_date ?? null
                );

                if ($conflictReason) {
                    $hasConflict = true;
                }
            }
        }

        // Block approval if conflict detected
        if ($hasConflict) {
            return back()->with('error', "Tidak dapat menyetujui request: {$conflictReason}");
        }

        DB::transaction(function () use ($cr, $request) {
            // 1. Create/update approval record (idempotent per unique(request_id, stage))
            Approval::updateOrCreate(
                [
                    'request_id' => $cr->id,
                    'stage'      => 'ADMIN_DECISION',
                ],
                [
                    'actor_id'   => $request->user()->id,
                    'decision'   => 'APPROVED',
                    'notes'      => $request->notes ?? 'Disetujui oleh Admin.',
                    'decided_at' => Carbon::now(),
                ]
            );

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
                $day = $cr->proposed_day ?? $schedule->day_of_week;
                $startTime = $cr->proposed_start_time ?? $schedule->start_time;
                $endTime = $cr->proposed_end_time ?? $schedule->end_time;
                
                list($sessionStart, $sessionDuration) = $this->calculateSessionRange($day, $startTime, $endTime);

                $schedule->update([
                    'day_of_week' => $day,
                    'start_time'  => $startTime,
                    'end_time'    => $endTime,
                    'room_id'     => $cr->proposed_room_id    ?? $schedule->room_id,
                    'session_start' => $sessionStart,
                    'session_duration' => $sessionDuration,
                    'effective_from' => $cr->effective_from_date ?? Carbon::now()->toDateString(),
                ]);
            }

            // 3. Mark request as approved
            $cr->update(['status' => 'APPROVED']);
        });

        // Build shared data_payload for all notifications from this approval
        $approvedSchedule = $cr->schedule()->with(['course', 'room'])->first();
        $approvedProposedRoom = $cr->proposed_room_id
            ? \App\Models\Room::find($cr->proposed_room_id)
            : null;

        $oldSessionApprove = null;
        if ($approvedSchedule && $approvedSchedule->session_start) {
            $dur = $approvedSchedule->session_duration ?? 1;
            $oldSessionApprove = $dur > 1
                ? 'Sesi ' . $approvedSchedule->session_start . '–' . ($approvedSchedule->session_start + $dur - 1)
                : 'Sesi ' . $approvedSchedule->session_start;
        }

        // Calculate new session
        $newSessionApprove = null;
        if ($cr->proposed_day && $cr->proposed_start_time && $cr->proposed_end_time) {
            $newSessionApprove = $this->calculateSessionLabel(
                $cr->proposed_day,
                $cr->proposed_start_time,
                $cr->proposed_end_time
            );
        }

        $approvePayload = [
            'request_code'   => $cr->request_code,
            'course_name'    => $approvedSchedule?->course?->name,
            'class_name'     => $approvedSchedule?->course?->class_name,
            'request_type'   => $cr->request_type,
            'student_reason' => $cr->reason,
            'old_day'        => $approvedSchedule?->day_of_week,
            'old_time'       => ($approvedSchedule && $approvedSchedule->start_time && $approvedSchedule->end_time)
                                    ? substr($approvedSchedule->start_time, 0, 5) . ' – ' . substr($approvedSchedule->end_time, 0, 5)
                                    : null,
            'old_room'       => $approvedSchedule?->room?->code,
            'old_room_name'  => $approvedSchedule?->room?->name,
            'old_session'    => $oldSessionApprove,
            'new_day'        => $cr->proposed_day,
            'new_time'       => ($cr->proposed_start_time && $cr->proposed_end_time)
                                    ? substr($cr->proposed_start_time, 0, 5) . ' – ' . substr($cr->proposed_end_time, 0, 5)
                                    : null,
            'new_room'       => $approvedProposedRoom?->code ?? $approvedSchedule?->room?->code,
            'new_room_name'  => $approvedProposedRoom?->name ?? $approvedSchedule?->room?->name,
            'new_session'    => $newSessionApprove,
        ];

        $notifMahasiswa = \App\Models\Notification::create([
            'request_id'   => $cr->id,
            'triggered_by' => $request->user()->id,
            'type'         => 'REQUEST_APPROVED',
            'title'        => 'Request Disetujui Admin',
            'message'      => "Pengajuan {$cr->request_code} telah disetujui.",
            'body'         => 'Perubahan jadwal telah diterapkan.',
            'data_payload' => $approvePayload,
        ]);
        \App\Models\NotificationRecipient::create(['notification_id' => $notifMahasiswa->id, 'recipient_id' => $cr->requester_id, 'channel' => 'IN_APP', 'is_sent' => true, 'sent_at' => Carbon::now()]);

        // Notify Aslab who validated it
        $aslabApproval = \DB::table('approvals')->where('request_id', $cr->id)->where('stage', 'ASLAB_CHECK')->first();
        if ($aslabApproval) {
            $notifAslab = \App\Models\Notification::create([
                'request_id'   => $cr->id,
                'triggered_by' => $request->user()->id,
                'type'         => 'REQUEST_APPROVED',
                'title'        => 'Request Disetujui Admin',
                'message'      => "Pengajuan {$cr->request_code} yang Anda validasi telah disetujui.",
                'body'         => 'Request berhasil diproses.',
                'data_payload' => $approvePayload,
            ]);
            \App\Models\NotificationRecipient::create(['notification_id' => $notifAslab->id, 'recipient_id' => $aslabApproval->actor_id, 'channel' => 'IN_APP', 'is_sent' => true, 'sent_at' => Carbon::now()]);
        }

        // Notify lecturers assigned to the schedule
        $lecturerIds = \DB::table('teaching_assignments')
            ->where('schedule_id', $cr->schedule_id)
            ->pluck('user_id');

        foreach ($lecturerIds as $lecturerId) {
            $notifDosen = \App\Models\Notification::create([
                'request_id'   => $cr->id,
                'triggered_by' => $request->user()->id,
                'type'         => 'SCHEDULE_CHANGED',
                'title'        => 'Perubahan Jadwal Kelas',
                'message'      => "Jadwal kelas {$approvedSchedule?->course?->name} telah diubah.",
                'body'         => 'Cek jadwal terbaru Anda.',
                'data_payload' => $approvePayload,
            ]);
            \App\Models\NotificationRecipient::create(['notification_id' => $notifDosen->id, 'recipient_id' => $lecturerId, 'channel' => 'IN_APP', 'is_sent' => true, 'sent_at' => Carbon::now()]);
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

        // Create/update approval record (idempotent per unique(request_id, stage))
        Approval::updateOrCreate(
            [
                'request_id' => $cr->id,
                'stage'      => 'ADMIN_DECISION',
            ],
            [
                'actor_id'   => $request->user()->id,
                'decision'   => 'REJECTED_ADMIN',
                'notes'      => $request->notes,
                'decided_at' => Carbon::now(),
            ]
        );

        $cr->update(['status' => 'REJECTED_ADMIN']);

        // Build data_payload for detail modal
        $rejectedSchedule = $cr->schedule()->with(['course', 'room'])->first();
        $rejectedProposedRoom = $cr->proposed_room_id
            ? \App\Models\Room::find($cr->proposed_room_id)
            : null;

        $oldSessionRejectAdmin = null;
        if ($rejectedSchedule && $rejectedSchedule->session_start) {
            $dur = $rejectedSchedule->session_duration ?? 1;
            $oldSessionRejectAdmin = $dur > 1
                ? 'Sesi ' . $rejectedSchedule->session_start . '–' . ($rejectedSchedule->session_start + $dur - 1)
                : 'Sesi ' . $rejectedSchedule->session_start;
        }

        // Calculate new session
        $newSessionReject = null;
        if ($cr->proposed_day && $cr->proposed_start_time && $cr->proposed_end_time) {
            $newSessionReject = $this->calculateSessionLabel(
                $cr->proposed_day,
                $cr->proposed_start_time,
                $cr->proposed_end_time
            );
        }

        $rejectAdminPayload = [
            'request_code'   => $cr->request_code,
            'course_name'    => $rejectedSchedule?->course?->name,
            'class_name'     => $rejectedSchedule?->course?->class_name,
            'request_type'   => $cr->request_type,
            'student_reason' => $cr->reason,
            'old_day'        => $rejectedSchedule?->day_of_week,
            'old_time'       => ($rejectedSchedule && $rejectedSchedule->start_time && $rejectedSchedule->end_time)
                                    ? substr($rejectedSchedule->start_time, 0, 5) . ' – ' . substr($rejectedSchedule->end_time, 0, 5)
                                    : null,
            'old_room'       => $rejectedSchedule?->room?->code,
            'old_room_name'  => $rejectedSchedule?->room?->name,
            'old_session'    => $oldSessionRejectAdmin,
            'new_day'        => $cr->proposed_day,
            'new_time'       => ($cr->proposed_start_time && $cr->proposed_end_time)
                                    ? substr($cr->proposed_start_time, 0, 5) . ' – ' . substr($cr->proposed_end_time, 0, 5)
                                    : null,
            'new_room'       => $rejectedProposedRoom?->code ?? $rejectedSchedule?->room?->code,
            'new_room_name'  => $rejectedProposedRoom?->name ?? $rejectedSchedule?->room?->name,
            'new_session'    => $newSessionReject,
        ];

        $notifMahasiswa = \App\Models\Notification::create([
            'request_id'   => $cr->id,
            'triggered_by' => $request->user()->id,
            'type'         => 'REQUEST_REJECTED',
            'title'        => 'Request Ditolak Admin',
            'message'      => "Pengajuan {$cr->request_code} ditolak.",
            'body'         => "Alasan: {$request->notes}",
            'data_payload' => $rejectAdminPayload,
        ]);
        \App\Models\NotificationRecipient::create(['notification_id' => $notifMahasiswa->id, 'recipient_id' => $cr->requester_id, 'channel' => 'IN_APP', 'is_sent' => true, 'sent_at' => Carbon::now()]);

        // Notify Aslab who validated it
        $aslabApproval = \DB::table('approvals')->where('request_id', $cr->id)->where('stage', 'ASLAB_CHECK')->first();
        if ($aslabApproval) {
            $notifAslab = \App\Models\Notification::create([
                'request_id'   => $cr->id,
                'triggered_by' => $request->user()->id,
                'type'         => 'REQUEST_REJECTED',
                'title'        => 'Request Ditolak Admin',
                'message'      => "Pengajuan {$cr->request_code} yang Anda validasi ditolak.",
                'body'         => 'Request tidak disetujui Admin.',
                'data_payload' => $rejectAdminPayload,
            ]);
            \App\Models\NotificationRecipient::create(['notification_id' => $notifAslab->id, 'recipient_id' => $aslabApproval->actor_id, 'channel' => 'IN_APP', 'is_sent' => true, 'sent_at' => Carbon::now()]);
        }

        return back()->with('success', 'Pengajuan berhasil ditolak.');
    }

    /**
     * Calculate session start and duration from day of week, start time, and end time.
     */
    private function calculateSessionRange(string $day, string $startTime, string $endTime): array
    {
        $isFriday = (strtoupper($day) === 'JUMAT');
        $sessionTimes = $isFriday ? [
            1 => ['07:30', '08:20'],
            2 => ['08:25', '09:15'],
            3 => ['09:20', '10:10'],
            4 => ['10:15', '11:05'],
            5 => ['13:00', '13:50'],
            6 => ['13:55', '14:45'],
            7 => ['15:30', '16:20'],
            8 => ['16:25', '17:15'],
            9 => ['18:00', '18:50'],
            10 => ['18:55', '19:20'],
            11 => ['19:25', '20:15'],
        ] : [
            1 => ['07:30', '08:20'],
            2 => ['08:25', '09:15'],
            3 => ['09:20', '10:10'],
            4 => ['10:15', '11:05'],
            5 => ['11:10', '12:00'],
            6 => ['13:00', '13:50'],
            7 => ['13:55', '14:45'],
            8 => ['15:30', '16:20'],
            9 => ['16:25', '17:15'],
            10 => ['18:00', '18:50'],
            11 => ['18:55', '19:20'],
        ];

        // Format start/end times to H:i
        $start = substr($startTime, 0, 5);
        $end = substr($endTime, 0, 5);

        $startSession = null;
        $endSession = null;

        // Try exact match
        foreach ($sessionTimes as $idx => $range) {
            if ($range[0] === $start) {
                $startSession = $idx;
            }
            if ($range[1] === $end) {
                $endSession = $idx;
            }
        }

        // Fallback to closest match if not found exactly
        if ($startSession === null) {
            $minDiff = null;
            foreach ($sessionTimes as $idx => $range) {
                $diff = abs(strtotime($range[0]) - strtotime($start));
                if ($minDiff === null || $diff < $minDiff) {
                    $minDiff = $diff;
                    $startSession = $idx;
                }
            }
        }

        if ($endSession === null) {
            $minDiff = null;
            foreach ($sessionTimes as $idx => $range) {
                $diff = abs(strtotime($range[1]) - strtotime($end));
                if ($minDiff === null || $diff < $minDiff) {
                    $minDiff = $diff;
                    $endSession = $idx;
                }
            }
        }

        $sessionDuration = max(1, $endSession - $startSession + 1);

        return [$startSession, $sessionDuration];
    }
}
