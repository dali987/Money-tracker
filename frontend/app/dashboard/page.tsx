import NetWorth from '@/Components/NetWorth';
import TransactionForm from '@/Components/TransactionForm';
import TransactionsList from '@/Components/TransactionsList';
import React from 'react';

const page = () => {
    return (
        <main className="bg-white lg:bg-gray-200 flex justify-center items-center min-h-screen w-[calc(100%-var(--nav-width))] ml-(--nav-width) p-16">
            <section className="w-full lg:bg-white lg:rounded-lg lg:shadow-2xl lg:w-5xl p-4 flex gap-4">
                <div className="w-2/5 flex justify-center ">
                    <NetWorth />
                </div>
                <div className="w-3/5 flex justify-center">
                    <div className="flex flex-col w-full gap-4">
                        <div className="collapse collapse-arrow font-mono bg-gray-100 p-2">
                            <input type="checkbox" name="my-accordion" defaultChecked />
                            <div className="collapse-title ml-8 font-bold text-xl">
                                NEW TRANSACTION
                            </div>
                            <div className="collapse-content">
                                <div className="tabs tabs-lift">
                                    {(['expense','transfer', 'income'] as const).map(
                                        (type: "expense" | "income" | "transfer", i: number) => (
                                            <React.Fragment key={type}>
                                                <input
                                                    type="radio"
                                                    name="tabs"
                                                    //@ts-ignore
                                                    style={{"--color-base-content": type === "expense" ? "#fb2c36" : type === "income" ? "oklch(72.3% 0.219 149.579)" : ""}}
                                                    className="tab grow font-bold transition"
                                                    aria-label={type}
                                                    defaultChecked
                                                />
                                                <div className="tab-content bg-gray-50 border-gray-300 p-6">
                                                    <TransactionForm type={type} />
                                                </div>
                                            </React.Fragment>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="collapse collapse-arrow font-mono bg-gray-100 p-2">
                            <input type="checkbox" name="my-accordion" defaultChecked />
                            <div className="collapse-title ml-8 font-bold text-xl">
                                RECENT TRANSACTIONS
                            </div>
                            <div className="collapse-content">
                                <TransactionsList />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default page;
