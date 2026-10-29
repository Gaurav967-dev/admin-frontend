"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DashboardShell from "@/feature/layout/dashboard-shell";
import { apiFetch, ApiError } from "@/lib/api";
import type { VerifyResponse } from "@/types/dashboard";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const {
        data,
        error,
        isPending,
        isFetching,
        refetch,
    } = useQuery<VerifyResponse, Error>({
        queryKey: ["auth", "current-user"],

        queryFn: () =>
            apiFetch<VerifyResponse>("/verify-token"),

        staleTime: 0,
        refetchOnMount: "always",
        retry: false,
    });

    const user = data?.user ?? null;

    const isAuthError =
        error instanceof ApiError &&
        (error.status === 401 || error.status === 419);

    const adminOnlyPage =
        pathname === "/dashboard" ||
        pathname === "/user";

    const mustRedirect =
        user !== null &&
        user.role !== "admin" &&
        adminOnlyPage;

    // Navigation side effect, not API data fetching.
    useEffect(() => {
        if (isAuthError) {
            router.replace("/");
        } else if (mustRedirect) {
            router.replace("/profile");
        }
    }, [isAuthError, mustRedirect, router]);

    if (isPending || isFetching) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="mx-auto size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#6048ce]" />

                    <p className="mt-4 text-sm text-slate-500">
                        Verifying your session...
                    </p>
                </div>
            </div>
        );
    }

    if (isAuthError || mustRedirect) {
        return null;
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
                <p role="alert" className="text-red-600">
                    {error.message || "Could not verify your session"}
                </p>

                <button
                    type="button"
                    onClick={() => void refetch()}
                    className="rounded-lg bg-[#6048ce] px-5 py-2 text-white"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <DashboardShell user={user}>
            {children}
        </DashboardShell>
    );
}