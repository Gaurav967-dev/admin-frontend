import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/service/user-service";

export function useUser(userId: number | undefined) {
    return useQuery({
        queryKey: ["users", "detail", userId],

        queryFn: () => {
            if (userId === undefined) {
                throw new Error("User Id is required");
            }

            return getUserById(userId);
        },

        enabled: userId !== undefined,
        retry: false,
    });
}