import SelectDropdown from '@/Components/Custom/SelectDropdown';

const RecurringFrequencySelect = ({ initialData }: { initialData?: string }) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            <label htmlFor="frequency" className="label text-base text-base-content">
                Frequency
            </label>
            <SelectDropdown
                name="frequency"
                options={[
                    { label: 'Daily', value: 'daily' },
                    { label: 'Weekly', value: 'weekly' },
                    { label: 'Monthly', value: 'monthly' },
                    { label: 'Yearly', value: 'yearly' },
                ]}
                defaultValue={initialData || 'monthly'}
                className="w-full"
            />
        </div>
    );
};

export default RecurringFrequencySelect;
