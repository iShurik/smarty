<?php

namespace App\Http\Controllers\Donor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Donor\DonorDonationIndexRequest;
use App\Models\Donation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DonorDonationController extends Controller
{
  public function index(DonorDonationIndexRequest $request): JsonResponse
  {
    $filters = $request->validated();

    $query = Donation::query()
      ->where('donor_user_id', $request->user()->id)
      ->with(['streamer', 'youtubeCache'])
      ->orderByDesc('created_at');

    if (! empty($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (! empty($filters['from'])) {
      $fromDate = Carbon::parse($filters['from'])->startOfDay();
      $query->where('created_at', '>=', $fromDate);
    }

    if (! empty($filters['to'])) {
      $toDate = Carbon::parse($filters['to'])->endOfDay();
      $query->where('created_at', '<=', $toDate);
    }

    if (! empty($filters['sort_by'])) {
      $sortBy = $filters['sort_by'];
      $sortDir = $filters['sort_dir'] ?? 'desc';
      $query->reorder()->orderBy($sortBy, $sortDir);
    }

    $perPage = isset($filters['per_page']) ? (int) $filters['per_page'] : 15;
    $perPage = max(1, min($perPage, 100));

    $donations = $query->paginate($perPage);

    return response()->json([
      'data' => $donations->getCollection()->map(fn (Donation $donation) => $this->transform($donation))->values(),
      'meta' => [
        'current_page' => $donations->currentPage(),
        'last_page' => $donations->lastPage(),
        'per_page' => $donations->perPage(),
        'total' => $donations->total(),
      ],
    ]);
  }

  private function transform(Donation $donation): array
  {
    return [
      'id' => $donation->id,
      'streamer' => [
        'id' => $donation->streamer?->id,
        'display_name' => $donation->streamer?->display_name,
        'slug' => $donation->streamer?->donation_page_slug,
      ],
      'amount' => $donation->amount,
      'currency' => $donation->currency,
      'message_text' => $donation->message_text,
      'has_tts' => (bool) $donation->voice_id,
      'youtube_id' => $donation->youtubeCache?->youtube_id,
      'meme_clip_id' => $donation->meme_clip_id,
      'status' => $donation->status,
      'created_at' => $donation->created_at,
    ];
  }
}
