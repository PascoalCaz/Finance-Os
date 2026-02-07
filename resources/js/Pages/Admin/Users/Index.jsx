import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { UserPlus, Pencil, Trash2, Mail, Shield, CreditCard } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

/**
 * =================================================================================
 * ARQUIVO: Admin/Users/Index.jsx
 * PROPÓSITO: Gestão de utilizadores e subscrições pelo Super Admin.
 * CONCEITOS ENSINADOS:
 * - Pagination: Lidar com grandes volumes de dados de utilizadores.
 * - Access Control: Gerir permissões (roles) de outros utilizadores.
 * =================================================================================
 */
export default function Index({ users }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        subscription_plan: 'free',
        status: 'active',
    });

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setData({
                name: user.name,
                email: user.email,
                role: user.role,
                subscription_plan: user.subscription_plan,
                status: user.status,
            });
        } else {
            setEditingUser(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingUser) {
            put(route('admin.users.update', editingUser.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    return (
        <AuthenticatedLayout header="Gestão de Utilizadores">
            <Head title="Admin: Utilizadores" />

            <div className="space-y-8">
                <div className="flex justify-between items-center px-2">
                    <h1 className="text-2xl font-black text-gray-900 leading-none">Controlo de Utilizadores</h1>
                    <button
                        onClick={() => openModal()}
                        className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center hover:bg-gray-800 transition-all shadow-lg"
                    >
                        <UserPlus size={16} className="mr-2" /> Novo Utilizador
                    </button>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#fcfdfe] border-b border-gray-50">
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Utilizador</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Permissão</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Plano</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.data.map((user) => (
                                <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-500 text-[10px] uppercase">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-tight">{user.name}</p>
                                                <p className="text-[11px] text-gray-400 flex items-center">
                                                    <Mail size={10} className="mr-1" /> {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${
                                            user.role === 'super_admin' ? 'bg-red-50 text-red-600 border-red-100' :
                                            user.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center space-x-2">
                                            <CreditCard size={12} className="text-gray-400" />
                                            <span className="text-xs font-bold text-gray-600">{user.subscription_plan}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="text-xs font-bold text-gray-600 capitalize">{user.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal(user)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => { if(confirm('Remover utilizador?')) destroy(route('admin.users.destroy', user.id)) }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                            >
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

            {/* MODAL UTILIZADOR */}
            <Modal
                show={isModalOpen}
                onClose={closeModal}
                title={editingUser ? 'Editar Utilizador' : 'Novo Utilizador'}
            >
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Nome Completo</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-200"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-200"
                            required
                            disabled={!!editingUser}
                        />
                    </div>

                    {!editingUser && (
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Palavra-passe Inicial</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-200 font-mono"
                                required
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Role</label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-gray-200"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Plano</label>
                            <select
                                value={data.subscription_plan}
                                onChange={(e) => setData('subscription_plan', e.target.value)}
                                className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-gray-200"
                            >
                                <option value="free">Free</option>
                                <option value="pro">Pro</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Status</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-gray-200"
                            >
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
                                <option value="suspended">Suspenso</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 pb-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            {editingUser ? 'Guardar Alterações' : 'Criar Utilizador'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
