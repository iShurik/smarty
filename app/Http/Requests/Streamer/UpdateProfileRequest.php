<?php

namespace App\Http\Requests\Streamer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('streamer') ?? false;
    }

    public function rules(): array
    {
        $profileId = $this->user()?->streamerProfile?->id;

        return [
            'display_name' => ['required', 'string', 'max:255'],
            'country_code' => ['required', 'string', 'size:2'],
            'slug' => [
                'required',
                'string',
                'max:64',
                'alpha_dash',
                Rule::unique('streamer_profiles', 'donation_page_slug')->ignore($profileId),
            ],
            'min_amount' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'slug.unique' => 'Этот адрес донат-страницы уже занят.',
            'slug.alpha_dash' => 'Слаг может содержать только буквы, цифры, тире и подчёркивания.',
        ];
    }

    public function prepareForValidation(): void
    {
        if ($this->has('country_code')) {
            $this->merge(['country_code' => strtoupper((string) $this->input('country_code'))]);
        }
    }
}