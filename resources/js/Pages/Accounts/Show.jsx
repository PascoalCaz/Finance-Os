import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Landmark,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    Wallet,
    Calendar,
    Search,
    ChevronRight,
    TrendingUp,
    Filter
} from 'lucide-react';

/**
 * =================================================================================
 * ARQUIVO: Accounts/Show.jsx
 * PROPÓSITO: Histórico detalhado de movimentações de uma conta bancária.
 * =================================================================================
 */
export default function Show({ account, transactions }) {

    const formatCurrency = (value, currency = 'AOA') => {
        return new Intl.NumberFormat(currency === 'AOA' ? 'pt-AO' : 'en-US', {
            style: 'currency',
            currency: currency,
        }).format(value);
    };

    const getTypeStyles = (type) => {
        switch(type) {
            case 'income': return 'text-emerald-500 bg-emerald-50';
            case 'expense': return 'text-rose-500 bg-rose-50';
            case 'transfer': return 'text-indigo-500 bg-indigo-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    return (
        <AuthenticatedLayout header={`Histórico: ${account.name}`}>
            <Head title={`Extrato - ${account.name}`} />

            <div className="space-y-8 pb-12">

                {/* HEADER COM BOTÃO VOLTAR */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('accounts.index')}
                            className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group"
                        >
                            <ArrowLeft size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                        </Link>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Extrato Bancário</p>
                            <h1 className="text-3xl font-black text-gray-900 leading-none tracking-tighter">
                                {account.name} <span className="text-gray-300">/</span> {account.bank_name || 'Particular'}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-xl border border-gray-100 flex items-center shadow-sm">
                            <Calendar size={14} className="text-gray-400 mr-2" />
                            <span className="text-[10px] font-black uppercase tracking-tight text-gray-600">Todo o Período</span>
                        </div>
                    </div>
                </div>

                {/* CARD DE SALDO PRINCIPAL (DESIGN PREMIUM) */}
                <div className="relative group overflow-hidden">
                    <div className="bg-gray-900 p-10 rounded-[3rem] text-white shadow-2xl relative z-10">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4 border border-white/10">
                                    <Landmark size={24} className="text-indigo-400" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Disponibilidade Imediata</p>
                                <h2 className="text-5xl font-black tracking-tighter leading-none">
                                    {formatCurrency(account.balance, account.currency)}
                                </h2>
                            </div>
                            <div className="text-right">
                                <span className="px-4 py-2 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    {account.currency}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5 pt-8 mt-4">
                            <div>
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Tipo de Conta</p>
                                <p className="text-xs font-bold uppercase">{account.type}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Movimentações</p>
                                <p className="text-xs font-bold uppercase">{transactions.length} Registros</p>
                            </div>
                        </div>
                    </div>
                    {/* DECORAÇÃO BACKGROUND */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>
                </div>

                {/* HISTÓRICO DE TRANSAÇÕES */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-[#fcfdfe]">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center">
                            <History size={18} className="mr-3 text-indigo-500" /> Fluxo de Movimentações
                        </h3>
                        <div className="flex space-x-2">
                            <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-xl transition-all">
                                <Filter size={16} />
                            </button>
                            <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-xl transition-all">
                                <Search size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/30">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado / Data</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição / Categoria</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Montante</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className={`p-2.5 rounded-xl ${getTypeStyles(t.type)}`}>
                                                    {t.type === 'income' ? <ArrowDownLeft size={16} /> :
                                                     t.type === 'expense' ? <ArrowUpRight size={16} /> :
                                                     <RotateCw size={16} />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-gray-900 leading-tight">Concluído</p>
                                                    <p className="text-[10px] font-bold text-gray-400">{new Date(t.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-black text-gray-900 leading-tight">
                                                    {t.description || (t.type === 'transfer' ? `Transferência para ${t.destination_account?.name}` : 'Sem descrição')}
                                                </span>
                                                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.1em] mt-1">
                                                    {t.category?.name || 'Geral'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-500' : t.type === 'expense' ? 'text-rose-500' : 'text-gray-500'}`}>
                                                {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}
                                                {formatCurrency(t.amount, account.currency)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 text-gray-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                                                <ChevronRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <History size={48} className="text-gray-100 mb-4" />
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Nenhuma movimentação encontrada para esta conta.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ACTION FOOTER */}
                <div className="flex justify-center pt-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-dashed border-gray-200 px-6 py-3 rounded-2xl">
                        Fim do Histórico Registado
                    </p>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
