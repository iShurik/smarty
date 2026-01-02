<?php

namespace App\Http\Controllers\Streamer;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\StreamerProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StreamerStatsController extends Controller
{
  public function overview(Request $request): JsonResponse
  {
    $profile = $this->resolveProfile($request->user());
    $now = now();

    $todayStart = $now->copy()->startOfDay();
    $last7Start = $now->copy()->subDays(6)->startOfDay();
    $last30Start = $now->copy()->subDays(29)->startOfDay();

    return response()->json([
      'today' => $this->totalsForRange($profile->id, $todayStart, $now),
      'last_7_days' => $this->totalsForRange($profile->id, $last7Start, $now),
      'last_30_days' => $this->totalsForRange($profile->id, $last30Start, $now),
    ]);
  }

  private function totalsForRange(int $streamerId, Carbon $from, Carbon $to): array
  {
    $totals = Donation::query()
      ->where('streamer_id', $streamerId)
      ->whereIn('status', [Donation::STATUS_PAID, Donation::STATUS_PLAYED])
      ->whereBetween('created_at', [$from, $to])
      ->selectRaw('COALESCE(SUM(amount), 0) as total_amount, COUNT(*) as donations_count')
      ->first();

    return [
      'total_amount' => number_format((float) $totals->total_amount, 2, '.', ''),
      'donations_count' => (int) $totals->donations_count,
    ];
  }

  private function resolveProfile(User $user): StreamerProfile
  {
    if (! $user->hasRole('streamer')) {
      abort(403, 'Доступно только для стримеров');
    }

    return $user->streamerProfile()->firstOrCreate([], [
      'display_name' => $user->name ?? 'Streamer',
      'country_code' => 'US',
      'donation_page_slug' => $this->generateUniqueSlug($user->name ?? 'streamer'),
      'min_donation_amount' => 0,
    ]);
  }

  private function generateUniqueSlug(string $base): string
  {
    $slug = Str::slug($base) ?: 'streamer';
    $originalSlug = $slug;
    $counter = 1;

    while (StreamerProfile::where('donation_page_slug', $slug)->exists()) {
      $slug = $originalSlug.'-'.$counter;
      $counter++;
    }

    return $slug;
  }
}
