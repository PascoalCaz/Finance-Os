import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    Plus,
    RotateCw,
    Calendar,
    Trash2,
    Power,
    Clock,
    TrendingUp,
    TrendingDown,
    Landmark,
    X as CloseIcon
} from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

/**
 * =================================================================================
 * ARQUIVO: Recurring/Index.jsx
 * PROPÓSITO: Gerir as automações financeiras (Agendamentos).
 * CONCEITOS ENSINADOS:
 * - Automation UI: Como apresentar agendamentos de forma clara.
 * - Dynamic Status: Mostrar se um serviço está ativo ou pausado.
 * =================================================================================
 */
export default function Index({ recurring_transactions, accounts, categories }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        account_id: accounts.length > 0 ? accounts[0].id : '',
        category_id: categories.length > 0 ? categories[0].id : '',
        description: '',
        amount: '',
        type: 'expense',
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        is_active: true,
    });

    const formatCurrency = (value, currency = 'AOA') => {
        return new Intl.NumberFormat('pt-AO', {
            style: 'currency',
            currency: currency,
        }).format(value);
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setData({
                account_id: item.account_id,
                category_id: item.category_id,
                description: item.description,
                amount: item.amount,
                type: item.type,
                frequency: item.frequency,
                is_active: item.is_active,
            });
        } else {
            setEditingItem(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingItem) {
            put(route('recurring.update', editingItem.id), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route('recurring.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    return (
        <AuthenticatedLayout header="Automação Financeira">
            <Head title="Agendamentos" />

            <div className="space-y-8 pb-12">
                <div className="flex justify-between items-center px-2">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 leading-none tracking-tighter">Recorrência</h1>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Automação de lançamentos periódicos</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center hover:bg-gray-800 transition-all shadow-xl active:scale-95"
                    >
                        <Plus size={16} className="mr-2" /> Novo Agendamento
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {recurring_transactions.map((rt) => (
                        <div key={rt.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row items-center justify-between">
                            <div className="flex items-center space-x-6 w-full md:w-auto">
                                <div className={`p-4 rounded-2xl ${rt.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {rt.type === 'income' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 leading-none mb-1">{rt.description}</h3>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                            <RotateCw size={10} className="mr-1" /> {rt.frequency}
                                        </span>
                                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                            {rt.category?.name || 'Geral'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center md:items-end mt-6 md:mt-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-50 pt-6 md:pt-0 md:pl-10">
                                <p className="text-2xl font-black text-gray-900 mb-1">{formatCurrency(rt.amount)}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Próximo: {new Date(rt.next_process_date).toLocaleDateString()}</p>
                            </div>

                            <div className="flex space-x-2 mt-6 md:mt-0 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={() => openModal(rt)}
                                    className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                >
                                    <RotateCw size={18} />
                                </button>
                                <button
                                    onClick={() => { if(confirm('Remover automação?')) destroy(route('recurring.destroy', rt.id)) }}
                                    className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {recurring_transactions.length === 0 && (
                        <div className="py-20 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                             <Clock size={48} className="text-gray-200 mx-auto mb-4" />
                             <p className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Nenhuma automação configurada.</p>
                             <button onClick={() => openModal()} className="mt-4 text-indigo-600 text-[10px] font-black uppercase hover:underline">Configurar a primeira agora</button>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Editar Agendamento' : 'Nova Automação Financeira'}>
                <form onSubmit={submit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Descrição da Recorrência</label>
                        <input
                            type="text"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Ex: Salário Mensal, Renda da Casa..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Montante</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Frequência</label>
                            <select
                                value={data.frequency}
                                onChange={(e) => setData('frequency', e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                <option value="daily">Diário</option>
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensal</option>
                                <option value="yearly">Anual</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Conta</label>
                            <select
                                value={data.account_id}
                                onChange={(e) => setData('account_id', e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Categoria</label>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {!editingItem && (
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Data de Início</label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                required
                            />
                        </div>
                    )}

                    <div className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-2xl">
                         <Power size={18} className="text-indigo-600" />
                         <span className="text-[10px] font-black uppercase text-indigo-900 tracking-widest">Ativar automação imediatamente</span>
                         <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="ml-auto rounded-lg text-indigo-600 border-none focus:ring-0 w-6 h-6"
                         />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-gray-800 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                    >
                        {editingItem ? 'Atualizar Automação' : 'Confirmar Agendamento'}
                    </button>
                </form>
             </Modal>
        </AuthenticatedLayout>
    );
}
