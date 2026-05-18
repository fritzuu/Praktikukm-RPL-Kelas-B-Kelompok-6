<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduleOverride extends Model
{
    protected $fillable = [
        'schedule_id',
        'request_id',
        'room_id',
        'override_date',
        'new_day_of_week',
        'new_start_time',
        'new_end_time',
        'is_active',
    ];

    protected $casts = [
        'override_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function changeRequest(): BelongsTo
    {
        return $this->belongsTo(ChangeRequest::class, 'request_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
