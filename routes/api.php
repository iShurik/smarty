<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Streamer\StreamerRulesController;
use App\Http\Controllers\Streamer\StreamerProfileController;
use App\Http\Controllers\TtsVoiceController;
use App\Http\Controllers\TagController;
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
    Route::get('rules', [StreamerRulesController::class, 'show']);
    Route::put('rules/allowed-voices', [StreamerRulesController::class, 'updateAllowedVoices']);
    Route::put('rules/banned-meme-tags', [StreamerRulesController::class, 'updateBannedMemeTags']);
    Route::put('rules/banned-youtube-videos', [StreamerRulesController::class, 'updateBannedYoutubeVideos']);    
  });

  Route::get('tts/voices', [TtsVoiceController::class, 'index']);
  Route::get('tags', [TagController::class, 'index']);
});