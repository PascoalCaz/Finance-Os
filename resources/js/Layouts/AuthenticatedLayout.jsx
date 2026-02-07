import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    LayoutDashboard,
    Wallet,
    ArrowRightLeft,
    PieChart,
    Target,
    Settings,
    Globe,
    Clock,
    Menu,
    X,
    Bell,
    ChevronDown,
    Tag,
    ShieldCheck,
    Users
} from 'lucide-react';

/**
 * =================================================================================
 * ARQUIVO: AuthenticatedLayout.jsx (REDESIGN COMPLETO)
 * PROPÓSITO: Implementar o layout com Sidebar e Header estilo Newgen 360.
 * CONCEITOS ENSINADOS:
 * - Layout Responsive: Uso de estados do React para alternar menus em dispositivos móveis.
 * - Design Consistente: Manter a paleta de cores e tipografia fiel à marca.
 * =================================================================================
 */
export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex text-gray-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* SIDEBAR (ESTILO MOCKUP) */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-sm`}>
                <div className="p-6 flex-1 flex flex-col">
                    {/* LOGO AREA */}
                    <div className="flex items-center space-x-2 mb-10 px-2">
                        <span className="text-xl font-black text-gray-800 tracking-tighter uppercase whitespace-nowrap">
                            Finance<span className="text-indigo-600">OS</span>
                        </span>
                    </div>

                    {/* NAVIGATION LINKS */}
                    <nav className="flex-1 space-y-1">
                        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Plataforma</p>

                        <SidebarLink href={route('dashboard')} active={route().current('dashboard')} icon={<LayoutDashboard size={18} />} onClick={() => setIsSidebarOpen(false)}>
                            Dashboard
                        </SidebarLink>

                        <SidebarLink href={route('accounts.index')} active={route().current('accounts.*')} icon={<Wallet size={18} />} onClick={() => setIsSidebarOpen(false)}>
                            Minhas Contas
                        </SidebarLink>

                        <SidebarLink href={route('transactions.index')} active={route().current('transactions.*')} icon={<ArrowRightLeft size={18} />} onClick={() => setIsSidebarOpen(false)}>
                            Transações
                        </SidebarLink>

                        <SidebarLink href={route('categories.index')} active={route().current('categories.index')} icon={<Tag size={18} />} onClick={() => setIsSidebarOpen(false)}>
                            Categorias
                        </SidebarLink>

                        <SidebarLink href={route('budgets.index')} active={route().current('budgets.*')} icon={<PieChart size={18} />} onClick={() => setIsSidebarOpen(false)}>
                            Orçamentos
                        </SidebarLink>

                        <SidebarLink href={route('goals.index')} active={route().current('goals.*')} icon={<Target size={18} />} onClick={() => setIsSidebarOpen(false)}>
                            Metas
                        </SidebarLink>

                        <SidebarLink href={route('recurring.index')} active={route().current('recurring.*')} icon={<Clock size={18} />} onClick={() => setIsSidebarOpen(false)}>
                            Automação
                        </SidebarLink>

                        {(user.role === 'admin' || user.role === 'super_admin') && (
                            <>
                                <p className="px-4 text-[10px] font-bold text-red-500 uppercase tracking-widest mt-8 mb-4">Administração</p>
                                <SidebarLink
                                    href={route('admin.dashboard')}
                                    active={route().current('admin.dashboard')}
                                    icon={<ShieldCheck size={18} className="text-red-500" />}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    Painel Admin
                                </SidebarLink>
                                <SidebarLink
                                    href={route('admin.users.index')}
                                    active={route().current('admin.users.*')}
                                    icon={<Users size={18} />}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    Utilizadores
                                </SidebarLink>
                            </>
                        )}
                    </nav>

                    {/* SETTINGS FOOTER */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <SidebarLink href={route('settings.index')} active={route().current('settings.index')} icon={<Settings size={18} />} onClick={() => setIsSidebarOpen(false)}>
                            Configurações
                        </SidebarLink>
                    </div>
                </div>
            </aside>

            {/* OVERLAY MOBILE */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] z-40 md:hidden transition-all duration-500"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* GLOBAL HEADER */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center space-x-4">
                        <button className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>

                        {/* BREADCRومBS ESTILO MOCKUP */}
                        <div className="flex items-center space-x-2 text-[11px] font-bold tracking-wider uppercase">
                            <span className="text-gray-700">{header}</span>
                        </div>
                    </div>

                    {/* HEADER OPTIONS */}
                    <div className="flex items-center space-x-4 md:space-x-10">
                        {/* Removidos: Relógio, Técnico, Idioma */}

                        {/* USER DROPDOWN (ESTILO CIRCULAR) */}
                        <div className="flex items-center space-x-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-gray-900 leading-none mb-1">{user.name}</p>
                                <p className="text-[10px] text-gray-400 font-medium">Online</p>
                            </div>
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="p-0.5 rounded-full border-2 border-transparent hover:border-gray-100 transition-all focus:outline-none">
                                        <div className="w-8 h-8 rounded-full bg-[#f3f4f6] border border-gray-200 flex items-center justify-center text-[11px] font-black text-gray-500 tracking-tighter uppercase">
                                            {user.name.charAt(0)}
                                        </div>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <div className="px-4 py-3 border-b border-gray-50">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Perfil Ativo</p>
                                        <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                                    </div>
                                    <Dropdown.Link href={route('profile.edit')}>Definições de Conta</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Terminar Sessão
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE MAIN CONTENT */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
                    {/* NOTIFICAÇÕES FLASH */}
                    {usePage().props.flash.success && (
                        <div className="absolute top-4 right-8 z-50 animate-bounce">
                            <div className="bg-green-600 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center space-x-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                <span>{usePage().props.flash.success}</span>
                            </div>
                        </div>
                    )}
                    {usePage().props.flash.error && (
                        <div className="absolute top-4 right-8 z-50 animate-pulse">
                            <div className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-xs">
                                {usePage().props.flash.error}
                            </div>
                        </div>
                    )}

                    <div className="max-w-screen-2xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

function SidebarLink({ href, active, icon, children, onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 relative group ${
                active
                ? 'bg-gray-100 text-gray-900 shadow-sm border border-gray-100/50'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
            <span className={`${active ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900'} transition-colors`}>
                {icon}
            </span>
            <span className="tracking-tight">{children}</span>
            {active && (
                <div className="absolute left-0 w-1 h-4 bg-gray-900 rounded-full my-auto inset-y-0"></div>
            )}
        </Link>
    );
}
