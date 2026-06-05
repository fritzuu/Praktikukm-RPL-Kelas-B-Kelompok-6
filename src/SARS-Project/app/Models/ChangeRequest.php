<?php

namespace App\Models;

use App\Traits\BroadcastsChanges;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ChangeRequest extends Model
{
    use BroadcastsChanges;
    /**
     * Generate a unique request code like CR-20260602-A3X7.
     */
    public static function generateCode(): string
    {
        do {
            $code = 'CR-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
        } while (self::where('request_code', $code)->exists());

        return $code;
    }

    protected $fillable = [
        'request_code',
        'requester_id',
        'schedule_id',
        'semester_id',
        'request_type',
        'target_date',
        'effective_from_date',
        'proposed_day',
        'proposed_start_time',
        'proposed_end_time',
        'proposed_room_id',
        'reason',
        'attachment_url',
        'status',
        'conflict_checked',
        'has_conflict',
    ];

    protected $casts = [
        'target_date' => 'date',
        'effective_from_date' => 'date',
        'conflict_checked' => 'boolean',
        'has_conflict' => 'boolean',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function proposedRoom(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'proposed_room_id');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(Approval::class, 'request_id');
    }

    public function overrides(): HasMany
    {
        return $this->hasMany(ScheduleOverride::class, 'request_id');
    }
}
