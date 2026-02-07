<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * =================================================================================
 * ARQUIVO: RecurringTransaction.php
 * PROPÓSITO: Agendar lançamentos automáticos que se repetem no tempo.
 * CONCEITOS ENSINADOS:
 * - Automation Logic: Como estruturar dados para processamento periódico.
 * - Frequency Mapping: Lidar com intervalos de tempo (mensal, anual, etc).
 * =================================================================================
 */
class RecurringTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'account_id',
        'category_id',
        'description',
        'amount',
        'type',
        'frequency',
        'start_date',
        'next_process_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'next_process_date' => 'date',
        'end_date' => 'date',
        'amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
