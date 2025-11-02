const NetWorth = () => {
  return (
        <div className="collapse collapse-arrow font-mono bg-gray-100 p-2">
            <input type="checkbox" name="my-accordion" defaultChecked />
            <div className="collapse-title ml-5 flex justify-between items-center font-bold text-xl"><h1 className='inline'>NET WORTH</h1><span>30,000 USD</span></div>
            <div className='collapse-content ml-2'>
                <div className="collapse">  
                    <input type="checkbox" name="my-accordion-1" defaultChecked />
                    <div className="collapse-title p-4 flex justify-between items-center font-bold text-lg"><h1 className='inline'>Cash</h1><span>10,000 USD</span></div>
                    <div className='collapse-content'>
                        <div className="accounts-worth">
                            <h3>Alex's Wallet</h3>
                            <div className='flex flex-col items-end'>
                                <h3>428.82 USD</h3>
                                <h3>0.00 EUR</h3>
                                <h3>0 JPY</h3>
                            </div>
                        </div>
                        <div className='divider [--color-base-content:lab(27_0_0)]'></div>
                        <div className="accounts-worth">
                            <h3>bobs's Wallet</h3>
                            <div className='flex flex-col items-end'>
                                <h3>1,127.85 USD</h3>
                                <h3>300.00 EUR</h3>
                                <h3>0 JPY</h3>
                            </div>
                        </div>
                        </div>
                </div>
                <div className="collapse">
                    <input type="checkbox" name="my-accordion-1" />
                    <div className="collapse-title p-4 flex justify-between items-center font-bold text-lg"><h1 className='inline'>Bank</h1><span>10,000 USD</span></div>
                    <div className="collapse-content accounts-worth">
                        <h3>Checking</h3>
                        <div className='flex flex-col items-end'>
                            <h3>8,501.75 USD</h3>
                            <h3>0.00 EUR</h3>
                            <h3>0 JPY</h3>
                        </div>
                    </div>
                </div>
                <div className="collapse">
                    <input type="checkbox" name="my-accordion-1" />
                    <div className="collapse-title p-4 flex justify-between items-center font-bold text-lg"><h1 className='inline'>Credit</h1><span>10,000 USD</span></div>
                    <div className="collapse-content accounts-worth">
                        <h3>MasterCard *6803</h3>
                        <div className='flex flex-col items-end'>
                            <h3>0 JPY</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NetWorth
