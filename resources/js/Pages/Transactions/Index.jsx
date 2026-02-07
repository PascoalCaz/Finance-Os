import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Plus,
    Tag,
    Pencil,
    Trash2,
    PieChart,
    ShoppingCart,
    Home,
    Car,
    Utensils,
    Heart,
    Smartphone,
    Briefcase,
    Plane,
    Dumbbell,
    Gamepad,
    Gift,
    Music,
    Zap,
    CreditCard,
    DollarSign,
    Smile,
    Search,
    Filter,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCcw,
    X,
    Paperclip,
    FileText,
    Download
} from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

// MAPA DE ÍCONES (IDEM AO CATEGORIES)
const ICON_MAP = {
    Tag: <Tag size={14} />,
    ShoppingCart: <ShoppingCart size={14} />,
    Home: <Home size={14} />,
    Car: <Car size={14} />,
    Utensils: <Utensils size={14} />,
    Heart: <Heart size={14} />,
    Smartphone: <Smartphone size={14} />,
    Briefcase: <Briefcase size={14} />,
    Plane: <Plane size={14} />,
    Dumbbell: <Dumbbell size={14} />,
    Gamepad: <Gamepad size={14} />,
    Gift: <Gift size={14} />,
    Music: <Music size={14} />,
    Zap: <Zap size={14} />,
    CreditCard: <CreditCard size={14} />,
    DollarSign: <DollarSign size={14} />,
    Smile: <Smile size={14} />,
};

const getIcon = (name) => ICON_MAP[name] || ICON_MAP['Tag'];

/**
 * =================================================================================
 * ARQUIVO: Transactions/Index.jsx (MULTIMOEDA ATUALIZADO)
 * =================================================================================
 */
