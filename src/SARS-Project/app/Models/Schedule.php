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

    public function scopeActiveForSemester($query, int $semesterId)
    {
        return $query->where('semester_id', $semesterId)->where('is_active', true);
    }

    public function scopeOnDay($query, string $dayOfWeek)
    {
        return $query->where('day_of_week', $dayOfWeek);
    }

    public function scopeEffectiveOnDate($query, string $date)
    {
        return $query->where('effective_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_until')
                    ->orWhere('effective_until', '>=', $date);
            });
    }

    public function scopeOverlappingTime($query, string $start, string $end)
    {
        return $query->where('start_time', '<', $end)
            ->where('end_time', '>', $start);
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
}
