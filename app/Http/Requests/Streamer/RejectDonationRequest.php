<?php

namespace App\Http\Requests\Streamer;

use Illuminate\Foundation\Http\FormRequest;

class RejectDonationRequest extends FormRequest
{
  public function authorize(): bool
  {
    $user = $this->user();

    return $user !== null && $user->hasRole('streamer');
  }

  public function rules(): array
  {
    return [
      'reject_reason' => ['required', 'string', 'max:255'],
    ];
  }
}
