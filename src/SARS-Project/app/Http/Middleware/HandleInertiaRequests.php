<?php

namespace App\Http\Middleware;

use App\Models\ChangeRequest;
use App\Models\NotificationRecipient;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id'          => $user->id,
                    'name'        => $user->name,
                    'email'       => $user->email,
                    'nim_nip'     => $user->nim_nip,
                    'avatar_url'  => $user->avatar_url,
                    'roles'       => $user->roles()->pluck('slug')->toArray(),
                    'primaryRole' => $user->primaryRole(),
                ] : null,
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],

            // ── Shared: notification bell data ────────────────────────
            'notifications'            => fn () => $user ? $this->getNotifications($user->id) : [],
            'unreadNotificationsCount' => fn () => $user
                ? NotificationRecipient::where('recipient_id', $user->id)
                    ->where('channel', 'IN_APP')
                    ->where('is_read', false)
                    ->count()
                : 0,

            // ── Shared: admin pending count (for sidebar badge) ───────
            'pendingAdminCount' => fn () =>
                ($user && $user->primaryRole() === 'admin')
                    ? ChangeRequest::where('status', 'PENDING_ADMIN')->count()
                    : 0,
        ]);
    }

    /**
     * Fetch recent in-app notifications for the bell dropdown.
     */
    private function getNotifications(int $userId): array
    {
        return NotificationRecipient::where('recipient_id', $userId)
            ->where('channel', 'IN_APP')
            ->with('notification')
            ->orderByDesc('notification_id')
            ->limit(10)
            ->get()
            ->map(function ($nr) {
                $notif = $nr->notification;
                return [
                    'id'     => (string) $notif->id,
                    'judul'  => $notif->title,
                    'pesan'  => $notif->body,
                    'waktu'  => $notif->created_at->diffForHumans(),
                    'dibaca' => $nr->is_read,
                    'tipe'   => match ($notif->type) {
                        'STATUS_CHANGE', 'CONFLICT_ALERT' => 'jadwal',
                        'SYSTEM'                          => 'sistem',
                        default                           => 'info',
                    },
                ];
            })
            ->values()
            ->toArray();
    }
}
