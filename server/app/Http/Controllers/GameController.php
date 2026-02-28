<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GameController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->games()->where('status', 'active')->exists()) {
            return response()->json(['error' => 'Ya tienes una partida activa'], 400);
        }

        $ships = $this->generateShips();

        $game = Game::create([
            'user_id' => $user->id,
            'ships' => $ships,
            'revealed_cells' => [],
            'status' => 'active',
            'attempts' => 0,
            'score' => 0,
            'time_spent' => 0,
        ]);

        return response()->json([
            'message' => 'Partida creada',
            'game_id' => $game->id,
            'status' => $game->status,
        ], 201);
    }

    public function shot(Request $request, Game $game): JsonResponse
    {
        $user = $request->user();

        if ($game->user_id !== $user->id) {
            return response()->json(['error' => 'No tienes permiso'], 403);
        }

        if ($game->status !== 'active') {
            return response()->json(['error' => 'Partida terminada'], 400);
        }

        $request->validate([
            'row' => 'required|integer|min:0|max:9',
            'col' => 'required|integer|min:0|max:9',
        ]);

        $row = $request->row;
        $col = $request->col;

        // TODO: Implementar lógica del disparo
        
        return response()->json([
            'message' => 'Disparo recibido',
            'row' => $row,
            'col' => $col,
        ]);
    }

     public function ranking(): JsonResponse
    {
        // Obtener todos los usuarios con la suma de sus puntos de partidas ganadas
        $users = User::withSum(['games' => function ($query) {
                $query->where('status', 'won');
            }], 'score')
            ->orderBy('games_sum_score', 'desc')
            ->get(['id', 'nickname']);
        
        // Formatear la respuesta
        $ranking = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'nickname' => $user->nickname,
                'total_puntos' => $user->games_sum_score ?? 0, // Si es null, devuelve 0
            ];
        });

        return response()->json([
            'ranking' => $ranking
        ]);
    }
    
    private function generateShips(): array
    {
        // Implementar generación de barcos
        return [];
    }

    public function userInfo(Request $request): JsonResponse
    {
        $user = $request->user();
        $activeGame = $user->games()->where('status', 'active')->first();

        return response()->json([
            'user' => $user,
            'active_game' => $activeGame,
        ]);
    }
}