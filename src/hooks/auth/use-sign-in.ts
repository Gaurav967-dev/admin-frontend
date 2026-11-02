"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn } from "@/service/auth-service";

export function useSignIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: signIn,

        onSuccess: () => {
            queryClient.removeQueries();
        },
    });
}