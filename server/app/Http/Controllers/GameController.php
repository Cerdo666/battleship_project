<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GameController extends Controller
{
    /**
     * Crear nueva partida
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Si hay partida activa, la cerramos o permitimos nueva?
        // Por ahora, permitimos crear nueva aunque haya activa
        // pero podríamos desactivar la anterior

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

    /**
     * Procesar un disparo
     */
    public function shot(Request $request, Game $game): JsonResponse
    {
        $user = $request->user();

        // Verificar permisos
        if ($game->user_id !== $user->id) {
            return response()->json(['error' => 'No tienes permiso'], 403);
        }

        // Verificar que la partida está activa
        if ($game->status !== 'active') {
            return response()->json(['error' => 'Esta partida ya terminó'], 400);
        }

        // Validar coordenadas
        $request->validate([
            'row' => 'required|integer|min:0|max:9',
            'col' => 'required|integer|min:0|max:9',
        ]);

        $row = $request->row;
        $col = $request->col;

        // Obtener datos actuales
        $ships = $game->ships;
        $revealedCells = $game->revealed_cells ?? [];

        // Verificar si la celda ya fue revelada
        $alreadyRevealed = collect($revealedCells)->first(function ($cell) use ($row, $col) {
            return $cell['row'] == $row && $cell['col'] == $col;
        });

        if ($alreadyRevealed) {
            return response()->json([
                'error' => 'Esta celda ya fue descubierta',
                'revealed_cells' => $revealedCells,
                'attempts' => $game->attempts,
                'won' => false,
                'score' => $game->score,
            ], 400);
        }

        // Incrementar intentos
        $game->attempts++;

        // Buscar si el disparo dio en algún barco
        $hitShip = null;
        $hitShipId = null;

        foreach ($ships as &$ship) {
            foreach ($ship['positions'] as $pos) {
                if ($pos['row'] == $row && $pos['col'] == $col) {
                    $hitShip = &$ship;
                    $hitShipId = $ship['id'];
                    $ship['hits']++;
                    break 2;
                }
            }
        }

        // Registrar celda revelada
        $revealedCells[] = [
            'row' => $row,
            'col' => $col,
            'result' => $hitShip ? 'hit' : 'miss',
            'ship_id' => $hitShipId,
        ];

        $game->revealed_cells = $revealedCells;
        $game->ships = $ships;

        // Verificar si el jugador ganó (todos los barcos hundidos)
        $allShipsHit = true;
        foreach ($ships as $ship) {
            if ($ship['hits'] < $ship['size']) {
                $allShipsHit = false;
                break;
            }
        }

        $won = false;
        if ($allShipsHit) {
            $game->status = 'won';
            $game->score = $game->calculateScore();
            $won = true;
        }

        $game->save();

        return response()->json([
            'revealed_cells' => $game->revealed_cells,
            'attempts' => $game->attempts,
            'won' => $won,
            'score' => $game->score,
            'message' => $hitShip ? '¡Tocado!' : 'Agua',
        ]);
    }

    /**
     * Generar 5 barcos aleatorios sin solaparse
     */
    private function generateShips(): array
    {
        $ships = [];
        $configs = [
            ['size' => 2, 'color' => 'bg-purple'],
            ['size' => 3, 'color' => 'bg-success'],
            ['size' => 3, 'color' => 'bg-primary'],
            ['size' => 4, 'color' => 'bg-danger'],
            ['size' => 5, 'color' => 'bg-warning'],
        ];

        $grid = array_fill(0, 10, array_fill(0, 10, null));
        $shipId = 1;

        foreach ($configs as $config) {
            $placed = false;
            $attempts = 0;
            $maxAttempts = 1000;

            while (!$placed && $attempts < $maxAttempts) {
                $attempts++;
                
                // Decidir orientación (horizontal o vertical)
                $horizontal = rand(0, 1) == 1;
                
                // Calcular posición inicial
                if ($horizontal) {
                    $row = rand(0, 9);
                    $col = rand(0, 10 - $config['size']);
                } else {
                    $row = rand(0, 10 - $config['size']);
                    $col = rand(0, 9);
                }

                // Verificar si las posiciones están libres
                $positions = [];
                $valid = true;

                for ($i = 0; $i < $config['size']; $i++) {
                    $r = $horizontal ? $row : $row + $i;
                    $c = $horizontal ? $col + $i : $col;

                    if ($grid[$r][$c] !== null) {
                        $valid = false;
                        break;
                    }
                    $positions[] = ['row' => $r, 'col' => $c];
                }

                // Colocar el barco
                if ($valid) {
                    foreach ($positions as $pos) {
                        $grid[$pos['row']][$pos['col']] = $shipId;
                    }

                    $ships[] = [
                        'id' => $shipId,
                        'size' => $config['size'],
                        'color' => $config['color'],
                        'positions' => $positions,
                        'hits' => 0,
                        'orientation' => $horizontal ? 'h' : 'v',
                    ];

                    $shipId++;
                    $placed = true;
                }
            }

            // Si no se pudo colocar después de muchos intentos (algo raro)
            if (!$placed) {
                throw new \Exception('No se pudo colocar el barco de tamaño ' . $config['size']);
            }
        }

        return $ships;
    }

    /**
     * Ranking de usuarios
     */
    public function ranking(): JsonResponse
    {
        $users = User::withSum(['games' => function ($query) {
                $query->where('status', 'won');
            }], 'score')
            ->orderBy('games_sum_score', 'desc')
            ->get(['id', 'nickname']);
        
        $ranking = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'nickname' => $user->nickname,
                'total_puntos' => $user->games_sum_score ?? 0,
            ];
        });

        return response()->json([
            'ranking' => $ranking
        ]);
    }

    /**
     * Información del usuario para Dashboard
     */
    public function userInfo(Request $request): JsonResponse
    {
        $user = $request->user();
        $activeGame = $user->games()->where('status', 'active')->first();

        return response()->json([
            'id' => $user->id,
            'nickname' => $user->nickname,
            'active_game' => $activeGame ? [
                'id' => $activeGame->id,
                'attempts' => $activeGame->attempts,
            ] : null,
        ]);
    }
}