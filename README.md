# Trobar la Flota – Pràctica Intermodular DAWBIO2

Variant pacífica de "Enfonsar la Flota": trobar vaixells perduts en un tauler 10×10.

## Estructura actual
- `client/` → Frontend (React + Vite + TypeScript + Bootstrap)
- `server/` → Backend (Laravel – API REST + MySQL)

## Instal·lació ràpida (2026)

### 1. Client (frontend)

cd client
bun install
bun add axios react-router-dom @types/react-router-dom
bun add -D @vitejs/plugin-react

### 2. Server (backend)

cd server
composer install
php artisan install:api
