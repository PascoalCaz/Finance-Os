/**
 * ================================================================================
 * COMPONENTE: Formulário de Contacto WhatsApp (Estilo Newgen)
 * ================================================================================
 */

import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';

export default function UpdateWhatsAppForm({ className = '' }) {
    const user = usePage().props.auth.user;

    // Remove o sufixo @s.whatsapp.net para exibição
    const currentWhatsApp = user.whatsapp
        ? user.whatsapp.replace('@s.whatsapp.net', '')
        : '';

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        whatsapp: currentWhatsApp,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="p-2 bg-green-100 rounded-lg text-green-600">💬</span>
                    Contacto WhatsApp
                </h2>
                <p className="mt-1 text-sm text-gray-600 ml-10">
                    Adicione o seu número de WhatsApp para receber notificações e usar automações.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100 space-y-4">
                    <div>
                        <InputLabel htmlFor="whatsapp" value="Número WhatsApp (com código do país)" />
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                                +
                            </span>
                            <TextInput
                                type="text"
                                id="whatsapp"
                                name="whatsapp"
                                value={data.whatsapp}
                                onChange={(e) => setData('whatsapp', e.target.value)}
                                placeholder="244956834375"
                                className="block w-full flex-1 rounded-none rounded-r-md border-gray-300"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Exemplo: 244956834375 (código do país + número)
                        </p>
                        <InputError className="mt-2" message={errors.whatsapp} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Guardar WhatsApp</PrimaryButton>

                    {recentlySuccessful && (
                        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                            <span>✓</span> Salvo!
                        </p>
                    )}
                </div>
            </form>
        </section>
    );
}
