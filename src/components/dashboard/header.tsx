"use client";

import { usePathname } from "next/navigation";

import { SearchIcon } from "@/components/icons/search";
import { MenuIcon } from "@/components/icons/menu";

import ThemeToggle from "./theme-toggle";
import { useDashboardSearch } from "./search-context";

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
      <div className="flex min-h-15 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

        {/* Left */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Open navigation"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 lg:hidden"
          >
            <MenuIcon
              size={20}
              className="flex size-5 items-center justify-center"
            />
          </button>

          <h1 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-2xl">
            {title}
          </h1>
        </div>

        {/* Right */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">

          {pathname !== "/profile" && (
            <div className="relative flex min-w-0 items-center">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center justify-center">
                <SearchIcon
                  size={18}
                  className="flex size-[18px] items-center justify-center text-slate-400"
                />
              </div>
              
              <input
                type="search"
                aria-label="Search users"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-28 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#6048ce] focus:ring-2 focus:ring-[#6048ce]/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:w-48 lg:w-64"
              />
            </div>
          )}

          <ThemeToggle />

          <div className="hidden border-l border-slate-200 pl-4 dark:border-slate-700 md:block">
            <p className="max-w-28 truncate text-sm font-semibold text-slate-800 dark:text-white">
              {user.name}
            </p>
            <p className="text-xs capitalize text-slate-500 dark:text-slate-400">
              {user.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}