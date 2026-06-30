<?php

namespace App\Models;

use App\Traits\BroadcastsChanges;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    use HasFactory, BroadcastsChanges;

    protected $fillable = [
        'course_id',
        'room_id',
        'semester_id',
        'day_of_week',
        'start_time',
        'end_time',
        'session_start',
        'session_duration',
        'effective_from',
        'effective_until',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'effective_from' => 'date',
        'effective_until' => 'date',
    ];

    /**
     * Relasi ke Course
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Relasi ke Room
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Relasi ke Semester
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * Relasi ke TeachingAssignment
     */
    public function teachingAssignments(): HasMany
    {
        return $this->hasMany(TeachingAssignment::class);
    }

    /**
     * Relasi ke ScheduleOverride
     */
    public function overrides(): HasMany
    {
        return $this->hasMany(ScheduleOverride::class);
    }

    public function scopeEffectiveOnDate($query, $date)
    {
        $dateStr = \Carbon\Carbon::parse($date)->toDateString();
        
        return $query->whereDate('effective_from', '<=', $dateStr)
            ->where(function ($q) use ($dateStr) {
                $q->whereNull('effective_until')
                    ->orWhereDate('effective_until', '>=', $dateStr);
            });
    }

    public function scopeOverlappingTime($query, string $startTime, string $endTime)
    {
        return $query->where('start_time', '<', $endTime)
                     ->where('end_time', '>', $startTime);
    }
}
