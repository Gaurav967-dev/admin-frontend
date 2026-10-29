"use client";

import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getUserById } from "@/service/user-service";
import type { DashboardUser } from "@/types/dashboard";

type Props = {
    user: DashboardUser | null;
    onClose: () => void;
};

export default function ViewUserDialog({
    user,
    onClose,
}: Props) {
    const userId = user?.id;

    const {
        data,
        error,
        isPending,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: ["users", "detail", userId],

        queryFn: () => {
            if (userId === undefined) {
                throw new Error("No user selected");
            }

            return getUserById(userId);
        },

        enabled: userId !== undefined,
        refetchOnMount: "always",
        staleTime: 0,
        retry: false,
    });

    const loading = isPending || isFetching;

    return (
        <Dialog
            open={user !== null}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                    <DialogDescription>
                        Registered account information
                    </DialogDescription>
                </DialogHeader>

                {loading && (
                    <p role="status" className="py-5 text-sm text-slate-500">
                        Loading user details...
                    </p>
                )}

                {!loading && error && (
                    <div className="space-y-3 py-4">
                        <p role="alert" className="text-sm text-red-600">
                            {error.message}
                        </p>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => void refetch()}
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {!loading && !error && data && (
                    <div className="space-y-4 py-4 text-sm">
                        {[
                            ["User ID", String(data.id)],
                            ["Full Name", data.name],
                            ["Email", data.email],
                            ["Role", data.role],
                            ["Status", data.is_active ? "Active" : "Inactive"],
                        ].map(([label, value]) => (
                            <div
                                key={label}
                                className="flex justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800"
                            >
                                <span className="text-slate-500">
                                    {label}
                                </span>

                                <span className="break-all text-right font-medium">
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}