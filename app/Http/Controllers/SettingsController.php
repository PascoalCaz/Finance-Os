<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

/**
 * =================================================================================
 * ARQUIVO: SettingsController.php
 * PROPÓSITO: Gerir as preferências do sistema para o utilizador.
 * CONCEITOS ENSINADOS:
 * - User Preferences: Como persistir configurações personalizadas de cada utilizador.
 * - Form Handling: Processamento de selects e switches (booleans).
 * =================================================================================
 */
class SettingsController extends Controller
{
    /**
     * Exibe a página de configurações.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Settings/Index', [
            'settings' => $request->user()->only([
                'default_currency',
                'language',
                'timezone',
                'notifications_enabled',
            ]),
        ]);
    }

    /**
     * Atualiza as preferências do utilizador.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'default_currency' => 'required|string|max:10',
            'language' => 'required|string|in:pt,en',
            'timezone' => 'required|string',
            'notifications_enabled' => 'required|boolean',
        ]);

        $request->user()->update($validated);

        return redirect()->back()->with('success', 'Configurações atualizadas!');
    }
}
