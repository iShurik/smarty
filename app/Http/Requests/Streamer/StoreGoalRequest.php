<?php

namespace App\Http\Requests\Streamer;

use Illuminate\Foundation\Http\FormRequest;

class StoreGoalRequest extends FormRequest
{
  public function authorize(): bool
  {
    return $this->user()?->hasRole('streamer') ?? false;
  }

  public function rules(): array
  {
    return [
      'title' => ['required', 'string', 'max:255'],
      'description' => ['nullable', 'string'],
      'target_amount' => ['required', 'numeric', 'min:0.01'],
      'currency' => ['required', 'string', 'size:3'],
      'starts_at' => ['nullable', 'date'],
      'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
      'is_active' => ['sometimes', 'boolean'],
    ];
  }

  public function prepareForValidation(): void
  {
    if ($this->has('currency')) {
      $this->merge(['currency' => strtoupper((string) $this->input('currency'))]);
    }
  }
}
