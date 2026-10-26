"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "@/components/icons/eye";

import type { DashboardUser } from "@/types/dashboard";

type Props = {
    users: DashboardUser[];
    management: boolean;
    onView: (user: DashboardUser) => void;
    onEdit: (user: DashboardUser) => void;
    onDelete: (user: DashboardUser) => void;
};

export default function TableContent({
    users,
    management,
    onView,
    onEdit,
    onDelete,
}: Props) {
    return (
        <>
            <div className="min-w-full">
                <table className="w-full min-w-[760px] whitespace-nowrap border-separate border-spacing-y-1 text-left text-sm lg:border-spacing-y-0">

                    <thead className="sticky top-0 z-10 bg-[#f5f6f8] dark:bg-slate-800">
                        <tr className="bg-[#f5f6f8] text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <th className="rounded-l-lg px-5 py-2">User ID</th>
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2">Role</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="rounded-r-lg px-3 py-2 text-center">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="bg-white text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-colors hover:bg-slate-50 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <td className="rounded-l-lg border-y border-l border-slate-100 px-5 py-1 font-medium dark:border-slate-700 lg:py-0">
                                    IN-{String(user.id).padStart(5, "0")}
                                </td>

                                <td className="border-y border-slate-100 px-3 py-1 font-medium text-slate-900 dark:border-slate-700 dark:text-white lg:py-0">
                                    {user.name}
                                </td>

                                <td className="border-y border-slate-100 px-3 py-1 text-slate-500 dark:border-slate-700 dark:text-slate-400 lg:py-0">
                                    {user.email}
                                </td>

                                <td className="border-y border-slate-100 px-3 py-1 dark:border-slate-700 lg:py-0">
                                    <Badge
                                        variant="secondary"
                                        className={
                                            user.role === "admin"
                                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                                                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                        }
                                    >
                                        {user.role}
                                    </Badge>
                                </td>

                                <td className="border-y border-slate-100 px-3 py-1 dark:border-slate-700 lg:py-0">
                                    <Badge
                                        className={
                                            user.is_active
                                                ? "border-0 bg-green-50 text-green-600 hover:bg-green-50 dark:bg-green-900/30 dark:text-green-400"
                                                : "border-0 bg-red-50 text-red-600 hover:bg-red-50 dark:bg-red-900/30 dark:text-red-400"
                                        }
                                    >
                                        {user.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </td>

                                <td className="rounded-r-lg border-y border-r border-slate-100 px-3 py-1 dark:border-slate-700 lg:py-0">
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            aria-label={`View ${user.name}`}
                                            onClick={() => onView(user)}
                                            className="gap-2 text-slate-600 hover:text-[#6048ce] dark:text-slate-300"
                                        >
                                            <EyeIcon size={18} className="size-[18px]" />
                                            View
                                        </Button>

                                        {management && (
                                            <>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEdit(user)}
                                                    className="text-[#6048ce] hover:bg-purple-50 dark:hover:bg-purple-950/30"
                                                >
                                                    Edit
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDelete(user)}
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

            {users.length === 0 && (
                <div className="py-16 text-center">
                    <p className="text-base font-medium text-slate-700 dark:text-white">
                        No users found
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Try changing the search or selected filter.
                    </p>
                </div>
            )}
        </>
    );
}