<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class GameController extends Controller
{
    /**
     * Crear una nueva partida (POST /api/games)
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Generar barcos random
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
            'message' => 'Partida creada correctamente',
            'game_id' => $game->id,
            'status' => $game->status,
        ], 201);
    }

    /**
     * Realizar un tiro (POST /api/games/{game}/shots)
     */
    public function shot(Request $request, Game $game): JsonResponse
    {
        $user = $request->user();

        // Seguridad: solo el dueño puede jugar esta partida
        if ($game->user_id !== $user->id) {
            return response()->json(['error' => 'No tienes permiso para esta partida'], 403);
        }

        // Solo si la partida está activa
        if ($game->status !== 'active') {
            return response()->json(['error' => 'La partida ya ha terminado'], 400);
        }

        $request->validate([
            'row' => 'required|integer|min:0|max:9',
            'col' => 'required|integer|min:0|max:9',
        ]);

        $row = $request->row;
        $col = $request->col;

        // Verificar si la celda ya fue revelada
        $revealed = collect($game->revealed_cells);
        if ($revealed->contains(fn($cell) => $cell['row'] == $row && $cell['col'] == $col)) {
            return response()->json(['error' => 'Celda ya revelada'], 400);
        }

        $hit = false;
        $shipId = null;

        // Copia del array ships para modificarlo sin problemas de cast
        $ships = $game->ships;

        // Recorremos y modificamos la copia
        foreach ($ships as $key => $ship) {
            foreach ($ship['positions'] as $pos) {
                if ($pos['row'] == $row && $pos['col'] == $col) {
                    $hit = true;
                    $shipId = $ship['id'];
                    $ships[$key]['hits'] = ($ships[$key]['hits'] ?? 0) + 1;
                    break 2; // Salimos de los dos foreach
                }
            }
        }

        // Asignamos la copia modificada de vuelta al modelo
        $game->ships = $ships;

        // Registrar celda revelada
        $revealedCells = $game->revealed_cells ?? [];
        $revealedCells[] = [
            'row' => $row,
            'col' => $col,
            'result' => $hit ? 'hit' : 'miss',
            'ship_id' => $hit ? $shipId : null,
        ];

        $game->revealed_cells = $revealedCells;
        $game->attempts += 1;

        // Comprobar si ganó
        $won = true;
        foreach ($game->ships as $ship) {
            if (($ship['hits'] ?? 0) < $ship['size']) {
                $won = false;
                break;
            }
        }

        if ($won) {
            $game->status = 'won';
            $game->score = $game->calculateScore(); // Usa el método del modelo
        }

        $game->save();

        return response()->json([
            'hit' => $hit,
            'won' => $won,
            'revealed_cells' => $game->revealed_cells,
            'attempts' => $game->attempts,
            'score' => $game->score,
        ]);
    }

    /**
     * Obtener ranking histórico (GET /api/ranking)
     */
    public function ranking(): JsonResponse
    {
        $ranking = Game::query()
            ->where('status', 'won')
            ->join('users', 'games.user_id', '=', 'users.id')
            ->select('users.nickname', \DB::raw('SUM(games.score) as total_puntos'))
            ->groupBy('users.id', 'users.nickname')
            ->orderByDesc('total_puntos')
            ->limit(10) // top 10, quítalo si quieres todos
            ->get();

        return response()->json([
            'ranking' => $ranking,
        ]);
    }

    /**
     * Genera los 5 barcos random sin solaparse (privado)
     */
    private function generateShips(): array
    {
        $grid = array_fill(0, 10, array_fill(0, 10, null));
        $ships = [];
        $shipConfigs = [
            ['size' => 5, 'id' => 1],
            ['size' => 4, 'id' => 2],
            ['size' => 3, 'id' => 3],
            ['size' => 3, 'id' => 4],
            ['size' => 2, 'id' => 5],
        ];

        foreach ($shipConfigs as $config) {
            $placed = false;
            while (!$placed) {
                $horizontal = rand(0, 1) === 1;
                $row = rand(0, 9);
                $col = rand(0, 9);

                $positions = [];
                $canPlace = true;

                for ($i = 0; $i < $config['size']; $i++) {
                    $r = $horizontal ? $row : $row + $i;
                    $c = $horizontal ? $col + $i : $col;

                    if ($r >= 10 || $c >= 10 || $grid[$r][$c] !== null) {
                        $canPlace = false;
                        break;
                    }
                    $positions[] = ['row' => $r, 'col' => $c];
                }

                if ($canPlace) {
                    foreach ($positions as $pos) {
                        $grid[$pos['row']][$pos['col']] = $config['id'];
                    }
                    $ships[] = [
                        'id' => $config['id'],
                        'size' => $config['size'],
                        'positions' => $positions,
                        'orientation' => $horizontal ? 'h' : 'v',
                        'hits' => 0,
                    ];
                    $placed = true;
                }
            }
        }

        return $ships;
    }
}