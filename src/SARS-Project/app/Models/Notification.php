<?php

namespace App\Models;

use App\Traits\BroadcastsChanges;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Notification extends Model
{
    use HasFactory, BroadcastsChanges;

    protected $fillable = [
        'user_id',
        'request_id',
        'triggered_by',
        'title',
        'message',
        'body',
        'type',
        'category',
        'action_url',
        'data_payload',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'data_payload' => 'array',
    ];

    public $timestamps = true;

    /**
     * Relasi ke User (untuk dosen yang menerima notifikasi)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke User (yang trigger notifikasi)
     */
    public function triggeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'triggered_by');
    }

    /**
     * Relasi ke ChangeRequest (jika notifikasi terkait pengajuan)
     */
    public function changeRequest(): BelongsTo
    {
        return $this->belongsTo(ChangeRequest::class, 'request_id');
    }

    /**
     * Relasi ke penerima notifikasi (multi-channel)
     */
    public function recipients(): HasMany
    {
        return $this->hasMany(NotificationRecipient::class);
    }

}

