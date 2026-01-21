'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { recurringApi } from '@/lib/api/recurring';
import { RecurringTransaction } from '@/types';
import RecurringForm from '@/Components/RecurringForm';
import { Plus, Clock, Trash2, Edit2, AlertCircle, Wallet, ArrowRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 15 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
        },
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

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
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

    if (isLoading)
        return (
            <div className="p-10 flex justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );

    if (isError)
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center text-error gap-2">
                <AlertCircle size={32} />
                <p>Failed to load recurring rules.</p>
            </div>
        );

    const list = recurringTransactions?.data || [];

    return (
        <main className="bg-base-200 min-h-screen w-full lg:w-[calc(100%-var(--nav-width))] lg:ml-(--nav-width) p-6 lg:p-12 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                </div>

                {/* List */}
                <div className="w-full">
                    <AnimatePresence mode="wait">
                        {list.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-20 text-center bg-base-100 rounded-3xl border border-dashed border-base-content/20">
                                <div className="bg-base-200 p-4 rounded-full mb-4">
                                    <Clock className="w-8 h-8 text-base-content/40" />
                                </div>
                                <h3 className="text-lg font-bold text-base-content">
                                    No recurring rules yet
                                </h3>
                                <p className="text-base-content/60 max-w-sm mt-2 mb-6">
                                    Set up recurring bills or salary to have them automatically
                                    added to your transactions.
                                </p>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => {
                                        setEditingItem(null);
                                        setIsModalOpen(true);
                                    }}>
                                    Create your first rule
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {list.map((item: RecurringTransaction) => (
                                    <motion.div
                                        key={item._id}
                                        variants={item}
                                        layout
                                        onClick={() => handleEdit(item)}
                                        className="group relative bg-base-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-base-200 cursor-pointer overflow-hidden">
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
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={(e) => handleDelete(item._id, e)}
                                                    className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
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
            </div>
        </main>
    );
};

export default RecurringPage;
