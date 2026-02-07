import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm } from '@inertiajs/react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    RotateCw,
    Users,
    FolderKanban,
    FileCheck,
    History,
    Landmark,
    Target as TargetIcon,
    Activity,
    Download,
    X,
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
    Tag
} from 'lucide-react';

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

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';

/**
 * =================================================================================
 * ARQUIVO: Dashboard.jsx (PREMIUM REDESIGN)
 * PROPÓSITO: Dashboard de finanças com visual Newgen 360, gráficos e multimoeda.
 * =================================================================================
 */
export default function Dashboard({ stats, accounts, filters }) {
    const { router } = usePage();
    const user = usePage().props.auth.user;
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const years = [2024, 2025, 2026];

    const handlePeriodChange = (newMonth, newYear) => {
        router.get(route('dashboard'), {
            month: newMonth || filters.month,
            year: newYear || filters.year
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const formatCurrency = (value, currency = 'AOA') => {
        return new Intl.NumberFormat(currency === 'AOA' ? 'pt-AO' : 'en-US', {
            style: 'currency',
            currency: currency,
        }).format(value);
    };

    // CORES PARA O GRÁFICO DE ROSCA
    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    // ESTADO PARA CUSTOMIZAÇÃO DO DASHBOARD (LOCAL)
    const { data: dashboardPrefs, setData } = useForm({
        forecastMode: 'daily',
        forecastStyle: 'white',
    });

    const data = dashboardPrefs; // Atalho para o template

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-10 pb-12">

                {/* HEADER COM SELETOR DE PERÍODO */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end px-2 gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-1">Visão Geral</p>
                        <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tighter">Finance<span className="text-indigo-600">OS</span></h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={filters.month}
                            onChange={(e) => handlePeriodChange(e.target.value, null)}
                            className="bg-white border-none rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                        >
                            {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                        </select>

                        <select
                            value={filters.year}
                            onChange={(e) => handlePeriodChange(null, e.target.value)}
                            className="bg-white border-none rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>

                        <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden md:block"></div>

                        <a
                            href={route('export.pdf')}
                            target="_blank"
                            className="bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-indigo-100 transition-all shadow-sm"
                        >
                            <Download size={14} className="mr-2" /> Relatório PDF
                        </a>
                        <a
                            href={route('export.transactions')}
                            className="bg-white text-gray-600 border border-gray-100 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <Download size={14} className="mr-2" /> Exportar CSV
                        </a>
                        <button
                            onClick={() => router.reload()}
                            className="bg-gray-900 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                        >
                            <Activity size={14} className="mr-2" /> Sincronizar
                        </button>
                    </div>
                </div>

                {/* TOP STATS CARDS V2 (ELITE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Património Líquido"
                        value={formatCurrency(stats.total_balance)}
                        subtitle="Consolidado em base fixa"
                        icon={<Wallet size={20} className="text-white" />}
                        iconBg="bg-indigo-600"
                        trend="Total em Carteira"
                    />
                    {/* WIDGET PREVISÃO DUAL & CUSTOMIZÁVEL */}
                    <div className={`p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group transition-all duration-500 ${
                        data.forecastStyle === 'dark' ? 'bg-gray-900 text-white border-gray-800' :
                        data.forecastStyle === 'indigo' ? 'bg-indigo-50 border-indigo-100 text-indigo-900' :
                        data.forecastStyle === 'emerald' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                        'bg-white text-gray-900'
                    }`}>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 leading-none ${data.forecastStyle === 'dark' ? 'text-indigo-400' : 'text-gray-400'}`}>
                                    Previsão Final
                                </p>
                                <div className="flex bg-black/5 p-0.5 rounded-lg w-fit">
                                    <button
                                        onClick={() => setData('forecastMode', 'daily')}
                                        className={`px-2 py-1 text-[8px] font-black uppercase rounded-md transition-all ${data.forecastMode === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >Fluxo</button>
                                    <button
                                        onClick={() => setData('forecastMode', 'budget')}
                                        className={`px-2 py-1 text-[8px] font-black uppercase rounded-md transition-all ${data.forecastMode === 'budget' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >Orçamento</button>
                                </div>
                            </div>

                            {/* SELETOR DE CORES INTEGRADO */}
                            <div className="flex space-x-1.5 pt-1">
                                {['white', 'indigo', 'emerald', 'dark'].map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => setData('forecastStyle', style)}
                                        className={`w-3 h-3 rounded-full border-2 transition-all ${
                                            style === 'white' ? 'bg-white border-gray-200' :
                                            style === 'indigo' ? 'bg-indigo-500 border-indigo-200' :
                                            style === 'emerald' ? 'bg-emerald-500 border-emerald-200' :
                                            'bg-gray-900 border-gray-700'
                                        } ${data.forecastStyle === style ? 'scale-125 ring-2 ring-indigo-200 ring-offset-2' : 'opacity-40 hover:opacity-100'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <p className={`text-2xl font-black mb-2 transition-all ${
                            data.forecastStyle === 'dark' ? 'text-white' :
                            data.forecastStyle === 'indigo' ? 'text-indigo-700' :
                            data.forecastStyle === 'emerald' ? 'text-emerald-700' :
                            'text-indigo-600'
                        }`}>
                            {formatCurrency(data.forecastMode === 'daily' ? stats.forecast_balance : stats.forecast_budget)}
                        </p>

                        <p className={`text-[9px] font-bold leading-tight uppercase tracking-tighter opacity-60`}>
                            {data.forecastMode === 'daily'
                                ? `Baseado no fluxo diário de ${formatCurrency(stats.daily_flow)}`
                                : `Baseado nos seus orçamentos definidos`
                            }
                        </p>

                        <TrendingUp className={`absolute -right-4 -bottom-4 w-16 h-16 opacity-10 transition-transform group-hover:scale-110 ${data.forecastStyle === 'dark' ? 'text-white' : 'text-indigo-500'}`} />
                    </div>

                    <StatCard
                        title="Execução Orçamental"
                        value={`${stats.budget_utilization}%`}
                        subtitle="Limite mensal utilizado"
                        icon={<Activity size={20} className="text-white" />}
                        iconBg="bg-orange-500"
                        trend={stats.budget_utilization > 80 ? 'Atenção' : 'No Limite'}
                    />

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group bg-gray-900 text-white">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 leading-none flex items-center">
                            <Plus size={10} className="mr-1" /> Top Gastos
                        </p>
                        <div className="space-y-2">
                            {stats.top_categories.slice(0, 3).map((cat, i) => (
                                <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                                    <span className="text-[9px] font-black uppercase tracking-tight truncate w-24">{cat.name}</span>
                                    <span className="text-[10px] font-bold text-rose-400">{formatCurrency(cat.value)}</span>
                                </div>
                            ))}
                            {stats.top_categories.length === 0 && <p className="text-[9px] italic text-gray-500">Sem gastos registados.</p>}
                        </div>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: ACCOUNTS & CATEGORIES */}
                    <div className="xl:col-span-2 space-y-8">

                        {/* BANK CARDS */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Minhas Contas</h3>
                                <button className="text-[10px] font-bold text-indigo-600 hover:underline">Ver todas</button>
                            </div>
                            <div className="flex space-x-6 overflow-x-auto pb-4 no-scrollbar">
                                {accounts && accounts.map((acc, idx) => (
                                    <BankCard key={acc.id} account={acc} index={idx} formatCurrency={formatCurrency} />
                                ))}
                                <button className="min-w-[280px] h-[180px] border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-300 hover:border-indigo-200 hover:text-indigo-400 transition-all bg-[#fcfdfe]/50 group">
                                    <div className="p-4 bg-gray-50 rounded-full mb-3 group-hover:bg-indigo-50 transition-colors">
                                        <Plus size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nova Conta</span>
                                </button>
                            </div>
                        </div>

                        {/* ANALYTICS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* FLOW CHART */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[400px]">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900">Fluxo de Caixa</h3>
                                        <p className="text-xs font-bold text-gray-400">Semestre Atual</p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <span className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></div> Ganho
                                        </span>
                                        <span className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                            <div className="w-2 h-2 rounded-full bg-rose-500 mr-1.5"></div> Gasto
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.chart_data}>
                                            <defs>
                                                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}}
                                                dy={10}
                                            />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
                                            />
                                            <Area type="monotone" dataKey="income" stroke="#6366f1" fillOpacity={1} fill="url(#colorInc)" strokeWidth={3} />
                                            <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExp)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* CATEGORY DISTRIBUTION */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[400px]">
                                <h3 className="text-lg font-black text-gray-900 mb-1">Distribuição</h3>
                                <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">Gastos por Categoria</p>
                                <div className="flex-1 flex items-center justify-center relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.expenses_by_category && stats.expenses_by_category.length > 0 ? stats.expenses_by_category : [{name: 'Sem gastos', value: 1}]}
                                                innerRadius={70}
                                                outerRadius={100}
                                                paddingAngle={8}
                                                dataKey="value"
                                            >
                                                {stats.expenses_by_category?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Mês Atual</span>
                                        <span className="text-xl font-black text-gray-900 leading-none">
                                            {formatCurrency(stats.monthly_expense).split(',')[0]}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-y-3 mt-6">
                                    {stats.expenses_by_category?.slice(0, 4).map((cat, idx) => (
                                        <div key={idx} className="flex items-center space-x-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                            <span className="text-[10px] font-bold text-gray-500 truncate uppercase tracking-tighter">{cat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: BUDGETS & ACTIVITY */}
                    <div className="space-y-8">
                        <div className="bg-gray-900 rounded-[2.5rem] p-9 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                <TrendingUp size={140} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-1">Saúde Financeira</h3>
                                <p className="text-[10px] font-bold text-gray-500 mb-9 uppercase tracking-widest">Orçamentos Ativos ({stats.detailed_budgets?.length || 0})</p>

                                <div className="space-y-8 max-h-[350px] overflow-y-auto no-scrollbar pr-2">
                                    {stats.detailed_budgets && stats.detailed_budgets.length > 0 ? (
                                        stats.detailed_budgets.map((budget) => (
                                            <div key={budget.id} className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1 block">{budget.category_name}</span>
                                                        <span className="text-xs font-black text-white">{formatCurrency(budget.real, budget.currency)} / {formatCurrency(budget.planned, budget.currency)}</span>
                                                    </div>
                                                    <span className={`text-xs font-black ${budget.percent > 90 ? 'text-rose-400' : 'text-indigo-300'}`}>{budget.percent}%</span>
                                                </div>
                                                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden backdrop-blur-md border border-white/5">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${budget.percent > 90 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]'}`}
                                                        style={{ width: `${Math.min(budget.percent, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nenhum orçamento configurado</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* RECENT ACTIVITY COMPACT */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Histórico Recente</h3>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em]">Últimas 24h</span>
                            </div>
                            <div className="space-y-6">
                                {stats.recent_transactions && stats.recent_transactions.length > 0 ? (
                                    stats.recent_transactions.map((t) => (
                                        <ActivityRow
                                            key={t.id}
                                            icon={t.category?.icon ? getIcon(t.category.icon) : (t.type === 'income' ? <ArrowUpRight size={14} /> : (t.type === 'expense' ? <ArrowDownLeft size={14} /> : <RotateCw size={14} />))}
                                            title={t.description || 'Lançamento'}
                                            val={`${t.type === 'expense' ? '-' : (t.type === 'income' ? '+' : '')}${formatCurrency(t.amount, t.account?.currency)}`}
                                            time={new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            color={t.type === 'income' ? 'emerald' : (t.type === 'expense' ? 'rose' : 'indigo')}
                                            categoryColor={t.category?.color}
                                        />
                                    ))
                                ) : (
                                    <p className="text-[10px] text-gray-400 font-bold uppercase text-center py-4">Sem movimentos recentes</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}

// COMPONENTES AUXILIARES
function StatCard({ title, value, subtitle, icon, iconBg, trend }) {
    return (
        <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 cursor-pointer overflow-hidden border-b-4 border-b-transparent hover:border-b-indigo-500">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${iconBg} shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                <div>
                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-wider">{trend}</span>
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{title}</p>
                <h2 className="text-2xl font-black text-gray-900 leading-none tracking-tight">{value}</h2>
                <p className="mt-5 text-[10px] font-black text-gray-300 uppercase tracking-widest">{subtitle}</p>
            </div>
        </div>
    );
}

function BankCard({ account, index, formatCurrency }) {
    const gradients = [
        'bg-gray-900',
        'bg-indigo-600',
        'bg-emerald-600',
        'bg-rose-600',
        'bg-amber-600',
    ];

    const cardStyle = account.color ? { backgroundColor: account.color } : {};

    return (
        <div
            className={`min-w-[320px] h-[190px] p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:scale-[1.03] transition-all duration-500 border border-white/10 ${!account.color ? gradients[index % gradients.length] : ''}`}
            style={cardStyle}
        >
            {/* CARD ORNAMENT */}
            <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">{account.bank_name || 'FINANCE OS'}</p>
                    <h4 className="text-lg font-black tracking-tight leading-none uppercase">{account.name}</h4>
                </div>
                <Landmark size={22} className="opacity-30" />
            </div>

            <div className="relative z-10">
                <p className="text-[10px] font-black opacity-40 mb-2 uppercase tracking-widest">Saldo Agregado</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-black tracking-tighter">{formatCurrency(account.balance, account.currency)}</h3>
                    <div className="flex -space-x-3 opacity-60">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/10"></div>
                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/10"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActivityRow({ icon, title, val, time, color, categoryColor }) {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600',
        rose: 'bg-rose-50 text-rose-600',
        indigo: 'bg-indigo-50 text-indigo-600',
    };
    return (
        <div className="flex items-center justify-between group p-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer">
            <div className="flex items-center space-x-4">
                <div
                    className={`p-3 rounded-xl ${colors[color]} shadow-sm group-hover:scale-110 transition-transform`}
                    style={categoryColor ? { backgroundColor: `${categoryColor}15`, color: categoryColor } : {}}
                >
                    {icon}
                </div>
                <div>
                    <p className="text-[11px] font-black text-gray-800 leading-none mb-1.5">{title}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{time}</p>
                </div>
            </div>
            <span className={`text-xs font-black ${val.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'}`}>{val}</span>
        </div>
    );
}
