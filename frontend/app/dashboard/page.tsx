import NetWorth from '@/Components/NetWorth';
import TransactionForm from '@/Components/TransactionForm';
import { Pencil } from 'lucide-react';

const page = () => {
    return (
        <main className="bg-white lg:bg-gray-200 flex justify-center items-center min-h-screen w-[calc(100%-var(--nav-width))] ml-(--nav-width)">
            <section className="w-full lg:bg-white lg:rounded-lg lg:shadow-2xl lg:w-5xl p-4 flex gap-4">
                <div className="w-2/5 flex justify-center ">
                    <NetWorth />
                </div>
                <div className="w-3/5 flex justify-center">
                    <div className="flex flex-col w-full gap-4">
                        <div className="collapse collapse-arrow font-mono bg-gray-100 p-2">
                            <input
                                type="checkbox"
                                name="my-accordion"
                                defaultChecked
                            />
                            <div className="collapse-title ml-8 font-bold text-xl">
                                NEW TRANSACTION
                            </div>
                            <div className="collapse-content">
                                <div className="tabs tabs-lift">
                                    <input
                                        type="radio"
                                        name="my_tabs_3"
                                        className="tab grow font-bold  [--color-base-content:#db2828]"
                                        aria-label="Expenses"
                                        defaultChecked
                                    />
                                    <div className="tab-content bg-gray-50 border-gray-300 p-6">
                                        <TransactionForm type="expense" />
                                    </div>

                                    <input
                                        type="radio"
                                        name="my_tabs_3"
                                        className="tab grow font-bold  [--color-base-content:#000] "
                                        aria-label="Transfer"
                                    />
                                    <div className="tab-content bg-gray-50 border-gray-300 p-6">
                                        <TransactionForm type="transfer" />
                                    </div>

                                    <input
                                        type="radio"
                                        name="my_tabs_3"
                                        className="tab grow font-bold before:[--radius-start:0] [--color-base-content:#099f5d]"
                                        aria-label="Income"
                                    />
                                    <div className="tab-content last bg-gray-50 border-gray-300 p-6">
                                        <TransactionForm type="income" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="collapse collapse-arrow font-mono bg-gray-100 p-2">
                            <input
                                type="checkbox"
                                name="my-accordion"
                                defaultChecked
                            />
                            <div className="collapse-title ml-8 font-bold text-xl">
                                RECENT TRANSACTIONS
                            </div>
                            <div className="collapse-content">
                                <ul className="list rounded-box">

                                    <li className="list-row ">
                                        <div className='list-col-grow'>
                                            <div className='text-base'>Car</div>
                                            <div className="text-xs uppercase font-semibold opacity-60">
                                                31 Oct, 2025
                                            </div>
                                        </div>
                                        <div className='text-lg flex justify-center items-center'>
                                            -100.00 USD
                                        </div>
                                        <button type="button" className="btn btn-square btn-ghost">
                                            <Pencil />
                                        </button>
                                    </li>

                                    

                                    <li className="list-row">
                                        <div className='list-col-grow'>
                                            <div className='text-base'>Car</div>
                                            <div className="text-xs uppercase font-semibold opacity-60">
                                                2 Nov, 2025
                                            </div>
                                        </div>
                                        <div className='text-lg flex justify-center items-center'>
                                            -100.00 USD
                                        </div>
                                        <button type="button" className="btn btn-square btn-ghost">
                                            <Pencil />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default page;
