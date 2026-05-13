<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

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
        'capacity'  => 'integer',
        'floor'     => 'integer',
        'is_active' => 'boolean',
    ];

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Display label: "Gedung A - Lab Komputer 1"
     */
    public function getDisplayNameAttribute(): string
    {
        return "{$this->building} - {$this->name}";
    }
}
