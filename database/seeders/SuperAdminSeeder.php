<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

/**
 * =================================================================================
 * ARQUIVO: SuperAdminSeeder.php
 * PROPÓSITO: Criar o primeiro administrador para gerir o sistema.
 * =================================================================================
 */
class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@newgen.com'],
            [
                'name' => 'Super Admin Newgen',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'subscription_plan' => 'enterprise',
                'status' => 'active',
            ]
        );
    }
}
