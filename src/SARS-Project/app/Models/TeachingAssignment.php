<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeachingAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'user_id',
        'role_in_class',
    ];

    public $timestamps = false;

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    /**
     * Relasi ke Schedule
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * Relasi ke User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
