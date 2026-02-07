import { Link } from "@inertiajs/react";

/**
 * =================================================================================
 * ARQUIVO: GuestLayout.jsx (REDESIGN ELITE)
 * PROPÓSITO: Prover uma moldura imersiva e luxuosa para as telas de autenticação.
 * =================================================================================
 */
export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex font-sans antialiased text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* LADO ESQUERDO: VISUAL IMERSIVO (ESCONDIDO NO MOBILE SE DESEJADO, MAS AQUI MANTEMOS PREMIUM) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
                <img
                    src="/storage/app/public/assets/auth_bg_premium.png"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity scale-110 blur-[2px] animate-pulse-slow"
                    alt="Finance Background"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-indigo-950/40 to-transparent"></div>

                <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full">
                    <Link href="/">
                        <span className="text-3xl font-black text-white tracking-tighter uppercase italic">
                            Finance<span className="text-indigo-500">OS</span>
                        </span>
                    </Link>

                    <div className="max-w-md">
                        <h2 className="text-5xl font-black text-white leading-tight mb-6 tracking-tighter">
                            A Nova Era da Sua <br />
                            <span className="text-indigo-400">
                                Liberdade Financeira.
                            </span>
                        </h2>
                        <p className="text-lg text-gray-400 font-medium leading-relaxed">
                            Gestão de elite, inteligência artificial e controle
                            absoluto do seu património em um único ecossistema.
                        </p>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-800"
                                ></div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500 font-bold">
                            Junte-se a +2.500 investidores de elite em Angola.
                        </p>
                    </div>
                </div>
            </div>

            {/* LADO DIREITO: FORMULÁRIO */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-[#fcfdfe]">
                <div className="w-full max-w-md">
                    {/* LOGO MOBILE-ONLY */}
                    <div className="lg:hidden mb-12 flex justify-center">
                        <Link href="/">
                            <span className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
                                Finance
                                <span className="text-indigo-600">OS</span>
                            </span>
                        </Link>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}

// Pequena animação personalizada (pode ser adicionada ao CSS global se necessário)
// Aqui definimos apenas para referência visual no JSX.
