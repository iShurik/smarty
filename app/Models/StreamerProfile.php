<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StreamerProfile extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'display_name',
    'country_code',
    'about',
    'donation_page_slug',
    'overlay_token',
    'min_donation_amount',
  ];

  protected function casts(): array
  {
    return [
      'min_donation_amount' => 'decimal:2',
      'overlay_token' => 'encrypted',
    ];
  }

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function allowedVoices(): BelongsToMany
  {
    return $this->belongsToMany(TtsVoice::class, 'streamer_allowed_voices', 'streamer_id', 'voice_id');
  }

  public function bannedMemeTags(): BelongsToMany
  {
    return $this->belongsToMany(Tag::class, 'streamer_banned_meme_tags', 'streamer_id', 'tag_id');
  }

  public function bannedYoutubeVideos(): HasMany
  {
    return $this->hasMany(StreamerBannedYoutubeVideo::class, 'streamer_id');
  }

  public function goals(): HasMany
  {
    return $this->hasMany(Goal::class, 'streamer_id');
  }

  public function donations(): HasMany
  {
    return $this->hasMany(Donation::class, 'streamer_id');
  }
}
