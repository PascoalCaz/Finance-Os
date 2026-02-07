<?php

namespace App\Http\Controllers;

use App\Models\FinancialGoal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

/**
 * =================================================================================
 * ARQUIVO: FinancialGoalController.php
 * PROPÓSITO: Ajudar o utilizador a poupar para sonhos e necessidades futuras.
 * CONCEITOS ENSINADOS:
 * - Deadline Tracking: Como lidar com datas limite em modelos de dados.
 * - Progress Calculation: Lógica de percentagem (Saldo Atual / Meta).
 * =================================================================================
 */
class FinancialGoalController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Goals/Index', [
            'goals' => auth()->user()->financialGoals()->with('account')->orderBy('deadline')->get(),
            'accounts' => auth()->user()->accounts()->where('type', 'savings')->orderBy('name')->get()
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'account_id' => 'nullable|exists:accounts,id',
            'target_amount' => 'required|numeric|min:0.01',
            'current_amount' => 'required|numeric|min:0',
            'deadline' => 'nullable|date|after_or_equal:today',
            'monthly_savings_planned' => 'nullable|numeric|min:0',
            'allocation_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $request->user()->financialGoals()->create($validated);

        return redirect()->back()->with('success', 'Meta financeira criada! Vamos poupar!');
    }

    public function update(Request $request, FinancialGoal $goal): RedirectResponse
    {
        if ($goal->user_id !== auth()->id())
            abort(403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'account_id' => 'nullable|exists:accounts,id',
            'target_amount' => 'required|numeric|min:0.01',
            'current_amount' => 'required|numeric|min:0',
            'deadline' => 'nullable|date',
            'monthly_savings_planned' => 'nullable|numeric|min:0',
            'allocation_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $goal->update($validated);

        return redirect()->back()->with('success', 'Meta atualizada!');
    }

    public function destroy(FinancialGoal $goal): RedirectResponse
    {
        if ($goal->user_id !== auth()->id())
            abort(403);

        $goal->delete();

        return redirect()->back()->with('success', 'Meta removida.');
    }
}
