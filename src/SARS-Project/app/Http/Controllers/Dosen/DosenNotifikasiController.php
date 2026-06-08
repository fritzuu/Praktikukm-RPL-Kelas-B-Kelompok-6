<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\NotificationRecipient;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DosenNotifikasiController extends Controller
{
    /**
     * Display the notification page with real data from DB.
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $notifikasi = $this->getNotifikasi($userId);

        return Inertia::render('Dosen/Notifikasi', [
            'notifikasi' => $notifikasi,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, int $notificationId): JsonResponse
    {
        $updated = NotificationRecipient::where('recipient_id', $request->user()->id)
            ->where('notification_id', $notificationId)
            ->where('channel', 'IN_APP')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => Carbon::now(),
            ]);

        return response()->json([
            'success' => $updated > 0,
            'message' => $updated > 0 ? 'Notifikasi ditandai dibaca.' : 'Notifikasi sudah dibaca atau tidak ditemukan.',
        ]);
    }

    /**
     * Mark all notifications as read for the current user.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $updated = NotificationRecipient::where('recipient_id', $request->user()->id)
            ->where('channel', 'IN_APP')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => Carbon::now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => "{$updated} notifikasi ditandai dibaca.",
            'count'   => $updated,
        ]);
    }

    /**
     * Delete a notification recipient record (soft-delete, only allowed when already read).
     */
    public function destroy(Request $request, int $notificationId): JsonResponse
    {
        $recipient = NotificationRecipient::where('recipient_id', $request->user()->id)
            ->where('notification_id', $notificationId)
            ->where('channel', 'IN_APP')
            ->whereNull('deleted_at')
            ->first();

        if (!$recipient) {
            return response()->json(['success' => false, 'message' => 'Notifikasi tidak ditemukan.'], 404);
        }

        if (!$recipient->is_read) {
            return response()->json([
                'success' => false,
                'message' => 'Tandai notifikasi sebagai dibaca sebelum menghapus.',
                'reason'  => 'UNREAD_NOT_DELETABLE',
            ], 422);
        }

        $recipient->delete(); // soft delete via SoftDeletes trait

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi dihapus.',
        ]);
    }

    /**
     * Fetch notifications for a given user, formatted for frontend.
     */
    private function getNotifikasi(int $userId): array
    {
        return NotificationRecipient::where('recipient_id', $userId)
            ->where('channel', 'IN_APP')
            ->with('notification')
            ->orderByDesc('notification_id')
            ->limit(50)
            ->get()
            ->map(function ($nr) {
                $notif = $nr->notification;
                $createdAt = $notif->created_at;

                // Map DB type to frontend type
                $tipeMap = [
                    'STATUS_CHANGE'  => 'jadwal',
                    'CONFLICT_ALERT' => 'jadwal',
                    'SYSTEM'         => 'sistem',
                    'REMINDER'       => 'info',
                ];

                return [
                    'id'      => (string) $notif->id,
                    'judul'   => $notif->title,
                    'pesan'   => $notif->body,
                    'waktu'   => $createdAt->diffForHumans(),
                    'tanggal' => $createdAt->translatedFormat('j F Y'),
                    'dibaca'  => $nr->is_read,
                    'tipe'    => $tipeMap[$notif->type] ?? 'info',
                ];
            })
            ->values()
            ->toArray();
    }
}
