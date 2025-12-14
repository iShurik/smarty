<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemeClip extends Model
{
  use HasFactory;

  public const STATUS_SUBMITTED = 'submitted';
  public const STATUS_APPROVED = 'approved';
  public const STATUS_REJECTED = 'rejected';

  protected $fillable = [
    'title',
    'file_id',
    'duration_sec',
    'status',
    'suggested_by_user_id',
    'moderated_by_user_id',
    'moderation_comment',
  ];

  public function file()
  {
    return $this->belongsTo(MediaFile::class, 'file_id');
  }

  public function tags()
  {
    return $this->belongsToMany(Tag::class, 'meme_clip_tag');
  }

  public function suggestedBy()
  {
    return $this->belongsTo(User::class, 'suggested_by_user_id');
  }

  public function moderatedBy()
  {
    return $this->belongsTo(User::class, 'moderated_by_user_id');
  }

  public function scopeApproved($query)
  {
    return $query->where('status', self::STATUS_APPROVED);
  }
}