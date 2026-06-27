<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Models\ChangeRequest;
use App\Models\NotificationRecipient;
use App\Services\Notifications\NotificationDetailBuilder;
use App\Services\Notifications\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationCenterController extends Controller
{
    public function index(Request $request, NotificationService $service): Response
    {
        $user = $request->user();

        return Inertia::render('Shared/NotificationPage', [
            'notifications' => $service->getArchive($user, 200),
            'unreadCount'   => NotificationRecipient::query()
                ->where('recipient_id', $user->id)
                ->where('channel', 'IN_APP')
                ->whereNull('deleted_at')
                ->where('is_read', false)
                ->count(),
        ]);
    }

    public function markAsRead(Request $request, NotificationService $service, int $notificationId): JsonResponse
    {
        $ok = $service->markAsRead($request->user(), $notificationId, 'IN_APP');

        return response()->json(['success' => $ok]);
    }

    public function markAllAsRead(Request $request)
    {
        $updated = NotificationRecipient::where('recipient_id', $request->user()->id)
            ->where('channel', 'IN_APP')
            ->whereNull('deleted_at')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => Carbon::now('Asia/Jakarta'),
            ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'count'   => $updated,
            ]);
        }

        return back();
    }

    public function delete(Request $request, NotificationService $service, int $notificationId): JsonResponse
    {
        $ok = $service->deleteIfRead($request->user(), $notificationId, 'IN_APP');

        return response()->json([
            'success' => $ok,
            'reason'  => $ok ? null : 'UNREAD_NOT_DELETABLE',
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

        $payload = $builder->build($nr->notification, $nr);

        // Auto mark as read when detail is opened
        if (!$nr->is_read) {
            app(NotificationService::class)->markAsRead($user, $notificationId, 'IN_APP');
        }

        return response()->json([
            'success'      => true,
            'notification' => $payload,
        ]);
    }

    /**
     * Fetch the full notification archive for the authenticated user.
     * Used by NotificationListPage to refresh its list without Inertia router.reload().
     * Safe for all roles — only requires `auth` middleware.
     *
     * Response: { notifications: array }  (same shape as NotificationService::getArchive)
     */
    public function list(Request $request, NotificationService $service): JsonResponse
    {
        $notifications = $service->getArchive($request->user(), 200, 'IN_APP');
        return response()->json(['notifications' => $notifications]);
    }

    /**
     * Lightweight polling endpoint — called every 30 s by any authenticated layout.
     *
     * Returns badge counts, bell dropdown items, AND fingerprints of mutable
     * data sets so the frontend can detect when page content needs a reload.
     *
     * Fingerprints are cheap integer hashes derived from counts + latest IDs.
     * When a fingerprint changes, the frontend dispatches a targeted reload event
     * so only the currently active page re-fetches its own Inertia props.
     *
     * Response shape:
     * {
     *   unreadCount:        int,
     *   pendingAslabCount:  int,
     *   pendingAdminCount:  int,
     *   notifications:      array,
     *   fingerprints: {
     *     pendingAslab:   string,   // hash for AslabValidation page
     *     pendingAdmin:   string,   // hash for AdminPersetujuan page
     *     notifications:  string,   // hash for Notifikasi page (any role)
     *   }
     * }
     */
    public function poll(Request $request, NotificationService $service): JsonResponse
    {
        $user      = $request->user();
        $userRoles = $user->roles()->pluck('slug')->toArray();

        $unreadCount = NotificationRecipient::where('recipient_id', $user->id)
            ->where('channel', 'IN_APP')
            ->whereNull('deleted_at')
            ->where('is_read', false)
            ->count();

        $notifications = $service->getRecentActivity($user, 10, 'IN_APP');

        $pendingAslabCount = 0;
        $pendingAdminCount = 0;

        // ── Fingerprints ────────────────────────────────────────────────────
        // Each fingerprint encodes count + latest record ID so it changes
        // whenever a row is added or removed — not just when counts change.
        $fingerprints = [];

        if (in_array('aslab', $userRoles)) {
            $pendingAslabCount = ChangeRequest::where('status', 'PENDING_ASLAB')->count();
            $latestAslab = ChangeRequest::where('status', 'PENDING_ASLAB')
                ->orderByDesc('id')->value('id') ?? 0;
            $fingerprints['pendingAslab'] = "{$pendingAslabCount}:{$latestAslab}";
        }

        if (in_array('admin', $userRoles)) {
            $pendingAdminCount = ChangeRequest::where('status', 'PENDING_ADMIN')->count();
            $latestAdmin = ChangeRequest::where('status', 'PENDING_ADMIN')
                ->orderByDesc('id')->value('id') ?? 0;
            $fingerprints['pendingAdmin'] = "{$pendingAdminCount}:{$latestAdmin}";
        }

        // Notification fingerprint for all roles — count + latest notification ID
        $latestNotifId = NotificationRecipient::where('recipient_id', $user->id)
            ->where('channel', 'IN_APP')
            ->whereNull('deleted_at')
            ->orderByDesc('notification_id')
            ->value('notification_id') ?? 0;
        $fingerprints['notifications'] = "{$unreadCount}:{$latestNotifId}";

        // Mahasiswa request fingerprint — detects status changes on the user's own requests.
        // Encodes: count of active requests + latest updated_at timestamp of the most recently
        // changed request. Changes whenever admin/aslab approves or rejects a request.
        if (in_array('mahasiswa', $userRoles)) {
            $latestRequest = \App\Models\ChangeRequest::where('requester_id', $user->id)
                ->orderByDesc('updated_at')
                ->first(['id', 'status', 'updated_at']);
            $myRequestsHash = $latestRequest
                ? "{$latestRequest->id}:{$latestRequest->status}:{$latestRequest->updated_at?->timestamp}"
                : '0';
            $fingerprints['myRequests'] = $myRequestsHash;
        }

        return response()->json([
            'unreadCount'       => $unreadCount,
            'pendingAslabCount' => $pendingAslabCount,
            'pendingAdminCount' => $pendingAdminCount,
            'notifications'     => $notifications,
            'fingerprints'      => $fingerprints,
        ]);
    }
}
