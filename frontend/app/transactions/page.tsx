'use client';

import Initializer from '@/Components/providers/Initializer';
import MultiSelectDropdown from '@/Components/Custom/MultiSelectDropdown';
import SelectAccountDropdown, {
    AccountDropdownOption,
} from '@/Components/Custom/SelectAccountDropdown';
import SelectDropdown from '@/Components/Custom/SelectDateRangeDropdown';
import TransactionForm from '@/Components/transactions/TransactionForm';
import TransactionsList from '@/Components/transactions/TransactionsList';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Plus, FilePlusCorner, Filter, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import AnimatedNumber from '@/Components/ui/AnimatedNumber';
import React, { useEffect, useState } from 'react';
import { useCallback, useMemo } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import CustomModal from '@/Components/Custom/CustomModal';
import { Account, TransactionFilter } from '@/types';

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

const TransactionsPage = () => {
    const getTransactionsSummary = useTransactionStore((state) => state.getTransactionsSummary);
    const authUser = useAuthStore((state) => state.authUser);
    const [summary, setSummary] = useState({
        totalExpense: 0,
        totalIncome: 0,
        netBalance: 0,
    });
    const [selectedRange, setSelectedRange] = useState<{
        start: string | null;
        end: string | null;
        label: string;
    }>({
        start: null,
        end: null,
        label: 'All time',
    });

    const [currentFilters, setCurrentFilters] = useState({
        account: '',
        tags: '',
    });

    const [tempFilters, setTempFilters] = useState({
        account: '',
        tags: '',
    });

    // Modal states
    const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const { data: accounts } = useAccounts();
    const queryClient = useQueryClient();

    const handleRangeChange = useCallback(
        ({ start, end, label }: { start: string | null; end: string | null; label: string }) => {
            setSelectedRange({ start, end, label });
        },
        [],
    );

    const activeFilters = useMemo(() => {
        const filters: TransactionFilter = { ...currentFilters };
        if (selectedRange.label !== 'All time' && selectedRange.start && selectedRange.end) {
            filters.startDate = new Date(selectedRange.start);
            filters.endDate = new Date(selectedRange.end);
        }
        return filters;
    }, [currentFilters, selectedRange]);

    const updateSummary = useCallback(async () => {
        if (!authUser) return;
        const sum = await getTransactionsSummary(activeFilters);
        if (sum) {
            setSummary({
                totalExpense: sum.totalExpense ?? 0,
                totalIncome: sum.totalIncome ?? 0,
                netBalance: sum.netBalance ?? 0,
            });
        }
    }, [getTransactionsSummary, activeFilters, authUser]);

    const createFormSubmit = useCallback(async () => {
        setIsNewTransactionModalOpen(false);
        await queryClient.invalidateQueries({ queryKey: ['transactions'] });
        await queryClient.invalidateQueries({ queryKey: ['accounts'] });
        await updateSummary();
    }, [queryClient, updateSummary]);

    const handleOptions = (accounts: Account[]) => {
        return accounts.map((account) => ({
            name: account.name,
            type: account.group,
            id: account._id,
        }));
    };

    useEffect(() => {
        updateSummary();
    }, [updateSummary]);

    useEffect(() => {
        setTempFilters(currentFilters);
    }, [currentFilters]);

    const options = useMemo(() => accounts && handleOptions(accounts), [accounts]);

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
        setIsFilterModalOpen(false);
    }, []);

    return (
        <main className="bg-base-200 min-h-screen w-full lg:w-[calc(100%-var(--nav-width))] lg:ml-(--nav-width) p-6 lg:p-12 transition-all duration-300">
            <Initializer />
            <section className="w-full lg:p-4 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 justify-between">
                    <button
                        type="button"
                        className="btn btn-outline flex text-base gap-2 items-center justify-center p-3"
                        onClick={() => setIsNewTransactionModalOpen(true)}>
                        <Plus size={25} /> New
                    </button>

                    <CustomModal
                        isOpen={isNewTransactionModalOpen}
                        onClose={() => setIsNewTransactionModalOpen(false)}
                        title="Add Transaction"
                        Icon={FilePlusCorner}>
                        <div className="tabs tabs-lift p-6">
                            {fields.map((type: string, i: number) => (
                                <React.Fragment key={type}>
                                    <input
                                        type="radio"
                                        name="edit-tabs"
                                        style={
                                            {
                                                '--color-base-content':
                                                    type === 'expense'
                                                        ? '#fb2c36'
                                                        : type === 'income'
                                                          ? 'oklch(72.3% 0.219 149.579)'
                                                          : '',
                                            } as React.CSSProperties
                                        }
                                        className="tab grow font-bold transition-all duration-300"
                                        aria-label={type}
                                        defaultChecked={i == 0}
                                    />
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <TransactionForm
                                            type={type as 'expense' | 'income' | 'transfer'}
                                            action="create"
                                            onSuccess={createFormSubmit}
                                        />
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </CustomModal>

                    <div className="join">
                        <SelectDropdown className="join-item" onRangeChange={handleRangeChange} />
                        <button
                            className="btn btn-outline rounded-box rounded-l-none text-base join-item p-3"
                            onClick={() => {
                                setTempFilters(currentFilters);
                                setIsFilterModalOpen(true);
                            }}>
                            <Filter />
                        </button>
                    </div>
                </div>

                <CustomModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    title="Filter"
                    Icon={ListFilter}>
                    <form onSubmit={(e) => handleFormSubmit(e)} id="filterForm">
                        <div className="flex flex-col gap-4 p-6">
                            <div className="flex flex-col gap-2">
                                <label className="label text-base text-base-content">Account</label>
                                <SelectAccountDropdown
                                    name="account"
                                    className="w-full"
                                    options={options || []}
                                    defaultValue={false}
                                    selectedId={tempFilters.account}
                                    onSelect={(option: AccountDropdownOption) =>
                                        setTempFilters({
                                            ...tempFilters,
                                            account: option.id,
                                        })
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="label text-base text-base-content">Tags</label>
                                <MultiSelectDropdown
                                    formFieldName="tags"
                                    options={
                                        authUser?.tags?.map((tag: string) => ({
                                            label: tag,
                                            value: tag,
                                        })) || []
                                    }
                                    selected={tempFilters.tags ? tempFilters.tags.split(',') : []}
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
                </CustomModal>

                <div className="font-mono">
                    <TransactionsList
                        maxCount={-1}
                        filters={activeFilters}
                        onAddClick={() => setIsNewTransactionModalOpen(true)}
                    />
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
                                        +<AnimatedNumber value={summary.totalIncome} />{' '}
                                        <span className="text-sm font-normal opacity-70">
                                            {authUser?.baseCurrency}
                                        </span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    className="stat place-items-center border-l border-base-200 py-6">
                                    <div className="stat-title font-medium">Total Expense</div>
                                    <div className="stat-value text-error text-3xl font-bold">
                                        -<AnimatedNumber value={summary.totalExpense} />{' '}
                                        <span className="text-sm font-normal opacity-70">
                                            {authUser?.baseCurrency}
                                        </span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    className="stat place-items-center border-l border-base-200 py-6">
                                    <div className="stat-title font-medium">Net Balance</div>
                                    <div
                                        className={`stat-value text-3xl font-bold ${
                                            summary.netBalance >= 0 ? 'text-success' : 'text-error'
                                        }`}>
                                        {summary.netBalance >= 0 ? '+' : ''}
                                        <AnimatedNumber value={summary.netBalance} />{' '}
                                        <span className="text-sm font-normal opacity-70">
                                            {authUser?.baseCurrency}
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

export default TransactionsPage;
