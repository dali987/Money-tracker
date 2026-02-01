'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { recurringApi } from '@/lib/api/recurring';
import { RecurringTransaction } from '@/types';
import RecurringForm from '@/Components/transactions/RecurringForm';
import { Plus, Clock, Wallet, ArrowRight, MoreVertical } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import SelectDropdown from '@/Components/Custom/SelectDropdown';
import EmptyState from '@/Components/states/EmptyState';
import ErrorState from '@/Components/states/ErrorState';
import ThreeBlockSkeleton from '@/Components/states/ThreeBlockSkeleton';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' as const },
    },
};

const RecurringPage = () => {
    const queryClient = useQueryClient();
    const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        data: recurringTransactions,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['recurringTransactions'],
        queryFn: recurringApi.getAll,
    });

    const deleteMutation = useMutation({
        mutationFn: recurringApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
            toast.success('Recurring rule deleted');
        },
    });

    const handleEdit = (item: RecurringTransaction) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string, e?: React.MouseEvent | { stopPropagation: () => void }) => {
        e?.stopPropagation();
        if (confirm('Are you sure you want to delete this recurring rule?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleFormSuccess = () => {
        setEditingItem(null);
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
    };

    const handleFormClose = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const list = recurringTransactions?.data || [];

    return (
        <main className="bg-base-200 min-h-screen w-full lg:w-[calc(100%-var(--nav-width))] lg:ml-(--nav-width) p-6 lg:p-12 transition-all duration-300">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content flex items-center gap-2">
                            Recurring Transactions
                        </h1>
                        <p className="text-base-content/60 mt-1">
                            Manage your automated income and expenses.
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => {
                                setEditingItem(null);
                                setIsModalOpen(true);
                            }}
                            className="btn btn-primary gap-2 flex-1 sm:flex-none shadow-lg shadow-primary/20">
                            <Plus size={18} />
                            Add Rule
                        </button>
                    </div>
                </motion.div>

                {/* List */}
                <div className="w-full">
                    <AnimatePresence mode="wait">
                        {isError ? (
                            <motion.div
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                className="w-full">
                                <ErrorState message="Failed to load your recurring transactions." />
                            </motion.div>
                        ) : isLoading ? (
                            <ThreeBlockSkeleton />
                        ) : list.length === 0 ? (
                            <EmptyState
                                title="No recurring transactions found"
                                description="We couldn't find any recurring transactions created. Try adding a new transaction to get started."
                                icon={<Plus />}
                                action={{
                                    label: 'Add Rule',
                                    onClick: () => {
                                        setEditingItem(null);
                                        setIsModalOpen(true);
                                    },
                                }}
                            />
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {list.map((item: RecurringTransaction, index: number) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: 0.2 + index * 0.1,
                                            ease: 'easeOut',
                                        }}
                                        layout
                                        className="group relative bg-base-100 p-6 rounded-2xl shadow-sm hover:border-primary/20 hover:shadow-md border border-base-200 cursor-pointer overflow-hidden">
                                        {/* Status Indicator Bar */}
                                        <div
                                            className={`absolute top-0 left-0 w-1.5 h-full 
                                            ${
                                                item.type === 'income'
                                                    ? 'bg-success'
                                                    : item.type === 'expense'
                                                      ? 'bg-error'
                                                      : 'bg-info'
                                            }`}
                                        />

                                        <div className="flex justify-between items-start mb-3 ml-2">
                                            <span
                                                className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md
                                                 ${
                                                     item.type === 'income'
                                                         ? 'bg-success/10 text-success'
                                                         : item.type === 'expense'
                                                           ? 'bg-error/10 text-error'
                                                           : 'bg-info/10 text-info'
                                                 }`}>
                                                {item.type}
                                            </span>
                                            <SelectDropdown
                                                trigger={
                                                    <div className="btn btn-ghost btn-circle btn-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreVertical
                                                            size={18}
                                                            className="text-base-content/70"
                                                        />
                                                    </div>
                                                }
                                                showSelected={false}
                                                menuClassName="w-32"
                                                options={[
                                                    { label: 'Edit', value: 'edit' },
                                                    {
                                                        label: 'Delete',
                                                        value: 'delete',
                                                        className: 'text-error hover:bg-error/10',
                                                    },
                                                ]}
                                                onSelect={(val) => {
                                                    if (val === 'edit') handleEdit(item);
                                                    if (val === 'delete') handleDelete(item._id);
                                                }}
                                            />
                                        </div>

                                        <div className="ml-2 mb-4">
                                            <h3 className="font-bold text-lg text-base-content truncate pr-2">
                                                {item.description}
                                            </h3>
                                            <div
                                                className={`text-2xl font-black font-mono mt-1 ${
                                                    item.type === 'income'
                                                        ? 'text-success'
                                                        : item.type === 'expense'
                                                          ? 'text-error'
                                                          : 'text-info'
                                                }`}>
                                                {item.type === 'expense' ? '-' : '+'}
                                                {Number(item.amount).toLocaleString('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                })}
                                            </div>

                                            {/* Account Display */}
                                            <div className="flex items-center gap-1.5 mt-2 text-sm text-base-content/50 font-medium">
                                                <Wallet size={14} className="opacity-70" />
                                                {item.type === 'transfer' ? (
                                                    <div className="flex items-center gap-1 overflow-hidden">
                                                        <span className="truncate max-w-[80px]">
                                                            {typeof item.fromAccount === 'object'
                                                                ? item.fromAccount?.name
                                                                : 'Account'}
                                                        </span>
                                                        <ArrowRight
                                                            size={12}
                                                            className="shrink-0"
                                                        />
                                                        <span className="truncate max-w-[80px]">
                                                            {typeof item.toAccount === 'object'
                                                                ? item.toAccount?.name
                                                                : 'Account'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="truncate">
                                                        {item.type === 'income'
                                                            ? typeof item.toAccount === 'object'
                                                                ? item.toAccount?.name
                                                                : 'Account'
                                                            : typeof item.fromAccount === 'object'
                                                              ? item.fromAccount?.name
                                                              : 'Account'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="ml-2 pt-4 border-t border-base-200 flex justify-between items-center text-xs text-base-content/60">
                                            <div className="flex items-center gap-1.5 bg-base-200/50 px-2 py-1 rounded-lg">
                                                <Clock size={12} />
                                                <span className="capitalize font-medium">
                                                    {item.frequency}
                                                </span>
                                            </div>
                                            <span>
                                                Next:{' '}
                                                <span className="font-semibold text-base-content">
                                                    {new Date(
                                                        item.nextRunDate,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <RecurringForm
                    existingTransaction={editingItem}
                    isOpen={isModalOpen}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            </motion.div>
        </main>
    );
};

export default RecurringPage;
