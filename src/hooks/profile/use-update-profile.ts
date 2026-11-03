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

        onSuccess: async (result, variables) => {
            queryClient.setQueryData(["profile"], result.profile);

            const previousName = `${variables.existingProfile.first_name} ${variables.existingProfile.last_name}`.trim();

            const updatedName = `${result.profile.first_name} ${result.profile.last_name}`.trim();

            if (previousName !== updatedName) {
                await queryClient.invalidateQueries({
                    queryKey: ["auth", "current-user"],
                });

                await queryClient.invalidateQueries({
                    queryKey: ["users"],
                });
            }
        },
    });
}