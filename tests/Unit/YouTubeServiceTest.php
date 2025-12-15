<?php

namespace Tests\Unit;

use App\Services\YouTubeService;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class YouTubeServiceTest extends TestCase
{
  #[Test]
  public function it_parses_various_youtube_urls(): void
  {
    $service = new YouTubeService();

    $this->assertSame('dQw4w9WgXcQ', $service->parseVideoId('dQw4w9WgXcQ'));
    $this->assertSame('dQw4w9WgXcQ', $service->parseVideoId('https://youtu.be/dQw4w9WgXcQ'));
    $this->assertSame('dQw4w9WgXcQ', $service->parseVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'));
    $this->assertSame('dQw4w9WgXcQ', $service->parseVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s'));
    $this->assertSame('dQw4w9WgXcQ', $service->parseVideoId('https://youtube.com/embed/dQw4w9WgXcQ?autoplay=1'));
    $this->assertSame('dQw4w9WgXcQ', $service->parseVideoId('https://youtube.com/shorts/dQw4w9WgXcQ'));
    $this->assertNull($service->parseVideoId('https://example.com/video/123'));
    $this->assertNull($service->parseVideoId('')); // empty input
  }

  #[Test]
  public function it_fetches_video_metadata(): void
  {
    config([
      'services.youtube.api_key' => 'test-key',
      'services.youtube.base_url' => 'https://youtube.googleapis.com/youtube/v3',
    ]);

    Http::fake([
      'https://youtube.googleapis.com/youtube/v3/videos*' => Http::response([
        'items' => [
          [
            'id' => 'dQw4w9WgXcQ',
            'snippet' => ['title' => 'Never Gonna Give You Up'],
            'contentDetails' => [
              'duration' => 'PT3M33S',
              'regionRestriction' => [
                'blocked' => ['DE', 'RU'],
              ],
            ],
            'statistics' => ['viewCount' => '123456789'],
          ],
        ],
      ]),
    ]);

    $service = new YouTubeService();

    $data = $service->fetchMetadata('dQw4w9WgXcQ');

    $duration = (int) $data['duration_sec'];

    $this->assertNotNull($data);
    $this->assertSame('Never Gonna Give You Up', $data['title']);
    $this->assertSame(123456789, $data['views']);
    $this->assertSame(213, $duration);
    $this->assertSame(['DE', 'RU'], $data['region_blocked']);
  }

  #[Test]
  public function it_returns_null_when_video_not_found(): void
  {
    config(['services.youtube.api_key' => 'test-key']);

    Http::fake([
      '*' => Http::response(['items' => []]),
    ]);

    $service = new YouTubeService();

    $this->assertNull($service->fetchMetadata('unknown')); 
  }

  #[Test]
  public function it_throws_when_api_key_missing(): void
  {
    config(['services.youtube.api_key' => '']);

    $service = new YouTubeService();

    $this->expectException(\RuntimeException::class);

    $service->fetchMetadata('dQw4w9WgXcQ');
  }
}