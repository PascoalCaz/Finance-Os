<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\User;

class CategorySeeder extends Seeder
{
    /**
     * =================================================================================
     * ARQUIVO: CategorySeeder.php
     * PROPÓSITO: Popular o sistema com dados iniciais úteis (Bootstrap).
     * CONCEITOS ENSINADOS:
     * - Seeders: Automatizar a criação de dados para teste ou configuração inicial.
     * =================================================================================
     */
    public function run(): void
    {
        $user = User::first();
        if (!$user)
            return;

        $categories = [
            ['name' => 'Salário', 'type' => 'income', 'icon' => 'banknote', 'color' => '#10b981'],
            ['name' => 'Investimentos', 'type' => 'income', 'icon' => 'trending-up', 'color' => '#3b82f6'],
            ['name' => 'Alimentação', 'type' => 'expense', 'icon' => 'utensils', 'color' => '#ef4444'],
            ['name' => 'Transporte', 'type' => 'expense', 'icon' => 'car', 'color' => '#f59e0b'],
            ['name' => 'Lazer', 'type' => 'expense', 'icon' => 'tv', 'color' => '#8b5cf6'],
            ['name' => 'Saúde', 'type' => 'expense', 'icon' => 'heart', 'color' => '#ec4899'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name'], 'user_id' => $user->id],
                $category
            );
        }
    }
}
