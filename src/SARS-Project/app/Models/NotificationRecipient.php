<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class NotificationRecipient extends Model
{
    use SoftDeletes;

    public $timestamps = false;

    protected $fillable = [
        'notification_id',
        'recipient_id',
        'channel',
        'is_sent',
        'sent_at',
        'is_read',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'is_sent' => 'boolean',
            'is_read' => 'boolean',
            'sent_at' => 'datetime',
            'read_at' => 'datetime',
        ];
    }

    public function notification(): BelongsTo
    {
        return $this->belongsTo(Notification::class);
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }
}
