import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Plus, Pencil, Trash2, FolderKanban, TrendingUp, Wallet, List, Eye, X as CloseIcon } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

/**
 * =================================================================================
 * ARQUIVO: Budgets/Index.jsx (DETALHAMENTO DE ITENS + LINK SHOW)
 * PROPÓSITO: Planeamento financeiro detalhado por itens.
 * =================================================================================
 */
export default function Index({ budgets, categories }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        category_id: categories.length > 0 ? categories[0].id : '',
        amount: '',
        currency: 'AOA',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        items: [],
    });

    const formatCurrency = (value, currency = 'AOA') => {
        return new Intl.NumberFormat(currency === 'AOA' ? 'pt-AO' : 'en-US', {
            style: 'currency',
            currency: currency,
        }).format(value);
    };

    const openModal = (budget = null) => {
        if (budget) {
            setEditingBudget(budget);
            setData({
                category_id: budget.category_id,
                amount: budget.amount,
                currency: budget.currency || 'AOA',
                month: budget.month,
                year: budget.year,
                items: budget.items || [],
            });
        } else {
            setEditingBudget(null);
            reset();
            setData('items', []);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const addItem = () => {
        setData('items', [...data.items, { name: '', amount: '' }]);
    };

    const removeItem = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);

        // Auto-soma se desejar atualizar o total global baseado nos itens
        const total = newItems.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
        if (total > 0) setData('amount', total);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingBudget) {
            put(route('budgets.update', editingBudget.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('budgets.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    return (
        <AuthenticatedLayout header="Orçamentos">
            <Head title="Orçamentos" />

            <div className="space-y-8 pb-20">
                <div className="flex justify-between items-center px-2">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 leading-none tracking-tighter">Planeamento</h1>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Gestão de limites por categoria</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                    >
                        <Plus size={16} className="mr-2" /> Novo Orçamento
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {budgets.map((budget) => (
                        <div key={budget.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="p-4 bg-orange-50 rounded-2xl text-orange-600 group-hover:scale-110 transition-transform">
                                    <FolderKanban size={24} />
                                </div>
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <Link href={route('budgets.show', budget.id)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                                        <Eye size={16} />
                                    </Link>
                                    <button onClick={() => openModal(budget)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => { if(confirm('Remover orçamento?')) destroy(route('budgets.destroy', budget.id)) }} className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-gray-900 mb-1">{budget.category?.name}</h3>
                                <div className="flex items-center space-x-3 mb-8">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">
                                        {budget.month}/{budget.year}
                                    </span>
                                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase">
                                        {budget.currency}
                                    </span>
                                </div>

                                {/* LISTA DE ITENS PLANEADOS */}
                                {budget.items && budget.items.length > 0 && (
                                    <div className="mb-8 space-y-3">
                                         <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4 flex items-center">
                                            <List size={10} className="mr-1" /> Itens Planeados
                                         </p>
                                         <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
                                            {budget.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-[#fcfdfe] p-3 rounded-xl border border-gray-50">
                                                    <span className="text-[11px] font-bold text-gray-600">{item.name}</span>
                                                    <span className="text-[11px] font-black text-gray-900">{formatCurrency(item.amount, budget.currency)}</span>
                                                </div>
                                            ))}
                                         </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Previsto</p>
                                            <p className="text-lg font-black text-gray-900 leading-none">{formatCurrency(budget.amount, budget.currency)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase">Activo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* DECORATION */}
                            <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 bg-gray-50 rounded-full blur-3xl opacity-50"></div>
                        </div>
                    ))}

                    {budgets.length === 0 && (
                        <div className="col-span-full py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                            <FolderKanban size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-black uppercase tracking-widest">Nenhum orçamento definido</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                show={isModalOpen}
                onClose={closeModal}
                title={editingBudget ? 'Actualizar Planeamento' : 'Configurar Planeamento'}
            >
                <form onSubmit={submit} className="p-8 space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Categoria Alvo</label>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-indigo-50 transition-all uppercase tracking-tighter"
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Moeda Base</label>
                                <select
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-indigo-50"
                                    required
                                >
                                    <option value="AOA">Kwanza (AOA)</option>
                                    <option value="USD">Dólar (USD)</option>
                                    <option value="EUR">Euro (EUR)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Valor Global</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-indigo-50 placeholder-gray-300"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Mês</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={data.month}
                                    onChange={(e) => setData('month', e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-indigo-50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Ano</label>
                                <input
                                    type="number"
                                    min="2000"
                                    value={data.year}
                                    onChange={(e) => setData('year', e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-indigo-50"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* ITENS DETALHADOS */}
                    <div className="bg-[#fcfdfe] p-6 rounded-[2rem] border border-indigo-50 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.1em] flex items-center">
                                <List size={14} className="mr-2" /> Itens de Despesa Prevista
                            </h4>
                            <button
                                type="button"
                                onClick={addItem}
                                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {data.items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-center group">
                                    <input
                                        placeholder="Ex: Arroz"
                                        className="flex-1 px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-100"
                                        value={item.name}
                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Valor"
                                        className="w-24 px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-black focus:ring-2 focus:ring-indigo-100"
                                        value={item.amount}
                                        onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-3 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {data.items.length === 0 && (
                                <p className="text-[10px] text-gray-400 italic text-center py-4">Clique no + para adicionar itens detalhados (opcional)</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-gray-800 transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50"
                        >
                            {editingBudget ? 'Confirmar Alterações' : 'Iniciar Planeamento'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
