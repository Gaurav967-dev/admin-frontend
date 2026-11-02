"use client";

import { useMemo, useState, type SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { ApiError } from "@/lib/api";
import { fetchUsers } from "@/service/user-service";
import { useDashboardSearch } from "@/context/search-context";
import { DEFAULT_PAGE_SIZE } from "@/constant/people";
import type { TableResponse, UserFilter } from "@/feature/people/type/people-type";

export function useUserData(management: boolean) {
    const { search } = useDashboardSearch();
    const [debouncedSearch] = useDebounce(search.trim(), 300);

    const [pageSelection, setPageSelection] = useState({
        page: 1,
        search: search.trim(),
    });

    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [filter, setFilter] = useState<UserFilter>("all");
    const [pageInputDraft, setPageInputDraft] = useState<string | null>(null);

    // New search terms automatically start on page 1.
    const searchIsCurrent =
        pageSelection.search === debouncedSearch;

    const page = searchIsCurrent
        ? pageSelection.page
        : 1;

    const pageInput =
        searchIsCurrent && pageInputDraft !== null
            ? pageInputDraft
            : String(page);

    // TanStack Query owns server data and request state.
    const query = useQuery<TableResponse, Error>({
        queryKey: management
            ? [
                "users",
                "management",
                page,
                pageSize,
                debouncedSearch,
                filter,
            ]
            : ["users", "dashboard"],

        queryFn: () =>
            fetchUsers({
                management,
                page,
                pageSize,
                search: debouncedSearch,
                filter,
            }),

        retry: false,
    });

    const data = query.data ?? null;
    const loading = query.isPending || query.isFetching;

    let error = "";

    if (query.error instanceof ApiError) {
        if (query.error.status === 403) {
            error = "Administrator permission required.";
        } else if (
            query.error.status === 401 ||
            query.error.status === 419
        ) {
            error = "Your session has expired.";
        } else {
            error = query.error.message;
        }
    } else if (query.error) {
        error = "Unable to load users.";
    }

    // Dashboard filters locally, User Management is already filtered by FastAPI.
    const filteredUsers = useMemo(() => {
        if (!data) return [];

        if (management) {
            return data.users;
        }

        const term = search.trim().toLowerCase();

        return data.users.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                user.role.toLowerCase().includes(term) ||
                String(user.id).includes(term);

            const matchesFilter =
                filter === "all" ||
                (filter === "active" && user.is_active) ||
                (filter === "inactive" && !user.is_active) ||
                (filter === "admins" && user.role === "admin");

            return matchesSearch && matchesFilter;
        });
    }, [data, management, search, filter]);

    const totalPages = management
        ? data?.total_pages ?? 1
        : Math.max(
            1,
            Math.ceil(filteredUsers.length / pageSize)
        );

    const pageRows = management
        ? filteredUsers
        : filteredUsers.slice(
            (page - 1) * pageSize,
            page * pageSize
        );

    const totalMatches = management
        ? data?.filtered_total ?? 0
        : filteredUsers.length;

    const startRow =
        totalMatches === 0
            ? 0
            : (page - 1) * pageSize + 1;

    const endRow =
        totalMatches === 0
            ? 0
            : Math.min(
                totalMatches,
                startRow + pageRows.length - 1
            );

    // Previous, Next, or another page selection.
    function changePage(update: SetStateAction<number>) {
        const nextPage =
            typeof update === "function"
                ? update(page)
                : update;

        setPageSelection({
            page: nextPage,
            search: debouncedSearch,
        });

        setPageInputDraft(null);
    }

    function changePageSize(value: number) {
        setPageSize(value);

        setPageSelection({
            page: 1,
            search: debouncedSearch,
        });

        setPageInputDraft(null);
    }

    function changeFilter(value: UserFilter) {
        setFilter(value);

        setPageSelection({
            page: 1,
            search: debouncedSearch,
        });

        setPageInputDraft(null);
    }

    function goToPage() {
        const requestedPage = Number(pageInput);

        if (
            !Number.isInteger(requestedPage) ||
            requestedPage < 1 ||
            requestedPage > totalPages
        ) {
            setPageInputDraft(null);
            return;
        }

        changePage(requestedPage);
    }

    return {
        data,
        page,
        pageSize,
        pageInput,
        filter,
        loading,
        error,
        pageRows,
        totalPages,
        totalMatches,
        startRow,
        endRow,

        setPage: changePage,
        setPageInput: setPageInputDraft,
        changeFilter,
        changePageSize,
        goToPage,

        // TanStack Query refresh function.
        refetch: query.refetch,
    };
}