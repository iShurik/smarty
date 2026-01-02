<?php

namespace App\Services;

use App\Models\Donation;
use App\Models\MediaFile;
use App\Models\TtsVoice;
use App\Services\Tts\MockTtsProvider;
use App\Services\Tts\TtsProviderInterface;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class TtsService
{
  public function generateForDonation(Donation $donation): ?MediaFile
  {
    $donation->loadMissing(['voice', 'ttsAudio']);

    if ($donation->tts_audio_file_id) {
      return $donation->ttsAudio;
    }

    $text = trim((string) $donation->message_text);
    $voice = $donation->voice;

    if ($text === '' || ! $voice) {
      return null;
    }

    $provider = $this->resolveProvider($voice);
    $result = $provider->synthesize($text, $voice);

    $disk = (string) config('tts.disk', 'local');
    $path = $this->buildPath($result->extension);

    Storage::disk($disk)->put($path, $result->content);

    $size = Storage::disk($disk)->size($path);
    $sizeBytes = is_int($size) ? $size : strlen($result->content);

    $mediaFile = MediaFile::create([
      'type' => 'tts_audio',
      'disk' => $disk,
      'path' => $path,
      'mime_type' => $result->mimeType,
      'size_bytes' => $sizeBytes,
      'meta_json' => array_merge($result->meta, [
        'voice_id' => $voice->id,
        'provider' => $this->resolveProviderCode(),
      ]),
    ]);

    $donation->tts_audio_file_id = $mediaFile->id;
    $donation->save();

    return $mediaFile;
  }

  private function resolveProvider(TtsVoice $voice): TtsProviderInterface
  {
    $provider = $this->resolveProviderCode();

    if ($voice->provider && $voice->provider !== $provider) {
      throw new RuntimeException('TTS voice provider mismatch.');
    }

    return match ($provider) {
      'mock' => new MockTtsProvider(),
      default => throw new RuntimeException('TTS provider is not configured.'),
    };
  }

  private function resolveProviderCode(): string
  {
    return (string) config('tts.provider', 'mock');
  }

  private function buildPath(string $extension): string
  {
    $prefix = trim((string) config('tts.path_prefix', 'tts'), '/');
    $datePath = now()->format('Y/m/d');
    $name = (string) Str::uuid().'.'.$extension;

    return $prefix.'/'.$datePath.'/'.$name;
  }
}
