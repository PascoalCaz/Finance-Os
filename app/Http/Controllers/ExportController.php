<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Barryvdh\DomPDF\Facade\Pdf;

/**
 * =================================================================================
 * ARQUIVO: ExportController.php
 * PROPÓSITO: Permitir ao utilizador baixar os seus dados para Excel/Contabilidade.
 * CONCEITOS ENSINADOS:
 * - CSV Generation: Como criar ficheiros em tempo real sem sobrecarregar a memória.
 * - Filtering: Exportar apenas o que o utilizador deseja (datas, categorias).
 * =================================================================================
 */
class ExportController extends Controller
{
    /**
     * EXPORTAÇÃO DE TRANSAÇÕES EM CSV
     */
    public function transactions(Request $request): StreamedResponse
    {
        $user = auth()->user();

        // Filtros (Opcional no futuro)
        $transactions = $user->transactions()
            ->with(['account', 'category'])
            ->orderByDesc('date')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="transacoes_financeiras.csv"',
        ];

        return new StreamedResponse(function () use ($transactions) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM para o Excel abrir correctamente acentos
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Cabeçalho
            fputcsv($handle, [
                'Data',
                'Descrição',
                'Categoria',
                'Conta',
                'Tipo',
                'Valor Original',
                'Moeda',
                'Câmbio',
                'Valor em AOA'
            ]);

            foreach ($transactions as $t) {
                fputcsv($handle, [
                    $t->date->format('d/m/Y'),
                    $t->description ?? 'Sem descrição',
                    $t->category?->name ?? 'Geral',
                    $t->account?->name ?? 'N/A',
                    $t->type === 'income' ? 'Entrada' : ($t->type === 'expense' ? 'Saída' : 'Transferência'),
                    $t->amount,
                    $t->account?->currency ?? 'AOA',
                    $t->exchange_rate ?? 1,
                    $t->converted_amount ?? $t->amount,
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * EXPORTAÇÃO DE TRANSAÇÕES EM PDF (NOVO)
     */
    public function pdf(Request $request)
    {
        $user = auth()->user();

        $transactions = $user->transactions()
            ->with(['account', 'category'])
            ->orderByDesc('date')
            ->get();

        $pdf = Pdf::loadView('exports.transactions_pdf', [
            'user' => $user,
            'transactions' => $transactions
        ]);

        return $pdf->download('extrato_financeiro_financeos.pdf');
    }
}
