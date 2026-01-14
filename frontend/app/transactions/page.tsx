'use client';

import Initializer from '@/Components/Initializer';
import MultiSelectDropdown from '@/Components/Custom/MultiSelectDropdown';
import SelectAccountDropdown from '@/Components/Custom/SelectAccountDropdown';
import SelectDropdown from '@/Components/Custom/SelectDateRangeDropdown';
import TransactionForm from '@/Components/TransactionForm';
import TransactionsList from '@/Components/TransactionsList';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Plus, File, Filter, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedNumber from '@/Components/AnimatedNumber';
import React, { useEffect } from 'react';
import { useCallback, useMemo } from 'react';
import { useAccounts } from '@/hooks/useAccounts';

const fields = ['expense', 'transfer', 'income'];

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
};

const page = () => {
    const getTransactionsWithFilter = useTransactionStore(
        (state) => state.getTransactionsWithFilter
    );
    const getTransactionsSummary = useTransactionStore((state) => state.getTransactionsSummary);
    const authUser = useAuthStore((state) => state.authUser);
    const [summary, setSummary] = React.useState({
        Expense: 0,
        Income: 0,
        netWorth: 0,
    });
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

    const [tempFilters, setTempFilters] = React.useState({
        account: '',
        tags: '',
    });

    const { data: accountsRaw = [], isLoading: isAccountsLoading } = useAccounts();

    const accounts = accountsRaw || [];

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
        },
        []
    );

    const createFormSubmit = useCallback(async () => {
        (document.getElementById('edit-transaction-modal') as HTMLDialogElement)?.close();
        const filters: any = { ...currentFilters };
        if (selectedRange.label !== 'All time' && selectedRange.start && selectedRange.end) {
            filters.startDate = selectedRange.start;
            filters.endDate = selectedRange.end;
        }
        await getTransactionsWithFilter(filters);
    }, [getTransactionsWithFilter, selectedRange, currentFilters]);

    const handleOptions = (accounts: Array<any>) => {
        if (!accounts) return [];
        return accounts.map((account) => ({
            name: account.name,
            type: account.type,
            id: account._id,
        }));
    };

    useEffect(() => {
        const fetchTransactions = async () => {
            const filters: any = { ...currentFilters };
            if (selectedRange.label !== 'All time' && selectedRange.start && selectedRange.end) {
                filters.startDate = selectedRange.start;
                filters.endDate = selectedRange.end;
            }
            await getTransactionsWithFilter(filters);
            const sum = await getTransactionsSummary(filters);
            setSummary(sum);
        };
        fetchTransactions();
    }, [getTransactionsSummary, getTransactionsWithFilter, currentFilters, selectedRange]);

    useEffect(() => {
        setTempFilters(currentFilters);
    }, [currentFilters]);

    const options = useMemo(() => handleOptions(accounts), [accounts, handleOptions]);

    const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const account = formData.get('account') as string;
        const tags = formData.get('tags') as string;

        const newFilters = {
            account: account || '',
            tags: tags || '',
        };

        setCurrentFilters(newFilters);
        (document.getElementById('filter') as HTMLDialogElement)?.close();
    }, []);

    return (
        <main className="bg-white lg:bg-gray-200 flex justify-center items-start lg:items-center min-h-screen w-full lg:w-[calc(100%-var(--nav-width))] lg:ml-(--nav-width) p-3 lg:p-16">
            <Initializer />
            <section className="w-full lg:bg-white lg:rounded-lg lg:shadow-2xl lg:max-w-5xl lg:p-4 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 justify-between">
                    <button
                        type="button"
                        className="btn btn-outline flex text-base gap-2 items-center justify-center p-3"
                        onClick={() =>
                            ((
                                document.getElementById('new-modal-toggle') as HTMLInputElement
                            ).checked = true)
                        }>
                        <Plus size={25} /> New
                    </button>
                    <input type="checkbox" id="new-modal-toggle" className="modal-toggle" />
                    <div role="dialoge" id="add" className="modal">
                        <div className="modal-box max-w-150 min-h-80 transition-all overflow-visible">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg flex gap-2 py-4">
                                    <File /> Add Transaction
                                </h3>{' '}
                                <form method="dialog">
                                    <button
                                        className="btn p-3.5 text-lg font-black bg-red-600/70 text-white hover:bg-red-600"
                                        onClick={() =>
                                            ((
                                                document.getElementById(
                                                    'new-modal-toggle'
                                                ) as HTMLInputElement
                                            ).checked = false)
                                        }>
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
                    </div>
                    <div className="join">
                        <SelectDropdown className="join-item" onRangeChange={handleRangeChange} />
                        <button
                            className="btn btn-outline rounded-box rounded-l-none text-base join-item p-3"
                            onClick={() => {
                                setTempFilters(currentFilters);
                                (
                                    document.getElementById('filter') as HTMLDialogElement
                                )?.showModal();
                            }}>
                            <Filter />
                        </button>
                        <dialog id="filter" className="modal">
                            <div className="modal-box max-w-150 min-h-90 transition-all overflow-visible">
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
                                <form onSubmit={(e) => handleFormSubmit(e)} id="filterForm">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="label text-base text-base-content">
                                                Account
                                            </label>
                                            <SelectAccountDropdown
                                                name="account"
                                                className="w-full"
                                                options={options}
                                                defaultValue={false}
                                                selectedId={tempFilters.account}
                                                onSelect={(option: any) =>
                                                    setTempFilters({
                                                        ...tempFilters,
                                                        account: option.id,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="label text-base text-base-content">
                                                Tags
                                            </label>
                                            <MultiSelectDropdown
                                                formFieldName="tags"
                                                options={
                                                    authUser?.tags?.map((tag: string) => ({
                                                        label: tag,
                                                        value: tag,
                                                    })) || []
                                                }
                                                selected={
                                                    tempFilters.tags
                                                        ? tempFilters.tags.split(',')
                                                        : []
                                                }
                                                onSelect={(tags: string[]) =>
                                                    setTempFilters({
                                                        ...tempFilters,
                                                        tags: tags.join(','),
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="modal-action justify-end">
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-error rounded"
                                                onClick={() => {
                                                    setTempFilters({ account: '', tags: '' });
                                                    
                                                }}>
                                                Reset
                                            </button>
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
                <AnimatePresence>
                    {summary && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="mt-6">
                            <div className="stats stats-vertical lg:stats-horizontal shadow-xl bg-base-100 border border-base-200 w-full overflow-hidden rounded-2xl">
                                <motion.div
                                    variants={itemVariants}
                                    className="stat place-items-center py-6">
                                    <div className="stat-title font-medium">Total Income</div>
                                    <div className="stat-value text-success text-3xl font-bold">
                                        +<AnimatedNumber value={summary.Income} />{' '}
                                        <span className="text-sm font-normal opacity-70">
                                            {authUser?.currency}
                                        </span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    className="stat place-items-center border-l border-base-200 py-6">
                                    <div className="stat-title font-medium">Total Expense</div>
                                    <div className="stat-value text-error text-3xl font-bold">
                                        -<AnimatedNumber value={summary.Expense} />{' '}
                                        <span className="text-sm font-normal opacity-70">
                                            {authUser?.currency}
                                        </span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    className="stat place-items-center border-l border-base-200 py-6">
                                    <div className="stat-title font-medium">Net Balance</div>
                                    <div
                                        className={`stat-value text-3xl font-bold ${
                                            summary.netWorth >= 0 ? 'text-success' : 'text-error'
                                        }`}>
                                        {summary.netWorth >= 0 ? '+' : ''}
                                        <AnimatedNumber value={summary.netWorth} />{' '}
                                        <span className="text-sm font-normal opacity-70">
                                            {authUser?.currency}
                                        </span>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </main>
    );
};

export default page;
