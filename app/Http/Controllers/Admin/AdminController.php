<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

/**
 * =================================================================================
 * ARQUIVO: AdminController.php
 * PROPÓSITO: Gestão global do sistema (SaaS/Multitenant).
 * CONCEITOS ENSINADOS:
 * - Administrative Control: Poder de gerir perfis e estados de outros utilizadores.
 * - Subscription Management: Controlo de planos e datas de expiração.
 * =================================================================================
 */
class AdminController extends Controller
{
    /**
     * Dashboard Administrativo: Resumo do sistema.
     */
    public function dashboard(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_users' => User::count(),
                'active_subscriptions' => User::where('subscription_plan', '!=', 'free')->count(),
                'new_users_month' => User::whereMonth('created_at', now()->month)->count(),
            ],
            'recent_users' => User::latest()->take(5)->get(),
        ]);
    }

    /**
     * Listagem de Utilizadores.
     */
    public function users(): Response
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => User::orderBy('name')->paginate(10),
        ]);
    }

    /**
     * Criação de novo utilizador pelo Admin.
     */
    public function storeUser(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', Rules\Password::defaults()],
            'role' => 'required|in:user,admin,super_admin',
            'subscription_plan' => 'required|in:free,pro,enterprise',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'subscription_plan' => $request->subscription_plan,
            'status' => 'active',
        ]);

        return redirect()->back()->with('success', 'Utilizador criado com sucesso!');
    }

    /**
     * Atualização de utilizador e subscrição.
     */
    public function updateUser(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|in:user,admin,super_admin',
            'subscription_plan' => 'required|in:free,pro,enterprise',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'Dados do utilizador atualizados!');
    }

    /**
     * Remoção de utilizador.
     */
    public function destroyUser(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Não podes remover-te a ti mesmo!');
        }

        $user->delete();
        return redirect()->back()->with('success', 'Utilizador removido do sistema.');
    }
}
