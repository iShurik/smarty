<?php

namespace App\Http\Controllers;

use App\Services\Overlay\OverlayStreamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OverlayController extends Controller
{
  public function streamer(Request $request, string $slug, OverlayStreamService $streamService): StreamedResponse
  {
    $token = $this->resolveToken($request);
    $profile = $streamService->authorizeStreamer($slug, $token);

    return $streamService->stream($profile);
  }

  public function view(Request $request, string $slug): View
  {
    return view('overlay', [
      'slug' => $slug,
      'token' => $request->query('token'),
    ]);
  }

  public function acknowledge(Request $request, string $slug, OverlayStreamService $streamService): JsonResponse
  {
    $token = $this->resolveToken($request);
    $profile = $streamService->authorizeStreamer($slug, $token);

    $payload = $request->validate([
      'donation_id' => ['required', 'integer'],
    ]);

    $streamService->acknowledgeDonation($profile, (int) $payload['donation_id']);

    return response()->json(['status' => 'ok']);
  }

  private function resolveToken(Request $request): ?string
  {
    return $request->header('X-Overlay-Token')
      ?? $request->query('token');
  }
}
