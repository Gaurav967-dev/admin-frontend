"use client";

import { useState, useEffect, type ReactNode } from "react";

import Sidebar from "./sidebar";
import Header from "./header";
import { SearchProvider } from "@/context/search-context";
import { usePathname } from "next/navigation"

import type { AuthenticatedUser } from "@/types/dashboard";

type DashboardShellProps = {
  children: ReactNode;
  user: AuthenticatedUser;
};

export default function DashboardShell({
  children,
  user,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isProfile = pathname === "/profile";

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    // Disable browser level scrolling while dashboard is mounted
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Restore scrolling when leaving protected dashboard layout
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return (
    <SearchProvider>
      <div className="h-dvh overflow-hidden bg-[#e9ebef] dark:bg-[#0e121b]">
        <div className="mx-auto flex h-full min-h-0 max-w-[1600px] overflow-hidden bg-white shadow-sm dark:bg-[#171c28] lg:rounded-xl">

          <Sidebar
            open={sidebarOpen}
            close={() => setSidebarOpen(false)}
            user={user}
          />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="shrink-0">
              <Header
                toggleSidebar={() => setSidebarOpen(true)}
                user={user}
              />
            </div>

            <main className={`flex min-h-0 min-w-0 flex-1 flex-col px-3 py-4 sm:px-5 lg:px-6 ${
              isProfile 
                ? "overflow-y-auto overflow-x-hidden pt-0 pb-4 lg:pb-2"
                : "overflow-hidden pt-4 pb-2 lg:pt-2"
            }`}>
              {children}

              <footer className={`shrink-0 border-t border-slate-100 pb-2 pt-2 text-center text-xs text-slate-400 dark:border-slate-800 ${
                isProfile ? "mt-8" : "mt-2"
              }`}>
                © 2026 Expinova. All rights reserved.
              </footer>
            </main>
          </div>
        </div>
      </div>
    </SearchProvider>
  );
}