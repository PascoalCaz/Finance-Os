<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * =================================================================================
 * ARQUIVO: Transaction.php
 * PROPÓSITO: Registrar cada movimento financeiro (entrada, saída ou transferência).
 * CONCEITOS ENSINADOS:
 * - Foreign Keys: Como vincular esta movimentação a uma conta e uma categoria.
 * =================================================================================
 */
class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'account_id',
        'category_id',
        'date',
        'amount',
        'exchange_rate',
        'converted_amount',
        'description',
        'attachment_path',
        'type',
        'to_account_id',
    ];

    // LÓGICA: Cast de campos para facilitar a manipulação
    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'exchange_rate' => 'decimal:6',
        'converted_amount' => 'decimal:2',
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

    /**
     * RELACIONAMENTO OPCIONAL: Se for uma transferência, aponta para a conta de destino.
     */
    public function destinationAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'to_account_id');
    }
}
