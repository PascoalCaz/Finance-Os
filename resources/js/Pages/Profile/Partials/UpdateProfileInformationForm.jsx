/**
 * ================================================================================
 * COMPONENTE: Atualizar Informações do Perfil (Estilo Newgen)
 * ================================================================================
 */

import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">👤</span>
                    Dados Pessoais
                </h2>
                <p className="mt-1 text-sm text-gray-600 ml-10">
                    Atualize o seu nome e endereço de email.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100 space-y-4">
                    <div>
                        <InputLabel htmlFor="name" value="Nome Completo" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Endereço de Email" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Salvar Informações</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                            <span>✓</span> Atualizado com sucesso.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
