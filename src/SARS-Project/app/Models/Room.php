<?php

namespace App\Models;

use App\Traits\BroadcastsChanges;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory, BroadcastsChanges;

    protected $fillable = [
        'code',
        'name',
        'capacity',
        'building',
        'floor',
        'type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relasi ke Schedule
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}
