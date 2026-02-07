import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Users, CreditCard, UserPlus, TrendingUp, ShieldCheck } from 'lucide-react';

/**
 * =================================================================================
 * ARQUIVO: Admin/Dashboard.jsx
 * PROPÓSITO: Visão geral para Super Administradores.
 * CONCEITOS ENSINADOS:
 * - Admin Metrics: Monitorização de KPIs de negócio (SaaS).
 * - User Tracking: Observar o crescimento da base de utilizadores.
 * =================================================================================
 */
export default function Dashboard({ stats, recent_users }) {
    return (
        <AuthenticatedLayout header="Painel Super Admin">
            <Head title="Admin Dashboard" />

            <div className="space-y-8">
                {/* ADMIN HEADER */}
                <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <ShieldCheck size={120} />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-black mb-2 tracking-tight">Gestão Global FinanceOs</h1>
                        <p className="text-gray-400 font-medium text-sm">Bem-vindo ao controlo central do sistema multiténante.</p>
                    </div>
                </div>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AdminStatCard
                        title="Total Utilizadores"
                        value={stats.total_users}
                        icon={<Users size={20} />}
                        color="bg-blue-500"
                    />
                    <AdminStatCard
                        title="Subscrições Ativas"
                        value={stats.active_subscriptions}
                        icon={<CreditCard size={20} />}
                        color="bg-green-500"
                    />
                    <AdminStatCard
                        title="Novos (Este Mês)"
                        value={stats.new_users_month}
                        icon={<UserPlus size={20} />}
                        color="bg-indigo-500"
                    />
                </div>

                {/* RECENT USERS LIST */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-900 leading-none">Últimos Registos</h3>
                        <button onClick={() => window.location.href='/admin/users'} className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700">Gerir Todos os Utilizadores →</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recent_users.map((user) => (
                            <div key={user.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-500 text-xs uppercase">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 leading-tight">{user.name}</p>
                                        <p className="text-[11px] text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Plano</p>
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                                        user.subscription_plan === 'free' ? 'bg-gray-100 text-gray-500' :
                                        user.subscription_plan === 'pro' ? 'bg-indigo-50 text-indigo-600' : 'bg-yellow-50 text-yellow-700'
                                    }`}>
                                        {user.subscription_plan}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function AdminStatCard({ title, value, icon, color }) {
    return (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-6 hover:shadow-md transition-all">
            <div className={`p-4 rounded-2xl text-white ${color} shadow-lg shadow-${color.split('-')[1]}-100`}>
                {icon}
            </div>
            <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">{value}</p>
            </div>
        </div>
    );
}
