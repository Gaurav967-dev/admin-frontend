"use client";

import { Button } from "@/components/ui/button";
import { RefreshCWIcon } from "@/components/icons/refresh-cw";
import { UsersIcon } from "@/components/icons/users";
import { USER_FILTERS } from "@/constant/people";
import type { UserFilter } from "../type/people-type";

type Props = {
    management: boolean;
    filter: UserFilter;
    loading: boolean;
    onFilterChange: (value: UserFilter) => void;
    onCreate: () => void;
    onRefresh: () => void;
};

export default function TableToolbar({
    management,
    filter,
    loading,
    onFilterChange,
    onCreate,
    onRefresh,
}: Props) {
    return (
        <div className="mb-2 flex min-w-0 items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800">

            {/* Mobile filter dropdown */}
            <div className="min-w-0 md:hidden">
                <label htmlFor="mobile-user-filter" className="sr-only">
                    Filter users
                </label>

                <select
                    id="mobile-user-filter"
                    value={filter}
                    onChange={(e) =>
                        onFilterChange(e.target.value as UserFilter)
                    }
                    className="h-9 w-[95px] rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                    {USER_FILTERS.map((item) => (
                        <option key={item.value} value={item.value}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tablet and desktop filter tabs */}
            <div className="hidden min-w-0 items-center gap-3 md:flex">
                {USER_FILTERS.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        onClick={() => onFilterChange(item.value)}
                        className={`shrink-0 border-b-2 px-2 py-2 text-sm font-medium transition-colors ${filter === item.value
                            ? "border-[#6048ce] text-[#6048ce]"
                            : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1.5 pb-1">
                {management && (
                    <Button
                        type="button"
                        onClick={onCreate}
                        className="h-9 gap-1 bg-[#6048ce] px-2 text-xs text-white hover:bg-[#5039b7] sm:px-3 sm:text-sm"
                    >
                        <UsersIcon className="size-3.5 shrink-0" />
                        Create User
                    </Button>
                )}

                <Button
                    type="button"
                    variant="outline"
                    onClick={onRefresh}
                    disabled={loading}
                    aria-label="Refresh users"
                    title="Refresh Users"
                    className="h-9 gap-1 px-2 dark:border-slate-700 sm:px-3"
                >
                    <RefreshCWIcon
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                </Button>
            </div>
        </div>
    );
}