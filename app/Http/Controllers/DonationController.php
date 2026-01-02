<?php

namespace App\Http\Controllers;

use App\Http\Requests\Donation\StoreDonationRequest;
use App\Models\Donation;
use App\Models\DonationEvent;
use App\Models\Goal;
use App\Models\MemeClip;
use App\Models\StreamerProfile;
use App\Models\TtsVoice;
use App\Services\StreamerRulesService;
use App\Services\YouTubeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class DonationController extends Controller
{
  public function store(
    StoreDonationRequest $request,
    StreamerRulesService $rulesService,
    YouTubeService $youTubeService
  ): JsonResponse {
    $data = $request->validated();

    $streamer = StreamerProfile::query()
      ->where('donation_page_slug', $data['streamer_slug'])
      ->firstOrFail();

    $amount = (float) $data['amount'];
    $minAmount = (float) $streamer->min_donation_amount;

    if ($amount < $minAmount) {
      throw ValidationException::withMessages([
        'amount' => "Минимальная сумма доната: {$minAmount}.",
      ]);
    }

    $voice = null;
    if (array_key_exists('voice_id', $data) && $data['voice_id'] !== null) {
      $voice = TtsVoice::query()->whereKey($data['voice_id'])->first();
    }

    $memeClip = null;
    if (array_key_exists('meme_clip_id', $data) && $data['meme_clip_id'] !== null) {
      $memeClip = MemeClip::query()
        ->approved()
        ->with('tags')
        ->find($data['meme_clip_id']);

      if (! $memeClip) {
        throw ValidationException::withMessages([
          'meme_clip_id' => 'Мем-клип недоступен для донатов.',
        ]);
      }
    }

    $rulesCheck = $rulesService->validateDonationRules($streamer, $voice, $memeClip);

    if (! $rulesCheck['allowed']) {
      throw ValidationException::withMessages([
        $rulesCheck['field'] => $this->rulesRejectMessage($rulesCheck['reject_reason']),
      ]);
    }

    $youtubeCacheId = null;
    $countryWarning = false;

    if (! empty($data['youtube_url'])) {
      $videoId = $youTubeService->parseVideoId($data['youtube_url']);

      if (! $videoId) {
        throw ValidationException::withMessages([
          'youtube_url' => 'Некорректная ссылка на YouTube.',
        ]);
      }

      $validation = $youTubeService->validateForStreamer($streamer, $videoId);

      if (! $validation['allowed']) {
        throw ValidationException::withMessages([
          'youtube_url' => $this->youtubeRejectMessage($validation['reject_reason']),
        ]);
      }

      $youtubeCacheId = $validation['video']?->id;
      $countryWarning = (bool) $validation['country_warning'];
    }

    $goal = null;
    if (array_key_exists('goal_id', $data) && $data['goal_id'] !== null) {
      $goal = $this->resolveActiveGoal($streamer, (int) $data['goal_id']);
    }

    $donation = Donation::create([
      'streamer_id' => $streamer->id,
      'donor_user_id' => $request->user()?->id,
      'donor_name' => null,
      'amount' => $amount,
      'currency' => $goal?->currency ?? 'USD',
      'message_text' => $data['message_text'] ?? null,
      'voice_id' => $voice?->id,
      'youtube_cache_id' => $youtubeCacheId,
      'meme_clip_id' => $memeClip?->id,
      'goal_id' => $goal?->id,
      'status' => Donation::STATUS_PENDING_PAYMENT,
      'reject_reason' => null,
      'country_warning' => $countryWarning,
    ]);

    DonationEvent::create([
      'donation_id' => $donation->id,
      'type' => DonationEvent::TYPE_CREATED,
      'payload_json' => null,
      'created_at' => now(),
    ]);

    return response()->json([
      'data' => $this->transform($donation),
    ], 201);
  }

  private function resolveActiveGoal(StreamerProfile $streamer, int $goalId): Goal
  {
    $now = now();

    $goal = $streamer->goals()
      ->whereKey($goalId)
      ->where('is_active', true)
      ->where(function ($query) use ($now) {
        $query->whereNull('starts_at')
          ->orWhere('starts_at', '<=', $now);
      })
      ->where(function ($query) use ($now) {
        $query->whereNull('ends_at')
          ->orWhere('ends_at', '>=', $now);
      })
      ->first();

    if (! $goal) {
      throw ValidationException::withMessages([
        'goal_id' => 'Цель недоступна или не принадлежит стримеру.',
      ]);
    }

    return $goal;
  }

  private function rulesRejectMessage(?string $reason): string
  {
    return match ($reason) {
      'voice_not_allowed' => 'Выбранный голос недоступен у стримера.',
      'banned_meme_tag' => 'Этот мем-клип содержит запрещённые теги.',
      default => 'Донат не прошёл правила стримера.',
    };
  }

  private function youtubeRejectMessage(?string $reason): string
  {
    return match ($reason) {
      'banned' => 'Видео заблокировано стримером.',
      'not_found' => 'Видео не найдено или недоступно.',
      'low_views' => 'Видео не набрало 1000 просмотров.',
      'invalid_id' => 'Некорректный идентификатор видео.',
      default => 'Видео не прошло проверку.',
    };
  }

  private function transform(Donation $donation): array
  {
    return [
      'id' => $donation->id,
      'streamer_id' => $donation->streamer_id,
      'amount' => $donation->amount,
      'currency' => $donation->currency,
      'message_text' => $donation->message_text,
      'voice_id' => $donation->voice_id,
      'youtube_cache_id' => $donation->youtube_cache_id,
      'meme_clip_id' => $donation->meme_clip_id,
      'goal_id' => $donation->goal_id,
      'status' => $donation->status,
      'country_warning' => $donation->country_warning,
      'created_at' => $donation->created_at,
    ];
  }
}
