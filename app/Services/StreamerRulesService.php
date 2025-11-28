<?php

namespace App\Services;

use App\Models\StreamerProfile;
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