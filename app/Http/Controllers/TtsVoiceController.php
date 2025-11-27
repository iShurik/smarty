<?php

namespace App\Http\Controllers;

use App\Models\TtsVoice;
use Illuminate\Http\JsonResponse;

class TtsVoiceController extends Controller
{
  public function index(): JsonResponse
  {
    $voices = TtsVoice::query()
      ->where('is_active', true)
      ->orderBy('provider')
      ->orderBy('name')
      ->get(['id', 'provider', 'code', 'name', 'lang', 'gender']);

    return response()->json(['data' => $voices]);
  }
}