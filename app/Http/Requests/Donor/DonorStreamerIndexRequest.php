<?php

namespace App\Http\Requests\Donor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DonorStreamerIndexRequest extends FormRequest
{
  public function authorize(): bool
  {
    return $this->user()?->hasRole('donor') ?? false;
  }

  public function rules(): array
  {
    return [
      'sort_by' => ['nullable', 'string', Rule::in(['last_donation_at', 'total_amount', 'donations_count'])],
      'sort_dir' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
      'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
      'page' => ['nullable', 'integer', 'min:1'],
    ];
  }
}
