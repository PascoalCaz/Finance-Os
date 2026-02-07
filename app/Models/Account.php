<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * =================================================================================
 * ARQUIVO: Account.php
 * PROPÓSITO: Representar uma conta bancária ou carteira física do usuário.
 * CONCEITOS ENSINADOS:
 * - Mass Assignment ($fillable): Proteção contra inserção de dados não autorizados.
 * - Relationships (Eloquent): Como o Laravel liga tabelas de forma intuitiva.
 * =================================================================================
 */
class Account extends Model
{
    // LÓGICA: Atributos que podem ser preenchidos via create() ou update()
    protected $fillable = [
        'user_id',
        'name',
        'type',
        'bank_name',
        'balance',
        'currency',
        'color',
    ];

    /**
     * RELACIONAMENTO: Uma conta pertence a um único utilizador.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * RELACIONAMENTO: Uma conta pode ter muitos registros de transações.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
