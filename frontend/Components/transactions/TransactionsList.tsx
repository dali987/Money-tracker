import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAccounts } from '@/hooks/useAccounts';
import { usePaginatedTransactions } from '@/hooks/useTransactions';
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
import { Transaction, TransactionFilter } from '@/types';

interface TransactionsListProps {
    maxCount: number;
    onAddClick?: () => void;
    filters?: TransactionFilter;
}

const ITEMS_PER_PAGE = 10;

const TransactionsList = ({ maxCount, onAddClick, filters }: TransactionsListProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data: accounts = [], isLoading: isAccountsLoading } = useAccounts();

    const isLimited = maxCount !== -1;
    const fetchLimit = isLimited ? maxCount : ITEMS_PER_PAGE;
    const fetchPage = isLimited ? 1 : currentPage;

    const {
        data: paginatedData,
        isLoading: isTransactionsLoading,
        isError: isPaginatedError,
    } = usePaginatedTransactions(fetchPage, fetchLimit, filters);

    const transactions = paginatedData?.data ?? [];

    const totalPages = isLimited ? 1 : (paginatedData?.pagination?.totalPages ?? 1);

    const queryClient = useQueryClient();
    const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);
    const authUser = useAuthStore((state) => state.authUser);
    const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
    const { isTransactionsError } = useTransactionStore();
    const { isError: isAccountsError } = useAccountStore();

    const accountNameMap = useMemo(() => {
        if (!accounts?.length) return {};
        return accounts.reduce((map: Record<string, string>, account) => {
            map[account._id] = account.name;
            return map;
        }, {});
    }, [accounts]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleDelete = async (id: string) => {
        await deleteTransaction(id);
        await queryClient.invalidateQueries({ queryKey: ['transactions'] });
        await queryClient.invalidateQueries({ queryKey: ['accounts'] });
    };

    if (isTransactionsError || isAccountsError || isPaginatedError) {
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
                            queryClient.invalidateQueries({ queryKey: ['transactions'] });
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
                {Array.from({ length: isLimited ? Math.min(6, maxCount) : 6 }).map((_, i) => (
                    <TransactionSkeleton key={i} />
                ))}
            </motion.div>
        );
    }

    const showPagination = !isLimited && totalPages > 1;

    return (
        <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.ul
                    key={`list-page-${currentPage}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="list rounded-box overflow-clip">
                    {transactions.length > 0 ? (
                        <AnimatePresence mode="wait">
                            {authUser &&
                                accounts.length > 0 &&
                                transactions.map((transaction) => (
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

            {showPagination && (
                <TransactionsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={isTransactionsLoading}
                />
            )}
        </div>
    );
};

export default TransactionsList;
