<?php

namespace App\Services\Notifications;

use App\Models\ChangeRequest;
use App\Models\Notification;
use App\Models\NotificationRecipient;
use App\Support\AcademicSessionTimes;
use Carbon\Carbon;


class NotificationDetailBuilder
{
    /**
     * Build payload for Notification Detail Modal.
     *
     * Data resolution priority:
     *   1. ChangeRequest + relations (live DB — most accurate)
     *   2. data_payload (populated since the recent fix)
     *   3. Parse request code from notification text and re-query (legacy recovery)
     *   4. Notification title/body fallback only
     */
    public function build(Notification $notification, NotificationRecipient $recipient): array
    {
        // ── Resolve ChangeRequest ─────────────────────────────────────────────
        $changeRequest = $this->resolveChangeRequest($notification);

        $payload  = $notification->data_payload ?? [];
        $schedule = $changeRequest?->schedule;

        // ── Request summary ───────────────────────────────────────────────────
        $requestSummary = [
            'request_code' => $changeRequest?->request_code
                                ?? $payload['request_code'] ?? null,
            'course_name'  => $schedule?->course?->name
                                ?? $payload['course_name'] ?? null,
            'class_name'   => $schedule?->course?->class_name
                                ?? $payload['class_name'] ?? null,
            'request_type' => $changeRequest?->request_type
                                ?? $payload['request_type'] ?? null,
            'current_status' => $changeRequest?->status ?? $notification->type,
        ];

        // ── Schedule change: OLD (current/original schedule) ──────────────────
        // ALWAYS prioritize payload first (contains original schedule snapshot)
        // then fallback to current schedule model (may have been updated already)
        $oldDay     = $payload['old_day']      ?? $schedule?->day_of_week  ?? null;
        $oldTime    = $payload['old_time']     ?? $this->formatTimeRange($schedule?->start_time, $schedule?->end_time) ?? null;
        $oldRoom    = $payload['old_room']     ?? $schedule?->room?->code   ?? null;
        $oldRoomName= $payload['old_room_name'] ?? $schedule?->room?->name   ?? null;
        $oldSession = $payload['old_session']  ?? (($schedule && $schedule->session_start)
                        ? $this->sessionLabel($schedule->session_start, $schedule->session_duration ?? 1)
                        : null);

        // ── Schedule change: NEW (what was requested) ─────────────────────────
        $newDay      = $changeRequest?->proposed_day      ?? $payload['new_day']  ?? null;
        $newTime     = $this->formatTimeRange(
                            $changeRequest?->proposed_start_time,
                            $changeRequest?->proposed_end_time
                        ) ?? $payload['new_time'] ?? null;
        $newRoom     = $changeRequest?->proposedRoom?->code ?? $payload['new_room'] ?? null;
        $newRoomName = $changeRequest?->proposedRoom?->name ?? $payload['new_room_name'] ?? null;

        // Derive new session by matching proposed start/end times against the UNS session table
        $newSession = null;
        if ($changeRequest && $changeRequest->proposed_start_time && $changeRequest->proposed_end_time) {
            $newSession = $this->resolveSessionLabel(
                $changeRequest->proposed_start_time,
                $changeRequest->proposed_end_time,
                $changeRequest->proposed_day ?? $schedule?->day_of_week
            );
        }
        $newSession = $newSession ?? $payload['new_session'] ?? null;

        // ── Student reason ────────────────────────────────────────────────────
        $studentReason = $changeRequest?->reason
                            ?? $payload['student_reason'] ?? null;

        // ── Approval decisions ────────────────────────────────────────────────
        [$approvedDecision, $rejectedDecision, $forwardedDecision] =
            $this->extractDecisions($changeRequest);

        // ── Timeline ─────────────────────────────────────────────────────────
        $timeline = $this->buildTimeline($changeRequest);

        return [
            'request_summary' => $requestSummary,
            'schedule_change' => [
                'old' => [
                    'day'       => $oldDay,
                    'time'      => $oldTime,
                    'room'      => $oldRoom,
                    'room_name' => $oldRoomName,
                    'session'   => $oldSession,
                ],
                'new' => [
                    'day'       => $newDay,
                    'time'      => $newTime,
                    'room'      => $newRoom,
                    'room_name' => $newRoomName,
                    'session'   => $newSession,
                ],
            ],
            'student_reason' => [
                'reason' => $studentReason,
            ],
            'decision' => [
                'mode'      => $this->inferDecisionMode($notification),
                'approved'  => $approvedDecision,
                'rejected'  => $rejectedDecision,
                'forwarded' => $forwardedDecision,
            ],
            'timeline' => $timeline,
            'fallback' => [
                'title'   => $notification->title,
                'preview' => $notification->message ?? $notification->body,
            ],
        ];
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Resolve ChangeRequest from the notification.
     *
     * Tries request_id first (set on new notifications).
     * For old notifications without request_id, scans title/message for a
     * CR-YYYYMMDD-XXXX code and looks it up.
     */
    private function resolveChangeRequest(Notification $notification): ?ChangeRequest
    {
        // 1. Direct FK
        if ($notification->request_id) {
            return ChangeRequest::with([
                'schedule.course',
                'schedule.room',
                'proposedRoom',
                'approvals.actor',
                'requester',
            ])->find($notification->request_id);
        }

        // 2. Parse CR code from text (legacy recovery)
        $text = implode(' ', array_filter([
            $notification->title,
            $notification->message,
            $notification->body,
        ]));

        if (preg_match('/CR-\d{8}-[A-Z0-9]{4}/', $text, $matches)) {
            return ChangeRequest::with([
                'schedule.course',
                'schedule.room',
                'proposedRoom',
                'approvals.actor',
                'requester',
            ])->where('request_code', $matches[0])->first();
        }

        return null;
    }

    /**
     * Reverse-map a proposed start/end time to a session label using the UNS
     * academic session table.
     *
     * Matches by finding which session's start time equals the proposed start.
     * Falls back to a range match (start within session window) if exact match
     * fails (e.g. when the student picked a non-standard slot).
     */
    private function resolveSessionLabel(?string $proposedStart, ?string $proposedEnd, ?string $day): ?string
    {
        if (!$proposedStart) return null;

        $day       = $day ?? 'SENIN';
        $sessions  = AcademicSessionTimes::sessionsForDay($day);
        $normStart = substr($proposedStart, 0, 5);
        $normEnd   = $proposedEnd ? substr($proposedEnd, 0, 5) : null;

        // Pass 1: exact start-time match — find first and last matching session
        $matched = [];
        foreach ($sessions as $num => [$sStart, $sEnd]) {
            if ($sStart === $normStart) {
                $matched[] = $num; // start session
            }
            if ($normEnd && $sEnd === $normEnd) {
                $matched[] = $num; // end session
            }
        }

        if (!empty($matched)) {
            $first = min($matched);
            $last  = max($matched);
            return $first === $last ? "Sesi {$first}" : "Sesi {$first}–{$last}";
        }

        // Pass 2: find the session whose window contains the proposed start
        foreach ($sessions as $num => [$sStart, $sEnd]) {
            if ($normStart >= $sStart && $normStart < $sEnd) {
                return "Sesi {$num}";
            }
        }

        return null;
    }

    /**
     * Format HH:MM:SS or HH:MM to "HH:MM – HH:MM".
     */
    private function formatTimeRange(?string $start, ?string $end): ?string
    {
        if (!$start || !$end) return null;
        return substr($start, 0, 5) . ' – ' . substr($end, 0, 5);
    }

    /**
     * Produce a human label for a session range, e.g. "Sesi 3–4 (09:20 – 11:05)".
     * Uses the canonical UNS session time map.
     */
    private function sessionLabel(int $sessionStart, int $duration = 1): string
    {
        $sessionEnd = $sessionStart + $duration - 1;
        $label = $duration > 1
            ? "Sesi {$sessionStart}–{$sessionEnd}"
            : "Sesi {$sessionStart}";
        return $label;
    }

    /**
     * Extract approved / rejected / forwarded decision objects from approvals.
     */
    private function extractDecisions(?ChangeRequest $cr): array
    {
        $approved  = null;
        $rejected  = null;
        $forwarded = null;

        if (!$cr) return [$approved, $rejected, $forwarded];

        foreach ($cr->approvals->sortBy('decided_at') as $approval) {
            $actorName = $approval->actor?->name ?? 'Unknown';
            $decidedAt = $approval->decided_at
                ? Carbon::parse($approval->decided_at)->translatedFormat('d M Y, H:i')
                : null;
            $notes = $approval->notes;

            match ($approval->decision) {
                'FORWARDED'     => $forwarded = ['by' => $actorName, 'at' => $decidedAt, 'notes' => $notes],
                'APPROVED'      => $approved  = ['by' => $actorName, 'at' => $decidedAt, 'notes' => $notes],
                'REJECTED_ASLAB' => $rejected = ['by' => $actorName, 'at' => $decidedAt, 'notes' => $notes, 'stage' => 'Aslab'],
                'REJECTED_ADMIN' => $rejected = ['by' => $actorName, 'at' => $decidedAt, 'notes' => $notes, 'stage' => 'Admin'],
                default         => null,
            };
        }

        return [$approved, $rejected, $forwarded];
    }

    /**
     * Build ordered timeline array from ChangeRequest + approvals.
     */
    private function buildTimeline(?ChangeRequest $cr): array
    {
        if (!$cr) return [];

        $timeline = [[
            'label'  => 'Pengajuan Dikirim',
            'by'     => $cr->requester?->name ?? null,
            'time'   => $cr->created_at
                ? Carbon::parse($cr->created_at)->translatedFormat('d M Y, H:i')
                : null,
            'notes'  => null,
            'status' => 'done',
        ]];

        foreach ($cr->approvals->sortBy('decided_at') as $approval) {
            $decidedAt = $approval->decided_at
                ? Carbon::parse($approval->decided_at)->translatedFormat('d M Y, H:i')
                : null;

            $label = match (true) {
                $approval->stage === 'ASLAB_CHECK'   && $approval->decision === 'FORWARDED'     => 'Divalidasi Aslab (Diteruskan)',
                $approval->stage === 'ASLAB_CHECK'   && $approval->decision === 'REJECTED_ASLAB' => 'Ditolak Aslab',
                $approval->stage === 'ASLAB_CHECK'                                              => 'Diproses Aslab',
                $approval->stage === 'ADMIN_DECISION' && $approval->decision === 'APPROVED'     => 'Disetujui Admin',
                $approval->stage === 'ADMIN_DECISION' && $approval->decision === 'REJECTED_ADMIN' => 'Ditolak Admin',
                $approval->stage === 'ADMIN_DECISION'                                           => 'Diproses Admin',
                default                                                                         => 'Diproses',
            };

            $timeline[] = [
                'label'  => $label,
                'by'     => $approval->actor?->name ?? null,
                'time'   => $decidedAt,
                'notes'  => $approval->notes,
                'status' => 'done',
            ];
        }

        return $timeline;
    }

    private function inferDecisionMode(Notification $notification): string
    {
        return match ($notification->type) {
            'REQUEST_APPROVED'  => 'approved',
            'REQUEST_REJECTED'  => 'rejected',
            'REQUEST_FORWARDED' => 'forwarded',
            'SCHEDULE_CHANGED'  => 'schedule_changed',
            'REQUEST_SUBMITTED' => 'submitted',
            default             => 'info',
        };
    }
}
