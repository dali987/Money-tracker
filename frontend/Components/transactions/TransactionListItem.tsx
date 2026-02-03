import { motion } from 'motion/react';
import { ArrowRight, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { Transaction, User } from '@/types';

const typeProperties = {
    transfer: {
        color: 'text-gray-500',
        symbol: '',
        account: 'fromAccount' as keyof Transaction,
    },
    income: {
        color: 'text-success',
        symbol: '+',
        account: 'toAccount' as keyof Transaction,
    },
    expense: {
        color: 'text-error',
        symbol: '-',
        account: 'fromAccount' as keyof Transaction,
    },
} as const;

interface TransactionListItemProps {
    transaction: Transaction;
    authUser: User;
    accountNameMap: Record<string, string>;
    onEditClick: (transaction: Transaction) => void;
}

const TransactionListItem = ({
    transaction,
    authUser,
    accountNameMap,
    onEditClick,
}: TransactionListItemProps) => {
    const properties = typeProperties[transaction.type];
    const getAccountId = (value: Transaction[keyof Transaction]) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && '_id' in value && value._id) return value._id;
        return '';
    };

    return (
        <motion.li
            className="list-row !"
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
                                {accountNameMap[getAccountId(transaction[properties.account])] || ''}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="truncate shrink">
                                    {accountNameMap[getAccountId(transaction.fromAccount)] || ''}
                                </span>
                                <ArrowRight className="shrink-0 opacity-50" size={16} />
                                <span className="truncate shrink">
                                    {accountNameMap[getAccountId(transaction.toAccount)] || ''}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="text-xs uppercase font-semibold opacity-60">
                        {format(new Date(transaction.date), 'dd MMM, yyyy')}
                    </div>
                    <p className="text-base-300 text-sm wrap-break-word lg:max-w-sm">
                        {transaction.note}
                    </p>
                </div>
                <div className="flex flex-wrap gap-1 lg:gap-2 w-full min-w-0">
                    {transaction.tags.map((tag: string) => (
                        <div key={tag} className="badge badge-soft text-xs lg:text-sm">
                            {tag}
                        </div>
                    ))}
                </div>
            </div>
            <div
                className={`text-base lg:text-lg flex justify-center text-center items-center shrink-0 ${properties.color}`}>
                {`${properties.symbol}${transaction.amount.toFixed(2)} ${authUser.baseCurrency}`}
            </div>
            <button
                type="button"
                className="btn btn-square btn-ghost self-center max-lg:btn-sm"
                onClick={() => onEditClick(transaction)}>
                <Pencil size={22} />
            </button>
        </motion.li>
    );
};

export default TransactionListItem;
