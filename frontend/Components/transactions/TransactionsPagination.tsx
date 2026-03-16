import { useCallback } from 'react';

interface TransactionsPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

const TransactionsPagination = ({
    currentPage,
    totalPages,
    onPageChange,
    isLoading = false,
}: TransactionsPaginationProps) => {
    const getVisiblePages = useCallback(() => {
        const pages: (number | 'left-ellipsis' | 'right-ellipsis')[] = [];

        pages.push(1);

        if (currentPage > 3) {
            pages.push('left-ellipsis');
        }

        for (
            let i = Math.max(2, currentPage - 1);
            i <= Math.min(totalPages - 1, currentPage + 1);
            i++
        ) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push('right-ellipsis');
        }

        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    }, [currentPage, totalPages]);

    const handleJumpToPage = (value: string) => {
        const pageNum = parseInt(value, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum);
        }
    };

    const renderEllipsisInput = (key: string) => (
        <input
            key={key}
            className="join-item btn w-16 px-1 text-center font-normal"
            type="number"
            min={1}
            max={totalPages}
            placeholder="..."
            disabled={isLoading}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    handleJumpToPage((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                }
            }}
        />
    );

    const renderPageButton = (page: number) => (
        <button
            key={page}
            className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
            onClick={() => onPageChange(page)}
            disabled={isLoading || currentPage === page}
            aria-current={currentPage === page ? 'page' : undefined}>
            {page}
        </button>
    );

    return (
        <div className="flex justify-center mt-4">
            <div className="join">
                <button
                    className="join-item btn"
                    disabled={currentPage === 1 || isLoading}
                    onClick={() => onPageChange(currentPage - 1)}
                    aria-label="Previous page">
                    «
                </button>

                {getVisiblePages().map((page) => {
                    if (page === 'left-ellipsis' || page === 'right-ellipsis') {
                        return renderEllipsisInput(page);
                    }

                    return renderPageButton(page);
                })}

                <button
                    className="join-item btn"
                    disabled={currentPage === totalPages || isLoading}
                    onClick={() => onPageChange(currentPage + 1)}
                    aria-label="Next page">
                    »
                </button>
            </div>
        </div>
    );
};

export default TransactionsPagination;
