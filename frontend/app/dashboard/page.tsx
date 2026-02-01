'use client';

import Initializer from '@/Components/providers/Initializer';
import NetWorth from '@/Components/dashboard/NetWorth';
import TransactionForm from '@/Components/transactions/TransactionForm';
import TransactionsList from '@/Components/transactions/TransactionsList';
import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CustomCollapse from '@/Components/Custom/CustomCollapse';
const fields = ['expense', 'transfer', 'income'];

const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState('expense');

    return (
        <main className="bg-base-200 min-h-screen w-full lg:w-[calc(100%-var(--nav-width))] lg:ml-(--nav-width) p-6 lg:p-12 transition-all duration-300">
            <Initializer rates />
            <motion.section className="w-full bg-transparent lg:p-4 flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-2/5 flex justify-center">
                    <NetWorth />
                </div>
                <div className="w-full lg:w-3/5 flex justify-center overflow-visible">
                    <div className="flex flex-col w-full gap-4 ">
                        {/* New Transaction Collapse */}
                        <CustomCollapse id="new-transaction-collapse" title="NEW TRANSACTION">
                            <div className="tabs tabs-lift">
                                {fields.map((type: string) => (
                                    <Fragment key={type}>
                                        <input
                                            type="radio"
                                            name="tabs"
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
                                        <div className="tab-content bg-base-100 border-base-300 min-h-65 overflow-visible">
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
                                                                type as
                                                                    | 'expense'
                                                                    | 'income'
                                                                    | 'transfer'
                                                            }
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </Fragment>
                                ))}
                            </div>
                        </CustomCollapse>

                        {/* Recent Transactions Collapse */}
                        <CustomCollapse title="RECENT TRANSACTIONS">
                            <TransactionsList maxCount={6} />
                        </CustomCollapse>
                    </div>
                </div>
            </motion.section>
        </main>
    );
};

export default DashboardPage;
