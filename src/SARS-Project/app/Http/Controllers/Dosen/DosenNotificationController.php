<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DosenNotificationController extends Controller
{
    /**
     * Display all notifications for dosen.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Ambil notifikasi untuk user saat ini
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn (Notification $n) => [
                'id'         => (string) $n->id,
                'title'      => $n->title ?? $n->body,
                'message'    => $n->message ?? substr($n->body ?? '', 0, 100),
                'type'       => $this->normalizeType($n->type),
                'category'   => $n->category ?? 'General',
                'read'       => (bool) $n->read_at,
                'createdAt'  => $n->created_at->toIso8601String(),
                'actionUrl'  => $n->action_url,
            ]);

        return Inertia::render('Dosen/Notification', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Normalize notification type to simple types.
     */
    private function normalizeType(string $type): string
    {
        return match($type) {
            'STATUS_CHANGE', 'CONFLICT_ALERT', 'SYSTEM' => 'info',
            'success' => 'success',
            'warning' => 'warning',
            'error' => 'error',
            default => 'info',
        };
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Notification $notification)
    {
        if ($notification->user_id !== auth()->id()) {
            abort(403);
        }

        $notification->update(['read_at' => now()]);

        return back();
    }

    /**
     * Delete notification.
     */
    public function destroy(Notification $notification)
    {
        if ($notification->user_id !== auth()->id()) {
            abort(403);
        }

        $notification->delete();

        return back();
    }
}
