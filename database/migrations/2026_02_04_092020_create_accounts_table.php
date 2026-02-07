<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name'); // Ex: Carteira, Conta BAI
            $table->string('type'); // checking, savings, investment, cash
            $table->string('bank_name')->nullable(); // Ex: BAI, BFA, BIC
            $table->decimal('balance', 15, 2)->default(0);
            $table->string('currency', 3)->default('AOA');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
