"use client";

import { usePathname } from "next/navigation";

import { SearchIcon } from "@/components/icons/search";
import { MenuIcon } from "@/components/icons/menu";

import ThemeToggle from "./theme-toggle";
import { useDashboardSearch } from "@/context/search-context";

import type { AuthenticatedUser } from "@/types/dashboard";

type HeaderProps = {
  toggleSidebar: () => void;
  user: AuthenticatedUser;
};

export default function Header({
  toggleSidebar,
  user,
}: HeaderProps) {
  const pathname = usePathname();
  const { search, setSearch } = useDashboardSearch();

  const title =
    pathname === "/user" ? "User Management" : pathname === "/profile" ? "Profile" : "Dashboard";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-[#171c28]/95">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 px-3 py-2 sm:flex sm:min-h-14 sm:gap-3 sm:px-6 lg:px-8">

        {/* Left: Menu, page title */}
        <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-2 sm:order-1 sm:gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Open navigation"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 lg:hidden"
          >
            <MenuIcon
              size={20}
              className="size-5"
            />
          </button>

          <h1 className="min-w-0 truncate text-sm font-semibold text-slate-900 dark:text-white sm:text-xl lg:text-2xl">
            {title}
          </h1>
        </div>

        {/* Search shifts to second row in mobile view */}
        {pathname !== "/profile" && (
          <div className="col-span-2 col-start-1 row-start-2 min-w-0 sm:order-2 sm:ml-auto sm:w-40 md:w-48 lg:w-64">

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <SearchIcon
                  size={18}
                  className="size-[18px] text-slate-400"
                />
              </div>

              <input
                type="search"
                aria-label="Search users"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-[#6048ce] focus:ring-2 focus:ring-[#6048ce]/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Right: theme toggle, user info */}
        <div
          className={`col-start-2 row-start-1 flex shrink-0 items-center gap-1 sm:order-3 sm:gap-2 ${
            pathname === "/profile" ? "sm:ml-auto" : ""}
          `}
        >

          <ThemeToggle />

          <div className="w-14 min-w-0 text-right sm:w-auto sm:border-slate-200 sm:pl-3 sm:text-left dark:sm:border-slate-700">
            <p className="truncate text-[11px] font-semibold text-slate-800 dark:text-white sm:max-w-28 sm:text-sm">
              {user.name}
            </p>

            <p className="truncate text-[10px] capitalize text-slate-500 dark:text-slate-400 sm:text-xs">
              {user.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}