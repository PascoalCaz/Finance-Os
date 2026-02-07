<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

/**
 * =================================================================================
 * ARQUIVO: BudgetController.php
 * PROPÓSITO: Planejar limites de gastos por categoria.
 * CONCEITOS ENSINADOS:
 * - Resource Scoping: Garantir que orçamentos pertençam ao utilizador.
 * - Data Aggregation: Comparar orçamento definido com gastos reais (implementado no Dashboard).
 * =================================================================================
 */
class BudgetController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Budgets/Index', [
            'budgets' => auth()->user()->budgets()->with(['category', 'items'])->get(),
            'categories' => auth()->user()->categories()->where('type', 'expense')->get()
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'month' => 'nullable|integer|min:1|max:12',
            'year' => 'nullable|integer|min:2000',
            'items' => 'nullable|array',
            'items.*.name' => 'required|string|max:255',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        if (!$request->has('month'))
            $validated['month'] = now()->month;
        if (!$request->has('year'))
            $validated['year'] = now()->year;

        $budget = $request->user()->budgets()->create($validated);

        if (isset($validated['items'])) {
            foreach ($validated['items'] as $item) {
                $budget->items()->create($item);
            }
        }

        return redirect()->back()->with('success', 'Orçamento definido com itens!');
    }

    public function update(Request $request, Budget $budget): RedirectResponse
    {
        if ($budget->user_id !== auth()->id())
            abort(403);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'month' => 'nullable|integer|min:1|max:12',
            'year' => 'nullable|integer|min:2000',
            'items' => 'nullable|array',
            'items.*.name' => 'required|string|max:255',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        $budget->update($validated);

        if (isset($validated['items'])) {
            $budget->items()->delete();
            foreach ($validated['items'] as $item) {
                $budget->items()->create($item);
            }
        }

        return redirect()->back()->with('success', 'Orçamento e itens atualizados!');
    }

    public function show(Budget $budget): Response
    {
        if ($budget->user_id !== auth()->id())
            abort(403);

        $budget->load(['category', 'items']);
        $totalPlannedItems = $budget->items->sum('amount');

        // 1. Obter transações reais para esta categoria no período do orçamento
        $transactions = auth()->user()->transactions()
            ->with(['account', 'category'])
            ->where('category_id', $budget->category_id)
            ->where('type', 'expense')
            ->whereMonth('date', $budget->month)
            ->whereYear('date', $budget->year)
            ->orderByDesc('date')
            ->get();

        // 2. Calcular o total gasto (Convertido para a moeda do orçamento)
        // Usamos taxas fixas para consistência com o Dashboard por enquanto
        $toAoa = ['AOA' => 1, 'USD' => 830, 'EUR' => 900];
        $totalReal = 0;

        foreach ($transactions as $t) {
            $fromCurrency = $t->account->currency ?? 'AOA';
            $amountInAoa = $t->amount * ($toAoa[$fromCurrency] ?? 1);
            $budgetRateInAoa = $toAoa[$budget->currency] ?? 1;
            $totalReal += $amountInAoa / $budgetRateInAoa;
        }

        return Inertia::render('Budgets/Show', [
            'budget' => $budget,
            'transactions' => $transactions,
            'analysis' => [
                'real_spend' => round($totalReal, 2),
                'percent' => $budget->amount > 0 ? round(($totalReal / $budget->amount) * 100, 1) : 0,
                'remaining' => round($budget->amount - $totalReal, 2),
                'total_planned_items' => round($totalPlannedItems, 2),
            ]
        ]);
    }

    public function destroy(Budget $budget): RedirectResponse
    {
        if ($budget->user_id !== auth()->id())
            abort(403);

        $budget->delete();

        return redirect()->back()->with('success', 'Orçamento removido.');
    }
}
