"use client";

import { useState, type ReactNode } from "react";

import Sidebar from "./sidebar";
import Header from "./header";
import { SearchProvider } from "./search-context";

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

  return (
    <SearchProvider>
      <div className="min-h-screen bg-[#e9ebef] p-0 dark:bg-[#0e121b] lg:p-5">
        <div className="mx-auto flex min-h-screen max-w-[1600px] overflow-hidden bg-white shadow-sm dark:bg-[#171c28] lg:min-h-[calc(100vh-40px)] lg:rounded-xl">

          <Sidebar
            open={sidebarOpen}
            close={() => setSidebarOpen(false)}
            user={user}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <Header
              toggleSidebar={() => setSidebarOpen(true)}
              user={user}
            />

            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>

            <footer className="border-t border-slate-100 px-6 py-4 text-center text-xs text-slate-400 dark:border-slate-800">
              © 2026 Expinova. All rights reserved.
            </footer>
          </div>
        </div>
      </div>
    </SearchProvider>
  );
}