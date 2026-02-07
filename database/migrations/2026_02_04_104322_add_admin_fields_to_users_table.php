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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user'); // super_admin, admin, user
            $table->string('subscription_plan')->default('free'); // free, pro, enterprise
            $table->timestamp('subscription_expires_at')->nullable();
            $table->string('status')->default('active'); // active, inactive, suspended
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'subscription_plan', 'subscription_expires_at', 'status']);
        });
    }
};
