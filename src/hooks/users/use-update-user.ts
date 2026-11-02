import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "@/service/user-service";
import type { UserSavePayload } from "@/feature/people/type/people-type";

type UpdateUserArgs = {
    userId: number;
    payload: UserSavePayload;
};

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, payload }: UpdateUserArgs) => updateUser(userId, payload),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["users"],
            });
        },
    });
}