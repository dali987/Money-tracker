import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowRight, Wallet, Pencil, SquarePen } from 'lucide-react';
import TransactionForm from './TransactionForm';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import TranscationsSkeleton from './skeletons/TranscationsSkeleton';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import CustomModal from './Custom/CustomModal';

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

const TransactionsList = ({
    maxCount,
    transactions: externalTransactions,
    isLoading: externalIsLoading,
    onAddClick,
}: {
    maxCount: number;
    transactions?: any[];
    isLoading?: boolean;
    onAddClick?: () => void;
}) => {
    const { data: accountsRaw = [], isLoading: isAccountsLoading } = useAccounts();
    // Only fetch if external transactions are not provided
    const { data: transactionsRaw = [], isLoading: isInternalLoading } = useTransactions(
        externalTransactions ? undefined : {},
    );
    const { data: transactionsForExcel = [] } = useTransactions({});

    const accounts = accountsRaw || [];
    // Prioritize external transactions
    const transactions = externalTransactions || transactionsRaw;
    const isTransactionsLoading =
        externalIsLoading !== undefined ? externalIsLoading : isInternalLoading;

    const getTransactionsWithFilter = useTransactionStore(
        (state) => state.getTransactionsWithFilter,
    );
    const queryClient = useQueryClient();

    const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);

    const authUser = useAuthStore((state) => state.authUser);
    const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

    const [currentPage, setCurrentPage] = useState(1);
    const [inputMode, setInputMode] = useState<'left' | 'right' | null>(null);
    const itemsPerPage = 10;

    const [editingTransaction, setEditingTransaction] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        // getTransactionsWithFilter(); // This might not be needed if useTransactions handles fetching
    }, [getTransactionsWithFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [transactions]);

    const accountNameMap = useMemo(() => {
        if (!accounts || accounts.length === 0) return {};
        return accounts.reduce((map: Record<string, string>, account) => {
            map[account._id] = account.name;
            return map;
        }, {});
    }, [accounts]);

    const displayedTransactions = useMemo(() => {
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

    const isTransactionsError = useTransactionStore((state) => state.isTransactionsError);
    const isAccountsError = useTransactionStore((state) => state.isAccountsError);

    const handleEditClick = (transaction: any) => {
        setEditingTransaction(transaction);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingTransaction(null);
    };

    return (
        <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout" initial={false}>
                {isTransactionsError || isAccountsError ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}>
                        <ErrorState
                            message={
                                isAccountsError
                                    ? 'Failed to load accounts.'
                                    : 'Failed to load transactions.'
                            }
                            onRetry={() => {
                                if (isAccountsError)
                                    queryClient.invalidateQueries({ queryKey: ['accounts'] });
                                getTransactionsWithFilter({});
                            }}
                        />
                    </motion.div>
                ) : isCheckingAuth ||
                  (isTransactionsLoading && transactions.length < 1) ||
                  (isAccountsLoading && accounts.length < 1) ? (
                    <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-8 p-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <TranscationsSkeleton key={i} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.ul
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="list rounded-box overflow-clip">
                        {displayedTransactions.length > 0 ? (
                            <AnimatePresence mode="popLayout">
                                {authUser &&
                                    accounts.length > 0 &&
                                    displayedTransactions.map((transaction) => (
                                        <motion.li
                                            className="list-row !"
                                            key={transaction._id}
                                            layout
                                            transition={{ duration: 0.35, ease: 'easeOut' }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}>
                                            <div className="list-col-grow flex flex-col lg:flex-row gap-2 lg:gap-6 items-start lg:items-center min-w-0">
                                                <div className="min-w-0 w-full">
                                                    <div className="text-sm lg:text-base lg:max-w-lg w-full">
                                                        {transaction.type !== 'transfer' ? (
                                                            <div className="truncate">
                                                                {
                                                                    accountNameMap[
                                                                        (transaction as any)[
                                                                            typeProperties[
                                                                                transaction.type as keyof typeof typeProperties
                                                                            ].account
                                                                        ] || ''
                                                                    ]
                                                                }
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span className="truncate shrink">
                                                                    {
                                                                        accountNameMap[
                                                                            transaction.fromAccount ||
                                                                                ''
                                                                        ]
                                                                    }
                                                                </span>
                                                                <ArrowRight
                                                                    className="shrink-0 opacity-50"
                                                                    size={16}
                                                                />
                                                                <span className="truncate shrink">
                                                                    {
                                                                        accountNameMap[
                                                                            transaction.toAccount ||
                                                                                ''
                                                                        ]
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-xs uppercase font-semibold opacity-60">
                                                        {format(
                                                            new Date(transaction.date),
                                                            'dd MMM, yyyy',
                                                        )}
                                                    </div>
                                                    <p className="text-base-300 text-sm wrap-break-word lg:max-w-sm">
                                                        {transaction.note}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-1 lg:gap-2 w-full min-w-0">
                                                    {transaction.tags.map((tag: string) => (
                                                        <div
                                                            key={tag}
                                                            className="badge badge-soft text-xs lg:text-sm">
                                                            {tag}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div
                                                className={`text-base lg:text-lg flex justify-center text-center items-center shrink-0 ${
                                                    typeProperties[
                                                        transaction.type as keyof typeof typeProperties
                                                    ].color
                                                }`}>
                                                {`${
                                                    typeProperties[
                                                        transaction.type as keyof typeof typeProperties
                                                    ].symbol
                                                }${transaction.amount.toFixed(2)} ${
                                                    authUser.baseCurrency
                                                }`}
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-square btn-ghost self-center max-lg:btn-sm "
                                                onClick={() => handleEditClick(transaction)}>
                                                <Pencil size={22} />
                                            </button>
                                        </motion.li>
                                    ))}
                            </AnimatePresence>
                        ) : (
                            <EmptyState
                                action={
                                    onAddClick
                                        ? {
                                              label: 'Add Transaction',
                                              onClick: onAddClick,
                                          }
                                        : undefined
                                }
                            />
                        )}
                    </motion.ul>
                )}
            </AnimatePresence>

            <CustomModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                title="Edit Transaction"
                Icon={SquarePen}>
                {editingTransaction && (
                    <div className="tabs tabs-lift p-6 pb-0">
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
                                    className="tab grow font-bold transition-all duration-300"
                                    aria-label={type}
                                    defaultChecked={editingTransaction.type === type}
                                />
                                <div className="tab-content bg-base-100 border-base-300 p-6">
                                    <TransactionForm
                                        type={type as 'expense' | 'income' | 'transfer'}
                                        action={{
                                            type: 'edit',
                                            id: editingTransaction._id,
                                        }}
                                        onSuccess={handleCloseEditModal}
                                    />
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                )}
                <form method="dialog" className="flex justify-end items-center">
                    <button
                        className="btn btn-error text-white m-6"
                        onClick={async () => {
                            if (editingTransaction) {
                                await deleteTransaction(editingTransaction._id);
                                await queryClient.invalidateQueries({
                                    queryKey: ['transactions'],
                                });
                                await queryClient.invalidateQueries({
                                    queryKey: ['accounts'],
                                });
                                handleCloseEditModal();
                            }
                        }}>
                        Delete
                    </button>
                </form>
            </CustomModal>

            {(maxCount > 10 || maxCount == -1) && transactions.length > 10 && (
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
                                                            (e.target as HTMLInputElement).value,
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
                                                    page === 'left-ellipsis' ? 'left' : 'right',
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
