<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'nim_nip',
        'avatar_url',
        'fcm_token',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
        ];
    }

    /**
     * Roles belonging to this user (many-to-many via user_roles).
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot(['assigned_at', 'assigned_by']);
    }

    /**
     * Check if user has a specific role slug.
     */
    public function hasRole(string $slug): bool
    {
        return $this->roles()->where('slug', $slug)->exists();
    }

    /**
     * Get the primary role slug for redirect logic.
     * Priority: admin > aslab > dosen > mahasiswa
     */
    public function primaryRole(): ?string
    {
        $priority = ['admin', 'aslab', 'dosen', 'mahasiswa'];

        $userSlugs = $this->roles()->pluck('slug')->toArray();

        foreach ($priority as $slug) {
            if (in_array($slug, $userSlugs)) {
                return $slug;
            }
        }

        return null;
    }

    /**
     * Teaching assignments for this user (as PENGAJAR or ASISTEN).
     */
    public function teachingAssignments(): HasMany
    {
        return $this->hasMany(TeachingAssignment::class);
    }

    /**
     * Notification recipients for this user.
     */
    public function notificationRecipients(): HasMany
    {
        return $this->hasMany(NotificationRecipient::class, 'recipient_id');
    }
}
