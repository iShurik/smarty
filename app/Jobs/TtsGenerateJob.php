<?php

namespace App\Jobs;

use App\Models\Donation;
use App\Models\DonationEvent;
use App\Services\TtsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class TtsGenerateJob implements ShouldQueue
{
  use Dispatchable;
  use InteractsWithQueue;
  use Queueable;
  use SerializesModels;

  public function __construct(public int $donationId)
  {
    $this->onQueue((string) config('tts.queue', 'tts'));
  }

  public function handle(TtsService $ttsService): void
  {
    $donation = Donation::query()
      ->with(['voice', 'ttsAudio'])
      ->find($this->donationId);

    if (! $donation) {
      return;
    }

    if ($donation->status !== Donation::STATUS_PAID) {
      return;
    }

    if ($donation->tts_audio_file_id) {
      return;
    }

    $mediaFile = $ttsService->generateForDonation($donation);

    if (! $mediaFile) {
      return;
    }

    DonationEvent::create([
      'donation_id' => $donation->id,
      'type' => DonationEvent::TYPE_TTS_READY,
      'payload_json' => [
        'media_file_id' => $mediaFile->id,
        'disk' => $mediaFile->disk,
        'path' => $mediaFile->path,
      ],
      'created_at' => now(),
    ]);
  }
}
