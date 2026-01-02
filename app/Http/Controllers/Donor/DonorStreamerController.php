<?php

namespace App\Http\Controllers\Donor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Donor\DonorStreamerIndexRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DonorStreamerController extends Controller
{
  public function index(DonorStreamerIndexRequest $request): JsonResponse
  {
    $filters = $request->validated();
    $userId = $request->user()->id;

    $query = DB::table('donations')
      ->join('streamer_profiles', 'donations.streamer_id', '=', 'streamer_profiles.id')
      ->where('donations.donor_user_id', $userId)
      ->groupBy('streamer_profiles.id', 'streamer_profiles.display_name', 'streamer_profiles.donation_page_slug')
      ->select([
        'streamer_profiles.id',
        'streamer_profiles.display_name',
        'streamer_profiles.donation_page_slug',
        DB::raw('COUNT(donations.id) as donations_count'),
        DB::raw('SUM(donations.amount) as total_amount'),
        DB::raw('MAX(donations.created_at) as last_donation_at'),
      ]);

    $sortBy = $filters['sort_by'] ?? 'last_donation_at';
    $sortDir = $filters['sort_dir'] ?? 'desc';

    $query->orderBy($sortBy, $sortDir);

    $perPage = isset($filters['per_page']) ? (int) $filters['per_page'] : 12;
    $perPage = max(1, min($perPage, 100));

    $streamers = $query->paginate($perPage);

    return response()->json([
      'data' => collect($streamers->items())->map(fn ($row) => [
        'id' => $row->id,
        'display_name' => $row->display_name,
        'slug' => $row->donation_page_slug,
        'donations_count' => (int) $row->donations_count,
        'total_amount' => $row->total_amount,
        'last_donation_at' => $row->last_donation_at,
      ])->values(),
      'meta' => [
        'current_page' => $streamers->currentPage(),
        'last_page' => $streamers->lastPage(),
        'per_page' => $streamers->perPage(),
        'total' => $streamers->total(),
      ],
    ]);
  }
}
