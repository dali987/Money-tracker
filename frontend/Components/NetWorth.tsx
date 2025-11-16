'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionAuth';
import { LoaderIcon } from 'lucide-react';
import React, { useMemo } from 'react';

const types = ['Cash', 'Bank', 'Credit']

const NetWorth = () => {
    const { accounts, rates, transactions } = useTransactionStore();
    const { authUser } = useAuthStore();

    const totalNetWorth = useMemo(() => {
        if (!accounts) return 0;
        return accounts.reduce((acc: number, account: any) => acc + account.balance, 0);
    }, [accounts]);

    const sumsByType = useMemo(() => {
        if (!accounts) return {};
        return types.reduce((acc, type) => {
            const sum = accounts
                .filter((account: any) => account.type === type)
                .reduce((sum: number, account: any) => sum + account.balance, 0);
            acc[type] = sum;
            return acc;
        }, {} as Record<string, number>);
    }, [accounts]);

    return (
        <div className="collapse collapse-arrow font-mono bg-gray-100 p-2">
            {authUser && rates && accounts ? (
                <>
                    <input type="checkbox" name="my-accordion" defaultChecked />
                    <div className="collapse-title ml-5 flex justify-between items-center font-bold text-xl">
                        <h1 className="inline">NET WORTH</h1>
                        <span className={totalNetWorth < 0 ? 'text-red-700' : 'text-green-700'}>{totalNetWorth.toFixed(2)} {authUser.currency}</span>
                    </div>
                    <div className="collapse-content ml-2">
                        {types.map((type: string, i: number) => (
                            <div className="collapse" key={type}>
                                <input type="checkbox" name="my-accordion-1" defaultChecked />
                                <div className="collapse-title p-4 flex justify-between items-center font-bold text-lg">
                                    <h1 className="inline">{type}</h1>
                                    <span
                                        className={
                                            sumsByType[type] < 0
                                                ? 'text-red-600'
                                                : 'text-green-600'
                                        }>
                                        {sumsByType[type].toFixed(2)} {authUser.currency}
                                    </span>
                                </div>
                                <div className="collapse-content">
                                    {accounts.filter((account: any) => account.type === type).map((account: any) => (
                                        <React.Fragment key={account._id}>
                                            <div className="accounts-worth" key={i}>
                                                <h3>{account.name}</h3>
                                                <div className="flex flex-col items-end">
                                                    {account.currencies.map(
                                                        (currency: string, i: number) => (
                                                            <h3
                                                                key={i}
                                                                className={`${
                                                                    account.balance < 0
                                                                        ? 'text-red-500'
                                                                        : 'text-green-500'
                                                                }`}>
                                                                {(
                                                                    (account.balance /
                                                                        rates[authUser.currency]) *
                                                                    rates[currency]
                                                                ).toFixed(2)}{' '}
                                                                {currency}
                                                            </h3>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                            {accounts.length - 1 !== i && (
                                                <div className="divider [--color-base-content:lab(27_0_0)]"></div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center p-12 ">
                    <LoaderIcon className="size-10 animate-spin" />
                </div>
            )}
        </div>
    );
};

export default NetWorth;
