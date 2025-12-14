<?php

namespace App\Http\Controllers;

use App\Http\Requests\Meme\StoreMemeClipRequest;
use App\Models\MemeClip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemeClipController extends Controller
{
  public function index(Request $request): JsonResponse
  {
    $status = $request->query('status', MemeClip::STATUS_APPROVED);

    if (!in_array($status, [MemeClip::STATUS_APPROVED, MemeClip::STATUS_SUBMITTED, MemeClip::STATUS_REJECTED], true)) {
      abort(422, 'Некорректный статус мемов.');
    }

    if ($status !== MemeClip::STATUS_APPROVED && $request->user() === null) {
      abort(403, 'Необходимо войти для просмотра этой очереди.');
    }

    $memes = MemeClip::query()
      ->when($status === MemeClip::STATUS_APPROVED, fn ($query) => $query->approved(), fn ($query) => $query->where('status', $status))
      ->with(['file', 'tags', 'suggestedBy'])
      ->orderByDesc('created_at')
      ->get();

    return response()->json([
      'data' => $memes->map(fn (MemeClip $clip) => $this->transform($clip))->values(),
    ]);
  }

  public function store(StoreMemeClipRequest $request): JsonResponse
  {
    $clip = MemeClip::create([
      'title' => $request->validated('title'),
      'file_id' => $request->validated('file_id'),
      'duration_sec' => $request->validated('duration_sec'),
      'status' => MemeClip::STATUS_SUBMITTED,
      'suggested_by_user_id' => $request->user()?->id,
    ]);

    $clip->tags()->sync($request->validated('tag_ids', []));

    $clip->load(['file', 'tags']);

    return response()->json([
      'data' => $this->transform($clip),
    ], 201);
  }

  private function transform(MemeClip $clip): array
  {
    return [
      'id' => $clip->id,
      'title' => $clip->title,
      'duration_sec' => $clip->duration_sec,
      'status' => $clip->status,
      'suggested_by' => $clip->suggestedBy?->only(['id', 'name']),
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
      'created_at' => $clip->created_at,
    ];
  }
}