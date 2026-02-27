<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registro de usuario (devuelve token)
     */
    public function register(Request $request)
    {
        $request->validate([
            'nickname' => 'required|string|max:255|unique:users,nickname',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'nickname' => $request->nickname,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'user' => $user->only('id', 'nickname'),
            'token' => $token,
        ], 201);
    }

    /**
     * Login (devuelve token si credenciales OK)
     */
    public function login(Request $request)
    {
        $request->validate([
            'nickname' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('nickname', $request->nickname)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'nickname' => ['Credenciales incorrectas.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login correcto',
            'user' => $user->only('id', 'nickname'),
            'token' => $token,
        ]);
    }

    /**
     * Logout (revoca el token actual)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente',
        ]);
    }
}