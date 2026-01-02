<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentProvider extends Model
{
  use HasFactory;

  protected $fillable = [
    'code',
    'title',
    'is_active',
  ];

  protected function casts(): array
  {
    return [
      'is_active' => 'boolean',
    ];
  }

  public function payments(): HasMany
  {
    return $this->hasMany(Payment::class, 'provider_id');
  }
}
