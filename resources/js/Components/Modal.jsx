import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

/**
 * =================================================================================
 * ARQUIVO: Modal.jsx
 * PROPÓSITO: Componente de janela sobreposta (modal) ultra-premium.
 * CONCEITOS ENSINADOS:
 * - Transitions: Animações suaves de entrada e saída (Fade/Scale).
 * - Accessibility: Uso do Headless UI para garantir navegação por teclado.
 * =================================================================================
 */
export default function Modal({ show, onClose, title, children }) {
    return (
        <Transition show={show} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/5backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
                                <div className="bg-white px-8 pt-8 pb-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <Dialog.Title as="h3" className="text-xl font-black text-gray-900 tracking-tight">
                                            {title}
                                        </Dialog.Title>
                                        <button
                                            type="button"
                                            className="rounded-xl p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-all"
                                            onClick={onClose}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="mt-2">
                                        {children}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
