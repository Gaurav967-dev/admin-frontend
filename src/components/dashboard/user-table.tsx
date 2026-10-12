"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { RefreshCWIcon } from "@/components/icons/refresh-cw";
import { EyeIcon } from "@/components/icons/eye";

import { useDashboardSearch } from "./search-context";

import { apiFetch, ApiError } from "@/lib/api";

import UserFormDialog from "./user-form-dialog";
import DeleteUserDialog from "./delete-user-dialog";

import { UsersIcon } from "@/components/icons/users";

import type {
  DashboardResponse,
  DashboardUser,
} from "@/types/dashboard";

type Filter = "all" | "active" | "inactive" | "admins";

const filters: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Admins", value: "admins" },
];

export default function UserTable({
  management = false,
}: {
  management?: boolean;
}) {
  const { search } = useDashboardSearch();
  const latestRequestId = useRef(0);

  const [data, setData] = useState<DashboardResponse | null>(null);

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
      const result = await apiFetch<DashboardResponse>(
        management ? "/user" : "/dashboard"
      );
      console.log("GET response user IDs:", result.users.map(
        (user) => user.id
      ));

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
          setError("Access denied. Only administrators can view users.");
        } else if (err.status === 401) {
          setError("Your session has expired. Please sign in again.");
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
  }, [management]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];

    const query = search.trim().toLowerCase();

    return data.users.filter((user) => {
      let matchesFilter = true;

      if (filter === "active") {
        matchesFilter = user.is_active;
      }

      if (filter === "inactive") {
        matchesFilter = !user.is_active;
      }

      if (filter === "admins") {
        matchesFilter = user.role === "admin";
      }

      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        String(user.id).includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [data, filter, search]);

  function handleMutationSuccess(message: string) {
    setNotice(message);
    void loadUsers();
  }
  
  function handleDeleteSuccess(
    message: string,
    deletedUserId: number
  ) {
    console.log("Deleting user ID:", deletedUserId);
    console.log(
      "Current table IDs:",
      data?.users.map((user) => user.id)
    );

    // Invalidate any GET requests already in progress.
    latestRequestId.current += 1;
    setNotice(message);

    setData((previous) => {
      if (!previous) return previous;

      const updatedUsers = previous.users.filter(
        (user) => user.id !== deletedUserId
      );

      return {
        ...previous,
        users: updatedUsers,
        total_users: updatedUsers.length,
        active_users: updatedUsers.filter(
          (user) => user.is_active
        ).length,
        admins: updatedUsers.filter(
          (user) => user.role === "admin"
        ).length,
      };
    });

    void loadUsers();
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
              className={`flex size-[18px] shrink-0 items-center justify-center ${
                loading ? "animate-spin" : ""
              }`}
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
            onClick={() => setFilter(item.value)}
            className={`
              shrink-0 border-b-2 px-2 pb-3 pt-2 text-sm font-medium transition-colors
              ${
                filter === item.value ? "border-[#6048ce] text-[#6048ce]" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }
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
                {filteredUsers.map((user) => (
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

          <div className="mt-5 text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredUsers.length} of {data.total_users} users
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