import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "@/service/user-service";

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteUser,
        
        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({
                queryKey: ["users"],
            });

            queryClient.removeQueries({
                queryKey: ["users", "detail", userId],
            });
        },
    });
}