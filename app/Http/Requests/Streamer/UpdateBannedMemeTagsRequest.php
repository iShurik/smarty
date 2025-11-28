<?php

namespace App\Http\Requests\Streamer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBannedMemeTagsRequest extends FormRequest
{
  public function authorize(): bool
  {
    return $this->user()?->hasRole('streamer') ?? false;
  }

  public function rules(): array
  {
    return [
      'tag_ids' => ['required', 'array'],
      'tag_ids.*' => [
        'integer',
        Rule::exists('tags', 'id')->where('type', 'meme'),
      ],
    ];
  }
}