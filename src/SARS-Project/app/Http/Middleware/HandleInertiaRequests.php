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
                'notifications' => $request->user() ? \Illuminate\Support\Facades\DB::table('notification_recipients')
                    ->join('notifications', 'notification_recipients.notification_id', '=', 'notifications.id')
                    ->where('notification_recipients.recipient_id', $request->user()->id)
                    ->where('notification_recipients.channel', 'IN_APP')
                    ->orderBy('notifications.id', 'desc')
                    ->select(
                        'notifications.id',
                        'notifications.title as judul',
                        'notifications.body as pesan',
                        'notifications.created_at',
                        'notifications.type as tipe',
                        'notification_recipients.is_read as dibaca'
                    )
                    ->limit(50)
                    ->get()
                    ->map(function ($n) {
                        $createdAt = \Carbon\Carbon::parse($n->created_at);
                        $tipeMap = [
                            'STATUS_CHANGE'  => 'jadwal',
                            'CONFLICT_ALERT' => 'validasi',
                            'SYSTEM'         => 'sistem',
                            'REMINDER'       => 'info',
                        ];
                        return [
                            'id' => (string)$n->id,
                            'judul' => $n->judul,
                            'pesan' => $n->pesan,
                            'waktu' => $createdAt->diffForHumans(),
                            'tipe' => $tipeMap[$n->tipe] ?? 'info',
                            'dibaca' => (bool)$n->dibaca,
                        ];
                    })->toArray() : [],
            ],
            'unreadCount' => $request->user()
                ? \App\Models\NotificationRecipient::where('recipient_id', $request->user()->id)
                    ->where('is_read', false)
                    ->count()
                : 0,
            'notifikasi' => $request->user()
                ? \App\Models\NotificationRecipient::where('recipient_id', $request->user()->id)
                    ->where('channel', 'IN_APP')
                    ->with('notification')
                    ->orderByDesc('notification_id')
                    ->limit(10)
                    ->get()
                    ->map(fn ($nr) => [
                        'id'     => (string) $nr->notification_id,
                        'judul'  => $nr->notification->title,
                        'pesan'  => $nr->notification->body,
                        'waktu'  => $nr->notification->created_at->diffForHumans(),
                        'dibaca' => (bool) $nr->is_read,
                        'tipe'   => strtolower($nr->notification->type) === 'status_change' ? 'jadwal'
                                  : (strtolower($nr->notification->type) === 'conflict_alert' ? 'validasi' : 'info'),
                    ])->values()->toArray()
                : [],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'pendingAdminCount' => $request->user() && in_array('admin', $request->user()->roles()->pluck('slug')->toArray())
                ? \App\Models\ChangeRequest::where('status', 'PENDING_ADMIN')->count()
                : 0,
            'serverTime' => now()->timestamp * 1000,
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
