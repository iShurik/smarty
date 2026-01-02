<?php

namespace App\Jobs;

use App\Models\Donation;
use App\Models\DonationEvent;
use App\Services\Overlay\DonationOverlayPayloadService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DonationBroadcastJob implements ShouldQueue
{
  use Dispatchable;
  use InteractsWithQueue;
  use Queueable;
  use SerializesModels;

  public function __construct(public int $donationId)
  {
    $this->onQueue((string) config('overlay.queue', 'notifications'));
  }

  public function handle(DonationOverlayPayloadService $payloadService): void
  {
    $donation = Donation::query()
      ->with(['donor', 'ttsAudio', 'youtubeCache', 'memeClip.file', 'goal'])
      ->find($this->donationId);

    if (! $donation) {
      return;
    }

    if ($donation->status !== Donation::STATUS_PAID) {
      return;
    }

    if ($donation->voice_id !== null && ! $donation->tts_audio_file_id) {
      return;
    }

    $alreadyBroadcasted = $donation->events()
      ->where('type', DonationEvent::TYPE_BROADCASTED)
      ->exists();

    if ($alreadyBroadcasted) {
      return;
    }

    $payload = $payloadService->make($donation);

    DonationEvent::create([
      'donation_id' => $donation->id,
      'type' => DonationEvent::TYPE_BROADCASTED,
      'payload_json' => $payload,
      'created_at' => now(),
    ]);
  }
}
