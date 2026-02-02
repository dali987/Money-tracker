'use client';

import DateSelect from '@/Components/Custom/DateSelect';
import MultiSelectDropdown from '@/Components/Custom/MultiSelectDropdown';
import RecurringFrequencySelect from '@/Components/Custom/RecurringFrequencySelect';
import MoneyExchangeInput from '@/Components/Custom/MoneyExchangeInput';
import { recurringApi } from '@/lib/api/recurring';
import { transactionSchema } from '@/lib/validations';
import { useState, useMemo } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { formatISO } from 'date-fns';
import { motion, Variants } from 'motion/react';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useQueryClient } from '@tanstack/react-query';
import { Account, Transaction, RecurringTransaction } from '@/types';
import { useAccountStore } from '@/store/useAccountStore';
import { AccountDropdownOption } from '../Custom/SelectAccountDropdown';

const formContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const formItem: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

interface TransactionFormProps {
    type: 'expense' | 'transfer' | 'income';
    action?: 'create' | { type: 'edit'; id: string };
    onSuccess?: () => void;
    isRecurring?: boolean;
    initialData?: Transaction | RecurringTransaction | null;
}

interface KeepFormData {
    note: string;
    tags: string[];
    toAccount: AccountDropdownOption | null;
    fromAccount: AccountDropdownOption | null;
}

