import { motion, AnimatePresence } from 'framer-motion';
import { RecurringTransaction } from '@/types';
import { Clock } from 'lucide-react';
import TransactionForm from '@/Components/transactions/TransactionForm';
import CustomModal from '@/Components/Custom/CustomModal';
import React, { useState } from 'react';

interface RecurringFormProps {
    existingTransaction?: RecurringTransaction | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const RecurringForm = ({ existingTransaction, isOpen, onClose, onSuccess }: RecurringFormProps) => {
    const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'transfer'>(
        existingTransaction?.type || 'expense',
    );

    const [prevIsOpen, setPrevIsOpen] = useState(false);
    const [prevId, setPrevId] = useState<string | undefined>(undefined);

    if (isOpen !== prevIsOpen || existingTransaction?._id !== prevId) {
        setPrevIsOpen(isOpen);
        setPrevId(existingTransaction?._id);
        if (isOpen) {
            setActiveTab(existingTransaction?.type || 'expense');
        }
    }

    return (
        <CustomModal
            isOpen={isOpen}
            onClose={onClose}
            title={existingTransaction ? 'Edit Recurring Rule' : 'New Recurring Rule'}
            Icon={Clock}>
            <div className="tabs tabs-lift p-4">
                {(['expense', 'transfer', 'income'] as const).map((type) => (
                    <React.Fragment key={type}>
                        <input
                            type="radio"
                            name="recurring-tabs"
                            style={
                                {
                                    '--color-base-content':
                                        type === 'expense'
                                            ? '#fb2c36'
                                            : type === 'income'
                                              ? 'oklch(72.3% 0.219 149.579)'
                                              : '',
                                } as React.CSSProperties
                            }
                            className="tab grow font-bold transition-all duration-300"
                            aria-label={type}
                            checked={activeTab === type}
                            onChange={() => setActiveTab(type)}
                        />
                        <div className="tab-content bg-base-100 border-base-300 min-h-65 overflow-visible rounded-b-2xl">
                            <AnimatePresence mode="wait">
                                {activeTab === type && (
                                    <motion.div
                                        key={type}
                                        initial={{
                                            opacity: 0,
                                            x: 20,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            x: -20,
                                        }}
                                        transition={{
                                            duration: 0.3,
                                            ease: 'easeOut',
                                        }}
                                        className="p-4 lg:p-6">
                                        <TransactionForm
                                            type={
                                                existingTransaction
                                                    ? existingTransaction.type
                                                    : activeTab
                                            }
                                            action={
                                                existingTransaction
                                                    ? {
                                                          type: 'edit',
                                                          id: existingTransaction._id,
                                                      }
                                                    : 'create'
                                            }
                                            onSuccess={onSuccess}
                                            isRecurring={true}
                                            initialData={existingTransaction}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </CustomModal>
    );
};

export default RecurringForm;
