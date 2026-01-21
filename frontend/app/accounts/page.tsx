'use client';

import { useState } from 'react';
import AccountForm from '@/Components/AccountForm';
import CustomModal from '@/Components/Custom/CustomModal';
import Initializer from '@/Components/Initializer';
import NetWorth from '@/Components/NetWorth';
import { Plus, Wallet } from 'lucide-react';

const page = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <main className="bg-base-200 min-h-screen w-full lg:w-[calc(100%-var(--nav-width))] lg:ml-(--nav-width) p-6 lg:p-12 transition-all duration-300">
            <Initializer rates />
            <section className="w-full lg:p-4 flex flex-col gap-4">
                <div className="flex justify-between">
                    <button
                        type="button"
                        className="btn btn-outline flex text-base gap-2 items-center justify-center p-3"
                        onClick={() => setIsModalOpen(true)}>
                        <Plus size={25} /> New
                    </button>
                </div>
                <div className="font-mono">
                    <NetWorth closable={false} editMode={true} />
                </div>

                <CustomModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Add Account"
                    Icon={Wallet}>
                    <AccountForm action={'create'} onSuccess={() => setIsModalOpen(false)} />
                </CustomModal>
            </section>
        </main>
    );
};

export default page;
