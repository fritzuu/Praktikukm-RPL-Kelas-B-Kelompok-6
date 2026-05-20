<?php

namespace App\Http\Controllers;

use App\Models\NotificationRecipient;
use Carbon\Carbon;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markAsRead(Request $request, int $notificationId)
    {
        NotificationRecipient::where('recipient_id', $request->user()->id)
            ->where('notification_id', $notificationId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => Carbon::now(),
            ]);

        return back();
    }

    public function markAllAsRead(Request $request)
    {
        NotificationRecipient::where('recipient_id', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => Carbon::now(),
            ]);

        return back();
    }

    public function destroy(Request $request, int $notificationId)
    {
        NotificationRecipient::where('recipient_id', $request->user()->id)
            ->where('notification_id', $notificationId)
            ->delete();

        return back();
    }
}
