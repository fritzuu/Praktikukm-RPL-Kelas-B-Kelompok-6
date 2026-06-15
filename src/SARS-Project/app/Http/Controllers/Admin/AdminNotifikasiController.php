<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationRecipient;
use App\Services\Notifications\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminNotifikasiController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService) {}

    /**
     * Display the notification page.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/Notifikasi', [
            'notifikasi' => $this->notificationService->getArchive($request->user(), 100),
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, int $notificationId): JsonResponse
    {
        $ok = $this->notificationService->markAsRead($request->user(), $notificationId);

        return response()->json([
            'success' => $ok,
            'message' => $ok ? 'Notifikasi ditandai dibaca.' : 'Notifikasi sudah dibaca atau tidak ditemukan.',
        ]);
    }

    /**
     * Mark all IN_APP notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $updated = NotificationRecipient::where('recipient_id', $request->user()->id)
            ->where('channel', 'IN_APP')
            ->whereNull('deleted_at')
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => Carbon::now()]);

        return response()->json(['success' => true, 'count' => $updated]);
    }

    /**
     * Soft-delete a notification recipient row (must be read first).
     */
    public function destroy(Request $request, int $notificationId): JsonResponse
    {
        $ok = $this->notificationService->deleteIfRead($request->user(), $notificationId);

        if (!$ok) {
            // Distinguish: not found vs unread
            $exists = NotificationRecipient::where('recipient_id', $request->user()->id)
                ->where('notification_id', $notificationId)
                ->whereNull('deleted_at')
                ->exists();

            if (!$exists) {
                return response()->json(['success' => false, 'message' => 'Notifikasi tidak ditemukan.'], 404);
            }

            return response()->json([
                'success' => false,
                'message' => 'Tandai notifikasi sebagai dibaca sebelum menghapus.',
                'reason'  => 'UNREAD_NOT_DELETABLE',
            ], 422);
        }

        return response()->json(['success' => true, 'message' => 'Notifikasi dihapus.']);
    }
}
