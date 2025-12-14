<?php

namespace App\Http\Controllers;

use App\Http\Requests\Meme\ReviewMemeClipRequest;
use App\Models\MemeClip;
use Illuminate\Http\JsonResponse;

class MemeClipModerationController extends Controller
{
  public function approve(ReviewMemeClipRequest $request, MemeClip $memeClip): JsonResponse
  {
    if ($memeClip->status !== MemeClip::STATUS_SUBMITTED) {
      abort(422, 'Мем уже обработан');
    }

    $memeClip->fill([
      'status' => MemeClip::STATUS_APPROVED,
      'moderated_by_user_id' => $request->user()->id,
      'moderation_comment' => $request->validated('moderation_comment'),
    ])->save();

    $memeClip->load(['file', 'tags']);

    return response()->json(['data' => $this->transform($memeClip)]);
  }

  public function reject(ReviewMemeClipRequest $request, MemeClip $memeClip): JsonResponse
  {
    if ($memeClip->status !== MemeClip::STATUS_SUBMITTED) {
      abort(422, 'Мем уже обработан');
    }

    $memeClip->fill([
      'status' => MemeClip::STATUS_REJECTED,
      'moderated_by_user_id' => $request->user()->id,
      'moderation_comment' => $request->validated('moderation_comment'),
    ])->save();

    $memeClip->load(['file', 'tags']);

    return response()->json(['data' => $this->transform($memeClip)]);
  }

  private function transform(MemeClip $clip): array
  {
    return [
      'id' => $clip->id,
      'title' => $clip->title,
      'duration_sec' => $clip->duration_sec,
      'status' => $clip->status,
      'file' => [
        'id' => $clip->file->id,
        'disk' => $clip->file->disk,
        'path' => $clip->file->path,
        'mime_type' => $clip->file->mime_type,
      ],
      'tags' => $clip->tags->map(fn ($tag) => [
        'id' => $tag->id,
        'name' => $tag->name,
      ])->values(),
      'moderation_comment' => $clip->moderation_comment,
      'created_at' => $clip->created_at,
    ];
  }
}