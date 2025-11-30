'use client';

import Initializer from '@/Components/Initializer';
import SelectDropdown from '@/Components/SelectDateRangeDropdown';
import TransactionForm from '@/Components/TransactionForm';
import TransactionsList from '@/Components/TransactionsList';
import { useTransactionStore } from '@/store/useTransactionAuth';
import { Plus, File, Filter } from 'lucide-react';
import React from 'react';
import { useCallback } from 'react';

const fields = ['expense', 'transfer', 'income'];

const page = () => {
    const { getTransactions, getTransactionsWithDate, createTransaction } = useTransactionStore();
    const [selectedRange, setSelectedRange] = React.useState<{
        start: string | null;
        end: string | null;
        label: string;
    }>({
        start: null,
        end: null,
        label: 'All time',
    });

    const handleRangeChange = useCallback(
        async ({
            start,
            end,
            label,
        }: {
            start: string | null;
            end: string | null;
            label: string;
        }) => {
            setSelectedRange({ start, end, label });
            if (label === 'All time' || !start || !end) {
                await getTransactions();
            } else {
                await getTransactionsWithDate({ start, end });
            }
        },
        [getTransactions, getTransactionsWithDate]
    );

    const createFormSubmit = useCallback(async () => {
        (document.getElementById('edit') as HTMLDialogElement)?.close();
        if (selectedRange.label === 'All time' || !selectedRange.start || !selectedRange.end) {
            await getTransactions();
        } else {
            await getTransactionsWithDate({ start: selectedRange.start, end: selectedRange.end });
        }
    }, [getTransactions, getTransactionsWithDate, selectedRange]);

    return (
        <main className="bg-white lg:bg-gray-200 flex justify-center items-center min-h-screen w-[calc(100%-var(--nav-width))] ml-(--nav-width)">
            <Initializer transactions accounts />
            <section className="w-full lg:bg-white lg:rounded-lg lg:shadow-2xl lg:w-5xl p-4 flex flex-col gap-4">
                <div className="flex justify-between">
                    <button
                        type="button"
                        className="btn btn-outline flex text-base gap-2 items-center justify-center p-3"
                        onClick={() =>
                            (document.getElementById('edit') as HTMLDialogElement)?.showModal()
                        }>
                        <Plus size={25} /> New
                    </button>
                    <dialog id="edit" className="modal">
                        <div className="modal-box max-w-150 min-h-80 transition-all">
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
                            <div className="tabs tabs-lift">
                                {fields.map((type: string, i: number) => (
                                    <React.Fragment key={type}>
                                        <input
                                            type="radio"
                                            name="edit-tabs"
                                            style={{
                                                //@ts-ignore
                                                '--color-base-content':
                                                    type === 'expense'
                                                        ? '#fb2c36'
                                                        : type === 'income'
                                                        ? 'oklch(72.3% 0.219 149.579)'
                                                        : '',
                                            }}
                                            className="tab grow font-bold"
                                            aria-label={type}
                                            defaultChecked
                                        />
                                        <div className="tab-content bg-gray-50 border-gray-300 p-6">
                                            <TransactionForm
                                                type={type as 'expense' | 'income' | 'transfer'}
                                                action="create"
                                                onSuccess={createFormSubmit}
                                            />
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </dialog>
                    <div className="join">
                        <SelectDropdown onRangeChange={handleRangeChange} />
                        <button className="btn btn-outline text-base join-item p-3"><Filter /></button>
                    </div>
                </div>
                <div className="font-mono">
                    <TransactionsList />
                </div>
            </section>
        </main>
    );
};

export default page;
