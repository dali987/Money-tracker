'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import SelectDropdown from '@/Components/Custom/SelectDropdown';
import NumberInput from '@/Components/Custom/NumberInput';
import CustomModal from '@/Components/Custom/CustomModal';

// Helper for currency if utility missing
const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

import ErrorState from '@/Components/ErrorState';

const BudgetPage = () => {
    const { budgets, getBudgets, createBudget, updateBudget, deleteBudget, isLoading, isError } =
        useBudgetStore();
    const { transactions, getTransactionsWithFilter } = useTransactionStore(); // Fetch all/monthly transactions
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
        // Fetch current month's transactions to be accurate?
        // Or just rely on what's in store if it loads default.
        // Better to ensure we have data.
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        getTransactionsWithFilter({
            startDate: startOfMonth,
            endDate: endOfMonth,
        });
    }, [getBudgets, getTransactionsWithFilter]);

    const budgetStats = useMemo(() => {
        return budgets.map((budget) => {
            const spent = transactions
                .filter((t: any) => t.type === 'expense' && t.tags?.includes(budget.tag))
                .reduce((sum: number, t: any) => sum + t.amount, 0);

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

    const handleEdit = (budget: any) => {
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

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, delayChildren: 1, ease: 'easeOut' as const },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, ease: 'easeOut' as const },
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            transition: { duration: 0.3 },
        },
    };

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
                        <h1 className="text-3xl font-bold text-base-content">
                            Monthly Budgets
                        </h1>
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
                    <motion.div variants={itemVariants} className="w-full">
                        <ErrorState
                            message="Failed to load your budgets."
                            onRetry={() => getBudgets()}
                        />
                    </motion.div>
                ) : isLoading ? (
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                className="skeleton h-56 rounded-2xl w-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                            />
                        ))}
                    </motion.div>
                ) : budgets.length === 0 ? (
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col items-center justify-center py-20 bg-base-100 rounded-3xl shadow-sm border border-base-200">
                        <motion.div
                            className="bg-base-200 p-4 rounded-full mb-4"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}>
                            <Plus size={32} className="text-primary" />
                        </motion.div>
                        <h3 className="text-xl font-semibold">No budgets yet</h3>
                        <p className="text-base-content/60 mt-2 text-center max-w-md">
                            Create a budget for a tag to start tracking your expenses and save more
                            money.
                        </p>
                        <motion.button
                            onClick={openCreateModal}
                            className="btn btn-outline btn-primary mt-6"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}>
                            Create your first budget
                        </motion.button>
                    </motion.div>
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
                                        delay: index * 0.1,
                                        ease: 'easeOut',
                                    }}
                                    whileHover={{
                                        y: -4,
                                        boxShadow: '0 10px 40px -15px rgba(0,0,0,0.3)',
                                    }}
                                    className="bg-base-100 border border-base-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group cursor-default">
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
                                        <div className="dropdown dropdown-end">
                                            <div
                                                tabIndex={0}
                                                role="button"
                                                className="btn btn-ghost btn-circle btn-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Edit2 size={16} />
                                            </div>
                                            <ul
                                                tabIndex={0}
                                                className="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-32 border border-base-200">
                                                <li>
                                                    <a onClick={() => handleEdit(item)}>Edit</a>
                                                </li>
                                                <li>
                                                    <a
                                                        onClick={() => handleDelete(item._id)}
                                                        className="text-error">
                                                        Delete
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
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
