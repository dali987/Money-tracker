import React, { CSSProperties } from 'react';
import CustomModal from '@/Components/Custom/CustomModal';
import { SquarePen } from 'lucide-react';
import TransactionForm from '@/Components/transactions/TransactionForm';
import { Transaction } from '@/types';

interface EditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction;
    onDelete: (id: string) => void;
}

const EditTransactionModal = ({
    isOpen,
    onClose,
    transaction,
    onDelete,
}: EditTransactionModalProps) => {
    return (
        <CustomModal isOpen={isOpen} onClose={onClose} title="Edit Transaction" Icon={SquarePen}>
            {transaction && (
                <div className="tabs tabs-lift p-6 pb-0">
                    {['expense', 'transfer', 'income'].map((type) => (
                        <React.Fragment key={type}>
                            <input
                                type="radio"
                                name="edit-tabs"
                                style={{
                                    '--color-base-content':
                                        type === 'expense'
                                            ? '#fb2c36'
                                            : type === 'income'
                                              ? 'oklch(72.3% 0.219 149.579)'
                                              : '',
                                } as CSSProperties}
                                className="tab grow font-bold transition-all duration-300"
                                aria-label={type}
                                defaultChecked={transaction.type === type}
                            />
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <TransactionForm
                                    type={type as 'expense' | 'income' | 'transfer'}
                                    action={{
                                        type: 'edit',
                                        id: transaction._id,
                                    }}
                                    onSuccess={onClose}
                                />
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            )}
            <form method="dialog" className="flex justify-end items-center">
                <button
                    className="btn btn-error text-white m-6"
                    onClick={() => {
                        if (transaction) {
                            onDelete(transaction._id);
                            onClose();
                        }
                    }}>
                    Delete
                </button>
            </form>
        </CustomModal>
    );
};

export default EditTransactionModal;
