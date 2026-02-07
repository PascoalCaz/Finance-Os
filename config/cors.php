<?php

/**
 * =================================================================================
 * CONFIGURAÇÃO CORS: Cross-Origin Resource Sharing
 * PROPÓSITO: Permitir que as apps Desktop (Tauri) e Mobile (Capacitor)
 *            comuniquem com a API Laravel na Hostinger.
 * =================================================================================
 */

return [

    /*
    |--------------------------------------------------------------------------
    | CORS Paths (Rotas Permitidas)
    |--------------------------------------------------------------------------
    | Define quais rotas da API podem ser acedidas por origens externas.
    | Expandimos para todo o domínio (*) para suportar a app híbrida.
    */
    'paths' => ['*'],

    'allowed_methods' => ['*'],

    /*
    |--------------------------------------------------------------------------
    | Origens Permitidas
    |--------------------------------------------------------------------------
    | Origens que podem fazer requisições à API:
    | - tauri://localhost (App Desktop Tauri)
    | - https://tauri.localhost (Tauri em modo seguro)
    | - capacitor://localhost (App Mobile Capacitor)
    | - http://localhost:* (Desenvolvimento local)
    */
    'allowed_origins' => [
        'tauri://localhost',
        'https://tauri.localhost',
        'capacitor://localhost',
        'http://localhost',
        'http://localhost:8000',
        'http://localhost:5173',
        'http://localhost:5174',
        'https://lavenderblush-leopard-281306.hostingersite.com',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    /*
    |--------------------------------------------------------------------------
    | Suporte a Credenciais (Cookies)
    |--------------------------------------------------------------------------
    | ESSENCIAL para autenticação via cookies (Laravel Sanctum/Session).
    | Sem isto, a app nativa não consegue manter a sessão do utilizador.
    */
    'supports_credentials' => true,

];

