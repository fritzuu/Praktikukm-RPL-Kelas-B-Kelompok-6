<?php

namespace App\Http\Middleware;

use App\Models\ChangeRequest;
use App\Services\Notifications\NotificationService;
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

        // Eager-load roles once per request so all hasRole/primaryRole calls use the cache
        if ($user) {
            $user->loadMissing('roles');
        }

        // Notifications for the bell dropdown:
        // - Unread OR created within last 7 days
        // - Soft-deleted recipients excluded
        // - Capped at 10 for the dropdown
        $notifications = [];
        $unreadCount = 0;

        if ($user) {
            /** @var NotificationService $notifService */
            $notifService = app(NotificationService::class);
            $notifications = $notifService->getRecentActivity($user, 10, 'IN_APP');
            $unreadCount   = \App\Models\NotificationRecipient::where('recipient_id', $user->id)
                ->where('channel', 'IN_APP')
                ->whereNull('deleted_at')
                ->where('is_read', false)
                ->count();
        }

        $userRoles = $user ? $user->roles()->pluck('slug')->toArray() : [];

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id'          => $user->id,
                    'name'        => $user->name,
                    'email'       => $user->email,
                    'nim_nip'     => $user->nim_nip,
                    'avatar_url'  => $user->avatar_url,
                    'roles'       => $userRoles,
                    'primaryRole' => $user->primaryRole(),
                ] : null,
                'notifications' => $notifications,
            ],
            // Single source of truth — same data, available at top level for
            // components that read props.notifikasi (Mahasiswa TopBar)
            'notifikasi'   => $notifications,
            'unreadCount'  => $unreadCount,
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'pendingAdminCount' => $user && in_array('admin', $userRoles)
                ? ChangeRequest::where('status', 'PENDING_ADMIN')->count()
                : 0,
            'pendingAslabCount' => $user && in_array('aslab', $userRoles)
                ? ChangeRequest::where('status', 'PENDING_ASLAB')->count()
                : 0,
            'serverTime' => now()->timestamp * 1000,
        ]);
    }
}
