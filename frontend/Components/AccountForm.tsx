'use client';

import { useAuthStore } from '@/store/useAuthStore';
import NumberInput from './Custom/NumberInput';
import { useEffect, useState } from 'react';
import { accountSchema } from '../lib/validations';
import { useTransactionStore } from '@/store/useTransactionStore';

import SelectDropdown from './Custom/SelectDropdown';
import { useAccounts } from '@/hooks/useAccounts';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

const AccountForm = ({
    action = 'create',
    onSuccess,
}: {
    action: 'create' | { type: 'edit'; id: string };
    onSuccess?: () => void;
}) => {
    const { authUser } = useAuthStore();
    const { createAccount, updateAccount, deleteAccount } = useTransactionStore();
    const [name, setName] = useState('');
    const [group, setGroup] = useState(authUser?.groups?.[0] || '');
    const queryClient = useQueryClient();

    const { data: accountsRaw = [], isLoading: isAccountsLoading } = useAccounts();

    const accounts = accountsRaw || [];

    useEffect(() => {
        if (typeof action === 'object' && action.type === 'edit') {
            const account = accounts.find((account: any) => account._id === action.id);
            if (account) {
                setName(account.name);
                setGroup(account.group);
            }
        }
    }, [action, accounts]);

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const group = (formData.get('group') as string) || (formData.get('group_hidden') as string); // in case hidden input is used
        const balance = Number(formData.get('balance'));

        const result = accountSchema.safeParse({ name, group, balance });

        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }

        if (action === 'create') {
            await createAccount(result.data);
        } else if (typeof action === 'object' && action.type === 'edit') {
            await updateAccount({ id: action.id, data: result.data });
        }
        await queryClient.invalidateQueries({ queryKey: ['accounts'] });
        if (onSuccess) onSuccess();
    };

    const handleDelete = async () => {
        if (typeof action === 'object' && action.type === 'edit') {
            if (confirm('Are you sure you want to delete this account?')) {
                await deleteAccount(action.id);
                await queryClient.invalidateQueries({ queryKey: ['accounts'] });
                if (onSuccess) onSuccess();
            }
        }
    };

    return (
        <form className="flex flex-col gap-6 p-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
                <label htmlFor="name">Name</label>
                <div className="flex flex-col">
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        pattern="^\S(.*\S)?$"
                        title="Name cannot start or end with spaces"
                        id="name"
                        maxLength={30}
                        className="input validator focus:outline-offset-0 focus:outline-1 transition w-full"
                    />
                    <p className="validator-hint">Name cannot start or end with spaces</p>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="group">Group</label>
                <SelectDropdown
                    name="group"
                    id="group"
                    options={authUser?.groups || []}
                    defaultValue={group}
                    onSelect={(val) => setGroup(val)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="balance">Balance</label>
                <NumberInput className="w-full" name="balance" />
            </div>
            {error && <p className="text-error text-sm">{error}</p>}
            <div className="flex gap-2 w-full">
                <button
                    type="submit"
                    className={
                        'btn btn-outline flex-1' +
                        (action === 'create' ? ' btn-success' : ' btn-info')
                    }>
                    {action === 'create' ? 'Create' : 'Update'}
                </button>
                {typeof action === 'object' && action.type === 'edit' && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="btn btn-outline btn-error">
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
        </form>
    );
};

export default AccountForm;