export default function Index({ transactions, accounts, categories, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const user = usePage().props.auth.user;
    const { router } = usePage();

    // ESTADO PARA FILTROS (USA VALORES DA URL SE EXISTIREM)
    const { data: filterData, setData: setFilterData, get, reset: resetFilters } = useForm({
        search: filters.search || '',
        account_id: filters.account_id || '',
        category_id: filters.category_id || '',
        type: filters.type || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });

    const handleFilter = (e) => {
        // e?.preventDefault(); // Removido para permitir reatividade
        get(route('transactions.index'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        resetFilters();
        router.get(route('transactions.index'));
    };

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        account_id: accounts.length > 0 ? accounts[0].id : '',
        category_id: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        exchange_rate: 1,
        description: '',
        type: 'expense',
        to_account_id: '',
        attachment: null,
    });

    const formatCurrency = (value, currency = 'AOA') => {
        return new Intl.NumberFormat(currency === 'AOA' ? 'pt-AO' : 'en-US', {
            style: 'currency',
            currency: currency,
        }).format(value);
    };

    const openModal = (transaction = null) => {
        if (transaction) {
            setEditingTransaction(transaction);
            setData({
                account_id: transaction.account_id,
                category_id: transaction.category_id || '',
                date: transaction.date,
                amount: transaction.amount,
                exchange_rate: transaction.exchange_rate || 1,
                description: transaction.description || '',
                type: transaction.type,
                to_account_id: transaction.to_account_id || '',
            });
        } else {
            setEditingTransaction(null);
            reset('amount', 'description', 'category_id', 'to_account_id', 'exchange_rate');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingTransaction) {
            put(route('transactions.update', editingTransaction.id), { onSuccess: () => closeModal() });
        } else {
            post(route('transactions.store'), { onSuccess: () => closeModal() });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja apagar esta transação? O saldo das contas será estornado.')) {
            destroy(route('transactions.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header="Transações">
            <Head title="Transações" />

            <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <h1 className="text-2xl font-bold text-gray-900 leading-none">Histórico Financeiro</h1>
                    <button
                        onClick={() => openModal()}
                        className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center hover:bg-gray-800 transition-all shadow-lg"
                    >
                        <Plus size={16} className="mr-2" /> Novo Lançamento
                    </button>
                </div>

                {/* BARRA DE FILTROS SUPERIOR */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {/* BUSCA POR TEXTO */}
                        <div className="lg:col-span-2 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={filterData.search}
                                onChange={e => { setFilterData('search', e.target.value); }}
                                onBlur={handleFilter}
                                placeholder="Procurar descrição..."
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                        </div>

                        {/* FILTRO DE CONTA */}
                        <select
                            value={filterData.account_id}
                            onChange={e => { setFilterData('account_id', e.target.value); }}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                        >
                            <option value="">Todas as Contas</option>
                            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>

                        {/* FILTRO DE CATEGORIA */}
                        <select
                            value={filterData.category_id}
                            onChange={e => { setFilterData('category_id', e.target.value); }}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                        >
                            <option value="">Todas as Categorias</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>

                        {/* FILTRO DE TIPO */}
                        <select
                            value={filterData.type}
                            onChange={e => { setFilterData('type', e.target.value); }}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                        >
                            <option value="">Todos os Tipos</option>
                            <option value="income">Receita</option>
                            <option value="expense">Despesa</option>
                            <option value="transfer">Transferência</option>
                        </select>

                        <button
                            onClick={handleFilter}
                            className="bg-indigo-50 text-indigo-600 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center"
                        >
                            <Filter size={14} className="mr-2" /> Filtrar
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-50">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">De:</span>
                                <input
                                    type="date"
                                    value={filterData.date_from}
                                    onChange={e => setFilterData('date_from', e.target.value)}
                                    className="px-3 py-1.5 bg-gray-50 border-none rounded-xl text-[11px] font-bold focus:ring-1 focus:ring-indigo-100"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Até:</span>
                                <input
                                    type="date"
                                    value={filterData.date_to}
                                    onChange={e => setFilterData('date_to', e.target.value)}
                                    className="px-3 py-1.5 bg-gray-50 border-none rounded-xl text-[11px] font-bold focus:ring-1 focus:ring-indigo-100"
                                />
                            </div>
                        </div>

                        <button
                            onClick={clearFilters}
                            className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                        >
                            Limpar Filtros 🗙
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#fcfdfe] border-b border-gray-50">
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Conta / Moeda</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Valor</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.data.map((transaction) => (
                                <tr key={transaction.id} className="group hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => openModal(transaction)}>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center space-x-3">
                                            <Calendar size={14} className="text-gray-300" />
                                            <span className="text-xs font-bold text-gray-600">
                                                {new Date(transaction.date).toLocaleDateString(user.language === 'en' ? 'en-US' : 'pt-AO')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className={`p-2 rounded-lg ${
                                                    transaction.type === 'income' ? 'bg-green-50 text-green-600' :
                                                    transaction.type === 'expense' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                                }`}
                                                style={transaction.category?.color ? { backgroundColor: `${transaction.category.color}15`, color: transaction.category.color } : {}}
                                            >
                                                {transaction.category?.icon ? getIcon(transaction.category.icon) : (
                                                    transaction.type === 'income' ? <ArrowUpRight size={14} /> :
                                                    transaction.type === 'expense' ? <ArrowDownLeft size={14} /> : <RefreshCcw size={14} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black text-gray-900 leading-tight mb-0.5">{transaction.description || 'Sem descrição'}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center">
                                                    {transaction.category?.name || 'Geral'}
                                                    {transaction.type === 'transfer' && ` • Taxa: ${transaction.exchange_rate}`}
                                                    {transaction.attachment_path && (
                                                        <a
                                                            href={`/storage/${transaction.attachment_path}`}
                                                            target="_blank"
                                                            className="ml-2 flex items-center text-indigo-500 hover:underline"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Paperclip size={10} className="mr-1" /> Ver Recibo
                                                        </a>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-600 mb-0.5">{transaction.account?.name}</span>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{transaction.account?.currency}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`text-[13px] font-black ${
                                            transaction.type === 'income' ? 'text-green-600' :
                                            transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                                        }`}>
                                            {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                                            {formatCurrency(transaction.amount, transaction.account?.currency)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(transaction.id); }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} title={editingTransaction ? 'Editar Registo' : 'Novo Lançamento'}>
                <form onSubmit={submit} className="space-y-6">
                    <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                        <TabButton active={data.type === 'expense'} onClick={() => setData('type', 'expense')} className="text-red-500">Despesa</TabButton>
                        <TabButton active={data.type === 'income'} onClick={() => setData('type', 'income')} className="text-green-600">Receita</TabButton>
                        <TabButton active={data.type === 'transfer'} onClick={() => setData('type', 'transfer')} className="text-blue-600">Transferência</TabButton>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Data</label>
                            <input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-200" required />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
                                Valor ({accounts.find(a => a.id == data.account_id)?.currency || '?'})
                            </label>
                            <input type="number" step="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-200" placeholder="0.00" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
                                {data.type === 'transfer' ? 'Origem' : 'Conta'}
                            </label>
                            <select value={data.account_id} onChange={(e) => setData('account_id', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-200" required>
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                            </select>
                        </div>
                        {data.type === 'transfer' ? (
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Destino</label>
                                <select value={data.to_account_id} onChange={(e) => setData('to_account_id', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-200" required>
                                    <option value="">Seleccione...</option>
                                    {accounts.filter(a => a.id != data.account_id).map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Categoria</label>
                                <select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-200">
                                    <option value="">Sem Categoria</option>
                                    {categories
                                        .filter(cat => cat.type === data.type)
                                        .map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        )}
                    </div>

                    {data.type === 'transfer' && data.to_account_id && (() => {
                        const from = accounts.find(a => a.id == data.account_id);
                        const to = accounts.find(a => a.id == data.to_account_id);
                        if (from && to && from.currency !== to.currency) {
                            return (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-3">
                                    <p className="text-[10px] font-black uppercase text-blue-800 tracking-wider flex items-center"><RefreshCcw size={12} className="mr-2" /> Câmbio Necessário</p>
                                    <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Taxa (1 {from.currency} = ? {to.currency})</label>
                                    <input type="number" step="0.000001" value={data.exchange_rate} onChange={(e) => setData('exchange_rate', e.target.value)} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-sm font-black text-blue-900 focus:ring-2 focus:ring-blue-200" required />
                                    <p className="text-[10px] font-bold text-blue-500 italic">Destino: {formatCurrency(data.amount * data.exchange_rate, to.currency)}</p>
                                </div>
                            );
                        }
                    })()}

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Descrição / Detalhes</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-200"
                            placeholder="Ex: Supermercado mensal..."
                            rows="2"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono flex items-center">
                            <Paperclip size={12} className="mr-1" /> Comprovativo / Anexo (Opcional)
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-100 border-dashed rounded-[2rem] cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Paperclip size={24} className="text-gray-300 group-hover:text-indigo-400 mb-2 transition-colors" />
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">
                                        {data.attachment ? data.attachment.name : 'Clique para anexar Recibo (PDF/IMG)'}
                                    </p>
                                </div>
                                <input type="file" className="hidden" onChange={(e) => setData('attachment', e.target.files[0])} />
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 pb-2">
                        <button type="submit" disabled={processing} className={`w-full py-4 ${
                            data.type === 'expense' ? 'bg-red-600' : data.type === 'income' ? 'bg-green-600' : 'bg-blue-600'
                        } text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl active:scale-95 disabled:opacity-50`}>
                            {editingTransaction ? 'Guardar Alterações' : 'Confirmar Lançamento'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

function TabButton({ active, onClick, children, className }) {
    return (
        <button type="button" onClick={onClick} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
            active ? `bg-white shadow-sm border border-gray-100 ${className}` : 'text-gray-400 hover:text-gray-600'
        }`}>{children}</button>
    );
}
