<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TtsVoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider',
        'code',
        'name',
        'lang',
        'gender',
        'is_active',
    ];
}