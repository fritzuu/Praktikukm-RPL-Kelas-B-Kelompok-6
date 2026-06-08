<?php

namespace App\Services\Notifications;

use App\Models\Notification;
use App\Models\NotificationRecipient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class NotificationService
{
    public function markAsRead(User $user, int|string $notificationId, string $channel = 'IN_APP'): bool
    {
        $updated = NotificationRecipient::query()
            ->where('recipient_id', $user->id)
            ->where('notification_id', $notificationId)
            ->whereNull('deleted_at')
            ->where('channel', $channel)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => Carbon::now('Asia/Jakarta'),
            ]);

        return $updated > 0;
    }

    /**
     * Recent activity dropdown rules:
     * unread OR created_at >= now() - 7 days
     * Only considers non-deleted recipient rows.
     */
    public function getRecentActivity(User $user, int $limit = 5, string $channel = 'IN_APP'): array
    {
        $since = Carbon::now('Asia/Jakarta')->subDays(7);

        $rows = NotificationRecipient::query()
            ->where('recipient_id', $user->id)
            ->where('channel', $channel)
            ->whereNull('deleted_at')
            ->where(function ($q) use ($since) {
                $q->where('is_read', false)
                    ->orWhereHas('notification', function ($nq) use ($since) {
                        $nq->where('created_at', '>=', $since);
                    });
            })
            ->with(['notification'])
            ->orderByDesc('notification_id')
            ->limit($limit)
            ->get();

        return $rows->map(fn ($nr) => $this->formatListItem($nr))->values()->all();
    }

    public function getArchive(User $user, int $limit = 200, string $channel = 'IN_APP'): array
    {
        $rows = NotificationRecipient::query()
            ->where('recipient_id', $user->id)
            ->where('channel', $channel)
            ->whereNull('deleted_at')
            ->with(['notification'])
            ->orderByDesc('notification_id')
            ->limit($limit)
            ->get();

        return $rows->map(fn ($nr) => $this->formatListItem($nr))->values()->all();
    }

    /**
     * Soft-delete recipient row, only if already read.
     */
    public function deleteIfRead(User $user, int|string $notificationId, string $channel = 'IN_APP'): bool
    {
        $recipient = NotificationRecipient::query()
            ->where('recipient_id', $user->id)
            ->where('notification_id', $notificationId)
            ->where('channel', $channel)
            ->whereNull('deleted_at')
            ->first();

        if (!$recipient) {
            return false;
        }

        if (!$recipient->is_read) {
            return false;
        }

        $recipient->delete();

        return true;
    }

    private function formatListItem(NotificationRecipient $nr): array
    {
        $notif = $nr->notification;
        $createdAt = $notif?->created_at;

        $tipeMap = [
            'STATUS_CHANGE'      => 'jadwal',
            'REQUEST_APPROVED'   => 'jadwal',
            'REQUEST_FORWARDED'  => 'jadwal',
            'SCHEDULE_CHANGED'   => 'jadwal',
            'CONFLICT_ALERT'     => 'validasi',
            'REQUEST_SUBMITTED'  => 'validasi',
            'REQUEST_REJECTED'   => 'info',
            'SYSTEM'             => 'sistem',
            'REMINDER'           => 'info',
        ];

        return [
            'id' => (string) $notif?->id,
            'request_id' => $notif?->request_id,
            'judul' => $notif?->title,
            'pesan' => $notif?->message ?? $notif?->body,
            'body' => $notif?->body,
            'tipe' => $tipeMap[$notif?->type] ?? 'info',
            'channel' => $nr->channel,
            'dibaca' => (bool) $nr->is_read,
            'waktu' => $createdAt?->diffForHumans(),
            'tanggal' => $createdAt?->translatedFormat('j F Y'),
            'created_at' => $createdAt?->toISOString(),
        ];
    }
}

