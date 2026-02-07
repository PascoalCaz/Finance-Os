<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * =================================================================================
 * ARQUIVO: BudgetItem.php
 * PROPÓSITO: Representar itens específicos dentro de um orçamento (ex: Arroz, Massa).
 * CONCEITOS ENSINADOS:
 * - Granularidade: Detalhar um valor global em itens menores para melhor controlo.
 * =================================================================================
 */
class BudgetItem extends Model
{
    protected $fillable = [
        'budget_id',
        'name',
        'amount',
    ];

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }
}
