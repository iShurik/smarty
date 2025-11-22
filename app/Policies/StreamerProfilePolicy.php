<?php

namespace App\Policies;

use App\Models\StreamerProfile;
use App\Models\User;

class StreamerProfilePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'moderator']);
    }

    public function view(User $user, StreamerProfile $profile): bool
    {
        return $this->isOwner($user, $profile) || $user->hasAnyRole(['admin', 'moderator']);
    }

    public function update(User $user, StreamerProfile $profile): bool
    {
        return $this->isOwner($user, $profile) || $user->hasAnyRole(['admin', 'moderator']);
    }

    public function delete(User $user, StreamerProfile $profile): bool
    {
        return $user->hasRole('admin');
    }

    private function isOwner(User $user, StreamerProfile $profile): bool
    {
        return $user->id === $profile->user_id;
    }
}