/**
 * ================================================================================
 * PÁGINA: Edição de Perfil (Style Newgen)
 * ================================================================================
 */

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateWhatsAppForm from './Partials/UpdateWhatsAppForm';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Definições de Perfil</h2>}
        >
            <Head title="Meu Perfil" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    {/* LINHA 1: INFORMAÇÕES BÁSICAS E WHATSAPP */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-4 sm:p-8 bg-white/80 backdrop-blur-md shadow-xl sm:rounded-2xl border border-white/20">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>

                        <div className="p-4 sm:p-8 bg-white/80 backdrop-blur-md shadow-xl sm:rounded-2xl border border-white/20">
                            <UpdateWhatsAppForm className="max-w-xl" />
                        </div>
                    </div>

                    {/* LINHA 2: SEGURANÇA */}
                    <div className="p-4 sm:p-8 bg-white/80 backdrop-blur-md shadow-xl sm:rounded-2xl border border-white/20">
                        <UpdatePasswordForm className="max-w-3xl" />
                    </div>

                    {/* LINHA 3: ZONA CRÍTICA */}
                    <div className="p-4 sm:p-8 bg-white/10 backdrop-blur-sm shadow-xl sm:rounded-2xl border border-red-200/30 overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
                        <DeleteUserForm className="max-w-7xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
