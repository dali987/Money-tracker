import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import TransactionSkeleton from '@/Components/states/TransactionSkeleton';
import EmptyState from '@/Components/states/EmptyState';
import ErrorState from '@/Components/states/ErrorState';
import TransactionListItem from './TransactionListItem';
import TransactionsPagination from './TransactionsPagination';
import EditTransactionModal from './EditTransactionModal';
import { useAccountStore } from '@/store/useAccountStore';
import { Transaction } from '@/types';

interface TransactionsListProps {
    maxCount: number;
    transactions?: Transaction[];
    isLoading?: boolean;
    onAddClick?: () => void;
}

const EMPTY_TRANSACTIONS: Transaction[] = [];

const TransactionsList = ({
    maxCount,
    transactions: externalTransactions,
    isLoading: externalIsLoading,
    onAddClick,
}: TransactionsListProps) => {
    const { data: accounts = [], isLoading: isAccountsLoading } = useAccounts();
    const { data: internalTransactions, isLoading: isInternalLoading } = useTransactions(
        externalTransactions ? undefined : {},
    );

    // prioritize external transactions if provided
    const transactions = externalTransactions ?? internalTransactions ?? EMPTY_TRANSACTIONS;

    const isTransactionsLoading = externalIsLoading ?? isInternalLoading;

    const queryClient = useQueryClient();
    const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);
    const authUser = useAuthStore((state) => state.authUser);
    const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
    const { isTransactionsError } = useTransactionStore();
    const { isError: isAccountsError } = useAccountStore();

    const [currentPage, setCurrentPage] = useState(1);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const itemsPerPage = 10;

    const [prevTransactions, setPrevTransactions] = useState(transactions);

    // Sync current page during render when transactions change
    if (transactions !== prevTransactions) {
        setPrevTransactions(transactions);
        setCurrentPage(1);
    }

    const accountNameMap = useMemo(() => {
        if (!accounts?.length) return {};
        return accounts.reduce((map: Record<string, string>, account) => {
            map[account._id] = account.name;
            return map;
        }, {});
    }, [accounts]);

    const displayedTransactions = useMemo(() => {
        if (maxCount !== -1) return transactions.slice(0, maxCount);
        const startIndex = (currentPage - 1) * itemsPerPage;
        return transactions.slice(startIndex, startIndex + itemsPerPage);
    }, [transactions, maxCount, currentPage]);

    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    const handleDelete = async (id: string) => {
        await deleteTransaction(id);
        await queryClient.invalidateQueries({ queryKey: ['transactions'] });
        await queryClient.invalidateQueries({ queryKey: ['accounts'] });
    };

    if (isTransactionsError || isAccountsError) {
        return (
            <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ErrorState
                        message={
                            isAccountsError
                                ? 'Failed to load accounts.'
                                : 'Failed to load transactions.'
                        }
                        onRetry={() => {
                            if (isAccountsError)
                                queryClient.invalidateQueries({ queryKey: ['accounts'] });
                            queryClient.invalidateQueries({ queryKey: ['transactions'] }); // Standard retry
                        }}
                    />
                </motion.div>
            </AnimatePresence>
        );
    }

    if (
        isCheckingAuth ||
        (isTransactionsLoading && transactions.length < 1) ||
        (isAccountsLoading && accounts.length < 1)
    ) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-8 p-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <TransactionSkeleton key={i} />
                ))}
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.ul
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="list rounded-box overflow-clip">
                    {displayedTransactions.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            {authUser &&
                                accounts.length > 0 &&
                                displayedTransactions.map((transaction) => (
                                    <TransactionListItem
                                        key={transaction._id}
                                        transaction={transaction}
                                        authUser={authUser}
                                        accountNameMap={accountNameMap}
                                        onEditClick={(t) => {
                                            setEditingTransaction(t);
                                            setIsEditModalOpen(true);
                                        }}
                                    />
                                ))}
                        </AnimatePresence>
                    ) : (
                        <EmptyState
                            action={
                                onAddClick
                                    ? { label: 'Add Transaction', onClick: onAddClick }
                                    : undefined
                            }
                        />
                    )}
                </motion.ul>
            </AnimatePresence>

            <EditTransactionModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingTransaction(null);
                }}
                transaction={editingTransaction!}
                onDelete={handleDelete}
            />

            {(maxCount > 10 || maxCount === -1) && transactions.length > 10 && (
                <TransactionsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default TransactionsList;
