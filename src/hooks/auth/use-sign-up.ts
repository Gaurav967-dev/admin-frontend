"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signUp } from "@/service/auth-service";

export function useSignUp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: signUp,

        onSuccess: () => {
            queryClient.removeQueries();
        },
    });
}