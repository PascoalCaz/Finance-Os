<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

/**
 * =================================================================================
 * ARQUIVO: AccountController.php
 * PROPÓSITO: Gerenciar as contas financeiras do utilizador (Bancos, Carteira, etc).
 * CONCEITOS ENSINADOS:
 * - Inertia::render: Como enviar dados do PHP para componentes React.
 * - Validation: Garantir que os dados recebidos são válidos antes de salvar.
 * - Redirect: Navegação fluida após operações de banco de dados.
 * =================================================================================
 */
class AccountController extends Controller
{
    /**
     * EXIBIÇÃO: Lista todas as contas do utilizador logado.
     */
    public function index(): Response
    {
        return Inertia::render('Accounts/Index', [
            'accounts' => auth()->user()->accounts()->orderBy('name')->get()
        ]);
    }

    /**
     * CRIAÇÃO: Salva uma nova conta no banco de dados.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:checking,savings,investment,cash',
            'bank_name' => 'nullable|string|max:255',
            'balance' => 'required|numeric',
            'currency' => 'nullable|string|size:3',
            'color' => 'nullable|string|max:7',
        ]);

        $validated['currency'] = $validated['currency'] ?? 'AOA';

        $request->user()->accounts()->create($validated);

        return redirect()->back()->with('success', 'Conta criada com sucesso!');
    }

    public function update(Request $request, Account $account): RedirectResponse
    {
        $this->authorizeAccount($account);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:checking,savings,investment,cash',
            'bank_name' => 'nullable|string|max:255',
            'balance' => 'required|numeric',
            'currency' => 'nullable|string|size:3',
            'color' => 'nullable|string|max:7',
        ]);

        $account->update($validated);

        return redirect()->back()->with('success', 'Conta atualizada!');
    }

    /**
     * REMOÇÃO: Exclui uma conta.
     */
    public function destroy(Account $account): RedirectResponse
    {
        $this->authorizeAccount($account);

        $account->delete();

        return redirect()->back()->with('success', 'Conta removida.');
    }

    public function show(Account $account): Response
    {
        $this->authorizeAccount($account);

        $transactions = $account->transactions()
            ->with(['category', 'destinationAccount'])
            ->orderByDesc('date')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Accounts/Show', [
            'account' => $account,
            'transactions' => $transactions
        ]);
    }

    /**
     * AUXILIAR: Verifica se o utilizador tem permissão sobre a conta.
     */
    protected function authorizeAccount(Account $account)
    {
        if ($account->user_id !== auth()->id()) {
            abort(403);
        }
    }
}
