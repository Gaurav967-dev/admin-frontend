"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import TableToolbar from "../table/table-toolbar";
import TableContent from "../table/table-content";
import TablePagination from "../table/table-pagination";
import ViewUserDialog from "../table/view-user-dialog";
import UserFormDialog from "../form/user-form-dialog";
import DeleteUserDialog from "../form/delete-user-dialog";

import { useUserData } from "@/hooks/use-user-data";
import type { DashboardUser } from "@/types/dashboard";

type Props = {
    management?: boolean;
};

export default function PeopleContainer({
    management = false,
}: Props) {
    const {
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
        changeFilter,
        changePageSize,
        goToPage,
        loadUsers,
        refreshAfterDelete,
    } = useUserData(management);

    const [viewUser, setViewUser] = useState<DashboardUser | null>(null);
    const [editingUser, setEditingUser] = useState<DashboardUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<DashboardUser | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [notice, setNotice] = useState("");

    function openCreate() {
        setEditingUser(null);
        setFormOpen(true);
    }

    function openEdit(user: DashboardUser) {
        setEditingUser(user);
        setFormOpen(true);
    }

    function handleSaved(message: string) {
        setNotice(message);
        void loadUsers();
    }

    function handleDeleted(
        message: string,
        deletedUserId: number
    ) {
        setNotice(message);
        refreshAfterDelete(deletedUserId);
    }

    return (
        <div className="w-full">

            <TableToolbar
                management={management}
                filter={filter}
                loading={loading}
                onFilterChange={changeFilter}
                onCreate={openCreate}
                onRefresh={() => void loadUsers()}
            />

            {/* Success message */}
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
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div
                    role="status"
                    className="flex min-h-52 flex-col items-center justify-center gap-3"
                >
                    <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#6048ce]" />
                    <p className="text-sm text-slate-500">
                        Loading users...
                    </p>
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
                        onClick={() => void loadUsers()}
                        className="mt-4"
                    >
                        Try again
                    </Button>
                </div>
            )}

            {/* Table and pagination */}
            {!loading && !error && data && (
                <>
                    <TableContent
                        users={pageRows}
                        management={management}
                        onView={setViewUser}
                        onEdit={openEdit}
                        onDelete={setDeletingUser}
                    />

                    <TablePagination
                        page={page}
                        pageSize={pageSize}
                        pageInput={pageInput}
                        totalPages={totalPages}
                        totalMatches={totalMatches}
                        startRow={startRow}
                        endRow={endRow}
                        loading={loading}
                        onPageInputChange={setPageInput}
                        onPageSizeChange={changePageSize}
                        onPrevious={() =>
                            setPage((current) => current - 1)
                        }
                        onNext={() =>
                            setPage((current) => current + 1)
                        }
                        onGoToPage={goToPage}
                    />
                </>
            )}

            <ViewUserDialog
                user={viewUser}
                onClose={() => setViewUser(null)}
            />

            <UserFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                editingUser={editingUser}
                onSaved={handleSaved}
            />

            <DeleteUserDialog
                user={deletingUser}
                onOpenChange={(open) => {
                    if (!open) setDeletingUser(null);
                }}
                onDeleted={handleDeleted}
            />

        </div>
    );
}