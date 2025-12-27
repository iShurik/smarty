<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class YoutubeVideoCache extends Model
{
    use HasFactory;

    protected $fillable = [
        'youtube_id',
        'title',
        'channel_title',
        'views',
        'duration_sec',
        'region_blocked_json',
        'last_checked_at',
    ];

    protected $casts = [
        'region_blocked_json' => 'array',
        'last_checked_at' => 'datetime',
    ];
}