'use client';

import AccountForm from '@/Components/AccountForm';
import Initializer from '@/Components/Initializer';
import NetWorth from '@/Components/NetWorth';
import { Plus, File } from 'lucide-react';

const page = () => {
    return (
        <main className="bg-white lg:bg-gray-200 flex justify-center items-start lg:items-center min-h-screen w-full lg:w-[calc(100%-var(--nav-width))] lg:ml-(--nav-width) p-3 lg:p-16">
            <Initializer accounts rates />
            <section className="w-full lg:bg-white lg:rounded-lg lg:shadow-2xl lg:max-w-5xl lg:p-4 flex flex-col gap-4">
                <div className="flex justify-between">
                    <button
                        type="button"
                        className="btn btn-outline flex text-base gap-2 items-center justify-center p-3"
                        onClick={() =>
                            (document.getElementById('add') as HTMLDialogElement)?.showModal()
                        }>
                        <Plus size={25} /> New
                    </button>
                    <dialog id="add" className="modal">
                        <div className="modal-box max-w-120 min-h-90 transition-all">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg flex gap-2 py-4">
                                    <File /> Add Transaction
                                </h3>{' '}
                                <form method="dialog">
                                    <button className="btn p-3.5 text-lg font-black bg-red-600/70 text-white hover:bg-red-600">
                                        X
                                    </button>
                                </form>
                            </div>
                            <div>
                                <AccountForm action={'create'} />
                            </div>
                        </div>
                    </dialog>
                </div>
                <div className="font-mono">
                    <NetWorth closable={false} editMode={true} />
                </div>
            </section>
        </main>
    );
};

export default page;
