<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Notification extends Model
{
    use HasFactory;

    public $timestamps = true;

    protected $fillable = [
        'user_id', // Fallback for single-user notifications
        'request_id',
        'triggered_by',
        'type',
        'category',
        'title',
        'message',
        'body',
        'action_url',
        'data_payload',
        'read_at',
        'created_at',
    ];

    protected $casts = [
        'data_payload' => 'array',
        'read_at'      => 'datetime',
        'created_at'   => 'datetime',
    ];

    /**
     * Relasi ke User (untuk dosen yang menerima notifikasi - legacy/simple mode)
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
     * Multi-recipient support (from notification branch)
     */
    public function recipients(): HasMany
    {
        return $this->hasMany(NotificationRecipient::class);
    }

    /**
     * Scope untuk notifikasi belum dibaca (legacy)
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope untuk user tertentu (legacy)
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
