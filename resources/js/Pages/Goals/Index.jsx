import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Target, Pencil, Trash2, Calendar, TrendingUp, Activity } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

/**
 * =================================================================================
 * ARQUIVO: Goals/Index.jsx (ELITE)
 * PROPÓSITO: Gestão adaptativa de metas com alocação de património.
 * CONCEITOS ENSINADOS:
 * - Patrimonial Allocation: Múltiplas metas sobre o mesmo saldo bancário.
 * - Dynamic Prolonging: Recálculo de prazos baseado no desempenho real.
 * =================================================================================
 */
export default function Index({ goals, accounts }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [simulationMode, setSimulationMode] = useState('deadline'); // 'deadline' or 'monthly'

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        target_amount: '',
        current_amount: 0,
        deadline: '',
        account_id: '',
        monthly_savings_planned: '',
        allocation_percentage: 100,
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-AO', {
            style: 'currency',
            currency: 'AOA',
        }).format(value);
    };

    const calculatePercentage = (current, target) => {
        const percent = (current / target) * 100;
        return Math.min(percent, 100).toFixed(1);
    };

    // LÓGICA DE SIMULAÇÃO: Quanto poupar por mês para atingir o prazo?
    const calculateRecommendedSaving = (target, current, deadlineDate) => {
        if (!deadlineDate || !target) return 0;
        const remaining = target - current;
        if (remaining <= 0) return 0;

        const now = new Date();
        const end = new Date(deadlineDate);
        const diffTime = end - now;
        const diffMonths = Math.max(diffTime / (1000 * 60 * 60 * 24 * 30.44), 1);

        return (remaining / diffMonths).toFixed(2);
    };

    // LÓGICA DE SIMULAÇÃO: Quando termina se eu poupar X por mês?
    const calculateProjectedDate = (target, current, monthlySaving) => {
        if (!monthlySaving || monthlySaving <= 0 || !target) return null;
        const remaining = target - current;
        if (remaining <= 0) return new Date().toISOString().split('T')[0];

        const monthsNeeded = remaining / monthlySaving;
        const projectedDate = new Date();
        projectedDate.setMonth(projectedDate.getMonth() + Math.ceil(monthsNeeded));

        return projectedDate.toISOString().split('T')[0];
    };

    const handleDeadlineChange = (e) => {
        const date = e.target.value;
        setData('deadline', date);
        if (simulationMode === 'deadline' && date) {
            const recommended = calculateRecommendedSaving(data.target_amount, data.current_amount, date);
            setData('monthly_savings_planned', recommended);
        }
    };

    const handleMonthlySavingChange = (e) => {
        const value = e.target.value;
        setData('monthly_savings_planned', value);
        if (simulationMode === 'monthly' && value > 0) {
            const projected = calculateProjectedDate(data.target_amount, data.current_amount, value);
            setData('deadline', projected);
        }
    };

    const openModal = (goal = null) => {
        if (goal) {
            setEditingGoal(goal);
            setData({
                name: goal.name,
                target_amount: goal.target_amount,
                current_amount: goal.current_amount,
                deadline: goal.deadline || '',
                account_id: goal.account_id || '',
                monthly_savings_planned: goal.monthly_savings_planned || '',
                allocation_percentage: goal.allocation_percentage || 100,
            });
        } else {
            setEditingGoal(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingGoal) {
            put(route('goals.update', editingGoal.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('goals.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    return (
        <AuthenticatedLayout header="Metas Financeiras">
            <Head title="Minhas Metas" />

            <div className="space-y-8">
                <div className="flex justify-between items-center px-2">
                    <h1 className="text-2xl font-bold text-gray-900 leading-none">Minhas Metas</h1>
                    <button
                        onClick={() => openModal()}
                        className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center hover:bg-gray-800 transition-all shadow-lg"
                    >
                        <Plus size={16} className="mr-2" /> Nova Meta
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal) => {
                        // LÓGICA DE ALOCAÇÃO DE PATRIMÓNIO: O valor atual vem da conta vinculada (se existir)
                        const realCurrentAmount = goal.account
                            ? (parseFloat(goal.account.balance) * (parseFloat(goal.allocation_percentage) / 100))
                            : goal.current_amount;

                        const progress = calculatePercentage(realCurrentAmount, goal.target_amount);

                        // LÓGICA DE PROLONGAMENTO DINÂMICO
                        const now = new Date();
                        const deadlineDate = goal.deadline ? new Date(goal.deadline) : null;
                        let needsProlong = false;
                        let newDeadline = null;

                        if (deadlineDate && goal.monthly_savings_planned > 0 && progress < 100) {
                            const monthsRemaining = (deadlineDate - now) / (1000 * 60 * 60 * 24 * 30.44);
                            const projectedReach = realCurrentAmount + (goal.monthly_savings_planned * monthsRemaining);
                            if (projectedReach < goal.target_amount) {
                                needsProlong = true;
                                newDeadline = calculateProjectedDate(goal.target_amount, realCurrentAmount, goal.monthly_savings_planned);
                            }
                        }

                        return (
                            <div key={goal.id} className={`bg-white rounded-[2.5rem] p-8 border ${needsProlong ? 'border-amber-200 shadow-amber-50' : 'border-gray-100 shadow-sm'} hover:shadow-md transition-all group relative overflow-hidden`}>
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${needsProlong ? 'bg-amber-400' : 'bg-indigo-600'}`}></div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 ${needsProlong ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'} rounded-2xl shadow-sm`}>
                                        <Target size={24} />
                                    </div>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openModal(goal)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => { if(confirm('Remover?')) destroy(route('goals.destroy', goal.id)) }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-black text-gray-900 mb-1">{goal.name}</h3>

                                <div className="space-y-2 mb-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <div className="flex items-center space-x-2">
                                        <Calendar size={12} className={needsProlong ? 'text-amber-400' : 'text-indigo-400'} />
                                        <span className={needsProlong ? 'text-amber-600' : ''}>
                                            Prazo: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-AO') : 'Sem prazo'}
                                        </span>
                                    </div>
                                    {goal.account && (
                                        <div className="flex items-center space-x-2">
                                            <TrendingUp size={12} className="text-emerald-400" />
                                            <span>
                                                Alocação: <span className="text-gray-600 text-[9px]">{goal.account.alias || goal.account.name} ({goal.allocation_percentage}%)</span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight mb-3">
                                            <span className="text-gray-400">Progresso Real</span>
                                            <span className={`${needsProlong ? 'text-amber-600' : 'text-indigo-600'} font-black`}>{progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100 p-0.5">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-emerald-500' : (needsProlong ? 'bg-amber-400 animate-pulse' : 'bg-indigo-600')}`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {needsProlong && (
                                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                            <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest leading-normal">
                                                ⚠️ Atraso Detetado! Mantendo {formatCurrency(goal.monthly_savings_planned)}/mês, novo prazo: <span className="text-amber-900">{new Date(newDeadline).toLocaleDateString('pt-AO')}</span>
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Património Alocado</p>
                                            <p className="text-lg font-black text-gray-900 leading-none">{formatCurrency(realCurrentAmount)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Objetivo</p>
                                            <p className="text-lg font-black text-gray-400 leading-none opacity-40">{formatCurrency(goal.target_amount)}</p>
                                        </div>
                                    </div>

                                    {goal.monthly_savings_planned > 0 && progress < 100 && (
                                        <div className="pt-4 border-t border-gray-50">
                                            <div className="bg-indigo-50/50 p-4 rounded-2xl flex items-center justify-between">
                                                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-tight">Plano Mensal</span>
                                                <span className="text-sm font-black text-indigo-700">{formatCurrency(goal.monthly_savings_planned)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Modal
                show={isModalOpen}
                onClose={closeModal}
                title={editingGoal ? 'Ajustar Estratégia' : 'Novo Alvo de Poupança'}
                maxWidth="2xl"
            >
                <form onSubmit={submit} className="p-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* COLUNA 1: DADOS E ALOCAÇÃO */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 font-mono">Nome do Objetivo</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                                    placeholder="Ex: Reserva Financeira..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 font-mono">Conta Poupança Vinculada</label>
                                <select
                                    value={data.account_id}
                                    onChange={(e) => setData('account_id', e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                                >
                                    <option value="">Manual (Sem Vínculo)</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.alias || acc.name} ({formatCurrency(acc.balance)})</option>
                                    ))}
                                </select>
                            </div>

                            {data.account_id && (
                                <div className="animate-in zoom-in-95 duration-300">
                                    <label className="block text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-3 font-mono">Alocação de Património (%)</label>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="range"
                                            min="1"
                                            max="100"
                                            value={data.allocation_percentage}
                                            onChange={(e) => setData('allocation_percentage', e.target.value)}
                                            className="flex-1 accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-sm font-black text-indigo-600 w-12 text-right">{data.allocation_percentage}%</span>
                                    </div>
                                    <p className="mt-2 text-[9px] font-bold text-gray-400 uppercase">
                                        Esta meta usará {data.allocation_percentage}% do saldo total da conta selecionada.
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 font-mono">Meta Final</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.target_amount}
                                        onChange={(e) => setData('target_amount', e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold focus:ring-2 focus:ring-indigo-100"
                                        required
                                    />
                                </div>
                                {!data.account_id && (
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 font-mono">Saldo Manual</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.current_amount}
                                            onChange={(e) => setData('current_amount', e.target.value)}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold focus:ring-2 focus:ring-indigo-100"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* COLUNA 2: SIMULADOR ADAPTATIVO */}
                        <div className="bg-indigo-50/30 p-8 rounded-[2rem] border border-indigo-100/50 space-y-6">
                            <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center">
                                <Activity size={14} className="mr-2" /> Estrategista Newgen
                            </h4>

                            <div className="flex bg-white p-1 rounded-xl border border-indigo-100 mb-6 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setSimulationMode('deadline')}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${simulationMode === 'deadline' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-indigo-600'}`}
                                >
                                    Pelo Prazo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSimulationMode('monthly')}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${simulationMode === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-indigo-600'}`}
                                >
                                    Pelo Valor
                                </button>
                            </div>

                            {simulationMode === 'deadline' ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
                                    <div>
                                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 font-mono">Até Quando?</label>
                                        <input
                                            type="date"
                                            value={data.deadline}
                                            onChange={handleDeadlineChange}
                                            className="w-full px-4 py-3 bg-white border border-indigo-100 rounded-xl text-xs font-black focus:ring-2 focus:ring-indigo-200 font-mono shadow-sm text-indigo-900"
                                        />
                                    </div>
                                    <div className="p-5 bg-white rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-10"><Target size={40} /></div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Esforço Mensal:</p>
                                        <p className="text-xl font-black text-indigo-600 tracking-tight">{formatCurrency(data.monthly_savings_planned || 0)}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-500">
                                    <div>
                                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 font-mono">Poupança Mensal</label>
                                        <input
                                            type="number"
                                            value={data.monthly_savings_planned}
                                            onChange={handleMonthlySavingChange}
                                            className="w-full px-4 py-3 bg-white border border-indigo-100 rounded-xl text-xs font-black focus:ring-2 focus:ring-indigo-200 shadow-sm text-indigo-900"
                                            placeholder="Ex: 100 000"
                                        />
                                    </div>
                                    <div className="p-5 bg-white rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-10"><Calendar size={40} /></div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Previsão Conclusão:</p>
                                        <p className="text-xl font-black text-indigo-600 tracking-tight">
                                            {data.deadline ? new Date(data.deadline).toLocaleDateString('pt-AO') : '---'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 pb-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            {editingGoal ? 'Aplicar Nova Estratégia' : 'Ativar Este Planeamento'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
