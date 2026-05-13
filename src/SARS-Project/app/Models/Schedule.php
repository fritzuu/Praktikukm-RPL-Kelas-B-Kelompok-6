<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    use HasFactory;

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
     * Get nama hari dalam bahasa Indonesia
     */
    public function getHariIndonesiaAttribute(): string
    {
        $days = [
            'SENIN' => 'Senin',
            'SELASA' => 'Selasa',
            'RABU' => 'Rabu',
            'KAMIS' => 'Kamis',
            'JUMAT' => 'Jumat',
            'SABTU' => 'Sabtu',
        ];
        return $days[$this->day_of_week] ?? $this->day_of_week;
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
        // If stored in DB, use it, otherwise calculate
        if (isset($this->attributes['session_start'])) {
            return (int) $this->attributes['session_start'];
        }

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
        // If stored in DB, use it, otherwise calculate
        if (isset($this->attributes['session_duration'])) {
            return (int) $this->attributes['session_duration'];
        }

        $start = (int) substr($this->start_time, 0, 2) * 60
               + (int) substr($this->start_time, 3, 2);
        $end   = (int) substr($this->end_time, 0, 2) * 60
               + (int) substr($this->end_time, 3, 2);
        $diff  = $end - $start;
        return max(1, (int) round($diff / 50));
    }
}
