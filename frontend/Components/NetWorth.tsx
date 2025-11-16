'use client';

import { getAccounts } from '@/lib/server/fetchUser';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionAuth';
import { LoaderIcon } from 'lucide-react';
import React, { Fragment, useEffect, useState } from 'react';

const NetWorth = () => {
    const { accounts, rates, getRates, transactions } = useTransactionStore();
    const { authUser, checkAuth } = useAuthStore();

    useEffect(() => {
        getRates();
        checkAuth();
        getAccounts()
    }, [])

    console.log("transactions from net worth: ",transactions)



    const calculateSum = (type?: string) => {
        let sumAccounts = accounts;
        if (type) {
            sumAccounts = accounts.filter((account: any) => account.type === type);
        }

        const sum = sumAccounts.reduce((acc: number, account: any) => acc + account.balance, 0);
        console.log(sum);
        return sum;
    };

    return (
        <div className="collapse collapse-arrow font-mono bg-gray-100 p-2">
            {authUser && rates && accounts ? (
                <>
                    <input type="checkbox" name="my-accordion" defaultChecked />
                    <div className="collapse-title ml-5 flex justify-between items-center font-bold text-xl">
                        <h1 className="inline">NET WORTH</h1>
                        <span className={calculateSum() < 0 ? 'text-red-700' : 'text-green-700'}>{calculateSum().toFixed(2)} {authUser.currency}</span>
                    </div>
                    <div className="collapse-content ml-2">
                        {['Cash', 'Bank', 'Credit'].map((type: string, i: number) => (
                            <div className="collapse" key={type}>
                                <input type="checkbox" name="my-accordion-1" defaultChecked />
                                <div className="collapse-title p-4 flex justify-between items-center font-bold text-lg">
                                    <h1 className="inline">{type}</h1>
                                    <span
                                        className={
                                            calculateSum(type) < 0
                                                ? 'text-red-600'
                                                : 'text-green-600'
                                        }>
                                        {calculateSum(type).toFixed(2)} {authUser.currency}
                                    </span>
                                </div>
                                <div className="collapse-content">
                                    {accounts.filter((account: any) => account.type === type).map((account: any, i: number) => (
                                        <React.Fragment key={i}>
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
