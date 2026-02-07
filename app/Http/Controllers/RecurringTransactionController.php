<?php

namespace App\Http\Controllers;

use App\Models\RecurringTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

/**
 * =================================================================================
 * ARQUIVO: RecurringTransactionController.php
 * PROPÓSITO: Gerenciar os lançamentos automáticos (Salários, Aluguer, etc).
 * CONCEITOS ENSINADOS:
 * - Date Manipulation: Calcular próximas datas baseadas em frequências.
 * - Inertia Integration: Enviar agendamentos para a UI.
 * =================================================================================
 */
class RecurringTransactionController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        return Inertia::render('Recurring/Index', [
            'recurring_transactions' => $user->recurringTransactions()
                ->with(['account', 'category'])
                ->get(),
            'accounts' => $user->accounts()->get(),
            'categories' => $user->categories()->get()
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'type' => 'required|string|in:income,expense',
            'frequency' => 'required|string|in:daily,weekly,monthly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $validated['next_process_date'] = $validated['start_date'];
        $validated['user_id'] = auth()->id();

        RecurringTransaction::create($validated);

        return redirect()->back()->with('success', 'Agendamento criado com sucesso! O sistema fará o resto.');
    }

    public function update(Request $request, RecurringTransaction $recurringTransaction): RedirectResponse
    {
        if ($recurringTransaction->user_id !== auth()->id())
            abort(403);

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'type' => 'required|string|in:income,expense',
            'frequency' => 'required|string|in:daily,weekly,monthly,yearly',
            'is_active' => 'required|boolean',
        ]);

        $recurringTransaction->update($validated);

        return redirect()->back()->with('success', 'Agendamento atualizado.');
    }

    public function destroy(RecurringTransaction $recurringTransaction): RedirectResponse
    {
        if ($recurringTransaction->user_id !== auth()->id())
            abort(403);

        $recurringTransaction->delete();

        return redirect()->back()->with('success', 'Agendamento removido.');
    }
}
