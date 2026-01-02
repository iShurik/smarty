<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Donation extends Model
{
  use HasFactory;

  public const STATUS_PENDING_PAYMENT = 'pending_payment';
  public const STATUS_PAID = 'paid';
  public const STATUS_REJECTED = 'rejected';
  public const STATUS_REFUNDED = 'refunded';
  public const STATUS_PLAYED = 'played';

  protected $fillable = [
    'streamer_id',
    'donor_user_id',
    'donor_name',
    'amount',
    'currency',
    'message_text',
    'voice_id',
    'tts_audio_file_id',
    'youtube_cache_id',
    'meme_clip_id',
    'goal_id',
    'status',
    'reject_reason',
    'country_warning',
  ];

  protected function casts(): array
  {
    return [
      'amount' => 'decimal:2',
      'country_warning' => 'boolean',
    ];
  }

  public function streamer(): BelongsTo
  {
    return $this->belongsTo(StreamerProfile::class, 'streamer_id');
  }

  public function donor(): BelongsTo
  {
    return $this->belongsTo(User::class, 'donor_user_id');
  }

  public function voice(): BelongsTo
  {
    return $this->belongsTo(TtsVoice::class, 'voice_id');
  }

  public function ttsAudio(): BelongsTo
  {
    return $this->belongsTo(MediaFile::class, 'tts_audio_file_id');
  }

  public function youtubeCache(): BelongsTo
  {
    return $this->belongsTo(YoutubeVideoCache::class, 'youtube_cache_id');
  }

  public function memeClip(): BelongsTo
  {
    return $this->belongsTo(MemeClip::class, 'meme_clip_id');
  }

  public function goal(): BelongsTo
  {
    return $this->belongsTo(Goal::class, 'goal_id');
  }

  public function events(): HasMany
  {
    return $this->hasMany(DonationEvent::class, 'donation_id');
  }
}
