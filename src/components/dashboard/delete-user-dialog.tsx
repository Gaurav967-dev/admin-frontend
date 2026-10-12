"use client";

import { useState } from "react";

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

import type { DashboardUser } from "@/types/dashboard";

type DeleteUserDialogProps = {
    user: DashboardUser | null;
    onOpenChange: (open: boolean) => void;
    onDeleted: (message: string, userId: number) => void;
};

export default function DeleteUserDialog({
    user,
    onOpenChange,
    onDeleted,
}: DeleteUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleDelete() {
        if (!user || loading) return;

        setLoading(true);
        setError("");

        try {
            const result = await apiFetch<{
                message: string;
            }>(`/user?user_id=${user.id}`, {
                method: "DELETE",
            });

            onDeleted(result.message, user.id);
            onOpenChange(false);

        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to delete user"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <AlertDialog
            open={user !== null}
            onOpenChange={(open) => {
                if (!loading) {
                    setError("");
                    onOpenChange(open);
                }
            }}
        >
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete User?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <strong>{user?.name}</strong>?

                        This action permanently removes the user's
                        account and cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {error && (
                    <p
                        role="alert"
                        className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30"
                    >
                        {error}
                    </p>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        Cancel
                    </AlertDialogCancel>

                    <Button
                        type="button"
                        disabled={loading}
                        onClick={handleDelete}
                        className="bg-red-600 text-white hover:bg-red-700"
                    >
                        {loading ? "Deleting..." : "Delete User"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}