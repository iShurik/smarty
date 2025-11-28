<?php

namespace App\Http\Requests\Streamer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBannedYoutubeVideosRequest extends FormRequest
{
  public function authorize(): bool
  {
    return $this->user()?->hasRole('streamer') ?? false;
  }

  public function rules(): array
  {
    return [
      'youtube_ids' => ['required', 'array'],
      'youtube_ids.*' => ['string', 'max:32', 'regex:/^[A-Za-z0-9_-]{3,32}$/'],
    ];
  }
}