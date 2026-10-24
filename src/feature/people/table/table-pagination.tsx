"use client";

import { Button } from "@/components/ui/button";
import { PAGE_SIZE_OPTIONS } from "@/constant/people";

type Props = {
    page: number;
    pageSize: number;
    pageInput: string;
    totalPages: number;
    totalMatches: number;
    startRow: number;
    endRow: number;
    loading: boolean;

    onPageInputChange: (value: string) => void;
    onPageSizeChange: (value: number) => void;
    onPrevious: () => void;
    onNext: () => void;
    onGoToPage: () => void;
};

export default function TablePagination({
    page,
    pageSize,
    pageInput,
    totalPages,
    totalMatches,
    startRow,
    endRow,
    loading,
    onPageInputChange,
    onPageSizeChange,
    onPrevious,
    onNext,
    onGoToPage,
}: Props) {
    return (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing {startRow}-{endRow} of {totalMatches} users
                </p>

                <div className="flex items-center gap-2">
                    <label
                        htmlFor="rows-per-page"
                        className="text-xs text-slate-600 dark:text-slate-300"
                    >
                        Rows per page
                    </label>

                    <select
                        id="rows-per-page"
                        value={pageSize}
                        onChange={(e) =>
                            onPageSizeChange(Number(e.target.value))
                        }
                        className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading || page <= 1}
                    onClick={onPrevious}
                >
                    Previous
                </Button>

                <span className="whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                    Page {page} of {totalPages}
                </span>

                <label htmlFor="go-to-page" className="sr-only">
                    Enter page number
                </label>

                <input
                    id="go-to-page"
                    type="number"
                    min={1}
                    max={totalPages}
                    step={1}
                    inputMode="numeric"
                    value={pageInput}
                    aria-label="Go to page number"
                    onChange={(e) =>
                        onPageInputChange(e.target.value)
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            onGoToPage();
                        }
                    }}
                    className="h-8 w-14 rounded-md border border-slate-200 bg-white px-2 text-center text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={onGoToPage}
                >
                    Go
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading || page >= totalPages}
                    onClick={onNext}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}