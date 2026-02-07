<?php

namespace App\Console\Commands;

use App\Models\Account;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * =================================================================================
 * ARQUIVO: ProcessRecurringTransactions.php
 * PROPÓSITO: O "Coração" da automação financeira. Corre agendamentos vencidos.
 * CONCEITOS ENSINADOS:
 * - Recurring Logic: Como automatizar processos que dependem do tempo.
 * - Atomic Transactions: Garantir que a criação do log e atualização do saldo
 *   ocorrem em conjunto.
 * =================================================================================
 */
class ProcessRecurringTransactions extends Command
{
    /**
     * O nome e a assinatura do comando.
     * Use: php artisan app:process-recurring
     */
    protected $signature = 'app:process-recurring';

    /**
     * A descrição do comando.
     */
    protected $description = 'Processa as transações financeiras agendadas que venceram.';

    /**
     * LÓGICA PRINCIPAL DO COMANDO.
     */
    public function handle()
    {
        $today = Carbon::today();

        // 1. Buscar agendamentos activos que chegaram à data de processamento
        $recurring = RecurringTransaction::where('is_active', true)
            ->where('next_process_date', '<=', $today)
            ->where(function ($query) use ($today) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', $today);
            })
            ->get();

        if ($recurring->isEmpty()) {
            $this->info('Nenhuma transação recorrente para processar hoje.');
            return;
        }

        foreach ($recurring as $item) {
            $this->info("Processando: {$item->description} ({$item->amount})");

            DB::transaction(function () use ($item) {
                // A. Criar a transação real
                Transaction::create([
                    'user_id' => $item->user_id,
                    'account_id' => $item->account_id,
                    'category_id' => $item->category_id,
                    'date' => Carbon::today(),
                    'amount' => $item->amount,
                    'type' => $item->type,
                    'description' => "[AUTOMÁTICO] {$item->description}",
                ]);

                // B. Atualizar o saldo da conta
                $account = Account::find($item->account_id);
                if ($item->type === 'income') {
                    $account->increment('balance', $item->amount);
                } else {
                    $account->decrement('balance', $item->amount);
                }

                // C. Calcular a próxima data de processamento
                $item->next_process_date = $this->calculateNextDate($item->next_process_date, $item->frequency);
                $item->save();
            });
        }

        $this->info('Todas as transações recorrentes foram processadas!');
    }

    /**
     * AUXILIAR: Calcula o salto no tempo baseado na frequência escolhida.
     */
    protected function calculateNextDate($currentDate, $frequency)
    {
        $date = Carbon::parse($currentDate);

        return match ($frequency) {
            'daily' => $date->addDay(),
            'weekly' => $date->addWeek(),
            'monthly' => $date->addMonth(),
            'yearly' => $date->addYear(),
            default => $date->addMonth(),
        };
    }
}
