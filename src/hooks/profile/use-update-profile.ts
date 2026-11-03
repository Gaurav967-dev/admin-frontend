"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEmployeeProfile } from "@/service/profile-service";
import type { ProfileData, ProfileFormValues, ProfileSaveResponse } from "@/feature/profile/type/profile-type";

type UpdateProfileVariables = {
    values: ProfileFormValues;
    existingProfile: ProfileData;
};

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation<ProfileSaveResponse, Error, UpdateProfileVariables>({
        mutationFn: ({
            values,
            existingProfile,
        }) => updateEmployeeProfile(values, existingProfile),

        onSuccess: async (result) => {
            queryClient.setQueryData<ProfileData>(
                ["profile"],
                result.profile
            );

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["auth", "current-user"],
                }),

                queryClient.invalidateQueries({
                    queryKey: ["users"],
                }),
            ]);
        },
    });
}