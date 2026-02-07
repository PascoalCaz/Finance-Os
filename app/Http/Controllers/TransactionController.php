<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

/**
 * =================================================================================
 * ARQUIVO: TransactionController.php
 * PROPÓSITO: Registrar movimentações financeiras e manter saldos atualizados.
 * CONCEITOS ENSINADOS:
 * - DB::transaction: Garante que ou tudo funciona, ou nada é salvo (Atomicidade).
 * - Business Logic: Como subtrair/somar valores baseado no tipo de transação.
 * =================================================================================
 */
class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = $request->user()->transactions()->with(['account', 'category']);

        // APLICAÇÃO DE FILTROS DINÂMICOS
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('account_id')) {
            $query->where('account_id', $request->account_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        $transactions = $query->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'accounts' => $request->user()->accounts()->get(),
            'categories' => $request->user()->categories()->get(),
            'filters' => $request->only(['search', 'category_id', 'account_id', 'type', 'date_from', 'date_to']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'nullable|exists:categories,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'exchange_rate' => 'nullable|numeric|min:0.000001',
            'description' => 'nullable|string|max:255',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'type' => 'required|in:income,expense,transfer',
            'to_account_id' => 'required_if:type,transfer|nullable|exists:accounts,id|different:account_id',
        ]);

        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('attachments', 'public');
            $validated['attachment_path'] = $path;
        }

        DB::transaction(function () use ($request, $validated) {
            $account = Account::find($validated['account_id']);
            $exchangeRate = $validated['exchange_rate'] ?? 1;

            // LÓGICA: Se for transferência, verificar moedas
            if ($validated['type'] === 'transfer') {
                $toAccount = Account::find($validated['to_account_id']);

                // Se as moedas forem iguais, ignorar taxa de câmbio (forçar 1)
                if ($account->currency === $toAccount->currency) {
                    $exchangeRate = 1;
                }

                $validated['exchange_rate'] = $exchangeRate;
                $validated['converted_amount'] = $validated['amount'] * $exchangeRate;
            }

            // 1. Criar a transação
            $transaction = $request->user()->transactions()->create($validated);

            // 2. Atualizar saldos das contas
            if ($validated['type'] === 'income') {
                $account->increment('balance', $validated['amount']);
            } elseif ($validated['type'] === 'expense') {
                $account->decrement('balance', $validated['amount']);
            } elseif ($validated['type'] === 'transfer') {
                $account->decrement('balance', $validated['amount']);
                $toAccount = Account::find($validated['to_account_id']);

                // O valor que entra na conta de destino é o valor original * taxa de câmbio
                $toAccount->increment('balance', $validated['amount'] * $exchangeRate);
            }
        });

        return redirect()->back()->with('success', 'Transação registrada!');
    }

    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        if ($transaction->user_id !== auth()->id())
            abort(403);

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'nullable|exists:categories,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'type' => 'required|in:income,expense,transfer',
            'to_account_id' => 'required_if:type,transfer|nullable|exists:accounts,id|different:account_id',
        ]);

        if ($request->hasFile('attachment')) {
            // Remover anexo antigo se existir
            if ($transaction->attachment_path) {
                Storage::disk('public')->delete($transaction->attachment_path);
            }
            $path = $request->file('attachment')->store('attachments', 'public');
            $validated['attachment_path'] = $path;
        }

        DB::transaction(function () use ($transaction, $validated) {
            // 1. Reverter saldos antigos
            $this->adjustBalances($transaction, 'revert');

            // 2. Atualizar a transação
            $transaction->update($validated);

            // 3. Aplicar novos saldos
            $this->adjustBalances($transaction, 'apply');
        });

        return redirect()->back()->with('success', 'Transação atualizada!');
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        if ($transaction->user_id !== auth()->id())
            abort(403);

        DB::transaction(function () use ($transaction) {
            $this->adjustBalances($transaction, 'revert');
            $transaction->delete();
        });

        return redirect()->back()->with('success', 'Transação removida e saldo estornado.');
    }

    /**
     * AUXILIAR: Ajusta os saldos das contas baseada na transação.
     * $mode: 'apply' (adiciona/subtrai normalmente) ou 'revert' (faz o oposto)
     */
    protected function adjustBalances(Transaction $transaction, string $mode)
    {
        $multiplier = ($mode === 'apply') ? 1 : -1;
        $account = Account::find($transaction->account_id);

        if ($transaction->type === 'income') {
            $account->increment('balance', $transaction->amount * $multiplier);
        } elseif ($transaction->type === 'expense') {
            $account->decrement('balance', $transaction->amount * $multiplier);
        } elseif ($transaction->type === 'transfer') {
            $account->decrement('balance', $transaction->amount * $multiplier);

            $toAccount = Account::find($transaction->to_account_id);
            // CONCEITO: O valor ajustado na conta de destino respeita a taxa de câmbio gravada na transação
            $toAccount->increment('balance', ($transaction->amount * $transaction->exchange_rate) * $multiplier);
        }
    }
}
