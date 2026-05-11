<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    protected $fillable = [
        'course_id',
        'room_id',
        'semester_id',
        'day_of_week',
        'start_time',
        'end_time',
        'effective_from',
        'effective_until',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'effective_from'  => 'date',
            'effective_until' => 'date',
            'is_active'       => 'boolean',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function teachingAssignments(): HasMany
    {
        return $this->hasMany(TeachingAssignment::class);
    }

    /**
     * Get the dosen (PENGAJAR) assigned to this schedule.
     */
    public function dosens()
    {
        return $this->teachingAssignments()
            ->where('role_in_class', 'PENGAJAR')
            ->with('user');
    }

    /**
     * Calculate session number from start_time.
     * Sesi 1 = 07:00, Sesi 2 = 07:50, etc. (50 min per session)
     */
    public function getSessionStartAttribute(): int
    {
        $minutes = (int) substr($this->start_time, 0, 2) * 60
                 + (int) substr($this->start_time, 3, 2);
        $baseMinutes = 7 * 60; // 07:00
        return max(1, (int) floor(($minutes - $baseMinutes) / 50) + 1);
    }

    /**
     * Calculate session duration (number of sessions).
     */
    public function getSessionDurationAttribute(): int
    {
        $start = (int) substr($this->start_time, 0, 2) * 60
               + (int) substr($this->start_time, 3, 2);
        $end   = (int) substr($this->end_time, 0, 2) * 60
               + (int) substr($this->end_time, 3, 2);
        $diff  = $end - $start;
        return max(1, (int) round($diff / 50));
    }
}
