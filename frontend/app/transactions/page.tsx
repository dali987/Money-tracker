import Initializer from '@/Components/Initializer';
import SelectDropdown from '@/Components/SelectDropdown';
import TransactionsList from '@/Components/TransactionsList';
import { CalendarDays, Plus } from 'lucide-react';

const page = () => {
    return (
        <main className="bg-white lg:bg-gray-200 flex justify-center items-center min-h-screen w-[calc(100%-var(--nav-width))] ml-(--nav-width)">
            <Initializer transactions accounts />
            <section className="w-full lg:bg-white lg:rounded-lg lg:shadow-2xl lg:w-5xl p-4 flex flex-col gap-4">
                <div className="flex justify-between">
                    <button className="btn btn-outline flex text-base gap-2 items-center justify-center p-3">
                        <Plus size={25} /> New
                    </button>
                    <div className="join">
                        <SelectDropdown />
                        <button className="btn btn-outline text-base join-item p-3">eazeaz</button>
                    </div>
                </div>
                <div className="font-mono">
                    <TransactionsList />
                </div>
            </section>
        </main>
    );
};

export default page;
