import { useState } from 'react';

interface TransactionsPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const TransactionsPagination = ({
    currentPage,
    totalPages,
    onPageChange,
}: TransactionsPaginationProps) => {
    const [inputMode, setInputMode] = useState<'left' | 'right' | null>(null);

    const getPages = () => {
        const pages = [];
        pages.push(1);

        if (currentPage > 3) pages.push('left-ellipsis');

        for (
            let i = Math.max(2, currentPage - 1);
            i <= Math.min(totalPages - 1, currentPage + 1);
            i++
        ) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) pages.push('right-ellipsis');
        if (totalPages > 1) pages.push(totalPages);

        return pages;
    };

    return (
        <div className="flex justify-center mt-4">
            <div className="join">
                <button
                    className="join-item btn"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}>
                    «
                </button>

                {getPages().map((page) => {
                    if (page === 'left-ellipsis' || page === 'right-ellipsis') {
                        const isInput =
                            page === 'left-ellipsis' ? inputMode === 'left' : inputMode === 'right';

                        if (isInput) {
                            return (
                                <input
                                    key={page}
                                    className="join-item btn w-16 px-1"
                                    type="number"
                                    autoFocus
                                    min={1}
                                    max={totalPages}
                                    onBlur={() => setInputMode(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = parseInt(
                                                (e.target as HTMLInputElement).value,
                                            );
                                            if (!isNaN(val) && val >= 1 && val <= totalPages) {
                                                onPageChange(val);
                                            }
                                            setInputMode(null);
                                        }
                                    }}
                                />
                            );
                        }

                        return (
                            <button
                                key={page}
                                className="join-item btn"
                                onClick={() =>
                                    setInputMode(page === 'left-ellipsis' ? 'left' : 'right')
                                }>
                                ...
                            </button>
                        );
                    }

                    return (
                        <button
                            key={page}
                            className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                            onClick={() => onPageChange(page as number)}>
                            {page}
                        </button>
                    );
                })}

                <button
                    className="join-item btn"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}>
                    »
                </button>
            </div>
        </div>
    );
};

export default TransactionsPagination;
