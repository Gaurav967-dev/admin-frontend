import { apiFetch } from "@/lib/api";

import { profileToPayload } from "@/feature/profile/utils/profile-utils";

import type { ProfileData, ProfileFormValues, ProfileSaveResponse } from "@/feature/profile/type/profile-type";

export function getEmployeeProfile() {
    return apiFetch<ProfileData>("/profile");
}

export function updateEmployeeProfile(
    form: ProfileFormValues,
    existingProfile: ProfileData
) {
    const addingPhone = !existingProfile.phone?.trim() && Boolean(form.phone.trim());
    const payload = {
        ...profileToPayload(form),
        ...(addingPhone
            ? { phone: form.phone.trim() }
            : {}),
    };

    return apiFetch<ProfileSaveResponse>("/profile",
        {
            method: "PUT",
            body: JSON.stringify(payload),
        }
    );
}