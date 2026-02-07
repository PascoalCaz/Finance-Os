<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * =================================================================================
 * ARQUIVO: FinancialGoal.php
 * PROPÓSITO: Acompanhar metas de poupança (ex: Fundo de Emergência).
 * CONCEITOS ENSINADOS:
 * - Metas Financeiras: Cálculo de progresso (atual vs objetivo).
 * =================================================================================
 */
class FinancialGoal extends Model
{
    protected $fillable = [
        'user_id',
        'account_id',
        'name',
        'target_amount',
        'current_amount',
        'deadline',
        'monthly_savings_planned',
        'allocation_percentage',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
