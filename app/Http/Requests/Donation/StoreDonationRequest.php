<?php

namespace App\Http\Requests\Donation;

use App\Models\MemeClip;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDonationRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'streamer_slug' => ['required', 'string', 'max:64'],
      'amount' => ['required', 'numeric', 'min:0.01'],
      'message_text' => ['nullable', 'string', 'max:2000'],
      'voice_id' => [
        'nullable',
        'integer',
        Rule::exists('tts_voices', 'id')->where('is_active', true),
      ],
      'youtube_url' => ['nullable', 'string', 'max:255'],
      'meme_clip_id' => [
        'nullable',
        'integer',
        Rule::exists('meme_clips', 'id')->where('status', MemeClip::STATUS_APPROVED),
      ],
      'goal_id' => ['nullable', 'integer', Rule::exists('goals', 'id')],
    ];
  }
}
