"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { ApiError } from "@/lib/api";
import { fetchUsers } from "@/service/user-service";
import { useDashboardSearch } from "@/context/search-context";
import { useUserPagination } from "@/hooks/users/use-user-pagination";
import type { TableResponse, UserFilter } from "@/feature/people/type/people-type";

export function useUserData(management: boolean) {
    const { search } = useDashboardSearch();

    const [debouncedSearch] = useDebounce(
        search.trim(),
        300
    );

    const pagination = useUserPagination(debouncedSearch);

    const {
        page,
        pageSize,
        pageInput,
        setPage,
        setPageInput,
        changePageSize,
        resetPage,
    } = pagination;

    const [filter, setFilter] = useState<UserFilter>("all");

    // Fetch users using TanStack Query.
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

    // Handle API errors.
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

    // Dashboard filters locally, User Management filters through backend.
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

    // Calculate total pages.
    const totalPages = management
        ? data?.total_pages ?? 1
        : Math.max(
            1,
            Math.ceil(filteredUsers.length / pageSize)
        );

    // Get records for the currently selected page.
    const pageRows = management
        ? filteredUsers
        : filteredUsers.slice(
            (page - 1) * pageSize,
            page * pageSize
        );

    const totalMatches = management
        ? data?.filtered_total ?? 0
        : filteredUsers.length;

    // Calculate the displayed record range.
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

    // Change the selected filter and reset the page.
    function changeFilter(value: UserFilter) {
        setFilter(value);
        resetPage();
    }

    // Validate the Go to Page input.
    function goToPage() {
        pagination.goToPage(totalPages);
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

        setPage,
        setPageInput,
        changePageSize,
        goToPage,
        changeFilter,
        refetch: query.refetch,
    };
}