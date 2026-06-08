<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Services\Notifications\NotificationService;
use App\Services\Notifications\NotificationDetailBuilder;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Notification;
use App\Models\NotificationRecipient;
use Illuminate\Http\JsonResponse;

class NotificationCenterController extends Controller
{
    public function index(Request $request, NotificationService $service): Response
    {
        $user = $request->user();

        return Inertia::render('Shared/NotificationPage', [
            'notifications' => $service->getArchive($user, 200),
            'unreadCount' => NotificationRecipient::query()
                ->where('recipient_id', $user->id)
                ->where('channel', 'IN_APP')
                ->whereNull('deleted_at')
                ->where('is_read', false)
                ->count(),
        ]);
    }

    public function markAsRead(Request $request, NotificationService $service, int $notificationId): JsonResponse
    {
        $user = $request->user();

        $ok = $service->markAsRead($user, $notificationId, 'IN_APP');

        return response()->json([
            'success' => $ok,
        ]);
    }

    public function delete(Request $request, NotificationService $service, int $notificationId): JsonResponse
    {
        $user = $request->user();

        $ok = $service->deleteIfRead($user, $notificationId, 'IN_APP');


        return response()->json([
            'success' => $ok,
            'reason' => $ok ? null : 'UNREAD_NOT_DELETABLE',
        ]);
    }

    public function detail(Request $request, NotificationDetailBuilder $builder, int $notificationId): JsonResponse
    {
        $user = $request->user();

        $nr = NotificationRecipient::query()
            ->where('recipient_id', $user->id)
            ->where('notification_id', $notificationId)
            ->where('channel', 'IN_APP')
            ->whereNull('deleted_at')
            ->first();

        if (!$nr) {
            return response()->json(['success' => false, 'message' => 'NOT_FOUND'], 404);
        }

        $notif = $nr->notification;

        $payload = $builder->build($notif, $nr);

        // Auto mark as read
        if (!$nr->is_read) {
            app(NotificationService::class)->markAsRead($user, $notificationId, 'IN_APP');
            $nr->refresh();
        }

        return response()->json([
            'success' => true,
            'notification' => $payload,
        ]);
    }
}

