import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
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
    Smile
} from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

// MAPA DE ÍCONES DISPONÍVEIS PARA ESCOLHA
const ICON_MAP = {
    Tag: <Tag size={18} />,
    ShoppingCart: <ShoppingCart size={18} />,
    Home: <Home size={18} />,
    Car: <Car size={18} />,
    Utensils: <Utensils size={18} />,
    Heart: <Heart size={18} />,
    Smartphone: <Smartphone size={18} />,
    Briefcase: <Briefcase size={18} />,
    Plane: <Plane size={18} />,
    Dumbbell: <Dumbbell size={18} />,
    Gamepad: <Gamepad size={18} />,
    Gift: <Gift size={18} />,
    Music: <Music size={18} />,
    Zap: <Zap size={18} />,
    CreditCard: <CreditCard size={18} />,
    DollarSign: <DollarSign size={18} />,
    Smile: <Smile size={18} />,
};

export default function Index({ categories }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        type: 'expense',
        color: '#4f46e5',
        icon: 'Tag',
    });

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setData({
                name: category.name,
                type: category.type,
                color: category.color || '#4f46e5',
                icon: category.icon || 'Tag',
            });
        } else {
            setEditingCategory(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            put(route('categories.update', editingCategory.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const getIcon = (name) => ICON_MAP[name] || ICON_MAP['Tag'];

    return (
        <AuthenticatedLayout header="Categorias">
            <Head title="Categorias" />

            <div className="space-y-8">
                <div className="flex justify-between items-center px-2">
                    <h1 className="text-2xl font-bold text-gray-900 leading-none">Categorias</h1>
                    <button
                        onClick={() => openModal()}
                        className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center hover:bg-gray-800 transition-all shadow-lg"
                    >
                        <Plus size={16} className="mr-2" /> Nova Categoria
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map((category) => (
                        <div key={category.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                            <div className="flex items-center space-x-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                                    style={{ backgroundColor: category.color || '#4f46e5' }}
                                >
                                    {getIcon(category.icon)}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">{category.name}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {category.type === 'income' ? 'Receita' : 'Despesa'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(category)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                    <Pencil size={14} />
                                </button>
                                <button onClick={() => { if(confirm('Remover?')) destroy(route('categories.destroy', category.id)) }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                show={isModalOpen}
                onClose={closeModal}
                title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            >
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Nome</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-200 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Ícone</label>
                        <div className="grid grid-cols-6 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 max-h-[160px] overflow-y-auto">
                            {Object.entries(ICON_MAP).map(([name, icon]) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => setData('icon', name)}
                                    className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                                        data.icon === name
                                        ? 'bg-indigo-600 text-white shadow-lg scale-110'
                                        : 'bg-white text-gray-400 hover:text-gray-900 hover:shadow-sm'
                                    }`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Tipo</label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-200"
                            >
                                <option value="expense">Despesa</option>
                                <option value="income">Receita</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Cor Identificadora</label>
                            <input
                                type="color"
                                value={data.color}
                                onChange={(e) => setData('color', e.target.value)}
                                className="w-full h-12 p-1 bg-gray-50 border border-gray-100 rounded-2xl cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                        >
                            {editingCategory ? 'Atualizar' : 'Criar Categoria'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
