<?php

namespace App\Services;

use App\Models\MemeClip;
use App\Models\StreamerProfile;
use App\Models\TtsVoice;
use Illuminate\Support\Collection;

class StreamerRulesService
{
  public function syncAllowedVoices(StreamerProfile $streamer, array $voiceIds): void
  {
    $streamer->allowedVoices()->sync($voiceIds);
  }

  public function syncBannedMemeTags(StreamerProfile $streamer, array $tagIds): void
  {
    $streamer->bannedMemeTags()->sync($tagIds);
  }

  public function syncBannedYoutubeVideos(StreamerProfile $streamer, array $youtubeIds): void
  {
    $uniqueIds = $this->normalizeYoutubeIds($youtubeIds);

    $streamer->bannedYoutubeVideos()
      ->whereNotIn('youtube_id', $uniqueIds)
      ->delete();

    $existing = $streamer->bannedYoutubeVideos()->pluck('youtube_id')->all();
    $newItems = array_diff($uniqueIds, $existing);

    foreach ($newItems as $youtubeId) {
      $streamer->bannedYoutubeVideos()->create([
        'youtube_id' => $youtubeId,
      ]);
    }
  }

  public function validateDonationRules(StreamerProfile $streamer, ?TtsVoice $voice, ?MemeClip $memeClip): array
  {
    if ($voice) {
      $hasVoiceRules = $streamer->allowedVoices()->exists();

      if ($hasVoiceRules) {
        $allowed = $streamer->allowedVoices()->whereKey($voice->id)->exists();

        if (! $allowed) {
          return [
            'allowed' => false,
            'reject_reason' => 'voice_not_allowed',
            'field' => 'voice_id',
          ];
        }
      }
    }

    if ($memeClip) {
      $memeClip->loadMissing('tags');
      $bannedTagIds = $streamer->bannedMemeTags()->pluck('tags.id')->all();

      if (! empty($bannedTagIds)) {
        $hasBannedTag = $memeClip->tags->pluck('id')->intersect($bannedTagIds)->isNotEmpty();

        if ($hasBannedTag) {
          return [
            'allowed' => false,
            'reject_reason' => 'banned_meme_tag',
            'field' => 'meme_clip_id',
          ];
        }
      }
    }

    return [
      'allowed' => true,
      'reject_reason' => null,
      'field' => null,
    ];
  }

  private function normalizeYoutubeIds(array $youtubeIds): array
  {
    return Collection::make($youtubeIds)
      ->filter()
      ->map(fn (string $id): string => trim($id))
      ->filter()
      ->unique()
      ->values()
      ->all();
  }
}
