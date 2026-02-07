<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('financial_goals', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('user_id')->constrained()->onDelete('set null');
            $table->decimal('monthly_savings_planned', 15, 2)->nullable()->after('deadline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financial_goals', function (Blueprint $table) {
            //
        });
    }
};