const TransactionForm = ({
    type,
    action = 'create',
    onSuccess,
    isRecurring = false,
    initialData,
}: TransactionFormProps) => {
    const { createTransaction, updateTransaction } = useTransactionStore();
    const { getAccounts } = useAccountStore();
    const queryClient = useQueryClient();
    const { authUser, isCheckingAuth } = useAuthStore();
    const { data: accounts = [] } = useAccounts();
    const { data: transactions = [] } = useTransactions({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const transaction = useMemo(() => {
        if (initialData) return initialData;
        if (typeof action !== 'string' && action.type === 'edit') {
            return transactions.find((t) => t._id === action.id);
        }
        return null;
    }, [initialData, action, transactions]);

    const [keepFormData, setKeepFormData] = useState<KeepFormData>({
        note: transaction?.note || '',
        tags: transaction?.tags || [],
        toAccount: null,
        fromAccount: null,
    });

    const handleOptions = useMemo(() => {
        return (accounts || []).map((acc) => ({
            name: acc.name,
            type: acc.group,
            id: acc._id,
        }));
    }, [accounts]);

    const getSelectedId = (accField: string | Account | undefined | null) => {
        if (!accField) {
            // Check other potential identity fields if accField is missing
            if (transaction) {
                if ('accountId' in transaction && transaction.accountId) return transaction.accountId;
                if ('fromAccount' in transaction && transaction.fromAccount) {
                    return typeof transaction.fromAccount === 'object'
                        ? transaction.fromAccount._id
                        : transaction.fromAccount;
                }
                if ('toAccount' in transaction && transaction.toAccount) {
                    return typeof transaction.toAccount === 'object'
                        ? transaction.toAccount._id
                        : transaction.toAccount;
                }
            }
            return '';
        }
        return typeof accField === 'object' ? accField._id : accField;
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        try {
            const dateStr = String(formData.get('date'));
            let date = '';

            if (dateStr && dateStr !== 'Pick a date') {
                const [year, month, day] = dateStr.split('-').map(Number);
                const now = new Date();
                date = formatISO(
                    new Date(
                        year,
                        month - 1,
                        day,
                        now.getHours(),
                        now.getMinutes(),
                        now.getSeconds(),
                    ),
                );
            }

            const rawValues = {
                type,
                toAccount: formData.get('toAccount'),
                fromAccount: formData.get('fromAccount'),
                amount: Number(formData.get('amount')),
                tags: keepFormData.tags,
                note: keepFormData.note,
                date: date,
            };

            if (isRecurring) {
                const recurringPayload: Partial<RecurringTransaction> = {
                    type,
                    amount: rawValues.amount,
                    description: rawValues.note,
                    tags: rawValues.tags,
                    frequency: formData.get('frequency') as 'daily' | 'weekly' | 'monthly' | 'yearly',
                    startDate: rawValues.date
                        ? new Date(rawValues.date).toISOString()
                        : new Date().toISOString(),
                    active: true,
                    toAccount: ['income', 'transfer'].includes(type)
                        ? (rawValues.toAccount as string)
                        : undefined,
                    fromAccount: ['expense', 'transfer'].includes(type)
                        ? (rawValues.fromAccount as string)
                        : undefined,
                };

                if (typeof action !== 'string' && action.type === 'edit') {
                    await recurringApi.update(action.id, recurringPayload);
                } else {
                    await recurringApi.create(recurringPayload);
                }
            } else {
                await transactionSchema.parseAsync(rawValues);
                const cleanValues = Object.fromEntries(
                    Object.entries(rawValues).filter(
                        ([key, v]) => v !== '' && v != null && key !== 'frequency',
                    ),
                );

                if (action === 'create') {
                    await createTransaction(cleanValues);
                    setKeepFormData({ note: '', tags: [], toAccount: null, fromAccount: null });
                } else {
                    await updateTransaction({ id: action.id, data: cleanValues });
                }

                // Assuming getAccounts refreshes store state if needed, but react-query invalidation is key
                await getAccounts();
                await queryClient.invalidateQueries({ queryKey: ['accounts'] });
                await queryClient.invalidateQueries({ queryKey: ['transactions'] });
            }

            if (onSuccess) onSuccess();
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.issues.forEach((issue) => {
                    toast.error(issue.message);
                });
            } else {
                toast.error('Unexpected error occurred');
                console.error(error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="w-full flex flex-col gap-8">
                {[1, 2].map((i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <div className="skeleton h-8 w-1/4"></div>
                        <div className="w-full flex flex-col lg:flex-row gap-4">
                            <div className="skeleton h-10 w-full lg:w-2/3"></div>
                            <div className="skeleton h-10 w-full lg:w-1/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <form onSubmit={handleFormSubmit}>
            <motion.div
                variants={formContainer}
                initial="hidden"
                animate="visible"
                className="w-full flex flex-col gap-3">
                <motion.div variants={formItem} className="flex flex-col gap-1">
                    <label className="label text-base text-base-content">
                        {type === 'income' ? 'To' : 'From'}
                    </label>
                    <div className="flex flex-col lg:flex-row lg:gap-4">
                        <MoneyExchangeInput
                            options={handleOptions}
                            name={type === 'income' ? 'toAccount' : 'fromAccount'}
                            selectedId={getSelectedId(
                                type === 'income' ? transaction?.toAccount : transaction?.fromAccount,
                            )}
                            onSelect={(opt) =>
                                setKeepFormData((p) => ({
                                    ...p,
                                    [type === 'income' ? 'toAccount' : 'fromAccount']: opt,
                                }))
                            }
                        />
                    </div>
                </motion.div>

                {isRecurring && type !== 'transfer' && (
                    <RecurringFrequencySelect
                        initialData={
                            initialData && 'frequency' in initialData
                                ? initialData.frequency
                                : undefined
                        }
                    />
                )}

                <motion.div variants={formItem} className="flex flex-col gap-1">
                    <label className="label text-base text-base-content">
                        {type === 'transfer' ? 'To' : 'Tags'}
                    </label>
                    <div className="flex flex-col gap-3">
                        {type === 'transfer' && (
                            <div className="flex flex-col lg:flex-row lg:gap-4">
                                <MoneyExchangeInput
                                    disabled={true}
                                    options={handleOptions}
                                    name="toAccount"
                                    selectedId={getSelectedId(transaction?.toAccount)}
                                    onSelect={(opt) =>
                                        setKeepFormData((p) => ({ ...p, toAccount: opt }))
                                    }
                                />
                            </div>
                        )}

                        {isRecurring && type === 'transfer' && (
                            <RecurringFrequencySelect
                                initialData={
                                    initialData && 'frequency' in initialData
                                        ? initialData.frequency
                                        : undefined
                                }
                            />
                        )}

                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex flex-col gap-4 flex-1">
                                {type !== 'transfer' && (
                                    <MultiSelectDropdown
                                        formFieldName="tags"
                                        options={
                                            authUser?.tags?.map((tag: string) => ({
                                                label: tag,
                                                value: tag,
                                            })) || []
                                        }
                                        prompt="Choose tags"
                                        className="flex-1"
                                        onSelect={(tags) =>
                                            setKeepFormData((p) => ({ ...p, tags }))
                                        }
                                        selected={keepFormData.tags}
                                    />
                                )}
                                <input
                                    type="text"
                                    className="input focus:outline-offset-0 focus:outline-1 focus:shadow-lg transition w-full"
                                    name="note"
                                    placeholder="Note"
                                    maxLength={200}
                                    value={keepFormData.note}
                                    onChange={(e) =>
                                        setKeepFormData((p) => ({ ...p, note: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-4 w-full lg:w-45">
                                <DateSelect name="date" />
                                <button
                                    disabled={isSubmitting}
                                    className={`btn btn-outline flex-1 p-2 ${
                                        typeof action !== 'string' && action.type === 'edit'
                                            ? 'btn-info'
                                            : type === 'expense'
                                              ? 'btn-error'
                                              : 'btn-accent'
                                    }`}
                                    type="submit">
                                    {isSubmitting ? (
                                        <span className="loading loading-spinner"></span>
                                    ) : (
                                        <>
                                            {typeof action !== 'string' && action.type === 'edit'
                                                ? 'Update'
                                                : 'Add'}{' '}
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </form>
    );
};

export default TransactionForm;
