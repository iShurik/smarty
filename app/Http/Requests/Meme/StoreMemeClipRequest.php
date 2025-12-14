<?php

namespace App\Http\Requests\Meme;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMemeClipRequest extends FormRequest
{
  public function authorize(): bool
  {
    return $this->user() !== null;
  }

  public function rules(): array
  {
    return [
      'title' => ['required', 'string', 'max:255'],
      'file_id' => [
        'required',
        'integer',
        Rule::exists('media_files', 'id')->where('type', 'meme_video'),
      ],
      'duration_sec' => ['required', 'integer', 'min:1'],
      'tag_ids' => ['sometimes', 'array'],
      'tag_ids.*' => [
        'integer',
        Rule::exists('tags', 'id')->where('type', 'meme'),
      ],
    ];
  }
}