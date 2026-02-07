<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Relatório Financeiro</title>
    <style>
        body {
            font-family: sans-serif;
            color: #333;
            margin: 0;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 20px;
        }

        .header h1 {
            color: #4f46e5;
            margin: 0;
            font-size: 24px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .header p {
            color: #888;
            margin: 5px 0 0;
            font-size: 10px;
            font-weight: bold;
        }

        .info-grid {
            width: 100%;
            margin-bottom: 30px;
        }

        .info-box {
            background: #f9fafb;
            padding: 15px;
            border-radius: 10px;
            border: 1px solid #f3f4f6;
        }

        .info-label {
            font-size: 9px;
            font-weight: bold;
            color: #9ca3af;
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .info-value {
            font-size: 16px;
            font-weight: 900;
            color: #111827;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th {
            background: #f3f4f6;
            padding: 12px 8px;
            text-align: left;
            font-size: 10px;
            font-weight: bold;
            color: #4b5563;
            text-transform: uppercase;
            border-bottom: 1px solid #e5e7eb;
        }

        td {
            padding: 12px 8px;
            font-size: 11px;
            border-bottom: 1px solid #f3f4f6;
            color: #374151;
        }

        .income {
            color: #10b981;
            font-weight: bold;
        }

        .expense {
            color: #ef4444;
            font-weight: bold;
        }

        .transfer {
            color: #3b82f6;
            font-weight: bold;
        }

        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 9px;
            color: #9ca3af;
            padding: 20px 0;
            border-top: 1px solid #f3f4f6;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Finance<span style="color: #111">OS</span> Explorer</h1>
        <p>RELATÓRIO FINANCEIRO DETALHADO • {{ now()->format('d/m/Y H:i') }}</p>
    </div>

    <table class="info-grid">
        <tr>
            <td width="33%">
                <div class="info-box">
                    <div class="info-label">Utilizador</div>
                    <div class="info-value">{{ $user->name }}</div>
                </div>
            </td>
            <td width="33%">
                <div class="info-box">
                    <div class="info-label">Moeda Base</div>
                    <div class="info-value">{{ $user->default_currency ?? 'AOA' }}</div>
                </div>
            </td>
            <td width="33%">
                <div class="info-box">
                    <div class="info-label">Total de Movimentos</div>
                    <div class="info-value">{{ $transactions->count() }}</div>
                </div>
            </td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Conta</th>
                <th>Tipo</th>
                <th style="text-align: right">Valor</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $t)
                <tr>
                    <td>{{ $t->date->format('d/m/Y') }}</td>
                    <td>{{ $t->description ?? '---' }}</td>
                    <td>{{ $t->category?->name ?? 'Geral' }}</td>
                    <td>{{ $t->account?->name }}</td>
                    <td class="{{ $t->type }}">
                        {{ $t->type === 'income' ? 'Entrada' : ($t->type === 'expense' ? 'Saída' : 'Transf.') }}
                    </td>
                    <td style="text-align: right" class="{{ $t->type }}">
                        @if($t->type === 'expense') - @endif
                        {{ number_format($t->amount, 2) }} {{ $t->account->currency }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Gerado automaticamente pelo FinanceOs — Gestão Financeira Newgen 360°
    </div>
</body>

</html>
