<?php

namespace App\Http\Controllers;

use App\Services\Overlay\OverlayStreamService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OverlayController extends Controller
{
  public function streamer(Request $request, string $slug, OverlayStreamService $streamService): StreamedResponse
  {
    $token = $this->resolveToken($request);
    $profile = $streamService->authorizeStreamer($slug, $token);

    return $streamService->stream($profile);
  }

  private function resolveToken(Request $request): ?string
  {
    return $request->header('X-Overlay-Token')
      ?? $request->query('token');
  }
}
