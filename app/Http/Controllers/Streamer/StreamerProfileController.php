<?php

namespace App\Http\Controllers\Streamer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Streamer\UpdateProfileRequest;
use App\Http\Resources\StreamerProfileResource;
use App\Models\StreamerProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StreamerProfileController extends Controller
{
    public function show(Request $request): StreamerProfileResource
    {
        $user = $request->user();

        $profile = $this->resolveProfile($user);

        return new StreamerProfileResource($profile);
    }

    public function update(UpdateProfileRequest $request): StreamerProfileResource
    {
        $profile = $this->resolveProfile($request->user());

        $profile->fill([
            'display_name' => $request->string('display_name')->toString(),
            'country_code' => strtoupper($request->string('country_code')->toString()),
            'donation_page_slug' => $request->string('slug')->toString(),
            'min_donation_amount' => $request->float('min_amount'),
        ]);

        $profile->save();

        return new StreamerProfileResource($profile);
    }

    private function resolveProfile(User $user): StreamerProfile
    {
        if (! $user->hasRole('streamer')) {
            abort(403, 'Доступно только для стримеров');
        }

        $profile = $user->streamerProfile()->firstOrCreate([], [
            'display_name' => $user->name ?? 'Streamer',
            'country_code' => 'US',
            'donation_page_slug' => $this->generateUniqueSlug($user->name ?? 'streamer'),
            'overlay_token' => $this->generateOverlayToken(),
            'min_donation_amount' => 0,
        ]);

        if (! $profile->overlay_token) {
            $profile->overlay_token = $this->generateOverlayToken();
            $profile->save();
        }

        return $profile;
    }

    private function generateUniqueSlug(string $base): string
    {
        $slug = Str::slug($base) ?: 'streamer';
        $originalSlug = $slug;
        $counter = 1;

        while (StreamerProfile::where('donation_page_slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    private function generateOverlayToken(): string
    {
        return Str::random(40);
    }
}
