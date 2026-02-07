<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

/**
 * =================================================================================
 * ARQUIVO: CategoryController.php
 * PROPÓSITO: Organizar transações por tipos (Saúde, Lazer, Salário, etc).
 * CONCEITOS ENSINADOS:
 * - Model Relationships: Categorias pertencem a um Utilizador.
 * - CRUD Simples: Implementação padrão de Create, Read, Update, Delete.
 * =================================================================================
 */
class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Categories/Index', [
            'categories' => auth()->user()->categories()->orderBy('name')->get()
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:255',
        ]);

        $request->user()->categories()->create($validated);

        return redirect()->back()->with('success', 'Categoria criada!');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        if ($category->user_id !== auth()->id())
            abort(403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:255',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Categoria atualizada!');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->user_id !== auth()->id())
            abort(403);

        $category->delete();

        return redirect()->back()->with('success', 'Categoria removida.');
    }
}
