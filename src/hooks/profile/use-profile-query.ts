"use client";

import { useQuery } from "@tanstack/react-query";
import { getEmployeeProfile } from "@/service/profile-service";
import type { ProfileData } from "@/feature/profile/type/profile-type";

export function useProfileQuery() {
    return useQuery<ProfileData, Error>({
        queryKey: ["profile"],

        queryFn: getEmployeeProfile,

        retry: false,
    });
}