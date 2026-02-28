<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;

// RUTAS PÚBLICAS
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/ranking', [GameController::class, 'ranking']);

// RUTAS PROTEGIDAS (requieren token)
Route::middleware('auth:sanctum')->group(function () {
    // Usuario actual
    Route::get('/user', [AuthController::class, 'user']);
    
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Juego
    Route::post('/games', [GameController::class, 'store']);
    Route::post('/games/{game}/shots', [GameController::class, 'shot']);
    Route::get('/user/info', [GameController::class, 'userInfo']);
    
    // Perfil de usuario (nuevos)
    Route::get('/user/games', [UserController::class, 'games']);
    Route::put('/user/password', [UserController::class, 'updatePassword']);
    Route::get('/user/stats', [UserController::class, 'stats']);
});