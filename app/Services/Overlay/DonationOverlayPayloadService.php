<?php

namespace App\Services\Overlay;

use App\Models\Donation;
use App\Models\MediaFile;
use Illuminate\Support\Facades\Storage;

class DonationOverlayPayloadService
{
  public function make(Donation $donation): array
  {
    $donorName = $donation->donor_name
      ?? $donation->donor?->name
      ?? 'Guest';

    $payload = [
      'donation_id' => $donation->id,
      'donor_name' => $donorName,
      'amount' => $donation->amount,
      'currency' => $donation->currency,
      'message_text' => $donation->message_text,
      'country_warning' => $donation->country_warning,
      'created_at' => $donation->created_at,
    ];

    if ($donation->ttsAudio) {
      $payload['tts_audio'] = $this->mediaPayload($donation->ttsAudio);
    }

    if ($donation->youtubeCache) {
      $payload['youtube'] = [
        'id' => $donation->youtubeCache->youtube_id,
        'title' => $donation->youtubeCache->title,
        'channel_title' => $donation->youtubeCache->channel_title,
        'views' => $donation->youtubeCache->views,
        'duration_sec' => $donation->youtubeCache->duration_sec,
        'url' => 'https://www.youtube.com/watch?v='.$donation->youtubeCache->youtube_id,
      ];
    }

    if ($donation->memeClip && $donation->memeClip->file) {
      $payload['meme_clip'] = [
        'id' => $donation->memeClip->id,
        'title' => $donation->memeClip->title,
        'duration_sec' => $donation->memeClip->duration_sec,
        'file' => $this->mediaPayload($donation->memeClip->file),
      ];
    }

    return $payload;
  }

  private function mediaPayload(MediaFile $mediaFile): array
  {
    return [
      'id' => $mediaFile->id,
      'disk' => $mediaFile->disk,
      'path' => $mediaFile->path,
      'mime_type' => $mediaFile->mime_type,
      'size_bytes' => $mediaFile->size_bytes,
      'url' => Storage::disk($mediaFile->disk)->url($mediaFile->path),
    ];
  }
}
