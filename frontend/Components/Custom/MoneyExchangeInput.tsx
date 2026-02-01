import NumberInput from '@/Components/Custom/NumberInput';
import SelectAccountDropdown from '@/Components/Custom/SelectAccountDropdown';

interface MoneyExchangeInputProps {
    options: { name: string; type: string; id: string }[];
    onSelect: (option: { name: string; type: string; id: string }) => void;
    disabled?: boolean;
    name?: string;
    selectedId?: string;
}

const MoneyExchangeInput = ({
    options,
    onSelect,
    disabled,
    name,
    selectedId,
}: MoneyExchangeInputProps) => {
    return (
        <>
            <SelectAccountDropdown
                name={name}
                className="w-full"
                options={options}
                defaultValue={!selectedId}
                selectedId={selectedId}
                onSelect={onSelect}
            />
            <div className="join">
                <NumberInput className="grow" name="amount" disabled={disabled} />
            </div>
        </>
    );
};

export default MoneyExchangeInput;
