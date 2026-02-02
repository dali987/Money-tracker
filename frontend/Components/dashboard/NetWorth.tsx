'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { CreditCard, Pencil } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import AccountForm from '../accounts/AccountForm';
import { motion, AnimatePresence, Variants } from 'motion/react';
import AnimatedNumber from '../ui/AnimatedNumber';
import ErrorState from '@/Components/states/ErrorState';
import CustomModal from '@/Components/Custom/CustomModal';

const container: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.1, delayChildren: 0.1, ease: 'easeOut', duration: 0.4 },
    },
};

const section: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

import CustomCollapse from '@/Components/Custom/CustomCollapse';
import { useAccounts } from '@/hooks/useAccounts';
import { useQueryClient } from '@tanstack/react-query';
import { useAccountStore } from '@/store/useAccountStore';
import NetWorthSkeleton from '@/Components/states/NetWorthSkeleton';
import { Account, AccountSummary } from '@/types';

const EMPTY_GROUPS: string[] = [];

const NetWorth = ({ closable = true, editMode }: { closable?: boolean; editMode?: boolean }) => {
    const { rates } = useTransactionStore();
    const { getAccountsSummary } = useAccountStore();
    const { authUser } = useAuthStore();
    const [editAccount, setEditAccount] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [accountsSummary, setAccountsSummary] = useState<AccountSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();
    const isAccountsError = useAccountStore((state) => state.isError);

    const { data: accounts } = useAccounts();

    useEffect(() => {
        const fetchSummary = async () => {
            const summary = await getAccountsSummary();

            setAccountsSummary(summary);
            setIsLoading(false);
        };
        fetchSummary();
    }, [accounts, getAccountsSummary]);

    const totalNetWorth = accountsSummary?.totalNetWorth ?? 0;
    const groups = authUser?.groups ?? EMPTY_GROUPS;

    const sumsByType = useMemo(() => {
        const sums = accountsSummary?.sumsByGroup || {};
        return groups.reduce(
            (acc: Record<string, number>, group: string) => {
                acc[group] = sums[group] || 0;
                return acc;
            },
            {} as Record<string, number>,
        );
    }, [accountsSummary, groups]);

    const handleEditClick = (accountId: string) => {
        setEditAccount(accountId);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditAccount(null);
    };

    if (isAccountsError) {
        return (
            <div className="w-full bg-base-100 rounded-box p-4">
                <ErrorState
                    message="Failed to load your net worth data."
                    onRetry={() => {
                        queryClient.invalidateQueries({ queryKey: ['accounts'] });
                        getAccountsSummary();
                    }}
                />
            </div>
        );
    }

    if (!authUser || !rates || !accounts || isLoading) {
        return <NetWorthSkeleton />;
    }

    return (
        <motion.div
            layout
            variants={container}
            initial="hidden"
            animate="visible"
            className="w-full">
            <CustomCollapse
                title="NET WORTH"
                defaultOpen={true}
                closable={closable}
                rightContent={
                    <div className="text-xl font-bold">
                        <AnimatedNumber
                            value={totalNetWorth}
                            className={totalNetWorth < 0 ? 'text-red-700' : 'text-green-700'}
                        />
                        <span
                            className={`ml-2 text-sm font-bold ${
                                totalNetWorth < 0 ? 'text-red-700' : 'text-green-700'
                            }`}>
                            {authUser.baseCurrency}
                        </span>
                    </div>
                }>
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-2">
                    <AnimatePresence>
                        {groups.map((group: string) => (
                            <motion.div key={group} variants={section}>
                                <CustomCollapse
                                    layout
                                    key={group}
                                    title={group}
                                    defaultOpen={true}
                                    className="bg-transparent"
                                    rightContent={
                                        <div
                                            className={`text-lg font-bold ${
                                                sumsByType[group] < 0
                                                    ? 'text-red-600'
                                                    : 'text-green-600'
                                            }`}>
                                            <AnimatedNumber value={sumsByType[group]} />
                                            <span className="ml-2 text-xs">
                                                {authUser.baseCurrency}
                                            </span>
                                        </div>
                                    }>
                                    <motion.div
                                        variants={container}
                                        initial="hidden"
                                        animate="visible"
                                        className="flex flex-col gap-1">
                                        {accounts &&
                                            accounts
                                                .filter(
                                                    (account: Account) => account.group === group,
                                                )
                                                .map(
                                                    (
                                                        account: Account,
                                                        i: number,
                                                        filtered: Account[],
                                                    ) => (
                                                        <motion.div
                                                            layout
                                                            key={account._id}
                                                            variants={section}
                                                            className="group">
                                                            <div className="flex justify-between items-start lg:gap-4 py-2 hover:bg-black/5 rounded-lg px-2 transition-colors min-w-0">
                                                                <div className="flex flex-col lg:flex-row lg:items-center gap-2 min-w-0">
                                                                    <h3
                                                                        className="text-[#4183c4] font-medium font-sans truncate"
                                                                        title={account.name}>
                                                                        {account.name}
                                                                    </h3>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleEditClick(
                                                                                account._id,
                                                                            )
                                                                        }
                                                                        className={
                                                                            'btn btn-sm btn-square btn-ghost opacity-0 group-hover:opacity-100 transition-opacity shrink-0' +
                                                                            (!editMode
                                                                                ? ' hidden'
                                                                                : '')
                                                                        }>
                                                                        <Pencil size={16} />
                                                                    </button>
                                                                </div>
                                                                <div className="flex flex-wrap flex-col items-end gap-1 shrink-0 ml-4">
                                                                    {[
                                                                        authUser.baseCurrency,
                                                                        ...authUser.currencies!,
                                                                    ]
                                                                        .filter((c): c is string =>
                                                                            Boolean(c),
                                                                        )
                                                                        .map((currency: string) => (
                                                                            <div
                                                                                key={currency}
                                                                                className="flex items-center gap-1 whitespace-nowrap">
                                                                                <AnimatedNumber
                                                                                    value={
                                                                                        (account.balance /
                                                                                            rates?.[
                                                                                                authUser
                                                                                                    .baseCurrency!
                                                                                            ]) *
                                                                                        rates?.[
                                                                                            currency
                                                                                        ]
                                                                                    }
                                                                                    className={
                                                                                        account.balance <
                                                                                        0
                                                                                            ? 'text-red-500'
                                                                                            : 'text-green-500'
                                                                                    }
                                                                                />
                                                                                <span
                                                                                    className={`ml-1 text-xs ${
                                                                                        account.balance <
                                                                                        0
                                                                                            ? 'text-red-400'
                                                                                            : 'text-green-400'
                                                                                    }`}>
                                                                                    {currency}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                </div>
                                                            </div>
                                                            {i !== filtered.length - 1 && (
                                                                <div className="divider my-0 opacity-10"></div>
                                                            )}
                                                        </motion.div>
                                                    ),
                                                )}
                                    </motion.div>
                                </CustomCollapse>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </CustomCollapse>

            <CustomModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                title="Edit Account"
                Icon={CreditCard}>
                {editAccount && (
                    <AccountForm
                        action={{ type: 'edit', id: editAccount }}
                        onSuccess={handleCloseEditModal}
                    />
                )}
            </CustomModal>
        </motion.div>
    );
};

export default NetWorth;
