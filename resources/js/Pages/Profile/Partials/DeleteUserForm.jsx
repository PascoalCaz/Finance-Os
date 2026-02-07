/**
 * ================================================================================
 * COMPONENTE: Eliminar Utilizador (Estilo Newgen)
 * ================================================================================
 */

import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                    <span className="p-2 bg-red-100 rounded-lg text-red-600">⚠️</span>
                    Zona Crítica
                </h2>
                <p className="mt-1 text-sm text-gray-600 ml-10">
                    Ações permanentes e irreversíveis. Por favor, tenha cuidado.
                </p>
            </header>

            <div className="bg-red-50/50 backdrop-blur-sm p-4 rounded-xl border border-red-100 ml-10">
                <p className="text-sm text-gray-600 max-w-xl">
                    Ao eliminar a sua conta, todos os seus recursos e dados serão permanentemente apagados.
                    Antes de prosseguir, por favor descarregue qualquer dado que deseje manter.
                </p>

                <div className="mt-5">
                    <DangerButton onClick={confirmUserDeletion}>Eliminar Conta Definitivamente</DangerButton>
                </div>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Tem a certeza que deseja eliminar a sua conta?
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        Por favor, introduza a sua senha para confirmar que deseja eliminar permanentemente os seus dados.
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value="Senha" className="sr-only" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-3/4"
                            isFocused
                            placeholder="Senha"
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Cancelar</SecondaryButton>
                        <DangerButton className="ms-3" disabled={processing}>Eliminar Conta</DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
