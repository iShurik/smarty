<?php

namespace App\Http\Controllers\Streamer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Streamer\UpdateAllowedVoicesRequest;
use App\Http\Requests\Streamer\UpdateBannedMemeTagsRequest;
use App\Http\Requests\Streamer\UpdateBannedYoutubeVideosRequest;
use App\Models\StreamerProfile;
use App\Models\User;
use App\Services\StreamerRulesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StreamerRulesController extends Controller
{
  public function __construct(private readonly StreamerRulesService $rulesService)
  {
  }

  public function show(Request $request): JsonResponse
  {
    $profile = $this->resolveProfile($request->user());

    $profile->load(['allowedVoices', 'bannedMemeTags', 'bannedYoutubeVideos']);

    return response()->json(['data' => $this->transformRules($profile)]);
  }

  public function updateAllowedVoices(UpdateAllowedVoicesRequest $request): JsonResponse
  {
    $profile = $this->resolveProfile($request->user());

    DB::transaction(fn () => $this->rulesService->syncAllowedVoices($profile, $request->validated('voice_ids')));

    $profile->load('allowedVoices');

    return response()->json(['data' => $this->transformRules($profile)]);
  }

  public function updateBannedMemeTags(UpdateBannedMemeTagsRequest $request): JsonResponse
  {
    $profile = $this->resolveProfile($request->user());

    DB::transaction(fn () => $this->rulesService->syncBannedMemeTags($profile, $request->validated('tag_ids')));

    $profile->load('bannedMemeTags');

    return response()->json(['data' => $this->transformRules($profile)]);
  }

  public function updateBannedYoutubeVideos(UpdateBannedYoutubeVideosRequest $request): JsonResponse
  {
    $profile = $this->resolveProfile($request->user());

    DB::transaction(fn () => $this->rulesService->syncBannedYoutubeVideos($profile, $request->validated('youtube_ids')));

    $profile->load('bannedYoutubeVideos');

    return response()->json(['data' => $this->transformRules($profile)]);
  }

  private function resolveProfile(User $user): StreamerProfile
  {
    if (! $user->hasRole('streamer')) {
      abort(403, 'Доступно только для стримеров');
    }

    return $user->streamerProfile()->firstOrCreate([], [
      'display_name' => $user->name ?? 'Streamer',
      'country_code' => 'US',
      'donation_page_slug' => $this->generateUniqueSlug($user->name ?? 'streamer'),
      'min_donation_amount' => 0,
    ]);
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

  private function transformRules(StreamerProfile $profile): array
  {
    return [
      'allowed_voices' => $profile->allowedVoices->map(fn ($voice) => [
        'id' => $voice->id,
        'provider' => $voice->provider,
        'code' => $voice->code,
        'name' => $voice->name,
        'lang' => $voice->lang,
        'gender' => $voice->gender,
      ])->values(),
      'banned_meme_tags' => $profile->bannedMemeTags->map(fn ($tag) => [
        'id' => $tag->id,
        'name' => $tag->name,
      ])->values(),
      'banned_youtube_videos' => $profile->bannedYoutubeVideos->map(fn ($item) => [
        'youtube_id' => $item->youtube_id,
        'reason' => $item->reason,
      ])->values(),
    ];
  }
}