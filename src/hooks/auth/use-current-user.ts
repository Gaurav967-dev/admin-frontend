"use client";

import { useQuery } from "@tanstack/react-query";
import { verifyCurrentUser } from "@/service/auth-service";
import type { VerifyResponse } from "@/types/dashboard";

export function useCurrentUser() {
    return useQuery<VerifyResponse, Error>({
        queryKey: ["auth", "current-user"],

        queryFn: verifyCurrentUser,

        staleTime: 0,
        refetchOnMount: "always",
        retry: false,
    });
}