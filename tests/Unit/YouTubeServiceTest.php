<?php

namespace Tests\Unit;

use App\Models\StreamerBannedYoutubeVideo;
use App\Models\StreamerProfile;
use App\Services\YouTubeService;
use App\Models\YoutubeVideoCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class YouTubeServiceTest extends TestCase
{
  use RefreshDatabase;

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
            'snippet' => [
              'title' => 'Never Gonna Give You Up',
              'channelTitle' => 'RickAstleyVEVO',
            ],
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
    $this->assertSame('RickAstleyVEVO', $data['channel_title']);
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
  
  #[Test]
  public function it_returns_cached_video_when_fresh(): void
  {
    config([
      'services.youtube.api_key' => 'test-key',
      'services.youtube.cache_ttl_minutes' => 120,
    ]);

    $cached = YoutubeVideoCache::create([
      'youtube_id' => 'dQw4w9WgXcQ',
      'title' => 'Old title',
      'channel_title' => 'Cached channel',
      'views' => 42,
      'duration_sec' => 200,
      'region_blocked_json' => ['DE'],
      'last_checked_at' => Carbon::now()->subMinutes(15),
    ]);

    Http::fake();

    $service = new YouTubeService();

    $result = $service->getOrUpdate('dQw4w9WgXcQ');

    Http::assertNothingSent();
    $this->assertSame($cached->id, $result?->id);
  }

  #[Test]
  public function it_updates_cache_when_stale_or_missing(): void
  {
    config([
      'services.youtube.api_key' => 'test-key',
      'services.youtube.cache_ttl_minutes' => 30,
      'services.youtube.base_url' => 'https://youtube.googleapis.com/youtube/v3',
    ]);

    YoutubeVideoCache::create([
      'youtube_id' => 'dQw4w9WgXcQ',
      'title' => 'Very old title',
      'views' => 1,
      'last_checked_at' => Carbon::now()->subHours(2),
    ]);

    Http::fake([
      'https://youtube.googleapis.com/youtube/v3/videos*' => Http::response([
        'items' => [
          [
            'id' => 'dQw4w9WgXcQ',
            'snippet' => [
              'title' => 'New title',
              'channelTitle' => 'New channel',
            ],
            'contentDetails' => [
              'duration' => 'PT4M10S',
            ],
            'statistics' => [
              'viewCount' => '987',
            ],
          ],
        ],
      ]),
    ]);

    $service = new YouTubeService();

    $result = $service->getOrUpdate('dQw4w9WgXcQ');

    $this->assertSame('New title', $result?->title);
    $this->assertSame('New channel', $result?->channel_title);
    $this->assertSame(987, $result?->views);
    $this->assertSame(250, $result?->duration_sec);
    $this->assertNotNull($result?->last_checked_at);
  }

  #[Test]
  public function it_rejects_banned_video_for_streamer(): void
  {
    $streamer = StreamerProfile::create([
      'user_id' => \App\Models\User::factory()->create()->id,
      'display_name' => 'Streamer',
      'country_code' => 'UA',
      'donation_page_slug' => 'streamer',
      'min_donation_amount' => 0,
    ]);

    StreamerBannedYoutubeVideo::create([
      'streamer_id' => $streamer->id,
      'youtube_id' => 'dQw4w9WgXcQ',
      'reason' => 'ban',
    ]);

    $service = new YouTubeService();

    $result = $service->validateForStreamer($streamer, 'dQw4w9WgXcQ');

    $this->assertFalse($result['allowed']);
    $this->assertSame('banned', $result['reject_reason']);
    $this->assertFalse($result['country_warning']);
    $this->assertNull($result['video']);
  }

  #[Test]
  public function it_rejects_video_with_low_views(): void
  {
    config(['services.youtube.cache_ttl_minutes' => 120]);

    $streamer = StreamerProfile::create([
      'user_id' => \App\Models\User::factory()->create()->id,
      'display_name' => 'Streamer',
      'country_code' => 'UA',
      'donation_page_slug' => 'streamer-low',
      'min_donation_amount' => 0,
    ]);

    YoutubeVideoCache::create([
      'youtube_id' => 'dQw4w9WgXcQ',
      'title' => 'Test',
      'channel_title' => 'Channel',
      'views' => 999,
      'duration_sec' => 10,
      'region_blocked_json' => [],
      'last_checked_at' => Carbon::now(),
    ]);

    $service = new YouTubeService();

    $result = $service->validateForStreamer($streamer, 'dQw4w9WgXcQ');

    $this->assertFalse($result['allowed']);
    $this->assertSame('low_views', $result['reject_reason']);
    $this->assertFalse($result['country_warning']);
    $this->assertInstanceOf(YoutubeVideoCache::class, $result['video']);
  }

  #[Test]
  public function it_flags_country_warning_when_region_blocked(): void
  {
    config(['services.youtube.cache_ttl_minutes' => 120]);

    $streamer = StreamerProfile::create([
      'user_id' => \App\Models\User::factory()->create()->id,
      'display_name' => 'Streamer',
      'country_code' => 'UA',
      'donation_page_slug' => 'streamer-ua',
      'min_donation_amount' => 0,
    ]);

    YoutubeVideoCache::create([
      'youtube_id' => 'dQw4w9WgXcQ',
      'title' => 'Test',
      'channel_title' => 'Channel',
      'views' => 1000,
      'duration_sec' => 10,
      'region_blocked_json' => ['UA', 'DE'],
      'last_checked_at' => Carbon::now(),
    ]);

    $service = new YouTubeService();

    $result = $service->validateForStreamer($streamer, 'dQw4w9WgXcQ');

    $this->assertTrue($result['allowed']);
    $this->assertNull($result['reject_reason']);
    $this->assertTrue($result['country_warning']);
    $this->assertInstanceOf(YoutubeVideoCache::class, $result['video']);
  }
}
