<?php

namespace App\Services\Overlay;

use App\Models\Donation;
use App\Models\DonationEvent;
use App\Models\StreamerProfile;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OverlayStreamService
{
  public function __construct(private DonationOverlayPayloadService $payloadService)
  {
  }

  public function authorizeStreamer(string $slug, ?string $token): StreamerProfile
  {
    $profile = StreamerProfile::query()
      ->where('donation_page_slug', $slug)
      ->firstOrFail();

    if (! $token || ! $profile->overlay_token || ! hash_equals($profile->overlay_token, $token)) {
      abort(403, 'Invalid overlay token.');
    }

    return $profile;
  }

  public function stream(StreamerProfile $profile): StreamedResponse
  {
    $maxSeconds = (int) config('overlay.sse.max_seconds', 60);
    $sleepUs = (int) config('overlay.sse.sleep_us', 500000);
    $heartbeatSeconds = (int) config('overlay.sse.heartbeat_seconds', 10);

    return response()->stream(function () use ($profile, $maxSeconds, $sleepUs, $heartbeatSeconds) {
      $deadline = microtime(true) + $maxSeconds;
      $lastHeartbeat = microtime(true);

      while (ob_get_level() > 0) {
        ob_end_flush();
      }

      echo "retry: 3000\n\n";
      flush();

      while (microtime(true) < $deadline) {
        if (connection_aborted()) {
          break;
        }

    $payload = $this->claimNextDonationPayload($profile->id);

        if ($payload) {
          $this->sendEvent('donation', $payload);
          continue;
        }

        if (microtime(true) - $lastHeartbeat >= $heartbeatSeconds) {
          $this->sendEvent('heartbeat', ['ts' => now()->toISOString()]);
          $lastHeartbeat = microtime(true);
        }

        usleep($sleepUs);
      }
    }, 200, [
      'Content-Type' => 'text/event-stream',
      'Cache-Control' => 'no-cache, no-store',
      'Connection' => 'keep-alive',
      'X-Accel-Buffering' => 'no',
    ]);
  }

  private function claimNextDonationPayload(int $streamerId): ?array
  {
    return DB::transaction(function () use ($streamerId): ?array {
      $event = DonationEvent::query()
        ->with('donation')
        ->where('type', DonationEvent::TYPE_BROADCASTED)
        ->whereHas('donation', function ($query) use ($streamerId) {
          $query->where('streamer_id', $streamerId);
        })
        ->whereDoesntHave('donation.events', function ($query) {
          $query->where('type', DonationEvent::TYPE_PLAYED);
        })
        ->orderBy('id')
        ->lockForUpdate()
        ->first();

      if (! $event || ! $event->donation) {
        return null;
      }

      if ($event->donation->status !== Donation::STATUS_PAID) {
        return null;
      }

      $payload = $event->payload_json;

      if (! is_array($payload) || $payload === []) {
        $payload = $this->payloadService->make($event->donation);
      }

      DonationEvent::create([
        'donation_id' => $event->donation_id,
        'type' => DonationEvent::TYPE_PLAYED,
        'payload_json' => null,
        'created_at' => now(),
      ]);

      return $payload;
    });
  }

  private function sendEvent(string $event, array $payload): void
  {
    echo 'event: '.$event."\n";
    echo 'data: '.json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)."\n\n";
    flush();
  }
}
