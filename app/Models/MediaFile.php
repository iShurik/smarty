<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MediaFile extends Model
{
    use HasFactory;

    public const TYPES = [
        'tts_audio',
        'meme_video',
        'avatar',
        'other',
    ];

    protected $fillable = [
        'type',
        'disk',
        'path',
        'mime_type',
        'size_bytes',
        'meta_json',
    ];

    protected $casts = [
        'meta_json' => 'array',
    ];
}