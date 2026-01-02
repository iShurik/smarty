<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DonationEvent extends Model
{
  use HasFactory;

  public const TYPE_CREATED = 'created';
  public const TYPE_PAID = 'paid';
  public const TYPE_TTS_READY = 'tts_ready';
  public const TYPE_BROADCASTED = 'broadcasted';
  public const TYPE_DISPATCHED = 'dispatched';
  public const TYPE_PLAYED = 'played';
  public const TYPE_REFUNDED = 'refunded';

  public $timestamps = false;

  protected $fillable = [
    'donation_id',
    'type',
    'payload_json',
    'created_at',
  ];

  protected function casts(): array
  {
    return [
      'payload_json' => 'array',
      'created_at' => 'datetime',
    ];
  }

  public function donation(): BelongsTo
  {
    return $this->belongsTo(Donation::class, 'donation_id');
  }
}
