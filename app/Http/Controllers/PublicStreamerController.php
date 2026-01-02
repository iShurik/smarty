<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\StreamerProfile;
use Illuminate\Http\JsonResponse;

class PublicStreamerController extends Controller
{
  public function show(string $slug): JsonResponse
  {
    $profile = StreamerProfile::query()
      ->where('donation_page_slug', $slug)
      ->firstOrFail();

    return response()->json([
      'data' => [
        'id' => $profile->id,
        'display_name' => $profile->display_name,
        'about' => $profile->about,
        'country_code' => $profile->country_code,
        'slug' => $profile->donation_page_slug,
        'min_amount' => $profile->min_donation_amount,
        'allowed_voice_ids' => $profile->allowedVoices()->pluck('tts_voices.id')->values(),
        'banned_meme_tag_ids' => $profile->bannedMemeTags()->pluck('tags.id')->values(),
        'goals' => $this->activeGoals($profile),
      ],
    ]);
  }

  private function activeGoals(StreamerProfile $profile): array
  {
    $now = now();

    return $profile->goals()
      ->where('is_active', true)
      ->where(function ($query) use ($now) {
        $query->whereNull('starts_at')
          ->orWhere('starts_at', '<=', $now);
      })
      ->where(function ($query) use ($now) {
        $query->whereNull('ends_at')
          ->orWhere('ends_at', '>=', $now);
      })
      ->orderByDesc('created_at')
      ->get()
      ->map(fn (Goal $goal) => $this->transformGoal($goal))
      ->values()
      ->all();
  }

  private function transformGoal(Goal $goal): array
  {
    return [
      'id' => $goal->id,
      'title' => $goal->title,
      'description' => $goal->description,
      'target_amount' => $goal->target_amount,
      'current_amount' => $goal->current_amount,
      'currency' => $goal->currency,
      'starts_at' => $goal->starts_at,
      'ends_at' => $goal->ends_at,
      'is_active' => $goal->is_active,
      'created_at' => $goal->created_at,
      'updated_at' => $goal->updated_at,
    ];
  }
}
