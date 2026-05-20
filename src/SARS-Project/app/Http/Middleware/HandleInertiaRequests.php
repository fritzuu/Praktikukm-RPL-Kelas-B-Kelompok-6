<?php

namespace App\Http\Middleware;

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
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id'          => $request->user()->id,
                    'name'        => $request->user()->name,
                    'email'       => $request->user()->email,
                    'roles'       => $request->user()->roles()->pluck('slug')->toArray(),
                    'primaryRole' => $request->user()->primaryRole(),
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
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ]);
    }
}
