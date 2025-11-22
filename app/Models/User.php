<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
  /** @use HasFactory<\Database\Factories\UserFactory> */
  use HasApiTokens, HasFactory, Notifiable;

  /**
   * The attributes that are mass assignable.
   *
   * @var list<string>
   */
  protected $fillable = [
    'name',
    'email',
    'password',
    'avatar_url',
  ];

  /**
   * The attributes that should be hidden for serialization.
   *
   * @var list<string>
   */
  protected $hidden = [
    'password',
    'remember_token',
  ];

  /**
   * Get the attributes that should be cast.
   *
   * @return array<string, string>
   */
  protected function casts(): array
  {
    return [
      'password' => 'hashed',
    ];
  }

  public function roles()
  {
    return $this->belongsToMany(Role::class);
  }

  public function hasRole(string $roleCode): bool
  {
    return $this->hasAnyRole([$roleCode]);
  }

  /**
   * @param  array<int, string>|string  $roleCodes
   */
  public function hasAnyRole(array|string $roleCodes): bool
  {
    $normalizedCodes = collect(is_array($roleCodes) ? $roleCodes : func_get_args())
      ->flatMap(function (string $value): array {
        return preg_split('/[\\,\\|\\/]+/', $value) ?: [];
      })
      ->filter()
      ->map(fn (string $code): string => strtolower(trim($code)))
      ->unique()
      ->values();

    if ($normalizedCodes->isEmpty()) {
      return false;
    }

    if ($this->relationLoaded('roles')) {
      return $this->roles->contains(
        fn (Role $role): bool => $normalizedCodes->contains(strtolower($role->code))
      );
    }

    return $this->roles()->whereIn('code', $normalizedCodes)->exists();
  }

  public function streamerProfile()
  {
    return $this->hasOne(StreamerProfile::class);
  }

  public function donorProfile()
  {
    return $this->hasOne(DonorProfile::class);
  }
}
