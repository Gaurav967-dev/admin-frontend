import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "@/service/auth-service";

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logoutUser,

        onSuccess: () => {
            queryClient.removeQueries();
        },
    });
}