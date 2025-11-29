<?php

namespace App\Http\Requests\Media;

use App\Models\MediaFile;
use Illuminate\Foundation\Http\FormRequest;

class StoreMediaFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:' . implode(',', MediaFile::TYPES),
            'file' => 'required|file|max:51200',
        ];
    }
}