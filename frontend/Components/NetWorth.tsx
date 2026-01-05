'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { CreditCard, Pencil } from 'lucide-react';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import AccountForm from './AccountForm';
import { motion, AnimatePresence, Variants } from 'motion/react';
import AnimatedNumber from './AnimatedNumber';

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

const SkeletonNetWorth = () => (
    <div className="w-full font-mono bg-gray-100 rounded-box p-4">
        <div className="flex justify-between items-center mb-6">
            <div className="skeleton h-8 w-40"></div>
            <div className="skeleton h-8 w-32"></div>
        </div>
        {[1, 2].map((i) => (
            <div key={i} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <div className="skeleton h-6 w-24"></div>
                    <div className="skeleton h-6 w-28"></div>
                </div>
                <div className="space-y-2 ml-4">
                    <div className="skeleton h-10 w-full"></div>
                    <div className="skeleton h-10 w-full"></div>
                </div>
            </div>
        ))}
    </div>
);

import CustomCollapse from './Custom/CustomCollapse';

const NetWorth = ({ closable = true, editMode }: { closable?: boolean; editMode?: boolean }) => {
    const { accounts, rates, deleteAccount, getAccountsSummary } = useTransactionStore();
    const { authUser } = useAuthStore();
    const [editAccount, setEditAccount] = useState<any>(null);
    const [accountsSummary, setAccountsSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            const summary = await getAccountsSummary();
            setAccountsSummary(summary);
            setIsLoading(false);
        };
        fetchSummary();
    }, [accounts, getAccountsSummary]);

    const totalNetWorth = accountsSummary?.totalNetWorth ?? 0;
    const groups = authUser?.groups || [];

    const sumsByType = useMemo(() => {
        const sums = accountsSummary?.sumsByGroup || {};
        return groups.reduce((acc: Record<string, number>, group: string) => {
            acc[group] = sums[group] || 0;
            return acc;
        }, {} as Record<string, number>);
    }, [accountsSummary, groups]);
    if (!authUser || !rates || !accounts || isLoading) {
        return <SkeletonNetWorth />;
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
                                                .filter((account: any) => account.group === group)
                                                .map((account: any, i: number, filtered: any[]) => (
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
                                                                    onClick={() => {
                                                                        setEditAccount(account._id);
                                                                        (
                                                                            document.getElementById(
                                                                                'edit-account-modal'
                                                                            ) as HTMLDialogElement
                                                                        )?.showModal();
                                                                    }}
                                                                    className={
                                                                        'btn btn-sm btn-square btn-ghost opacity-0 group-hover:opacity-100 transition-opacity shrink-0' +
                                                                        (!editMode ? ' hidden' : '')
                                                                    }>
                                                                    <Pencil size={16} />
                                                                </button>
                                                            </div>
                                                            <div className="flex flex-wrap flex-col items-end gap-1 shrink-0 ml-4">
                                                                {[
                                                                    authUser.baseCurrency,
                                                                    ...authUser.currencies,
                                                                ].map((currency: string) => (
                                                                    <div
                                                                        key={currency}
                                                                        className="flex items-center gap-1 whitespace-nowrap">
                                                                        <AnimatedNumber
                                                                            value={
                                                                                (account.balance /
                                                                                    rates[
                                                                                        authUser
                                                                                            .baseCurrency
                                                                                    ]) *
                                                                                rates[currency]
                                                                            }
                                                                            className={
                                                                                account.balance < 0
                                                                                    ? 'text-red-500'
                                                                                    : 'text-green-500'
                                                                            }
                                                                        />
                                                                        <span
                                                                            className={`ml-1 text-xs ${
                                                                                account.balance < 0
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
                                                ))}
                                    </motion.div>
                                </CustomCollapse>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </CustomCollapse>

            <dialog id="edit-account-modal" className="modal">
                <div className="modal-box max-w-120 transition-all rounded-3xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-xl flex gap-3 items-center">
                            <CreditCard className="text-primary" /> Edit Account
                        </h3>
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost">✕</button>
                        </form>
                    </div>
                    {editAccount && <AccountForm action={{ type: 'edit', id: editAccount }} />}
                    <div className="modal-action flex-col gap-2">
                        <form method="dialog" className="w-full">
                            <button
                                className="btn btn-error btn-outline w-full"
                                onClick={() => editAccount && deleteAccount(editAccount)}>
                                Delete Account
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>
        </motion.div>
    );
};

export default NetWorth;
