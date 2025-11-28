<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StreamerBannedYoutubeVideo extends Model
{
  use HasFactory;

  protected $fillable = [
    'streamer_id',
    'youtube_id',
    'reason',
  ];

  public function streamer(): BelongsTo
  {
    return $this->belongsTo(StreamerProfile::class, 'streamer_id');
  }
}