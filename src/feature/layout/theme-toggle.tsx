"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { SunIcon } from "@/components/icons/sun";
import { MoonIcon } from "@/components/icons/moon";

function subscribe() {
    return () => { };
}

function getClientSnapshot() {
    return true;
}

function getServerSnapshot() {
    return false;
}

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    const mounted = useSyncExternalStore(
        subscribe,
        getClientSnapshot,
        getServerSnapshot
    );

    if (!mounted) {
        return <div className="size-10 shrink-0" />;
    }

    const dark = resolvedTheme === "dark";

    return (
        <button
            type="button"
            onClick={() => setTheme(dark ? "light" : "dark")}
            aria-label={
                dark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
            {dark ? (
                <SunIcon
                    size={20}
                    className="flex size-5 items-center justify-center"
                />
            ) : (
                <MoonIcon
                    size={20}
                    className="flex size-5 items-center justify-center"
                />
            )}
        </button>
    );
}