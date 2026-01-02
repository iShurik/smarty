<?php

use App\Http\Controllers\OverlayController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/overlay/streamer/{slug}/view', [OverlayController::class, 'view']);
Route::get('/overlay/streamer/{slug}', [OverlayController::class, 'streamer']);

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
