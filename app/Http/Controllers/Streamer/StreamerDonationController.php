<?php

namespace App\Http\Controllers\Streamer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Streamer\RejectDonationRequest;
use App\Models\Donation;
use App\Models\StreamerProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StreamerDonationController extends Controller
{
  public function reject(RejectDonationRequest $request, int $donation): JsonResponse
  {
    $profile = $this->resolveProfile($request->user());

    $donationModel = $profile->donations()
      ->with('goal')
      ->findOrFail($donation);

    if (! $this->canReject($donationModel)) {
      abort(422, 'Донат уже обработан');
    }

    DB::transaction(function () use ($donationModel, $request): void {
      $donationModel->refresh();

      if (! $this->canReject($donationModel)) {
        abort(422, 'Донат уже обработан');
      }

      $previousStatus = $donationModel->status;

      $donationModel->status = Donation::STATUS_REJECTED;
      $donationModel->reject_reason = $request->validated('reject_reason');
      $donationModel->save();

      if ($previousStatus === Donation::STATUS_PAID && $donationModel->goal) {
        $donationModel->goal()->decrement('current_amount', $donationModel->amount);
      }
    });

    $donationModel->refresh();

    return response()->json([
      'data' => $this->transform($donationModel),
    ]);
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
    $slug = \Illuminate\Support\Str::slug($base) ?: 'streamer';
    $originalSlug = $slug;
    $counter = 1;

    while (StreamerProfile::where('donation_page_slug', $slug)->exists()) {
      $slug = $originalSlug.'-'.$counter;
      $counter++;
    }

    return $slug;
  }

  private function canReject(Donation $donation): bool
  {
    return in_array($donation->status, [
      Donation::STATUS_PENDING_PAYMENT,
      Donation::STATUS_PAID,
    ], true);
  }

  private function transform(Donation $donation): array
  {
    return [
      'id' => $donation->id,
      'streamer_id' => $donation->streamer_id,
      'amount' => $donation->amount,
      'currency' => $donation->currency,
      'message_text' => $donation->message_text,
      'status' => $donation->status,
      'reject_reason' => $donation->reject_reason,
      'created_at' => $donation->created_at,
      'updated_at' => $donation->updated_at,
    ];
  }
}
