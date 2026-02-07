<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Transaction;
use Carbon\Carbon;

/**
 * =================================================================================
 * ARQUIVO: DashboardController.php
 * PROPÓSITO: Centralizar os dados resumidos e estatísticos para a tela inicial.
 * CONCEITOS ENSINADOS:
 * - Aggregation (SQL): Sumarizar valores (SUM) com condições de data.
 * - Carbon: Biblioteca PHP poderosa para manipulação de datas.
 * =================================================================================
 */
class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        // FILTROS DE PERÍODO
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        $now = Carbon::createFromDate($year, $month, 1);

        $baseCurrency = $user->default_currency ?? 'AOA';

        // TAXAS DE CONVERSÃO (Referência: 1 Unidade -> AOA)
        $toAoa = [
            'AOA' => 1,
            'USD' => 830,
            'EUR' => 900,
        ];

        // FUNÇÃO AUXILIAR: Converter de qualquer moeda para a Base do Usuário
        $convert = function ($amount, $fromCurrency) use ($toAoa, $baseCurrency) {
            $amountInAoa = $amount * ($toAoa[$fromCurrency] ?? 1);
            $baseRateInAoa = $toAoa[$baseCurrency] ?? 1;
            return $amountInAoa / $baseRateInAoa;
        };

        // 1. Saldo Total Convertido para Moeda Base
        $accounts = $user->accounts()->get();
        $totalBalance = 0;
        foreach ($accounts as $account) {
            $totalBalance += $convert($account->balance, $account->currency);
        }

        // 2. Resumo Mensal Convertido
        $monthlyIncome = 0;
        $monthlyExpense = 0;
        $monthTransactions = $user->transactions()
            ->with('account')
            ->whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->get();

        foreach ($monthTransactions as $t) {
            if ($t->account) {
                if ($t->type === 'income')
                    $monthlyIncome += $convert($t->amount, $t->account->currency);
                if ($t->type === 'expense')
                    $monthlyExpense += $convert($t->amount, $t->account->currency);
            }
        }

        // 3. Dados para o gráfico (Últimos 6 meses) - Convertido
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::now()->subMonths($i);
            $inc = 0;
            $exp = 0;
            $mTransactions = $user->transactions()
                ->with('account')
                ->whereMonth('date', $monthDate->month)
                ->whereYear('date', $monthDate->year)
                ->get();

            foreach ($mTransactions as $mt) {
                if ($mt->account) {
                    $mr = $toAoa[$mt->account->currency] ?? 1;
                    $userRate = $toAoa[$baseCurrency] ?? 1;
                    $convertedVal = ($mt->amount * $mr) / $userRate;

                    if ($mt->type === 'income')
                        $inc += $convertedVal;
                    if ($mt->type === 'expense')
                        $exp += $convertedVal;
                }
            }

            $chartData[] = [
                'month' => $monthDate->format('M'),
                'income' => $inc,
                'expense' => $exp,
            ];
        }

        // 4. Despesas por Categoria (Mês Atual)
        $expensesByCategory = [];
        $catExpenses = $user->transactions()
            ->with(['account', 'category'])
            ->where('type', 'expense')
            ->whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->get()
            ->groupBy('category_id');

        foreach ($catExpenses as $catId => $trans) {
            $catName = $trans->first()->category->name ?? 'Geral';
            $total = 0;
            foreach ($trans as $t) {
                $total += $convert($t->amount, $t->account->currency);
            }
            $expensesByCategory[] = [
                'name' => $catName,
                'value' => round($total, 2)
            ];
        }

        $activeGoalsCount = $user->financialGoals()->count();
        $budgets = $user->budgets()->with(['category', 'items'])->get();
        $totalBudget = 0;
        $detailedBudgets = [];

        foreach ($budgets as $budget) {
            $br = $toAoa[$budget->currency] ?? 1;
            $userRate = $toAoa[$baseCurrency] ?? 1;
            $budgetAmountConverted = ($budget->amount * $br) / $userRate;
            $totalBudget += $budgetAmountConverted;

            // Calcular gasto real para ESTA categoria específica no mês atual
            $realSpend = 0;
            if ($budget->category_id) {
                $categoryTransactions = $user->transactions()
                    ->with('account')
                    ->where('category_id', $budget->category_id)
                    ->where('type', 'expense')
                    ->whereMonth('date', $now->month)
                    ->whereYear('date', $now->year)
                    ->get();

                foreach ($categoryTransactions as $ct) {
                    $realSpend += $convert($ct->amount, $ct->account->currency);
                }
            }

            $detailedBudgets[] = [
                'id' => $budget->id,
                'category_name' => $budget->category->name ?? 'Geral',
                'planned' => round($budgetAmountConverted, 2),
                'real' => round($realSpend, 2),
                'percent' => $budgetAmountConverted > 0 ? round(($realSpend / $budgetAmountConverted) * 100, 1) : 0,
                'items' => $budget->items,
                'currency' => $baseCurrency,
            ];
        }

        $budgetUtilization = $totalBudget > 0 ? ($monthlyExpense / $totalBudget) * 100 : 0;

        // 5. Insights de Elite: Top 5 Categorias e Previsão
        usort($expensesByCategory, fn($a, $b) => $b['value'] <=> $a['value']);
        $topCategories = array_slice($expensesByCategory, 0, 5);

        // Previsão Simples: Saldo Atual + (Fluxo Diário Médio * Dias Restantes)
        $daysInMonth = $now->daysInMonth;
        $dayOfMonth = $now->day;
        $remainingDays = $daysInMonth - $dayOfMonth;
        $dailyFlow = ($monthlyIncome - $monthlyExpense) / max($dayOfMonth, 1);
        $forecastBalance = $totalBalance + ($dailyFlow * $remainingDays);

        // Previsão Hipótese 2: Baseada em Orçamentos (Saldo Atual - Restante do Orçamento)
        $remainingBudget = 0;
        foreach ($detailedBudgets as $db) {
            $diff = $db['planned'] - $db['real'];
            if ($diff > 0) {
                $remainingBudget += $diff;
            }
        }
        $forecastBudget = $totalBalance - $remainingBudget;

        // Alerta de Orçamento (Notificações)
        if ($user->notifications_enabled && $budgetUtilization > 100) {
            session()->flash('error', 'Atenção: O seu orçamento mensal foi excedido!');
        } elseif ($user->notifications_enabled && $budgetUtilization > 80) {
            session()->flash('success', 'Aviso: Já utilizou mais de 80% do seu orçamento.');
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_balance' => $totalBalance,
                'monthly_income' => $monthlyIncome,
                'monthly_expense' => $monthlyExpense,
                'active_goals_count' => $activeGoalsCount,
                'budget_utilization' => round($budgetUtilization, 1),
                'chart_data' => $chartData,
                'expenses_by_category' => $expensesByCategory,
                'top_categories' => $topCategories,
                'detailed_budgets' => $detailedBudgets,
                'forecast_balance' => round($forecastBalance, 2),
                'forecast_budget' => round($forecastBudget, 2),
                'daily_flow' => round($dailyFlow, 2),
                'recent_transactions' => $user->transactions()
                    ->with(['account', 'category'])
                    ->orderByDesc('id')
                    ->limit(5)
                    ->get(),
            ],
            'accounts' => $accounts,
            'filters' => [
                'month' => (int) $month,
                'year' => (int) $year,
            ]
        ]);
    }
}
