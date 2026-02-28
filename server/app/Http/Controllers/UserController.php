<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function games(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $games = $user->games()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($game) {
                return [
                    'id' => $game->id,
                    'status' => $game->status,
                    'attempts' => $game->attempts,
                    'score' => $game->score,
                    'created_at' => $game->created_at->format('Y-m-d H:i:s'),
                    'won' => $game->status === 'won',
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $games,
            'total' => $games->count(),
            'won_games' => $games->where('won', true)->count(),
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'confirmed', Password::min(6)],
        ]);

        $user = $request->user();
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Contraseña actualizada correctamente',
            'success' => true
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $games = $user->games;
        $wonGames = $games->where('status', 'won');
        
        $ranking = User::withSum(['games as total_puntos' => function ($query) {
                $query->where('status', 'won');
            }], 'score')
            ->orderByDesc('total_puntos')
            ->get();
        
        $position = $ranking->search(function ($item) use ($user) {
            return $item->id === $user->id;
        });

        return response()->json([
            'nickname' => $user->nickname,
            'created_at' => $user->created_at,
            'stats' => [
                'total_games' => $games->count(),
                'won_games' => $wonGames->count(),
                'total_attempts' => $games->sum('attempts'),
                'total_score' => $wonGames->sum('score'),
                'average_score' => $wonGames->count() > 0 
                    ? round($wonGames->sum('score') / $wonGames->count(), 2) 
                    : 0,
                'best_score' => $wonGames->max('score') ?? 0,
                'ranking_position' => $position !== false ? $position + 1 : null,
            ]
        ]);
    }
}