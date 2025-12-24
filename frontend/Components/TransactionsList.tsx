'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
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

const TransactionsList = ({ maxCount }: { maxCount: number }) => {
    const { transactions, accounts, deleteTransaction } = useTransactionStore();
    const { authUser } = useAuthStore();

    const [currentPage, setCurrentPage] = React.useState(1);
    const [inputMode, setInputMode] = React.useState<'left' | 'right' | null>(null);
    const itemsPerPage = 10;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [transactions]);

    const accountNameMap = React.useMemo(() => {
        if (!accounts || accounts.length === 0) return {};
        return accounts.reduce((map: Record<string, string>, account: any) => {
            map[account._id] = account.name;
            return map;
        }, {});
    }, [accounts]);

    const displayedTransactions = React.useMemo(() => {
        if (maxCount !== -1) {
            return transactions.slice(0, maxCount);
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        return transactions.slice(startIndex, startIndex + itemsPerPage);
    }, [transactions, maxCount, currentPage]);

    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="flex flex-col gap-4">
            <ul className="list rounded-box">
                {displayedTransactions.length > 0 &&
                    authUser &&
                    accounts.length > 0 &&
                    displayedTransactions.map((transaction: any) => (
                        <li className="list-row !" key={transaction._id}>
                            <div className="list-col-grow flex gap-6 items-center">
                                <div>
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
                                                {accountNameMap[transaction.fromAccount]}{' '}
                                                <ArrowRight />{' '}
                                                {accountNameMap[transaction.toAccount]}{' '}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs uppercase font-semibold opacity-60">
                                        {format(new Date(transaction.date), 'dd MMM, yyyy')}
                                    </div>
                                    <p className="text-base-300">{transaction.note}</p>
                                </div>
                                <div className="flex gap-2">
                                    {transaction.tags.map((tag: string) => (
                                        <div key={tag} className="badge badge-soft">
                                            {tag}
                                        </div>
                                    ))}
                                </div>
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
                                    (
                                        document.getElementById('edit') as HTMLDialogElement
                                    )?.showModal()
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
                                                        type={
                                                            type as
                                                                | 'expense'
                                                                | 'income'
                                                                | 'transfer'
                                                        }
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
            {transactions.length > 10 && (
                <div className="flex justify-center mt-4">
                    <div className="join">
                        <button
                            className="join-item btn"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}>
                            «
                        </button>

                        {(() => {
                            const pages = [];
                            // Always show first page
                            pages.push(1);

                            if (currentPage > 3) {
                                pages.push('left-ellipsis');
                            }

                            // Neighbors
                            for (
                                let i = Math.max(2, currentPage - 1);
                                i <= Math.min(totalPages - 1, currentPage + 1);
                                i++
                            ) {
                                pages.push(i);
                            }

                            if (currentPage < totalPages - 2) {
                                pages.push('right-ellipsis');
                            }

                            // Always show last page if > 1
                            if (totalPages > 1) {
                                pages.push(totalPages);
                            }

                            return pages.map((page, index) => {
                                if (page === 'left-ellipsis' || page === 'right-ellipsis') {
                                    const isInput =
                                        page === 'left-ellipsis'
                                            ? inputMode === 'left'
                                            : inputMode === 'right';

                                    if (isInput) {
                                        return (
                                            <input
                                                key={page}
                                                className="join-item btn w-16 px-1"
                                                type="number"
                                                autoFocus
                                                min={1}
                                                max={totalPages}
                                                onBlur={() => setInputMode(null)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = parseInt(
                                                            (e.target as HTMLInputElement).value
                                                        );
                                                        if (
                                                            !isNaN(val) &&
                                                            val >= 1 &&
                                                            val <= totalPages
                                                        ) {
                                                            setCurrentPage(val);
                                                        }
                                                        setInputMode(null);
                                                    }
                                                }}
                                            />
                                        );
                                    }

                                    return (
                                        <button
                                            key={page}
                                            className="join-item btn"
                                            onClick={() =>
                                                setInputMode(
                                                    page === 'left-ellipsis' ? 'left' : 'right'
                                                )
                                            }>
                                            ...
                                        </button>
                                    );
                                }

                                return (
                                    <button
                                        key={page}
                                        className={`join-item btn ${
                                            currentPage === page ? 'btn-active' : ''
                                        }`}
                                        onClick={() => handlePageChange(page as number)}>
                                        {page}
                                    </button>
                                );
                            });
                        })()}

                        <button
                            className="join-item btn"
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}>
                            »
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionsList;
