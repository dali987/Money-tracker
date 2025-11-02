import DateSelect from '@/Components/DateSelect';
import MultiSelectDropdown from '@/Components/MultiSelectDropdown';
import NumberInput from '@/Components/NumberInput';
import SelectDropdown from '@/Components/SelectDropdown';

const MoneyExchangeWithCurrency = ({
    options,
}: {
    options: { name: string; type: string }[];
}) => {
    return (
        <>
            <SelectDropdown className="w-full" options={options} />
            <div className="join">
                <NumberInput className="grow" />
                <select defaultValue="" className="select select-primary">
                    <option disabled={true}>Currency</option>
                    <option>USD</option>
                    <option>EUR</option>
                    <option>JYP</option>
                </select>
            </div>
        </>
    );
};

const TransactionForm = ({
    type,
}: {
    type: 'expense' | 'transfer' | 'income';
}) => {
    const options = [
        { name: "Alex's Wallet", type: 'Cash' },
        { name: "Bob's Wallet", type: 'Cash' },
        { name: 'Car', type: 'Asset' },
    ];

    return (
        <form action="">
            <fieldset className="fieldset w-full ">
                <label className="label text-base text-base-content">
                    From
                </label>
                <div className="flex gap-2">
                    <MoneyExchangeWithCurrency options={options} />
                </div>

                <label className="label text-base text-base-content">
                    Tags
                </label>
                {type === 'transfer' && (
                    <div className="flex gap-2">
                        <MoneyExchangeWithCurrency options={options} />
                    </div>
                )}
                <div className="flex gap-2">
                    <div className="flex flex-col gap-2 flex-1">
                        {type !== 'transfer' && (
                            <MultiSelectDropdown
                                formFieldName="countries"
                                options={['one', 'two', 'three']}
                                prompt="Choose or create tags"
                                className="flex-1"
                            />
                        )}
                        <input
                            type="text"
                            className="input focus:outline-offset-0 focus:outline-1 transition"
                            placeholder="Note"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <DateSelect />
                        <button className="btn btn-neutral btn-outline flex-1 p-2">
                            Add {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    </div>
                </div>
            </fieldset>
        </form>
    );
};

export default TransactionForm;
