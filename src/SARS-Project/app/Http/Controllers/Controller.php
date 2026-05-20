<?php

namespace App\Http\Controllers;

abstract class Controller
{
    /**
     * Log a user activity.
     */
    protected function logActivity(int $userId, string $action, string $status = 'disetujui'): void
    {
        \App\Models\Activity::create([
            'user_id' => $userId,
            'action'  => $action,
            'status'  => $status,
        ]);
    }

    /**
     * Send a notification to one or more recipients.
     */
    protected function sendNotification(
        string $title,
        string $body,
        string $type,
        $recipients,
        ?int $triggeredBy = null,
        ?int $requestId = null
    ): void {
        $notification = \App\Models\Notification::create([
            'title'        => $title,
            'body'         => $body,
            'type'         => $type,
            'triggered_by' => $triggeredBy,
            'request_id'   => $requestId,
        ]);

        foreach ((array) $recipients as $recipientId) {
            \Illuminate\Support\Facades\DB::table('notification_recipients')->insert([
                'notification_id' => $notification->id,
                'recipient_id'    => $recipientId,
                'channel'         => 'IN_APP',
                'is_sent'         => true,
                'sent_at'         => now(),
                'is_read'         => false,
                'read_at'         => null,
            ]);
        }
    }
}
