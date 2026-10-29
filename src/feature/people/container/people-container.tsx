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
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
        refetch,
    } = useUserData(management);

    const [viewUser, setViewUser] = useState<DashboardUser | null>(null);
    const [editingUser, setEditingUser] = useState<DashboardUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<DashboardUser | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const queryClient = useQueryClient();

    function openCreate() {
        setEditingUser(null);
        setFormOpen(true);
    }

    function openEdit(user: DashboardUser) {
        setEditingUser(user);
        setFormOpen(true);
    }

    function handleSaved(message: string) {
        toast.success(message);

        void queryClient.invalidateQueries({
            queryKey: ["users"],
        });
    }

    function handleDeleted(
        message: string,
        deletedUserId: number
    ) {
        toast.success(message);

        const deletedLastRow =
            management &&
            page > 1 &&
            pageRows.length === 1 &&
            pageRows[0].id === deletedUserId;

        // Don't leave the user on an empty last page.
        if (deletedLastRow) {
            setPage((current) => current - 1);
        }

        void queryClient.invalidateQueries({
            queryKey: ["users"],
        });
    }

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col">

            <TableToolbar
                management={management}
                filter={filter}
                loading={loading}
                onFilterChange={changeFilter}
                onCreate={openCreate}
                onRefresh={() => void refetch()}
            />

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
                        onClick={() => void refetch()}
                        className="mt-4"
                    >
                        Try again
                    </Button>
                </div>
            )}


            {/* Table and pagination */}
            {!loading && !error && data && (
                <div className="flex min-h-0 flex-1 flex-col">

                    {/* Only this area scrolls */}
                    <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
                        <TableContent
                            users={pageRows}
                            management={management}
                            onView={setViewUser}
                            onEdit={openEdit}
                            onDelete={setDeletingUser}
                        />
                    </div>

                    {/* Pagination always visible */}
                    <div className="shrink-0 bg-white dark:bg-[#171c28]">
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
                    </div>

                </div>
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