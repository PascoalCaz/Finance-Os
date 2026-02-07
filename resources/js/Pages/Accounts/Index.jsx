import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Plus, Landmark, Pencil, Trash2, Wallet, Eye } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

/**
 * =================================================================================
 * ARQUIVO: Accounts/Index.jsx (MULTIMOEDA + LINK SHOW)
 * PROPÓSITO: Gestão de contas bancárias com suporte a moedas (AOA, USD, EUR).
 * =================================================================================
 */
export default function Index({ accounts }) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        type: 'checking',
        bank_name: '',
        balance: 0,
        currency: 'AOA',
        color: '#1a1a1a',
    });

    const formatCurrency = (value, currency = 'AOA') => {
        return new Intl.NumberFormat(currency === 'AOA' ? 'pt-AO' : 'en-US', {
            style: 'currency',
            currency: currency,
        }).format(value);
    };

    const openModal = (account = null) => {
        if (account) {
            setEditingAccount(account);
            setData({
                name: account.name,
                type: account.type,
                bank_name: account.bank_name || '',
                balance: account.balance,
                currency: account.currency || 'AOA',
                color: account.color || '#1a1a1a',
            });
        } else {
            setEditingAccount(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingAccount) {
            put(route('accounts.update', editingAccount.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('accounts.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja remover esta conta? Todas as transações associadas serão apagadas.')) {
            destroy(route('accounts.destroy', id));
        }
    };

    const COLOR_OPTIONS = [
        { name: 'Dark', value: '#1a1a1a' },
        { name: 'Indigo', value: '#4f46e5' },
        { name: 'Emerald', value: '#10b981' },
        { name: 'Rose', value: '#e11d48' },
        { name: 'Amber', value: '#d97706' },
        { name: 'Sky', value: '#0284c7' },
        { name: 'Violet', value: '#8b5cf6' },
        { name: 'Teal', value: '#14b8a6' },
        { name: 'Fuchsia', value: '#d946ef' },
        { name: 'Orange', value: '#f97316' },
        { name: 'Lime', value: '#84cc16' },
        { name: 'Slate', value: '#64748b' },
    ];

    return (
        <AuthenticatedLayout header="Minhas Contas">
            <Head title="Contas" />

            <div className="space-y-8">
                {/* PAGE HEADER */}
                <div className="flex justify-between items-center px-2">
                    <h1 className="text-2xl font-bold text-gray-900 leading-none">Minhas Contas</h1>
                    <button
                        onClick={() => openModal()}
                        className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center hover:bg-gray-800 transition-all shadow-lg"
                    >
                        <Plus size={16} className="mr-2" /> Adicionar Conta
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map((account) => (
                        <div key={account.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div
                                className="absolute left-0 top-0 bottom-0 w-2 transition-all"
                                style={{ backgroundColor: account.color || '#1a1a1a' }}
                            ></div>

                            <div className="flex justify-between items-start mb-6">
                                <div
                                    className="p-3 rounded-2xl transition-colors bg-gray-50 text-gray-400 group-hover:bg-white"
                                    style={account.color ? { color: account.color, backgroundColor: `${account.color}10` } : {}}
                                >
                                    <Landmark className="w-6 h-6" />
                                </div>
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        href={route('accounts.show', account.id)}
                                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                    >
                                        <Eye size={16} />
                                    </Link>
                                    <button
                                        onClick={() => openModal(account)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(account.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-lg font-black text-gray-900">{account.name}</h3>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-black uppercase tracking-tighter">
                                    {account.currency}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">
                                {account.type} • {account.bank_name || 'Particular'}
                            </p>

                            <div className="pt-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                                    <Wallet size={12} className="mr-1.5" /> Saldo Atual
                                </p>
                                <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                                    {formatCurrency(account.balance, account.currency)}
                                </p>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => openModal()}
                        className="border-2 border-dashed border-gray-100 rounded-[2rem] p-8 flex flex-col items-center justify-center text-gray-300 hover:border-gray-200 hover:text-gray-500 transition-all bg-[#fcfdfe] hover:bg-white min-h-[220px]"
                    >
                        <div className="p-4 bg-gray-50 rounded-full mb-4 shadow-inner">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Registrar Nova Conta</span>
                    </button>
                </div>
            </div>

            {/* MODAL DE CONTA */}
            <Modal
                show={isModalOpen}
                onClose={closeModal}
                title={editingAccount ? 'Editar Conta' : 'Nova Conta Bancária'}
            >
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Apelido da Conta</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                                    placeholder="Ex: Minha Carteira, Conta BAI..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Cor da Conta</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 max-h-48 overflow-y-auto">
                                    {COLOR_OPTIONS.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setData('color', color.value)}
                                            className={`flex items-center space-x-2 p-2.5 rounded-xl border-2 transition-all ${
                                                data.color === color.value
                                                ? 'bg-white border-indigo-200 shadow-sm scale-105'
                                                : 'bg-white/50 border-transparent grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                                            }`}
                                        >
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.value }}></div>
                                            <span className="text-[10px] font-black uppercase tracking-tighter">{color.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Tipo</label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-100"
                                    >
                                        <option value="checking">Corrente</option>
                                        <option value="savings">Poupança</option>
                                        <option value="investment">Investimento</option>
                                        <option value="cash">Dinheiro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Moeda</label>
                                    <select
                                        value={data.currency}
                                        onChange={(e) => setData('currency', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-100"
                                        required
                                        disabled={editingAccount}
                                    >
                                        <option value="AOA">AOA</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Instituição</label>
                                <input
                                    type="text"
                                    value={data.bank_name}
                                    onChange={(e) => setData('bank_name', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-100"
                                    placeholder="Ex: BAI, BFA..."
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Saldo</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.balance}
                                    onChange={(e) => setData('balance', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-100 font-mono"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className={`w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50`}
                        >
                            {editingAccount ? 'Guardar Alterações' : 'Confirmar Registro'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
