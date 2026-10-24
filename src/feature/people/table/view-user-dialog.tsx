"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import type { DashboardUser } from "@/types/dashboard";

type Props = {
    user: DashboardUser | null;
    onClose: () => void;
};

export default function ViewUserDialog({
    user,
    onClose,
}: Props) {
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

                {user && (
                    <div className="space-y-4 py-4 text-sm">
                        {[
                            ["User ID", String(user.id)],
                            ["Full Name", user.name],
                            ["Email", user.email],
                            ["Role", user.role],
                            ["Status", user.is_active ? "Active" : "Inactive"],
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
    );
}