"use client";

import { useState, type SetStateAction } from "react";

import { DEFAULT_PAGE_SIZE } from "@/constant/people";

type PageSelection = {
    page: number;
    search: string;
};

export function useUserPagination(search: string) {
    const [pageSelection, setPageSelection] = useState<PageSelection>({ page: 1, search });
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [pageInputDraft, setPageInputDraft] = useState<string | null>(null);
    const searchIsCurrent = pageSelection.search === search;
    const page = searchIsCurrent ? pageSelection.page : 1;
    const pageInput = searchIsCurrent && pageInputDraft !== null ? pageInputDraft : String(page);

    function setPage(update: SetStateAction<number>) {
        const nextPage =
            typeof update === "function" ? update(page) : update;

        setPageSelection({
            page: nextPage,
            search,
        });

        setPageInputDraft(null);
    }

    function changePageSize(value: number) {
        setPageSize(value);

        setPageSelection({
            page: 1,
            search,
        });

        setPageInputDraft(null);
    }

    function resetPage() {
        setPageSelection({
            page: 1,
            search,
        });

        setPageInputDraft(null);
    }

    function goToPage(totalPages: number) {
        const requestedPage = Number(pageInput);

        if (!Number.isInteger(requestedPage) || requestedPage < 1 || requestedPage > totalPages) {
            setPageInputDraft(null);
            return;
        }

        setPage(requestedPage);
    }

    return {
        page,
        pageSize,
        pageInput,

        setPage,
        setPageInput: setPageInputDraft,
        changePageSize,
        resetPage,
        goToPage,
    };
}