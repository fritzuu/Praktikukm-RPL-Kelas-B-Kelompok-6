<?php

namespace App\Http\Controllers;

use App\Models\NotificationRecipient;
use App\Services\Notifications\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markAsRead(Request $request, int $notificationId)
    {
        $updated = NotificationRecipient::where('recipient_id', $request->user()->id)
            ->where('notification_id', $notificationId)
            ->where('channel', 'IN_APP')
            ->whereNull('deleted_at')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => Carbon::now(),
            ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => $updated > 0]);
        }

        return back();
    }

    /**
     * Mark all IN_APP notifications as read for the authenticated user.
     * Returns JSON when called via fetch() (Accept: application/json).
     */
    public function markAllAsRead(Request $request)
    {
        $updated = NotificationRecipient::where('recipient_id', $request->user()->id)
            ->where('channel', 'IN_APP')
            ->whereNull('deleted_at')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => Carbon::now(),
            ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'count'   => $updated,
            ]);
        }

        return back();
    }

    public function destroy(Request $request, int $notificationId)
    {
        NotificationRecipient::where('recipient_id', $request->user()->id)
            ->where('notification_id', $notificationId)
            ->whereNull('deleted_at')
            ->delete();

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back();
    }
}
