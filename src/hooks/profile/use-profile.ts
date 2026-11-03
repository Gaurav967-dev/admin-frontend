"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { applyServerValidationErrors } from "@/lib/form-errors";
import { createProfileSchema } from "@/feature/profile/schema/profile-schema";
import { profileToForm } from "@/feature/profile/utils/profile-utils";
import { useProfileQuery } from "@/hooks/profile/use-profile-query";
import { useUpdateProfile } from "@/hooks/profile/use-update-profile";
import type { ProfileFormValues } from "@/feature/profile/type/profile-type";

const defaultValues: ProfileFormValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    position: "",
    team: "",
    manager: "",
    lead: "",
    onboarding_start: "",
    onboarding_required: true,
    tasks: [],
};

export function useProfile() {
    const router = useRouter();
    const [formError, setFormError] = useState("");
    const profileQuery = useProfileQuery();
    const profile = profileQuery.data ?? null;
    const updateMutation = useUpdateProfile();

    // React Hook Form manages editable form values.
    const methods = useForm<ProfileFormValues>({
        resolver: zodResolver(
            createProfileSchema(
                Boolean(profile?.phone?.trim())
            )
        ),

        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues,

        values: profile ? profileToForm(profile) : defaultValues,

        resetOptions: {
            keepDirtyValues: true,
        },
    });

    const {
        reset,
        setError: setFieldError,
    } = methods;

    async function saveProfile(values: ProfileFormValues) {
        if (!profile) return;

        setFormError("");

        const addingPhone = !profile.phone?.trim() && Boolean(values.phone.trim());

        try {
            const result = await updateMutation.mutateAsync({
                values,
                existingProfile: profile,
            });

            reset(profileToForm(result.profile));

            toast.success(addingPhone ? "Phone Number Added Successfully" : result.message);
        } catch (err) {
            if (
                applyServerValidationErrors<ProfileFormValues>(
                    err,
                    setFieldError,
                    [
                        "first_name",
                        "last_name",
                        "phone",
                        "position",
                        "team",
                        "manager",
                        "lead",
                        "onboarding_start",
                        "onboarding_required",
                        "tasks",
                    ]
                )
            ) {
                return;
            }

            if (
                err instanceof ApiError &&
                err.status === 409 &&
                /phone number/i.test(err.message)
            ) {
                setFieldError("phone", {
                    type: "server",
                    message: err.message,
                });

                return;
            }

            setFormError(err instanceof Error ? err.message : "Unable to save your profile");
        }
    }

    async function copyText(
        label: string,
        value: string
    ) {
        if (!value) return;

        try {
            await navigator.clipboard.writeText(value);

            toast.success(`${label} copied to clipboard`);

            setFormError("");
        } catch {
            toast.error(`Unable to copy ${label.toLowerCase()}`);
        }
    }

    function cancelChanges() {
        if (!profile) return;

        if (profile.role === "admin") {
            router.push("/dashboard");
            return;
        }

        reset(profileToForm(profile));

        setFormError("");
    }

    const loading = profileQuery.isPending || (profileQuery.isFetching && !profile);

    const error = formError || (profileQuery.error ? profileQuery.error.message : "");

    return {
        methods,
        profile,
        loading,
        error,
        refetchProfile: profileQuery.refetch,
        saveProfile,
        copyText,
        cancelChanges,
    };
}