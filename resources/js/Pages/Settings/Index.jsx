import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Settings, Globe, Bell, Wallet, CheckCircle } from 'lucide-react';

/**
 * =================================================================================
 * ARQUIVO: Settings/Index.jsx
 * PROPÓSITO: Configurações de preferência do utilizador.
 * CONCEITOS ENSINADOS:
 * - Preference Persistence: Salvar escolhas globais que afetam a UI (ex: Moeda).
 * - UI Feedback: Uso de ícones e estados para confirmar alterações.
 * =================================================================================
 */
export default function Index({ settings }) {
    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        default_currency: settings.default_currency || 'AOA',
        language: settings.language || 'pt',
        timezone: settings.timezone || 'Africa/Luanda',
        notifications_enabled: settings.notifications_enabled,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('settings.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout header="Configurações do Sistema">
            <Head title="Configurações" />

            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-10 border-b border-gray-50 bg-[#fcfdfe] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-gray-900">
                            <Settings size={120} />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black text-gray-900 leading-none mb-2">Preferências</h2>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Personalize a sua experiência no FinanceOs</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-10 space-y-10">
                        {/* LOCALIZAÇÃO E MOEDA */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Wallet size={18} className="text-orange-500" />
                                    <label className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Moeda Padrão</label>
                                </div>
                                <select
                                    value={data.default_currency}
                                    onChange={e => setData('default_currency', e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-200 transition-all"
                                >
                                    <option value="AOA">Kwanza (AOA)</option>
                                    <option value="USD">Dólar (USD)</option>
                                    <option value="EUR">Euro (EUR)</option>
                                </select>
                                <p className="text-[10px] text-gray-400 font-medium">Esta moeda será usada por padrão nos novos lançamentos.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Globe size={18} className="text-blue-500" />
                                    <label className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Idioma do Sistema</label>
                                </div>
                                <select
                                    value={data.language}
                                    onChange={e => setData('language', e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="pt">Português (Angola)</option>
                                    <option value="en">English (International)</option>
                                </select>
                            </div>
                        </div>

                        {/* FUSO HORÁRIO */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-gray-900 uppercase tracking-widest block mb-2">Fuso Horário</label>
                            <select
                                value={data.timezone}
                                onChange={e => setData('timezone', e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-200"
                            >
                                <option value="Africa/Luanda">Africa/Luanda (GMT+1)</option>
                                <option value="UTC">UTC (Universal Tempo Coordenado)</option>
                            </select>
                        </div>

                        {/* NOTIFICAÇÕES */}
                        <div className="pt-6 border-t border-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                                        <Bell size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Alertas e Notificações</p>
                                        <p className="text-xs text-gray-400">Receba avisos de orçamentos excedidos e metas atingidas.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.notifications_enabled}
                                        onChange={e => setData('notifications_enabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* SUBMIT */}
                        <div className="pt-6 flex items-center space-x-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center"
                            >
                                {processing ? 'A Guardar...' : 'Salvar Preferências'}
                                {recentlySuccessful && <CheckCircle size={16} className="ml-2 text-green-400" />}
                            </button>

                            {recentlySuccessful && (
                                <p className="text-xs font-bold text-green-600 animate-pulse">Alterações guardadas com sucesso!</p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
