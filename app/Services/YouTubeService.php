<?php

namespace App\Services;

use App\Models\StreamerProfile;
use App\Models\YoutubeVideoCache;
use Carbon\CarbonInterval;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class YouTubeService
{
  private string $apiKey;

  private string $baseUrl;

  public function __construct()
  {
    $this->apiKey = (string) config('services.youtube.api_key');
    $this->baseUrl = rtrim((string) config('services.youtube.base_url', 'https://www.googleapis.com/youtube/v3'), '/');
  }

  public function parseVideoId(string $value): ?string
  {
    $value = trim($value);

    if ($value === '') {
      return null;
    }

    if (preg_match('/^[\w-]{11}$/', $value)) {
      return $value;
    }

    $parts = parse_url($value);

    if (! is_array($parts)) {
      return null;
    }

    $host = $parts['host'] ?? '';
    $path = $parts['path'] ?? '';

    parse_str($parts['query'] ?? '', $query);

    if (isset($query['v']) && preg_match('/^[\w-]{11}$/', (string) $query['v'])) {
      return (string) $query['v'];
    }

    $segments = array_values(array_filter(explode('/', $path)));

    if (count($segments) >= 2 && in_array($segments[0], ['embed', 'shorts', 'live'], true)) {
      $candidate = $segments[1];

      if (preg_match('/^[\w-]{11}$/', $candidate)) {
        return $candidate;
      }
    }

    if (str_contains($host, 'youtu.be') && isset($segments[0]) && preg_match('/^[\w-]{11}$/', $segments[0])) {
      return $segments[0];
    }

    return null;
  }

  public function fetchMetadata(string $videoId): ?array
  {
    if ($this->apiKey === '') {
      throw new RuntimeException('YouTube API key is not configured.');
    }

    $response = Http::baseUrl($this->baseUrl)
      ->get('/videos', [
        'id' => $videoId,
        'part' => 'snippet,contentDetails,statistics',
        'fields' => 'items(id,snippet/title,snippet/channelTitle,contentDetails/duration,contentDetails/regionRestriction,statistics/viewCount)',
        'key' => $this->apiKey,
      ]);

    $response->throw();

    $item = $response->json('items.0');

    if (! $item) {
      return null;
    }

    $duration = (string) ($item['contentDetails']['duration'] ?? '');
    $regionRestriction = $item['contentDetails']['regionRestriction'] ?? [];

    return [
      'youtube_id' => $videoId,
      'title' => $item['snippet']['title'] ?? null,
      'channel_title' => $item['snippet']['channelTitle'] ?? null,
      'views' => isset($item['statistics']['viewCount']) ? (int) $item['statistics']['viewCount'] : null,
      'duration_sec' => $duration ? (int) CarbonInterval::make($duration)->totalSeconds : null,
      'region_blocked' => array_values($regionRestriction['blocked'] ?? []),
    ];
  }
  
  public function getOrUpdate(string $videoId): ?YoutubeVideoCache
  {
    $cacheTtlMinutes = (int) config('services.youtube.cache_ttl_minutes', 60);

    $cached = YoutubeVideoCache::where('youtube_id', $videoId)->first();

    if ($cached && $cached->last_checked_at && $cached->last_checked_at->gt(now()->subMinutes($cacheTtlMinutes))) {
      return $cached;
    }

    $metadata = $this->fetchMetadata($videoId);

    if ($metadata === null) {
      return $cached;
    }

    return YoutubeVideoCache::updateOrCreate(
      ['youtube_id' => $videoId],
      [
        'title' => $metadata['title'] ?? null,
        'channel_title' => $metadata['channel_title'] ?? null,
        'views' => $metadata['views'] ?? null,
        'duration_sec' => $metadata['duration_sec'] ?? null,
        'region_blocked_json' => $metadata['region_blocked'] ?? [],
        'last_checked_at' => now(),
      ],
    );
  }

  public function validateForStreamer(StreamerProfile $streamer, string $videoId): array
  {
    $videoId = trim($videoId);

    if ($videoId === '') {
      return [
        'allowed' => false,
        'reject_reason' => 'invalid_id',
        'country_warning' => false,
        'video' => null,
      ];
    }

    $isBanned = $streamer->bannedYoutubeVideos()
      ->where('youtube_id', $videoId)
      ->exists();

    if ($isBanned) {
      return [
        'allowed' => false,
        'reject_reason' => 'banned',
        'country_warning' => false,
        'video' => null,
      ];
    }

    $video = $this->getOrUpdate($videoId);

    if (! $video) {
      return [
        'allowed' => false,
        'reject_reason' => 'not_found',
        'country_warning' => false,
        'video' => null,
      ];
    }

    if (($video->views ?? 0) < 1000) {
      return [
        'allowed' => false,
        'reject_reason' => 'low_views',
        'country_warning' => false,
        'video' => $video,
      ];
    }

    $countryWarning = $this->isRegionBlocked($video, $streamer->country_code);

    return [
      'allowed' => true,
      'reject_reason' => null,
      'country_warning' => $countryWarning,
      'video' => $video,
    ];
  }

  private function isRegionBlocked(YoutubeVideoCache $video, ?string $countryCode): bool
  {
    $countryCode = strtoupper(trim((string) $countryCode));

    if ($countryCode === '') {
      return false;
    }

    $blocked = $video->region_blocked_json ?? [];

    if (! is_array($blocked)) {
      return false;
    }

    $blockedUpper = array_map(
      static fn (string $code): string => strtoupper($code),
      array_filter($blocked, static fn ($code): bool => is_string($code) && $code !== '')
    );

    return in_array($countryCode, $blockedUpper, true);
  }
}
