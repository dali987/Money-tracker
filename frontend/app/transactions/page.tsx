'use client';

import Initializer from '@/Components/Initializer';
import MultiSelectDropdown from '@/Components/MultiSelectDropdown';
import SelectAccountDropdown from '@/Components/SelectAccountDropdown';
import SelectDropdown from '@/Components/SelectDateRangeDropdown';
import TransactionForm from '@/Components/TransactionForm';
import TransactionsList from '@/Components/TransactionsList';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Plus, File, Filter, ListFilter } from 'lucide-react';
import React, { useEffect } from 'react';
import { useCallback } from 'react';

const fields = ['expense', 'transfer', 'income'];

const page = () => {
    const { getTransactionsWithFilter, accounts, transactions } = useTransactionStore();
    const { authUser } = useAuthStore();
    const [selectedRange, setSelectedRange] = React.useState<{
        start: string | null;
        end: string | null;
        label: string;
    }>({
        start: null,
        end: null,
        label: 'All time',
    });

    const [currentFilters, setCurrentFilters] = React.useState({
        account: '',
        tags: '',
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

            const filters: any = { ...currentFilters };
            if (label !== 'All time' && start && end) {
                filters.startDate = start;
                filters.endDate = end;
            }
            await getTransactionsWithFilter(filters);
        },
        [getTransactionsWithFilter, currentFilters]
    );

    const createFormSubmit = useCallback(async () => {
        (document.getElementById('edit') as HTMLDialogElement)?.close();
        const filters: any = { ...currentFilters };
        if (selectedRange.label !== 'All time' && selectedRange.start && selectedRange.end) {
            filters.startDate = selectedRange.start;
            filters.endDate = selectedRange.end;
        }
        await getTransactionsWithFilter(filters);
    }, [getTransactionsWithFilter, selectedRange, currentFilters]);

    const handleOptions = (accounts: Array<any>) => {
        if (!accounts) return [];
        const newAccounts = accounts.map((account) => ({
            name: account.name,
            type: account.type,
            id: account._id,
        }));
        return newAccounts;
    };

    const options = handleOptions(accounts);

    const handleFormSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);

            const account = formData.get('account') as string;
            const tags = formData.getAll('tags').join(',');

            const newFilters = {
                account: account || '',
                tags: tags || '',
            };

            setCurrentFilters(newFilters);

            const filtersToSend: any = { ...newFilters };
            if (selectedRange.label !== 'All time' && selectedRange.start && selectedRange.end) {
                filtersToSend.startDate = selectedRange.start;
                filtersToSend.endDate = selectedRange.end;
            }

            await getTransactionsWithFilter(filtersToSend);
            (document.getElementById('filter') as HTMLDialogElement)?.close();
        },
        [getTransactionsWithFilter, selectedRange]
    );

    return (
        <main className="bg-white lg:bg-gray-200 flex justify-center items-center min-h-screen w-[calc(100%-var(--nav-width))] ml-(--nav-width) p-16">
            <Initializer transactions accounts />
            <section className="w-full lg:bg-white lg:rounded-lg lg:shadow-2xl lg:w-5xl p-4 flex flex-col gap-4">
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
                        <button
                            className="btn btn-outline text-base join-item p-3"
                            onClick={() =>
                                (
                                    document.getElementById('filter') as HTMLDialogElement
                                )?.showModal()
                            }>
                            <Filter />
                        </button>
                        <dialog id="filter" className="modal">
                            <div className="modal-box max-w-150 min-h-90 transition-all">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-lg flex gap-4 py-4 px-2">
                                        <ListFilter /> Filter
                                    </h3>{' '}
                                    <form method="dialog">
                                        <button className="btn p-3.5 text-lg font-black bg-red-600/70 text-white hover:bg-red-600">
                                            X
                                        </button>
                                    </form>
                                </div>
                                <form onSubmit={(e) => handleFormSubmit(e)} id="filter">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="label text-base text-base-content">
                                                Account
                                            </label>
                                            <SelectAccountDropdown
                                                name="account"
                                                className="w-full"
                                                options={options}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="label text-base text-base-content">
                                                End Date
                                            </label>
                                            <MultiSelectDropdown
                                                formFieldName="tags"
                                                options={authUser?.tags ? authUser.tags : []}
                                            />
                                        </div>
                                        <div className="modal-action justify-end">
                                            <button
                                                type="submit"
                                                className="btn btn-outline btn-success rounded">
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </dialog>
                    </div>
                </div>
                <div className="font-mono">
                    <TransactionsList maxCount={-1} />
                </div>

                {/* Totals Footer */}
                <div className="mt-4">
                    <div className="stats shadow bg-base-100 border border-base-200 w-full">
                        {(() => {
                            const income = transactions
                                .filter((t: any) => t.type === 'income')
                                .reduce((acc: number, curr: any) => acc + curr.amount, 0);
                            const expense = transactions
                                .filter((t: any) => t.type === 'expense')
                                .reduce((acc: number, curr: any) => acc + curr.amount, 0);
                            const net = income - expense;

                            return (
                                <React.Fragment>
                                    <div className="stat place-items-center">
                                        <div className="stat-title">Total Income</div>
                                        <div className="stat-value text-success text-2xl">
                                            +{income.toFixed(2)} {authUser?.currency}
                                        </div>
                                    </div>

                                    <div className="stat place-items-center">
                                        <div className="stat-title">Total Expense</div>
                                        <div className="stat-value text-error text-2xl">
                                            -{expense.toFixed(2)} {authUser?.currency}
                                        </div>
                                    </div>

                                    <div className="stat place-items-center">
                                        <div className="stat-title">Net Balance</div>
                                        <div
                                            className={`stat-value text-2xl ${
                                                net >= 0 ? 'text-success' : 'text-error'
                                            }`}>
                                            {net >= 0 ? '+' : ''}
                                            {net.toFixed(2)} {authUser?.currency}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })()}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default page;
