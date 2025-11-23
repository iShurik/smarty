<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Streamer\StreamerProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
  Route::prefix('auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
      Route::get('me', [AuthController::class, 'me']);
      Route::post('logout', [AuthController::class, 'logout']);
    });
  });

  Route::middleware('auth:sanctum')->prefix('streamer')->group(function (): void {
    Route::get('profile', [StreamerProfileController::class, 'show']);
    Route::put('profile', [StreamerProfileController::class, 'update']);
  });
});