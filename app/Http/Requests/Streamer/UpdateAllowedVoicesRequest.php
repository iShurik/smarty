<?php

namespace App\Http\Requests\Streamer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAllowedVoicesRequest extends FormRequest
{
  public function authorize(): bool
  {
    return $this->user()?->hasRole('streamer') ?? false;
  }

  public function rules(): array
  {
    return [
      'voice_ids' => ['required', 'array'],
      'voice_ids.*' => ['integer', 'exists:tts_voices,id,is_active,1'],
    ];
  }
}