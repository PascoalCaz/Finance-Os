<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * =================================================================================
 * ARQUIVO: Category.php
 * PROPÓSITO: Organizar transações em grupos (Alimentação, Lazer, etc).
 * CONCEITOS ENSINADOS:
 * - Resource Scoping: Cada utilizador tem as suas categorias personalizadas.
 * - Relationship HasMany: Uma categoria pode ter múltiplas transações.
 * =================================================================================
 */
class Category extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'type', // income, expense
        'icon',
        'color',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }

    public function recurringTransactions(): HasMany
    {
        return $this->hasMany(RecurringTransaction::class);
    }
}
