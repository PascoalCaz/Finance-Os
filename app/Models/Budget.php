<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * =================================================================================
 * ARQUIVO: Budget.php
 * PROPÓSITO: Definir limites de gastos mensais por categoria.
 * CONCEITOS ENSINADOS:
 * - Orçamentação: Como controlar o fluxo de caixa através de metas de gastos.
 * =================================================================================
 */
class Budget extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'amount',
        'currency',
        'month',
        'year',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function items(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(BudgetItem::class);
    }
}
