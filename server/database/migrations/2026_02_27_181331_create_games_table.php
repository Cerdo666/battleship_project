<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('ships');                    // [{id:1, size:5, positions:[{row:0,col:1},...], orientation:'h'|'v', hits:0}]
            $table->json('revealed_cells')->nullable(); // [{row:3, col:5, result:'miss'|'hit', ship_id?:1}]
            $table->enum('status', ['active', 'won'])->default('active');
            $table->integer('attempts')->default(0);
            $table->integer('score')->default(0);     // puntuación ESTA partida (calculada al ganar)
            $table->integer('time_spent')->default(0); // segundos (opcional, si mides tiempo)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
