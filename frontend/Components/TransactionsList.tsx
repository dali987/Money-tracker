'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionAuth';
import { format } from 'date-fns';
import { ArrowRight, File, Pencil } from 'lucide-react';
import TransactionForm from './TransactionForm';
import React from 'react';

const typeProperties = {
    transfer: {
        color: 'text-gray-500',
        symbol: '',
        account: '',
    },
    income: {
        color: 'text-green-500',
        symbol: '+',
        account: 'toAccount',
    },
    expense: {
        color: 'text-red-500',
        symbol: '-',
        account: 'fromAccount',
    },
};

const fields = ['expense', 'transfer', 'income'];


const TransactionsList = () => {
    const { transactions, accounts, deleteTransaction } = useTransactionStore();
    const { authUser } = useAuthStore();
    
    const accountNameMap = React.useMemo(() => {
        if (!accounts || accounts.length === 0) return {};
        return accounts.reduce((map: Record<string, string>, account: any) => {
            map[account._id] = account.name;
            return map;
        }, {});
    }, [accounts]);

    return (
        <ul className="list rounded-box">
            {transactions.length > 0 &&
                authUser &&
                accounts.length > 0 &&
                transactions.slice(0, 5).map((transaction: any) => (
                    <li className="list-row !" key={transaction._id}>
                        <div className="list-col-grow">
                            <div className="text-base">
                                {transaction.type !== 'transfer' ? (
                                    accountNameMap[
                                        transaction[
                                            typeProperties[
                                                transaction.type as keyof typeof typeProperties
                                            ].account
                                        ]
                                    ]
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {accountNameMap[transaction.fromAccount]} <ArrowRight />{' '}
                                        {accountNameMap[transaction.toAccount]}{' '}
                                    </div>
                                )}
                            </div>
                            <div className="text-xs uppercase font-semibold opacity-60">
                                {format(new Date(transaction.date), 'dd MMM, yyyy')}
                            </div>
                            <p className="text-base-300">{transaction.note}</p>
                        </div>
                        <div
                            className={`text-lg flex justify-center items-center ${
                                typeProperties[transaction.type as keyof typeof typeProperties]
                                    .color
                            }`}>
                            {`${
                                typeProperties[transaction.type as keyof typeof typeProperties]
                                    .symbol
                            }${transaction.amount.toFixed(2)} ${authUser.currency}`}
                        </div>
                        <button
                            type="button"
                            className="btn btn-square btn-ghost self-center"
                            onClick={() =>
                                (document.getElementById('edit') as HTMLDialogElement)?.showModal()
                            }>
                            <Pencil />
                        </button>
                        <dialog id="edit" className="modal">
                            <div className="modal-box max-w-150 min-h-80 transition-all">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-lg flex gap-2 py-4">
                                        <File /> Edit Transaction
                                    </h3>{' '}
                                    <form method="dialog">
                                        <button className="btn p-3.5 text-lg font-black bg-red-600/70 text-white hover:bg-red-600">
                                            X
                                        </button>
                                    </form>
                                </div>
                                <div className="tabs tabs-lift">
                                    {fields.map((type: string, i: number) => (
                                        <React.Fragment key={type}>
                                            <input
                                                type="radio"
                                                name="edit-tabs"
                                                style={{
                                                    //@ts-ignore
                                                    '--color-base-content':
                                                        type === 'expense'
                                                            ? '#fb2c36'
                                                            : type === 'income'
                                                            ? 'oklch(72.3% 0.219 149.579)'
                                                            : '',
                                                }}
                                                className="tab grow font-bold"
                                                aria-label={type}
                                                defaultChecked
                                            />
                                            <div className="tab-content bg-gray-50 border-gray-300 p-6">
                                                <TransactionForm
                                                    type={type as 'expense' | 'income' | 'transfer'}
                                                    action={{
                                                        type: 'edit',
                                                        id: transaction._id,
                                                    }}
                                                />
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
                                <div className="modal-action">
                                    <form method="dialog">
                                        <button
                                            className="btn bg-red-500 text-white hover:bg-red-700"
                                            onClick={() => deleteTransaction(transaction._id)}>
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </dialog>
                    </li>
                ))}
        </ul>
    );
};

export default TransactionsList;
