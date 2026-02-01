'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle, CheckCircle, Wallet, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import SelectDropdown from '@/Components/Custom/SelectDropdown';
import NumberInput from '@/Components/Custom/NumberInput';
import CustomModal from '@/Components/Custom/CustomModal';
import ErrorState from '@/Components/states/ErrorState';
import EmptyState from '@/Components/states/EmptyState';
import ThreeBlockSkeleton from '@/Components/states/ThreeBlockSkeleton';
import { Budget, Transaction } from '@/types';

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

// Helper for currency if utility missing
const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

const BudgetPage = () => {
    const { budgets, getBudgets, createBudget, updateBudget, deleteBudget, isLoading, isError } =
        useBudgetStore();
    const { transactions } = useTransactionStore(); // Fetch all/monthly transactions
    const { authUser } = useAuthStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        tag: '',
        amount: '',
        alertThreshold: '80',
    });

    useEffect(() => {
        getBudgets();
    }, [getBudgets]);

    const budgetStats = useMemo(() => {
        return budgets.map((budget) => {
            const spent = transactions
                .filter((transaction: Transaction) => transaction.type === 'expense' && transaction.tags?.includes(budget.tag))
                .reduce((sum: number, transaction: Transaction) => sum + transaction.amount, 0);

            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const isOverBudget = spent > budget.amount;
            const isNearLimit = percentage >= (budget.alertThreshold || 80);

            return {
                ...budget,
                spent,
                percentage,
                isOverBudget,
                isNearLimit,
            };
        });
    }, [budgets, transactions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tag || !formData.amount) {
            toast.error('Please fill in all required fields');
            return;
        }

        const payload = {
            tag: formData.tag,
            amount: Number(formData.amount),
            alertThreshold: Number(formData.alertThreshold),
        };

        if (editId) {
            await updateBudget(editId, payload);
        } else {
            await createBudget(payload);
        }

        setIsModalOpen(false);
        setEditId(null);
        setFormData({ tag: '', amount: '', alertThreshold: '80' });
    };

    const handleEdit = (budget: Budget) => {
        setFormData({
            tag: budget.tag,
            amount: String(budget.amount),
            alertThreshold: String(budget.alertThreshold),
        });
        setEditId(budget._id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this budget?')) {
            await deleteBudget(id);
        }
    };

    const openCreateModal = () => {
        setFormData({ tag: '', amount: '', alertThreshold: '80' });
        setEditId(null);
        setIsModalOpen(true);
    };

    // Filter out tags that already have a budget (unless editing)
    const availableTags =
        authUser?.tags?.filter(
            (tag: string) => !budgets.some((b) => b.tag === tag && b._id !== editId),
        ) || [];

    return (
        <main className="bg-base-200 min-h-screen w-full lg:w-[calc(100%-var(--nav-width))] lg:ml-(--nav-width) p-6 lg:p-12 transition-all duration-300">
            <motion.div
                className="max-w-6xl mx-auto flex flex-col gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible">
                {/* Header */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content">Monthly Budgets</h1>
                        <p className="text-base-content/70 mt-1">
                            Track your spending by tag and stay on target.
                        </p>
                    </div>
                    <motion.button
                        onClick={openCreateModal}
                        className="btn btn-primary btn-sm md:btn-md gap-2 shadow-lg shadow-primary/20"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}>
                        <Plus size={18} />
                        Add Budget
                    </motion.button>
                </motion.div>

                {/* Content */}
                {isError ? (
                    <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full">
                        <ErrorState
                            message="Failed to load your budgets."
                            onRetry={() => getBudgets()}
                        />
                    </motion.div>
                ) : isLoading ? (
                    <ThreeBlockSkeleton />
                ) : budgets.length === 0 ? (
                    // <BudgetEmpty variant={itemVariants} openModal={openCreateModal} />
                    <EmptyState
                        title="No budgets found"
                        description="We couldn't find any budgets created. Try adding a new budget to get started."
                        icon={<Plus />}
                        action={{ label: 'Add Budget', onClick: openCreateModal }}
                    />
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {budgetStats.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.2 + index * 0.1,
                                        ease: 'easeOut',
                                    }}
                                    className="bg-base-100 border border-base-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group cursor-pointer hover:border-primary/20">
                                    {/* Background Progress Gradient (Subtle) */}
                                    <div
                                        className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${
                                            item.isOverBudget
                                                ? 'bg-error'
                                                : item.isNearLimit
                                                  ? 'bg-warning'
                                                  : 'bg-success'
                                        }`}
                                        style={{ width: `${item.percentage}%` }}
                                    />

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-1">
                                                Tag
                                            </span>
                                            <div className="badge badge-lg badge-outline gap-2 font-medium">
                                                <div
                                                    className={`w-2 h-2 rounded-full ${
                                                        item.isOverBudget
                                                            ? 'bg-error'
                                                            : 'bg-primary'
                                                    }`}
                                                />
                                                {item.tag}
                                            </div>
                                        </div>
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

                                    <div className="flex flex-col gap-1 mb-6">
                                        <span className="text-3xl font-bold font-mono">
                                            {formatMoney(item.spent)}
                                        </span>
                                        <span className="text-sm text-base-content/60 flex justify-between">
                                            <span>of {formatMoney(item.amount)} limit</span>
                                            <span
                                                className={`${
                                                    item.isOverBudget ? 'text-error font-bold' : ''
                                                }`}>
                                                {Math.round(item.percentage)}%
                                            </span>
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-base-200 rounded-full h-3 mb-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.percentage}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className={`h-full rounded-full ${
                                                item.isOverBudget
                                                    ? 'bg-error'
                                                    : item.isNearLimit
                                                      ? 'bg-warning'
                                                      : 'bg-primary'
                                            }`}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 text-xs">
                                        {item.isOverBudget ? (
                                            <span className="text-error flex items-center gap-1 font-medium">
                                                <AlertCircle size={14} /> Over Budget
                                            </span>
                                        ) : item.isNearLimit ? (
                                            <span className="text-warning flex items-center gap-1 font-medium">
                                                <AlertCircle size={14} /> Near Limit (
                                                {item.alertThreshold}%)
                                            </span>
                                        ) : (
                                            <span className="text-success flex items-center gap-1 font-medium">
                                                <CheckCircle size={14} /> On Track
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </motion.div>

            {/* Modal */}
            <CustomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editId ? 'Edit Budget' : 'New Budget'}
                Icon={Wallet}>
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Tag Category</span>
                        </label>
                        {editId ? (
                            <input
                                type="text"
                                value={formData.tag}
                                disabled
                                className="input input-bordered w-full bg-base-200"
                            />
                        ) : (
                            <SelectDropdown
                                options={availableTags.map((tag: string) => ({
                                    label: tag,
                                    value: tag,
                                }))}
                                placeholder="Select a tag"
                                defaultValue={formData.tag || undefined}
                                onSelect={(value) => setFormData({ ...formData, tag: value })}
                                className="w-full"
                            />
                        )}
                        <label className="label">
                            <span className="label-text-alt text-base-content/60">
                                {editId
                                    ? 'Tag cannot be changed'
                                    : 'Budgets are linked to transaction tags'}
                            </span>
                        </label>
                    </div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Monthly Limit ($)</span>
                        </label>
                        <NumberInput
                            className="w-full"
                            placeholder="0.00"
                            value={Number(formData.amount) || 0}
                            onChange={(value) =>
                                setFormData({ ...formData, amount: String(value) })
                            }
                            min={0}
                            step={1}
                        />
                    </div>

                    <div className="form-control w-full flex items-center gap-2">
                        <label className="label">
                            <span className="label-text">Alert Threshold (%)</span>
                            <span className="label-text-alt font-mono tabular-nums min-w-[3ch] text-right">
                                {formData.alertThreshold}%
                            </span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={formData.alertThreshold}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    alertThreshold: e.target.value,
                                })
                            }
                            className="range range-xs range-primary"
                        />
                    </div>

                    <div className="modal-action mt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn btn-ghost">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary px-8">
                            Save
                        </button>
                    </div>
                </form>
            </CustomModal>
        </main>
    );
};

export default BudgetPage;

