<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ================================================================================
 * MIGRATION: Adicionar campo WhatsApp à tabela users
 * ================================================================================
 *
 * PROPÓSITO: Permitir identificação de utilizadores via número de telefone WhatsApp
 * para integração com automação n8n.
 *
 * FORMATO ARMAZENADO: 244XXXXXXXXX@s.whatsapp.net
 * O utilizador introduz apenas: código do país + número (ex: 244956834375)
 * O sistema adiciona automaticamente o sufixo @s.whatsapp.net
 * ================================================================================
 */
return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Campo WhatsApp no formato: 244XXXXXXXXX@s.whatsapp.net
            // Nullable porque nem todos os utilizadores terão WhatsApp configurado
            $table->string('whatsapp')->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('whatsapp');
        });
    }
};
