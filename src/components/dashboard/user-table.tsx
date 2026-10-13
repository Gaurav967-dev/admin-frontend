"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RefreshCWIcon } from "@/components/icons/refresh-cw";
import { EyeIcon } from "@/components/icons/eye";
import { UsersIcon } from "@/components/icons/users";

import { useDashboardSearch } from "./search-context";

import { apiFetch, ApiError } from "@/lib/api";

import UserFormDialog from "./user-form-dialog";
import DeleteUserDialog from "./delete-user-dialog";

import type { DashboardResponse, DashboardUser, PaginatedUsersResponse } from "@/types/dashboard";

type Filter = "all" | "active" | "inactive" | "admins";

const filters: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Admins", value: "admins" },
];

type TableResponse = DashboardResponse & Partial<PaginatedUsersResponse>;

const PAGE_SIZE = 5;

export default function UserTable({
  management = false,
}: {
  management?: boolean;
}) {
  const { search } = useDashboardSearch();
  const latestRequestId = useRef(0);

  const [data, setData] = useState<TableResponse | null>(null);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const [viewUser, setViewUser] = useState<DashboardUser | null>(null);

  const [formOpen, setFormOpen] = useState(false);

  const [editingUser, setEditingUser] = useState<DashboardUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<DashboardUser | null>(null);

  const [notice, setNotice] = useState("");

  const loadUsers = useCallback(async () => {
    const requestId = ++latestRequestId.current;

    setLoading(true);
    setError("");

    try {
      let path = "/dashboard";

      if (management) {
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(PAGE_SIZE),
          search: debouncedSearch,
          status_filter: filter == "active" ? "active" : filter == "inactive" ? "inactive" : "all",
          role_filter: filter === "admins" ? "admin" : "all",
        });

        path = `/user?${params.toString()}`;
      }

      const result = await apiFetch<TableResponse>(path);

      if (requestId !== latestRequestId.current) {
        return;
      }

      setData(result);

    } catch (err) {
      if (requestId !== latestRequestId.current) {
        return;
      }

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
  }, [management, page, filter, debouncedSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    }
  }, [search]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];

    if (management) return data.users;

    const query = search.trim().toLowerCase();

    return data.users.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query) || user.role.toLowerCase().includes(query) || String(user.id).includes(query);

      const matchesFilter = filter === "all" || (filter === "active" && user.is_active) || (filter === "inactive" && !user.is_active) || (filter === "admins" && user.role === "admin");

      return matchesSearch && matchesFilter;
    });
  }, [data, management, search, filter]);

  const totalPages = management ? (data?.total_pages ?? 1) : Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const pageRows = management ? filteredUsers : filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalMatches = management ? (data?.filtered_total ?? 0) : filteredUsers.length;

  const startRow = totalMatches === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const endRow = totalMatches === 0 ? 0 : Math.min(totalMatches, startRow + pageRows.length - 1);

  function handleMutationSuccess(message: string) {
    setNotice(message);
    void loadUsers();
  }

  function handleDeleteSuccess(message: string, deletedUserId: number) {
    setNotice(message);

    const deletedLastRow = management && page > 1 && pageRows.length === 1 && pageRows[0].id === deletedUserId;

    if (deletedLastRow) {
      // Current page may no longer exist, changing page triggers a fresh API request.
      setPage((current) => current - 1);
    } else {
      void loadUsers();
    }
  }

  return (
    <div className="w-full">

      {/* Section title */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Users
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage and review registered users
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {management && (
            <Button
              type="button"
              onClick={() => {
                setEditingUser(null);
                setFormOpen(true);
              }}
              className="gap-2 bg-[#6048ce] text-white hover:bg-[#5039b7]"
            >
              <UsersIcon className="size 4" />
              Create User
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 dark:border-slate-700"
          >
            <RefreshCWIcon
              size={18}
              className={`flex size-[18px] shrink-0 items-center justify-center ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400"
        >
          <span>{notice}</span>
      
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
            className="text-lg leading-none"
          >
            x
          </button>
        </div>
      )}

      {/* Summary */}
      {data && (
        <div className="mb-6 flex flex-wrap gap-3">
          {[
            { label: "Total Users", value: data.total_users },
            { label: "Active", value: data.active_users },
            { label: "Admins", value: data.admins },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.label}
              </p>

              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-5 flex gap-6 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setFilter(item.value);
              setPage(1);
            }}
            className={`shrink-0 border-b-2 px-2 pb-3 pt-2 text-sm font-medium transition-colors
              ${filter === item.value ? "border-[#6048ce] text-[#6048ce]" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}
            `}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div
          role="status"
          className="flex min-h-52 flex-col items-center justify-center gap-3"
        >
          <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#6048ce]" />
          <p className="text-sm text-slate-500">Loading users...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30"
        >
          <p>{error}</p>

          <Button
            type="button"
            variant="outline"
            onClick={loadUsers}
            className="mt-4"
          >
            Try again
          </Button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && data && (
        <>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">

              <thead>
                <tr className="bg-[#f5f6f8] text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">

                  <th className="rounded-l-lg px-5 py-4">User ID</th>
                  <th className="px-3 py-4">Name</th>
                  <th className="px-3 py-4">Email</th>
                  <th className="px-3 py-4">Role</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="rounded-r-lg px-3 py-4 text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {pageRows.map((user) => (
                  <tr
                    key={user.id}
                    className="bg-white text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-colors hover:bg-slate-50 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <td className="rounded-l-lg border-y border-l border-slate-100 px-5 py-4 font-medium dark:border-slate-700">
                      IN-{String(user.id).padStart(5, "0")}
                    </td>

                    <td className="border-y border-slate-100 px-3 py-4 font-medium text-slate-900 dark:border-slate-700 dark:text-white">
                      {user.name}
                    </td>

                    <td className="border-y border-slate-100 px-3 py-4 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      {user.email}
                    </td>

                    <td className="border-y border-slate-100 px-3 py-4 dark:border-slate-700">
                      <Badge
                        variant="secondary"
                        className={
                          user.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>

                    <td className="border-y border-slate-100 px-3 py-4 dark:border-slate-700">
                      <Badge
                        className={
                          user.is_active ? "border-0 bg-green-50 text-green-600 hover:bg-green-50 dark:bg-green-900/30 dark:text-green-400" : "border-0 bg-red-50 text-red-600 hover:bg-red-50 dark:bg-red-900/30 dark:text-red-400"
                        }
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>

                    
                    <td className="rounded-r-lg border-y border-r border-slate-100 px-3 py-4 dark:border-slate-700">
                      <div className="flex items-center justify-center gap-1">
                        
                        {/* View User */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`View ${user.name}`}
                          onClick={() => setViewUser(user)}
                          className="gap-2 text-slate-600 hover:text-[#6048ce] dark:text-slate-300"
                        >
                          <EyeIcon
                            size={18}
                            className="flex size-[18px] shrink-0 items-center justify-center"
                          />
                          View
                        </Button>

                        {/* Management-only actions */}
                        {management && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingUser(user);
                                setFormOpen(true);
                              }}
                              className="text-[#6048ce] hover:bg-purple-50 dark:hover:bg-purple-950/30"
                            >
                              Edit
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingUser(user)}
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {filteredUsers.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-base font-medium text-slate-700 dark:text-white">
                No users found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Try changing the search or selected filter.
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {startRow}-{endRow} of {totalMatches} users
            </p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>

              <span className="min-w-20 text-center text-xs text-slate-600 dark:text-slate-300">
                Page {page} of {totalPages}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* User details dialog */}
      <Dialog
        open={viewUser !== null}
        onOpenChange={(open) => {
          if (!open) setViewUser(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Registered account information
            </DialogDescription>
          </DialogHeader>

          {viewUser && (
            <div className="space-y-4 py-4 text-sm">
              {[
                ["User ID", String(viewUser.id)],
                ["Full Name", viewUser.name],
                ["Email", viewUser.email],
                ["Role", viewUser.role],
                ["Status", viewUser.is_active ? "Active" : "Inactive"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800"
                >
                  <span className="text-slate-500">{label}</span>

                  <span className="break-all text-right font-medium text-slate-900 dark:text-white">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / Edit User */}
      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingUser={editingUser}
        onSaved={handleMutationSuccess}
      />

      {/* Delete User */}
      <DeleteUserDialog
        user={deletingUser}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingUser(null);
          }
        }}
        onDeleted={handleDeleteSuccess}
      />

    </div>
  );
}