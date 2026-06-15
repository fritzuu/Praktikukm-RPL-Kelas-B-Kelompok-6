<?php

namespace App\Models;

use App\Traits\BroadcastsChanges;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Approval extends Model
{
    use BroadcastsChanges;
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'actor_id',
        'stage',
        'decision',
        'notes',
        'decided_at',
    ];

    protected $casts = [
        'decided_at' => 'datetime',
    ];

    /**
     * Normalize legacy decision values to match the DB enum.
     *
     * DB enum (approvals.decision) is:
     * - FORWARDED
     * - APPROVED
     * - REJECTED_ASLAB
     * - REJECTED_ADMIN
     *
     * Some runtime paths may still send "REJECTED" (legacy).
     * We map it based on the approval stage, without bypassing DB constraints.
     */
    public function setDecisionAttribute(?string $value): void
    {
        $value = $value !== null ? strtoupper(trim($value)) : null;

        if ($value === null) {
            $this->attributes['decision'] = null;
            return;
        }

        // Legacy mapping (the bug you reported)
        if ($value === 'REJECTED') {
            $stage = $this->attributes['stage'] ?? null;

            if ($stage === 'ASLAB_CHECK') {
                $value = ApprovalDecision::REJECTED_ASLAB;
            } elseif ($stage === 'ADMIN_DECISION') {
                $value = ApprovalDecision::REJECTED_ADMIN;
            } else {
                throw new \InvalidArgumentException("Invalid approval stage for legacy decision REJECTED: {$stage}");
            }
        }

        // Final sanity: only allow enum values supported by DB
        $allowed = [
            ApprovalDecision::FORWARDED,
            ApprovalDecision::APPROVED,
            ApprovalDecision::REJECTED_ASLAB,
            ApprovalDecision::REJECTED_ADMIN,
        ];

        if (!in_array($value, $allowed, true)) {
            throw new \InvalidArgumentException("Invalid approval decision: {$value}");
        }

        $this->attributes['decision'] = $value;
    }

    public function changeRequest(): BelongsTo
    {
        return $this->belongsTo(ChangeRequest::class, 'request_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
