<?php

namespace App\Http\Controllers\Streamer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Streamer\StoreGoalRequest;
use App\Http\Requests\Streamer\UpdateGoalRequest;
use App\Models\Goal;
use App\Models\StreamerProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StreamerGoalController extends Controller
{
  public function index(Request $request): JsonResponse
  {
    $profile = $this->resolveProfile($request->user());

    $goals = $profile->goals()
      ->orderByDesc('created_at')
      ->get();

    return response()->json([
      'data' => $goals->map(fn (Goal $goal) => $this->transform($goal))->values(),
    ]);
  }

  public function store(StoreGoalRequest $request): JsonResponse
  {
    $profile = $this->resolveProfile($request->user());

    $goal = $profile->goals()->create($request->validated());

    return response()->json([
      'data' => $this->transform($goal),
    ], 201);
  }

  public function show(Request $request, int $goal): JsonResponse
  {
    $profile = $this->resolveProfile($request->user());

    $goalModel = $profile->goals()->findOrFail($goal);

    return response()->json([
      'data' => $this->transform($goalModel),
    ]);
  }

  public function update(UpdateGoalRequest $request, int $goal): JsonResponse
  {
    $profile = $this->resolveProfile($request->user());

    $goalModel = $profile->goals()->findOrFail($goal);

    $goalModel->fill($request->validated());
    $goalModel->save();

    return response()->json([
      'data' => $this->transform($goalModel),
    ]);
  }

  public function destroy(Request $request, int $goal): JsonResponse
  {
    $profile = $this->resolveProfile($request->user());

    $goalModel = $profile->goals()->findOrFail($goal);
    $goalModel->delete();

    return response()->json(null, 204);
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

  private function transform(Goal $goal): array
  {
    return [
      'id' => $goal->id,
      'title' => $goal->title,
      'description' => $goal->description,
      'target_amount' => $goal->target_amount,
      'current_amount' => $goal->current_amount,
      'currency' => $goal->currency,
      'starts_at' => $goal->starts_at,
      'ends_at' => $goal->ends_at,
      'is_active' => $goal->is_active,
      'created_at' => $goal->created_at,
      'updated_at' => $goal->updated_at,
    ];
  }
}
