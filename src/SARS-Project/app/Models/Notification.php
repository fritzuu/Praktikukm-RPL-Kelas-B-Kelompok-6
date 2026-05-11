<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Notification extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'triggered_by',
        'type',
        'title',
        'body',
        'data_payload',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'data_payload' => 'array',
            'created_at'   => 'datetime',
        ];
    }

    public function triggeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'triggered_by');
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(NotificationRecipient::class);
    }
}
