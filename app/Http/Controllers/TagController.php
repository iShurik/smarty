<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
  public function index(Request $request): JsonResponse
  {
    $validated = $request->validate([
      'type' => 'nullable|in:' . implode(',', Tag::TYPES),
    ]);

    $tags = Tag::query()
      ->when(isset($validated['type']), fn ($query) => $query->where('type', $validated['type']))
      ->orderBy('type')
      ->orderBy('name')
      ->get(['id', 'type', 'name']);

    return response()->json(['data' => $tags]);
  }
}