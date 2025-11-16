'use client';

import DateSelect from '@/Components/DateSelect';
import MultiSelectDropdown from '@/Components/MultiSelectDropdown';
import NumberInput from '@/Components/NumberInput';
import SelectDropdown from '@/Components/SelectDropdown';
import { transactionSchema } from '@/lib/validations';
import { useActionState, useState } from 'react';
import { useTransactionStore } from '@/store/useTransactionAuth.js';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { LoaderIcon } from 'lucide-react';
import { formatISO } from 'date-fns';

const MoneyExchangeWithCurrency = ({
    options,
    onSelect,
    disabled,
}: {
    options: { name: string; type: string; id: string }[];
    onSelect?: any;
    disabled?: boolean;
}) => {
    const handleOnSelect = (option: any) => {
        onSelect(option);
    };

    return (
        <>
            <SelectDropdown
                className="w-full"
                options={options}
                onSelect={handleOnSelect}
            />
            <div className="join">
                <NumberInput
                className='grow'
                    name="amount"
                    disabled={disabled}
                />
            </div>
        </>
    );
};

const handleOptions = (accounts: Array<any>) => {
    if (!accounts) return [];
    const newAccounts = accounts.map((account) => ({
        name: account.name,
        type: account.type,
        id: account._id,
    }));
    return newAccounts;
};

const TransactionForm = ({
    type,
    action = "create"
}: {
    type: 'expense' | 'transfer' | 'income';
    action?: "create" | {type: "edit", id: string}
}) => {
    const { createTransaction, getAccounts, accounts, updateTransaction } = useTransactionStore();
    const { authUser, isCheckingAuth } = useAuthStore();

    const [ keepFormData, setKeepFormData ] = useState({toAccount: { name: "", type: "", id: ""}, fromAccount: { name: "", type: "", id: ""}, note: "", tags: []})
    
    const handleFormSubmit = async (prevState: any, formData: FormData) => {
        try {
            let date = String(formData.get('date'))
            date = date === "Pick a date" ? "" : date
            if (date !== "") {
                const [ year, month, day ] = (date as string)?.split("-").map(Number);
            
                const now = new Date()

                //@ts-ignore
                const newDate = new Date(Number(year), Number(month) - 1, Number(day), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
                date = formatISO(newDate);
            }


            const formValues = {
                type: type,
                toAccount: keepFormData.toAccount.id,
                fromAccount: keepFormData.fromAccount.id,
                amount: Number(formData.get('amount')),
                tags: keepFormData.tags,
                note: keepFormData.note,
                date: date
            };


            await transactionSchema.parseAsync(formValues);


            const cleanFormValues = Object.fromEntries(
                Object.entries(formValues).filter(([_, v]) => v !== '' && v != null)
            );

            if (action === "create"){
                await createTransaction(cleanFormValues);
            }
            else{
                await updateTransaction({id: action.id, data: cleanFormValues})
            }
            await getAccounts();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors = z.treeifyError(error) as {
                    errors: any;
                    properties: Record<string, unknown>;
                };

                if (fieldErrors?.properties) {
                    for (const [field, data] of Object.entries(
                        fieldErrors.properties
                    )) {
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
            }
            else{
                toast.error("Unexpected error occurred")
            }
            setKeepFormData((prev) => ({...prev, tags: []}))
            
        }
    };

    const [state, formAction, isPending] = useActionState(
        handleFormSubmit,
        null
    );

    const options = handleOptions(accounts);

    return (
        <form action={formAction}>
            {isCheckingAuth ? (
                <div className="flex items-center justify-center p-12">
                    <LoaderIcon className="size-10 animate-spin" />
                </div>
            ) : (
                <fieldset className="w-full ">
                    <label className="label text-base text-base-content">
                        {type === 'income' ? 'To' : 'From'}
                    </label>
                    <div className="flex gap-4">
                        <MoneyExchangeWithCurrency
                            options={options}
                            onSelect={(option: any) =>
                                type === 'income'
                                    ? setKeepFormData((prev) => ({...prev, toAccount: option}))
                                    : setKeepFormData((prev) => ({...prev, fromAccount: option}))
                            }
                        />
                    </div>

                    <label className="label text-base text-base-content">
                        {type === 'transfer' ? 'To' : 'Tags'}
                    </label>
                    {type === 'transfer' && (
                        <div className="flex gap-4">
                            <MoneyExchangeWithCurrency
                                disabled={true}
                                options={options}
                                onSelect={(option: any) =>
                                   setKeepFormData((prev) => ({...prev, toAccount: option}))
                                }
                            />
                        </div>
                    )}
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-4 flex-1">
                            {type !== 'transfer' && (
                                <MultiSelectDropdown
                                    formFieldName="tags"
                                    options={['one', 'two', 'three']}
                                    prompt="Choose or create tags"
                                    className="flex-1"
                                    onSelect={(tags: any) => setKeepFormData((prev) => ({...prev, tags: tags}))}
                                    selected={keepFormData.tags}
                                />
                            )}
                            <input
                                type="text"
                                className="input focus:outline-offset-0 focus:outline-1 transition"
                                name="note"
                                placeholder="Note"
                                value={keepFormData.note}
                                onChange={e => setKeepFormData((prev) => ({...prev, note: e.target.value}))}
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                            <DateSelect name="date" />
                            <button className="btn btn-neutral btn-outline flex-1 p-2" onSubmit={e => e.preventDefault()}>
                                {(action !== "create" && action.type) == "edit" ? "Update" : "Add"}{' '}
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        </div>
                    </div>
                </fieldset>
            )}
        </form>
    );
};

export default TransactionForm;
