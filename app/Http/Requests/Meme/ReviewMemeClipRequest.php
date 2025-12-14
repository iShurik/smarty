<?php

namespace App\Http\Requests\Meme;

use Illuminate\Foundation\Http\FormRequest;

class ReviewMemeClipRequest extends FormRequest
{
  public function authorize(): bool
  {
    $user = $this->user();

    return $user !== null && $user->hasAnyRole(['admin', 'moderator']);
  }

  public function rules(): array
  {
    return [
      'moderation_comment' => ['nullable', 'string', 'max:1000'],
    ];
  }
}