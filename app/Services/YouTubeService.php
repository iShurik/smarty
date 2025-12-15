<?php

namespace App\Services;

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
        'fields' => 'items(id,snippet/title,contentDetails/duration,contentDetails/regionRestriction,statistics/viewCount)',
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
      'views' => isset($item['statistics']['viewCount']) ? (int) $item['statistics']['viewCount'] : null,
      'duration_sec' => $duration ? CarbonInterval::make($duration)->totalSeconds : null,
      'region_blocked' => array_values($regionRestriction['blocked'] ?? []),
    ];
  }
}