"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type SetStateAction } from "react";
import { ApiError } from "@/lib/api";
import { fetchUsers } from "@/service/user-service";
import { useDashboardSearch } from "@/context/search-context";
import { DEFAULT_PAGE_SIZE } from "@/constant/people";
import type { TableResponse, UserFilter } from "@/feature/people/type/people-type";

export function useUserData(management: boolean) {
    const { search } = useDashboardSearch();
    const latestRequestId = useRef(0);
    const lastAppliedSearch = useRef(search.trim());
    const [data, setData] = useState<TableResponse | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    const [pageInputDraft, setPageInputDraft] = useState<string | null>(null);
    const pageInput = pageInputDraft ?? String(page);
    const [filter, setFilter] = useState<UserFilter>("all");
    const [debouncedSearch, setDebouncedSearch] = useState(search.trim());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPage = useCallback(async () => {
        const requestId = ++latestRequestId.current;

        try {
            const result = await fetchUsers({
                management,
                page,
                pageSize,
                search: debouncedSearch,
                filter,
            });

            if (requestId !== latestRequestId.current) {
                return;
            }

            setData(result);
            setError("");
        } catch (err) {
            if (requestId !== latestRequestId.current) {
                return;
            }

            if (err instanceof ApiError) {
                if (err.status === 403) {
                    setError("Administrator permission required.");
                } else if (err.status === 401 || err.status === 419) {
                    setError("Your session has expired.");
                } else {
                    setError(err.message);
                }
            } else {
                setError("Unable to load users.");
            }
        } finally {
            if (requestId === latestRequestId.current) {
                setLoading(false);
            }
        }
    }, [
        management,
        page,
        pageSize,
        debouncedSearch,
        filter,
    ]);

    // Initial fetch and refetch when pagination/filter values change.
    useEffect(() => {
        void fetchPage();
    }, [fetchPage]);

    // Called by Refresh, Retry, and CRUD success handlers.
    function loadUsers() {
        setLoading(true);
        setError("");
        void fetchPage();
    }

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const value = search.trim();

            if (value === lastAppliedSearch.current) {
                return;
            }

            lastAppliedSearch.current = value;

            setLoading(true);
            setDebouncedSearch(value);
            setPage(1);
            setPageInputDraft(null);
        }, 300);

        return () => window.clearTimeout(timer);
    }, [search]);

    // Dashboard: local filtering, Users page: backend filtering.
    const filteredUsers = useMemo(() => {
        if (!data) return [];

        if (management) {
            return data.users;
        }

        const query = search.trim().toLowerCase();

        return data.users.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.role.toLowerCase().includes(query) ||
                String(user.id).includes(query);

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

    // Used by Previous and Next.
    function changePage(update: SetStateAction<number>) {
        setLoading(true);
        setPage(update);
        setPageInputDraft(null);
    }

    function changeFilter(value: UserFilter) {
        if (value === filter) return;

        setLoading(true);
        setFilter(value);
        setPage(1);
        setPageInputDraft(null);
    }

    function changePageSize(value: number) {
        if (value === pageSize) return;

        setLoading(true);
        setPageSize(value);
        setPage(1);
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

        if (requestedPage !== page) {
            setLoading(true);
            setPage(requestedPage);
        }

        setPageInputDraft(null);
    }

    function refreshAfterDelete(deletedUserId: number) {
        const deletedLastRow =
            management &&
            page > 1 &&
            pageRows.length === 1 &&
            pageRows[0].id === deletedUserId;

        if (deletedLastRow) {
            setLoading(true);
            setPage(page - 1);
            setPageInputDraft(null);
        } else {
            loadUsers();
        }
    }

    return {
        data,
        page,
        pageSize,
        pageInput,
        filter,
        loading,
        error,
        filteredUsers,
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
        loadUsers,
        refreshAfterDelete,
    };
}