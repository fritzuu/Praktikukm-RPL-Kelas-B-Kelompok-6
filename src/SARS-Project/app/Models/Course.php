<?php

namespace App\Models;

use App\Traits\BroadcastsChanges;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Course extends Model
{
    use HasFactory, BroadcastsChanges;

    protected $fillable = [
        'semester_id',
        'code',
        'name',
        'credits',
        'class_name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relasi ke Semester
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * Relasi ke Schedule
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}
