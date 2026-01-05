'use client';

import DateSelect from '@/Components/Custom/DateSelect';
import MultiSelectDropdown from '@/Components/Custom/MultiSelectDropdown';
import NumberInput from '@/Components/Custom/NumberInput';
import SelectAccountDropdown from '@/Components/Custom/SelectAccountDropdown';
import { transactionSchema } from '@/lib/validations';
import { useActionState, useState, useMemo } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { formatISO } from 'date-fns';
import { useEffect } from 'react';
import { motion } from 'motion/react';

const MoneyExchangeWithCurrency = ({
    options,
    onSelect,
    disabled,
    name,
}: {
    options: { name: string; type: string; id: string }[];
    onSelect?: any;
    disabled?: boolean;
    name?: string;
}) => {
    const handleOnSelect = (option: any) => {
        onSelect(option);
    };

    return (
        <>
            <SelectAccountDropdown
                name={name}
                className="w-full"
                options={options}
                defaultValue={true}
                onSelect={handleOnSelect}
            />
            <div className="join">
                <NumberInput className="grow" name="amount" disabled={disabled} />
            </div>
        </>
    );
};

const handleOptions = (accounts: Array<any>) => {
    if (!accounts) return [];
    return accounts.map((account) => ({
        name: account.name,
        type: account.type,
        id: account._id,
    }));
};

const formContainer: any = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const formItem: any = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

const TransactionForm = ({
    type,
    action = 'create',
    onSuccess,
}: {
    type: 'expense' | 'transfer' | 'income';
    action?: 'create' | { type: 'edit'; id: string };
    onSuccess?: () => void;
}) => {
    const createTransaction = useTransactionStore((state) => state.createTransaction);
    const getAccounts = useTransactionStore((state) => state.getAccounts);
    const accounts = useTransactionStore((state) => state.accounts);
    const updateTransaction = useTransactionStore((state) => state.updateTransaction);

    const authUser = useAuthStore((state) => state.authUser);
    const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

    const transactions = useTransactionStore((state) => state.transactions);

    const [keepFormData, setKeepFormData] = useState({
        note: '',
        tags: [],
    });

    useEffect(() => {
        if (typeof action !== 'string' && action.type === 'edit') {
            const transaction = transactions.find((t: any) => t._id === action.id);
            if (transaction) {
                setKeepFormData({
                    note: transaction.note || '',
                    tags: transaction.tags || [],
                });
            }
        }
    }, [action, transactions]);

    const handleFormSubmit = async (prevState: any, formData: FormData) => {
        try {
            let date = String(formData.get('date'));
            date = date === 'Pick a date' ? '' : date;
            if (date !== '') {
                const [year, month, day] = (date as string)?.split('-').map(Number);

                const now = new Date();

                //@ts-ignore
                const newDate = new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day),
                    now.getHours(),
                    now.getMinutes(),
                    now.getSeconds(),
                    now.getMilliseconds()
                );
                date = formatISO(newDate);
            }

            const formValues = {
                type: type,
                toAccount: formData.get('toAccount'),
                fromAccount: formData.get('fromAccount'),
                amount: Number(formData.get('amount')),
                tags: keepFormData.tags,
                note: keepFormData.note,
                date: date,
            };

            await transactionSchema.parseAsync(formValues);

            const cleanFormValues = Object.fromEntries(
                Object.entries(formValues).filter(([_, v]) => v !== '' && v != null)
            );

            if (action === 'create') {
                await createTransaction(cleanFormValues);
                setKeepFormData({
                    note: '',
                    tags: [],
                });
            } else {
                await updateTransaction({ id: action.id, data: cleanFormValues });
            }
            await getAccounts();
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors = z.treeifyError(error) as {
                    errors: any;
                    properties: Record<string, unknown>;
                };

                if (fieldErrors?.properties) {
                    for (const [field, data] of Object.entries(fieldErrors.properties)) {
                        if (
                            typeof data === 'object' &&
                            data !== null &&
                            'errors' in data &&
                            Array.isArray(data.errors)
                        ) {
                            for (const message of data.errors) {
                                toast.error(message);
                            }
                        }
                    }
                }

                console.log(z.treeifyError(error));
            } else {
                toast.error('Unexpected error occurred');
            }
        }
    };

    const [state, formAction, isPending] = useActionState(handleFormSubmit, null);

    const memoizedOptions = useMemo(() => handleOptions(accounts), [accounts]);

    return (
        <form action={formAction}>
            {isCheckingAuth ? (
                <div className="w-full flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <div className="skeleton h-8 w-1/4"></div>
                        <div className="w-full flex flex-col lg:flex-row gap-4">
                            <div className="skeleton h-10 w-full lg:w-2/3"></div>
                            <div className="skeleton h-10 w-full lg:w-1/3"></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="skeleton h-8 w-1/4"></div>
                        <div className="w-full flex flex-col lg:flex-row gap-4">
                            <div className="skeleton h-10 w-full lg:w-2/3"></div>
                            <div className="skeleton h-10 w-full lg:w-1/3"></div>
                        </div>
                        <div className="w-full hidden lg:flex flex-col lg:flex-row gap-4">
                            <div className="skeleton h-10 w-2/3"></div>
                            <div className="skeleton h-10 w-1/3"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <motion.div
                    variants={formContainer}
                    initial="hidden"
                    animate="visible"
                    className="w-full flex flex-col gap-4">
                    <motion.div variants={formItem} className="flex flex-col gap-1">
                        <label className="label text-base text-base-content">
                            {type === 'income' ? 'To' : 'From'}
                        </label>
                        <div className="flex flex-col lg:flex-row lg:gap-4">
                            <MoneyExchangeWithCurrency
                                options={memoizedOptions}
                                name={type === 'income' ? 'toAccount' : 'fromAccount'}
                                onSelect={(option: any) =>
                                    type === 'income'
                                        ? setKeepFormData((prev) => ({
                                              ...prev,
                                              toAccount: option,
                                          }))
                                        : setKeepFormData((prev) => ({
                                              ...prev,
                                              fromAccount: option,
                                          }))
                                }
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={formItem} className="flex flex-col gap-1">
                        <label className="label text-base text-base-content">
                            {type === 'transfer' ? 'To' : 'Tags'}
                        </label>
                        <div className="flex flex-col gap-4">
                            {type === 'transfer' && (
                                <div className="flex flex-col lg:flex-row lg:gap-4">
                                    <MoneyExchangeWithCurrency
                                        disabled={true}
                                        options={memoizedOptions}
                                        name="toAccount"
                                        onSelect={(option: any) =>
                                            setKeepFormData((prev) => ({
                                                ...prev,
                                                toAccount: option,
                                            }))
                                        }
                                    />
                                </div>
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
                                            onSelect={(tags: any) =>
                                                setKeepFormData((prev) => ({ ...prev, tags: tags }))
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
                                            setKeepFormData((prev) => ({
                                                ...prev,
                                                note: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex flex-col gap-4 w-full lg:w-45">
                                    <DateSelect name="date" />
                                    <button
                                        className="btn btn-neutral btn-outline flex-1 p-2"
                                        onSubmit={(e) => e.preventDefault()}>
                                        {(action !== 'create' && action.type) == 'edit'
                                            ? 'Update'
                                            : 'Add'}{' '}
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </form>
    );
};

export default TransactionForm;
