<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'ships',
        'revealed_cells',
        'status',
        'attempts',
        'score',
        'time_spent',
    ];

    protected $casts = [
        'ships' => 'array',
        'revealed_cells' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Método útil: comprobar si está ganado
    public function isWon(): bool
    {
        foreach ($this->ships as $ship) {
            if ($ship['hits'] < $ship['size']) {
                return false;
            }
        }
        return true;
    }

    public function calculateScore(): int
    {
        return max(0, 100 - $this->attempts); // Ajusta fórmula
    }
}