<?php

namespace App\Http\Requests\Streamer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGoalRequest extends FormRequest
{
  public function authorize(): bool
  {
    return $this->user()?->hasRole('streamer') ?? false;
  }

  public function rules(): array
  {
    return [
      'title' => ['sometimes', 'string', 'max:255'],
      'description' => ['sometimes', 'nullable', 'string'],
      'target_amount' => ['sometimes', 'numeric', 'min:0.01'],
      'currency' => ['sometimes', 'string', 'size:3'],
      'starts_at' => ['sometimes', 'nullable', 'date'],
      'ends_at' => ['sometimes', 'nullable', 'date', 'after_or_equal:starts_at'],
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
