<?php

namespace App\Services\Overlay;

use App\Models\Donation;
use App\Models\MediaFile;
use Illuminate\Support\Facades\Storage;

class DonationOverlayPayloadService
{
  public function make(Donation $donation): array
  {
    $donation->loadMissing(['donor', 'ttsAudio', 'youtubeCache', 'memeClip.file', 'goal']);

    $donorName = $donation->donor_name
      ?? $donation->donor?->name
      ?? 'Guest';

    $payload = [
      'donation_id' => $donation->id,
      'donor_name' => $donorName,
      'amount' => $donation->amount,
      'currency' => $donation->currency,
      'text' => $donation->message_text,
    ];

    if ($donation->ttsAudio) {
      $payload['tts_audio_url'] = $this->mediaUrl($donation->ttsAudio);
    }

    if ($donation->youtubeCache) {
      $payload['youtube_url'] = 'https://www.youtube.com/watch?v='.$donation->youtubeCache->youtube_id;
      $payload['youtube_id'] = $donation->youtubeCache->youtube_id;
      $payload['youtube_duration_sec'] = $donation->youtubeCache->duration_sec;
    }

    if ($donation->memeClip && $donation->memeClip->file) {
      $payload['meme_clip_url'] = $this->mediaUrl($donation->memeClip->file);
      $payload['meme_duration_sec'] = $donation->memeClip->duration_sec;
    }

    if ($donation->goal) {
      $payload['goal_progress'] = [
        'goal_id' => $donation->goal->id,
        'current_amount' => $donation->goal->current_amount,
        'target_amount' => $donation->goal->target_amount,
        'currency' => $donation->goal->currency,
      ];
    }

    return $payload;
  }

  private function mediaUrl(MediaFile $mediaFile): string
  {
    return Storage::disk($mediaFile->disk)->url($mediaFile->path);
  }
}
