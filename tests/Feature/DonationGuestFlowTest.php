<?php

namespace Tests\Feature;

use App\Jobs\TtsGenerateJob;
use App\Models\Donation;
use App\Models\DonationEvent;
use App\Models\Goal;
use App\Models\MediaFile;
use App\Models\MemeClip;
use App\Models\Payment;
use App\Models\PaymentProvider;
use App\Models\StreamerProfile;
use App\Models\Tag;
use App\Models\TtsVoice;
use App\Models\User;
use App\Models\YoutubeVideoCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DonationGuestFlowTest extends TestCase
{
  use RefreshDatabase;

  public function test_guest_donation_with_tts_youtube_meme_goal_and_overlay_ack(): void
  {
    config(['queue.default' => 'sync']);
    config(['tts.disk' => 'public']);
    Storage::fake('public');

    PaymentProvider::create([
      'code' => 'mockpay',
      'title' => 'MockPay',
      'is_active' => true,
    ]);

    $streamerUser = User::factory()->create();
    $streamer = StreamerProfile::create([
      'user_id' => $streamerUser->id,
      'display_name' => 'Streamer One',
      'country_code' => 'UA',
      'about' => 'Test streamer',
      'donation_page_slug' => 'streamer-one',
      'overlay_token' => 'overlay-secret',
      'min_donation_amount' => 1,
    ]);

    $goal = Goal::create([
      'streamer_id' => $streamer->id,
      'title' => 'New mic',
      'description' => 'Upgrade audio',
      'target_amount' => 100,
      'current_amount' => 0,
      'currency' => 'USD',
      'starts_at' => now()->subDay(),
      'ends_at' => now()->addDay(),
      'is_active' => true,
    ]);

    $voice = TtsVoice::create([
      'provider' => 'mock',
      'code' => 'mock-ru-1',
      'name' => 'Mock RU',
      'lang' => 'ru',
      'gender' => null,
      'is_active' => true,
    ]);

    $memeMedia = MediaFile::create([
      'type' => 'meme_video',
      'disk' => 'public',
      'path' => 'memes/test.mp4',
      'mime_type' => 'video/mp4',
      'size_bytes' => 1234,
      'meta_json' => null,
    ]);

    $memeTag = Tag::create([
      'type' => 'meme',
      'name' => 'funny',
    ]);

    $memeClip = MemeClip::create([
      'title' => 'Test meme',
      'file_id' => $memeMedia->id,
      'duration_sec' => 5,
      'status' => MemeClip::STATUS_APPROVED,
      'suggested_by_user_id' => null,
      'moderated_by_user_id' => null,
      'moderation_comment' => null,
    ]);

    $memeClip->tags()->attach($memeTag->id);

    $youtubeId = 'dQw4w9WgXcQ';
    YoutubeVideoCache::create([
      'youtube_id' => $youtubeId,
      'title' => 'Test video',
      'channel_title' => 'Channel',
      'views' => 2500,
      'duration_sec' => 120,
      'region_blocked_json' => [],
      'last_checked_at' => now(),
    ]);

    $response = $this->postJson('/api/v1/donations', [
      'streamer_slug' => $streamer->donation_page_slug,
      'donor_name' => 'Guest',
      'amount' => 10,
      'message_text' => 'Hello, this is a test donation!',
      'voice_id' => $voice->id,
      'youtube_url' => 'https://www.youtube.com/watch?v=' . $youtubeId,
      'meme_clip_id' => $memeClip->id,
      'goal_id' => $goal->id,
    ]);

    $response->assertStatus(201);

    $donationId = (int) $response->json('data.id');
    $paymentId = (int) $response->json('payment.id');

    $donation = Donation::query()->findOrFail($donationId);
    $this->assertNull($donation->donor_user_id);
    $this->assertSame(Donation::STATUS_PENDING_PAYMENT, $donation->status);

    $payment = Payment::query()->findOrFail($paymentId);

    $webhook = $this->postJson('/api/v1/payments/mock/webhook', [
      'provider_payment_id' => $payment->provider_payment_id,
      'status' => Payment::STATUS_SUCCEEDED,
    ]);

    $webhook->assertOk();

    TtsGenerateJob::dispatchSync($donationId);

    $donation->refresh();
    $goal->refresh();

    $this->assertSame(Donation::STATUS_PAID, $donation->status);
    $this->assertNotNull($donation->tts_audio_file_id);
    $this->assertSame('10.00', (string) $goal->current_amount);

    $events = DonationEvent::query()
      ->where('donation_id', $donationId)
      ->pluck('type')
      ->all();

    $this->assertContains(DonationEvent::TYPE_CREATED, $events);
    $this->assertContains(DonationEvent::TYPE_PAID, $events);
    $this->assertContains(DonationEvent::TYPE_TTS_READY, $events);
    $this->assertContains(DonationEvent::TYPE_BROADCASTED, $events);

    $broadcasted = DonationEvent::query()
      ->where('donation_id', $donationId)
      ->where('type', DonationEvent::TYPE_BROADCASTED)
      ->firstOrFail();

    $payload = $broadcasted->payload_json;
    $this->assertIsArray($payload);
    $this->assertSame($donationId, $payload['donation_id'] ?? null);
    $this->assertArrayHasKey('tts_audio_url', $payload);
    $this->assertArrayHasKey('youtube_url', $payload);
    $this->assertArrayHasKey('meme_clip_url', $payload);
    $this->assertArrayHasKey('goal_progress', $payload);

    $ack = $this->postJson('/api/v1/overlay/streamer/' . $streamer->donation_page_slug . '/ack', [
      'donation_id' => $donationId,
    ], [
      'X-Overlay-Token' => 'overlay-secret',
    ]);

    $ack->assertOk();

    $donation->refresh();
    $this->assertSame(Donation::STATUS_PLAYED, $donation->status);
    $this->assertTrue(DonationEvent::query()
      ->where('donation_id', $donationId)
      ->where('type', DonationEvent::TYPE_PLAYED)
      ->exists());
  }
}
