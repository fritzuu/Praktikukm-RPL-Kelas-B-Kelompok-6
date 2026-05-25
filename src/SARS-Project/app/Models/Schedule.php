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
