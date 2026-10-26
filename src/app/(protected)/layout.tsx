"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardShell from "@/feature/layout/dashboard-shell";
import { apiFetch, ApiError } from "@/lib/api";
import type { AuthenticatedUser, VerifyResponse } from "@/types/dashboard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function checkAuthentication() {
      try {
        const result = await apiFetch<VerifyResponse>(
          "/verify-token"
        );

        if (!cancelled) {
          setUser(result.user);
          setError("");
        }
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError && err.status === 401) {
          router.replace("/");
        } else {
          setError(
            err instanceof Error ? err.message : "Could not verify your session"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkAuthentication();

    return () => {
      cancelled = true;
    };
  }, [router, attempt]);

  const adminOnlyPage =
    pathname === "/dashboard" || pathname === "/user";
  const mustRedirect =
    user !== null && user.role !== "admin" && adminOnlyPage;

  useEffect(() => {
    if (mustRedirect) {
      router.replace("/profile");
    }
  }, [mustRedirect, router]);

  if (loading) {
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

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p role="alert" className="text-red-600">
          {error}
        </p>

        <button
          onClick={() => {
            setLoading(true);
            setAttempt((value) => value + 1);
          }}
          className="rounded-lg bg-[#6048ce] px-5 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user || mustRedirect) {
    return null;
  }

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}