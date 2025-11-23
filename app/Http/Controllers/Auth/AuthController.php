<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
  public function register(Request $request): JsonResponse
  {
    $validated = $request->validate([
      'name' => ['required', 'string', 'max:255'],
      'email' => ['required', 'email', 'max:255', 'unique:users,email'],
      'password' => ['required', 'string', 'min:8', 'confirmed'],
      'role' => ['required', 'string', 'in:streamer,donor'],
    ]);

    $user = User::create([
      'name' => $validated['name'],
      'email' => $validated['email'],
      'password' => Hash::make($validated['password']),
    ]);

     $primaryRole = Role::firstOrCreate(
      ['code' => $validated['role']],
      ['title' => ucfirst($validated['role'])]
    );

    $user->roles()->sync([$primaryRole->id]);

    $token = $user->createToken('spa')->plainTextToken;

    return response()->json([
      'token' => $token,
      'user' => $user->load('roles'),
    ], 201);
  }

  public function login(Request $request): JsonResponse
  {
    $validated = $request->validate([
      'email' => ['required', 'email'],
      'password' => ['required', 'string'],
    ]);

    /** @var User|null $user */
    $user = User::where('email', $validated['email'])->first();

    if (! $user || ! Hash::check($validated['password'], $user->password)) {
      throw ValidationException::withMessages([
        'email' => __('auth.failed'),
      ]);
    }

    $token = $user->createToken('spa')->plainTextToken;

    return response()->json([
      'token' => $token,
      'user' => $user->load('roles'),
    ]);
  }

  public function me(Request $request): JsonResponse
  {
    return response()->json([
      'user' => $request->user()->load('roles'),
    ]);
  }

  public function logout(Request $request): JsonResponse
  {
    $token = $request->user()?->currentAccessToken();

    if ($token) {
      $token->delete();
    }

    return response()->json(status: 204);
  }
}