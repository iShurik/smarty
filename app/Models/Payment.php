<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
  use HasFactory;

  public const STATUS_INITIATED = 'initiated';
  public const STATUS_SUCCEEDED = 'succeeded';
  public const STATUS_FAILED = 'failed';
  public const STATUS_REFUNDED = 'refunded';

  protected $fillable = [
    'donation_id',
    'provider_id',
    'provider_payment_id',
    'amount',
    'currency',
    'status',
    'fee_amount',
    'meta_json',
  ];

  protected function casts(): array
  {
    return [
      'amount' => 'decimal:2',
      'fee_amount' => 'decimal:2',
      'meta_json' => 'array',
    ];
  }

  public function donation(): BelongsTo
  {
    return $this->belongsTo(Donation::class, 'donation_id');
  }

  public function provider(): BelongsTo
  {
    return $this->belongsTo(PaymentProvider::class, 'provider_id');
  }
}
