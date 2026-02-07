import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    TrendingUp,
    Calendar,
    List,
    History,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft,
    RotateCw,
    Wallet,
    DollarSign,
    Target
} from 'lucide-react';

/**
 * =================================================================================
 * ARQUIVO: Budgets/Show.jsx
 * PROPÓSITO: Visão detalhada de um orçamento específico (360° Explorer).
 * =================================================================================
 */
export default function Show({ budget, transactions, analysis }) {

    const formatCurrency = (value, currency = 'AOA') => {
        return new Intl.NumberFormat(currency === 'AOA' ? 'pt-AO' : 'en-US', {
            style: 'currency',
            currency: currency,
        }).format(value);
    };

    return (
        <AuthenticatedLayout header={`Detalhes: ${budget.category?.name}`}>
            <Head title={`Detalhes Orçamento - ${budget.category?.name}`} />

            <div className="space-y-8 pb-12">

                {/* HEADER COM BOTÃO VOLTAR */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('budgets.index')}
                            className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group"
                        >
                            <ArrowLeft size={18} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        </Link>
                        <div>
                            <p className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-1">Explorador de Orçamento</p>
                            <h1 className="text-3xl font-black text-gray-900 leading-none tracking-tighter">
                                {budget.category?.name} <span className="text-indigo-200">/</span> {budget.month}-{budget.year}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${analysis.percent > 100 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {analysis.percent > 100 ? 'Excedido' : 'Dentro do Limite'}
                        </span>
                    </div>
                </div>

                {/* KPI GRID: RESUMO RÁPIDO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KpiCard
                        title="Planeado"
                        value={formatCurrency(budget.amount, budget.currency)}
                        icon={<Target size={20} />}
                        color="indigo"
                        subtitle="Limite mensal definido"
                    />
                    <KpiCard
                        title="Executado"
                        value={formatCurrency(analysis.real_spend, budget.currency)}
                        icon={<TrendingUp size={20} />}
                        color={analysis.percent > 90 ? 'rose' : 'emerald'}
                        subtitle="Gasto real acumulado"
                    />
                    <KpiCard
                        title="Disponível"
                        value={formatCurrency(analysis.remaining, budget.currency)}
                        icon={<Wallet size={20} />}
                        color={analysis.remaining < 0 ? 'rose' : 'indigo'}
                        subtitle="Saldo para o mês"
                    />
                </div>

                {/* SEÇÃO PRINCIPAL: ANÁLISE E ITENS */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* COLUNA ESQUERDA: GRÁFICO E HISTÓRICO */}
                    <div className="xl:col-span-2 space-y-8">

                        {/* BARRA DE EXECUÇÃO DETALHADA */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                            <h3 className="text-lg font-black text-gray-900 mb-2">Análise de Performance</h3>
                            <p className="text-xs font-bold text-gray-400 mb-10 uppercase tracking-widest">Acompanhamento Real vs Previsto</p>

                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-black text-gray-900 uppercase">Utilização do Budget</span>
                                    <span className={`text-2xl font-black ${analysis.percent > 100 ? 'text-rose-500' : 'text-indigo-600'}`}>{analysis.percent}%</span>
                                </div>
                                <div className="w-full bg-gray-50 h-6 rounded-3xl overflow-hidden border border-gray-100 p-1">
                                    <div
                                        className={`h-full rounded-2xl transition-all duration-1000 ${analysis.percent > 90 ? 'bg-rose-500 shadow-lg shadow-rose-100' : 'bg-indigo-600 shadow-lg shadow-indigo-100'}`}
                                        style={{ width: `${Math.min(analysis.percent, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                                    <span>Ponto de Partida: {formatCurrency(0, budget.currency)}</span>
                                    <span>Limite: {formatCurrency(budget.amount, budget.currency)}</span>
                                </div>
                            </div>

                            {/* DECORAÇÃO BACKGROUND */}
                            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-50/30 rounded-full blur-[100px]"></div>
                        </div>

                        {/* HISTÓRICO DE GASTOS NESTED */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-[#fcfdfe]">
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center">
                                        <History size={16} className="mr-2 text-indigo-500" /> Movimentações do Período
                                    </h3>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{transactions.length} Transações</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/30">
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição / Conta</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {transactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <span className="text-xs font-bold text-gray-600">{new Date(t.date).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-black text-gray-900 leading-tight">{t.description || 'Sem descrição'}</span>
                                                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{t.account?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <span className="text-[13px] font-black text-rose-500">-{formatCurrency(t.amount, t.account?.currency)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {transactions.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-10 text-center text-gray-400 text-xs font-bold uppercase italic">Nenhum gasto registado excedendo a previsão.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* COLUNA DIREITA: ITENS PLANEADOS */}
                    <div className="space-y-8">
                        <div className="bg-gray-900 rounded-[2.5rem] p-9 text-white shadow-2xl relative overflow-hidden h-full">
                            <h3 className="text-xl font-black mb-1 flex items-center">
                                <List size={20} className="mr-3 text-indigo-400" /> Lista de Planeamento
                            </h3>
                            <p className="text-[10px] font-bold text-gray-500 mb-8 uppercase tracking-widest">Itens Detalhados</p>

                            <div className="space-y-4">
                                {budget.items && budget.items.length > 0 ? (
                                    <>
                                        <div className="bg-white/10 p-5 rounded-3xl mb-6 flex justify-between items-center border border-white/10">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Soma dos Itens</p>
                                                <p className="text-xl font-black text-indigo-400">{formatCurrency(analysis.total_planned_items, budget.currency)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Ajuste / Erro</p>
                                                <span className={`text-xs font-black px-2 py-1 rounded-lg ${Math.abs(analysis.total_planned_items - budget.amount) < 0.01 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
                                                    {formatCurrency(analysis.total_planned_items - budget.amount, budget.currency)}
                                                </span>
                                            </div>
                                        </div>

                                        {budget.items.map((item) => (
                                            <div key={item.id} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex justify-between items-center group hover:bg-white/10 transition-all">
                                                <div>
                                                    <p className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors uppercase leading-none mb-1.5">{item.name}</p>
                                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Previsto</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-indigo-300">{formatCurrency(item.amount, budget.currency)}</p>
                                                </div>
                                            </div>
                                        ))}

                                        {analysis.total_planned_items > budget.amount && (
                                            <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start space-x-3">
                                                <RotateCw size={14} className="text-rose-400 mt-0.5 shrink-0" />
                                                <p className="text-[10px] font-bold text-rose-200 uppercase leading-tight italic">Atenção: O somatório dos seus itens ({formatCurrency(analysis.total_planned_items, budget.currency)}) excede o limite global definido ({formatCurrency(budget.amount, budget.currency)}). Recomenda-se ajustar o planeamento.</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="py-10 text-center border-2 border-dashed border-white/10 rounded-[2rem]">
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Nenhum item específico</p>
                                    </div>
                                )}
                            </div>

                            <button className="w-full mt-10 py-4.5 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:border-transparent transition-all">
                                Editar Planilha
                            </button>

                            {/* DECORAÇÃO BACKGROUND */}
                            <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
                        </div>
                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}

function KpiCard({ title, value, icon, color, subtitle }) {
    const colors = {
        indigo: 'bg-indigo-600 text-white shadow-indigo-100',
        emerald: 'bg-emerald-500 text-white shadow-emerald-100',
        rose: 'bg-rose-500 text-white shadow-rose-100',
    };
    const iconColors = {
        indigo: 'bg-indigo-500 text-indigo-100',
        emerald: 'bg-emerald-400 text-emerald-50 text-white/20',
        rose: 'bg-rose-400 text-rose-50 text-white/20',
    };

    return (
        <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col group hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 cursor-default overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl shadow-lg transition-transform duration-500 active:scale-95 flex items-center justify-center ${colors[color]}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{title}</p>
                <h2 className="text-2xl font-black text-gray-900 leading-none tracking-tight">{value}</h2>
                <p className="mt-5 text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">{subtitle}</p>
            </div>
        </div>
    );
}
