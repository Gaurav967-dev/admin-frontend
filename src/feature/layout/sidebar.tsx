"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

import { LayoutGridIcon } from "@/components/icons/layout-grid";
import { UsersIcon } from "@/components/icons/users";
import { UserIcon } from "@/components/icons/user";
import { FileTextIcon } from "@/components/icons/file-text";
import { LogoutIcon } from "@/components/icons/logout";
import { ShieldCheckIcon } from "@/components/icons/shield-check";
import type { AuthenticatedUser } from "@/types/dashboard";

const adminMenuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutGridIcon,
  },
  {
    name: "Users",
    href: "/user",
    icon: UsersIcon,
  },
];

const myMenuItems = [
  {
    name: "Profile",
    href: "/profile",
    icon: UserIcon,
  },
];

type SidebarProps = {
  open: boolean;
  close: () => void;
  user: AuthenticatedUser;
};

export default function Sidebar({
  open,
  close,
  user,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const isAdmin = user.role === "admin";
  const navigationGroups = [
    ...(isAdmin
      ? [{
        title: "Admin View",
        items: adminMenuItems,
      }]
      : []),
    {
      title: "My View",
      items: myMenuItems,
    },
  ];

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");

    try {
      await apiFetch<{ message: string }>(
        "/logout",
        {
          method: "POST",
        }
      );

      router.replace("/");
      router.refresh();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Could not sign out. Please retry.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          onClick={close}
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-64 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-[#f6f7fb] shadow-xl transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-[#151a25] lg:static lg:h-full lg:translate-x-0 lg:shadow-none
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex h-20 items-center gap-3 px-7">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#6048ce] text-white">
            <FileTextIcon
              size={22}
              className="flex size-[22px] items-center justify-center"
            />
          </div>

          <span className="text-xl font-semibold leading-none tracking-tight text-[#6048ce]">
            Expinova
          </span>
        </div>

        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pt-5">
          {navigationGroups.map((group) => (
            <div key={group.title}>

              {/* Group heading */}
              <div className="mb-2 flex items-center gap-2 border-b border-slate-200 px-3 pb-3 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                {group.title === "Admin View" ? (
                  <ShieldCheckIcon size={16} />
                ) : (
                  <UserIcon size={16} />
                )}

                <span>{group.title}</span>
              </div>

              {/* Navigation links */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${active
                          ? "bg-[#6048ce] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                    >
                      <Icon
                        size={20}
                        className="flex size-5 shrink-0 items-center justify-center"
                      />

                      <span className="leading-none">
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>

            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto shrink-0 space-y-3 border-t border-slate-200 p-5 dark:border-slate-800">
          <div className="rounded-lg bg-white p-3 dark:bg-slate-800">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {user.name}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
            <p className="mt-1 text-xs capitalize text-[#6048ce]">
              {isAdmin ? "Admin" : "User"}
            </p>
          </div>

          {logoutError && (
            <p role="alert" className="text-xs text-red-500">
              {logoutError}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-red-950"
          >
            <LogoutIcon
              size={20}
              className="flex size-5 shrink-0 items-center justify-center"
            />

            <span className="leading-none">
              {loggingOut ? "Signing out..." : "Logout"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}