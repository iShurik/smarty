<?php

namespace App\Http\Requests\Streamer;

use App\Models\Donation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StreamerDonationIndexRequest extends FormRequest
{
  public function authorize(): bool
  {
    return $this->user()?->hasRole('streamer') ?? false;
  }

  public function rules(): array
  {
    return [
      'status' => ['nullable', 'string', Rule::in([
        Donation::STATUS_PENDING_PAYMENT,
        Donation::STATUS_PAID,
        Donation::STATUS_REJECTED,
        Donation::STATUS_REFUNDED,
        Donation::STATUS_PLAYED,
      ])],
      'from' => ['nullable', 'date'],
      'to' => ['nullable', 'date', 'after_or_equal:from'],
      'sort_by' => ['nullable', 'string', Rule::in(['created_at', 'amount'])],
      'sort_dir' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
      'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
      'page' => ['nullable', 'integer', 'min:1'],
    ];
  }
}
