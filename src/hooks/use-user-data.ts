"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { fetchUsers } from "@/service/user-service";

import { useDashboardSearch } from "@/context/search-context";
import { DEFAULT_PAGE_SIZE } from "@/constant/people";

import type { TableResponse, UserFilter } from "@/feature/people/type/people-type";

export function useUserData(management: boolean) {
    const { search } = useDashboardSearch();
    const latestRequestId = useRef(0);
    const [data, setData] = useState<TableResponse | null>(null);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [pageInput, setPageInput] = useState("1");
    const [filter, setFilter] = useState<UserFilter>("all");
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch users from FastAPI.
    const loadUsers = useCallback(async () => {
        const requestId = ++latestRequestId.current;

        setLoading(true);
        setError("");

        try {
            const result = await fetchUsers({
                management,
                page,
                pageSize,
                search: debouncedSearch,
                filter,
            });

            if (requestId !== latestRequestId.current) return;

            setData(result);
        } catch (err) {
            if (requestId !== latestRequestId.current) return;

            if (err instanceof ApiError) {
                if (err.status === 403) {
                    setError("Administrator permission required.");
                } else if (err.status === 401) {
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

    // Wait 300ms before applying search.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
            setPageInput("1");
        }, 300);

        return () => window.clearTimeout(timer);
    }, [search]);

    // Reload when request parameters change.
    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    // Synchronize Go-to-Page input.
    useEffect(() => {
        setPageInput(String(page));
    }, [page]);

    // Dashboard uses local filtering, User Management uses backend filtering.
    const filteredUsers = useMemo(() => {
        if (!data) return [];

        if (management) return data.users;

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

    const startRow = totalMatches === 0
        ? 0
        : (page - 1) * pageSize + 1;

    const endRow = totalMatches === 0
        ? 0
        : Math.min(
            totalMatches,
            startRow + pageRows.length - 1
        );

    function changeFilter(value: UserFilter) {
        setFilter(value);
        setPage(1);
        setPageInput("1");
    }

    function changePageSize(value: number) {
        setPageSize(value);
        setPage(1);
        setPageInput("1");
    }

    function goToPage() {
        const requestedPage = Number(pageInput);

        if (
            !Number.isInteger(requestedPage) ||
            requestedPage < 1 ||
            requestedPage > totalPages
        ) {
            setPageInput(String(page));
            return;
        }

        setPage(requestedPage);
        setPageInput(String(requestedPage));
    }

    function refreshAfterDelete(deletedUserId: number) {
        const deletedLastRow =
            management &&
            page > 1 &&
            pageRows.length === 1 &&
            pageRows[0].id === deletedUserId;

        if (deletedLastRow) {
            setPage((current) => current - 1);
        } else {
            void loadUsers();
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

        setPage,
        setPageInput,
        changeFilter,
        changePageSize,
        goToPage,
        loadUsers,
        refreshAfterDelete,
    };
}