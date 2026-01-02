<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Goal extends Model
{
  use HasFactory;

  protected $fillable = [
    'streamer_id',
    'title',
    'description',
    'target_amount',
    'current_amount',
    'currency',
    'starts_at',
    'ends_at',
    'is_active',
  ];

  protected function casts(): array
  {
    return [
      'target_amount' => 'decimal:2',
      'current_amount' => 'decimal:2',
      'starts_at' => 'datetime',
      'ends_at' => 'datetime',
      'is_active' => 'boolean',
    ];
  }

  public function streamer(): BelongsTo
  {
    return $this->belongsTo(StreamerProfile::class, 'streamer_id');
  }
}
