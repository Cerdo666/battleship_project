<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;  // ← Cambia esto (sin Api\)
use App\Http\Controllers\GameController; 

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    // Rutas futuras del juego aquí
});

Route::get('/ranking', [GameController::class, 'ranking']);

Route::post('/games/{game}/shots', [GameController::class, 'shot']);

Route::get('/me', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/games', [GameController::class, 'store']);
    Route::post('/games/{game}/shots', [GameController::class, 'shot']);
    // la ruta de prueba /me si la pusiste
});