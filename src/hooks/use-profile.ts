"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { applyServerValidationErrors } from "@/lib/form-errors";
import { createProfileSchema } from "@/feature/profile/schema/profile-schema";
import { profileToForm } from "@/feature/profile/utils/profile-utils";
import { getEmployeeProfile, updateEmployeeProfile } from "@/service/profile-service";
import type { ProfileData, ProfileFormValues } from "@/feature/profile/type/profile-type";

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

type SaveProfileArgs = {
    values: ProfileFormValues;
    existingProfile: ProfileData;
};

export function useProfile() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [formError, setFormError] = useState("");

    // TanStack Query fetches and caches the profile.
    const profileQuery = useQuery<ProfileData, Error>({
        queryKey: ["profile"],
        queryFn: getEmployeeProfile,
        retry: false,
    });

    const profile = profileQuery.data ?? null;

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

        // Automatically synchronize server data with the form.
        values: profile
            ? profileToForm(profile)
            : defaultValues,

        // Preserve unsaved edits during background refetching.
        resetOptions: {
            keepDirtyValues: true,
        },
    });

    const {
        reset,
        setError: setFieldError,
    } = methods;

    // TanStack Query manages the Profile update request.
    const updateMutation = useMutation({
        mutationFn: ({
            values,
            existingProfile,
        }: SaveProfileArgs) =>
            updateEmployeeProfile(values, existingProfile),
    });

    async function saveProfile(values: ProfileFormValues) {
        if (!profile) return;

        setFormError("");

        const addingPhone =
            !profile.phone?.trim() &&
            Boolean(values.phone.trim());

        try {
            const result = await updateMutation.mutateAsync({
                values,
                existingProfile: profile,
            });

            // Reset form to the newly saved values.
            reset(profileToForm(result.profile));

            // Update TanStack Query cache immediately.
            queryClient.setQueryData<ProfileData>(
                ["profile"],
                result.profile
            );

            // Refresh data affected by Profile changes.
            void queryClient.invalidateQueries({
                queryKey: ["auth", "current-user"],
            });

            void queryClient.invalidateQueries({
                queryKey: ["users"],
            });

            toast.success(
                addingPhone
                    ? "Phone Number Added Successfully"
                    : result.message
            );
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

            setFormError(
                err instanceof Error
                    ? err.message
                    : "Unable to save your profile"
            );
        }
    }

    async function copyText(label: string, value: string) {
        if (!value) return;

        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied to clipboard`);
            setFormError("");
        } catch {
            toast.error(
                `Unable to copy ${label.toLowerCase()}`
            );
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

    const loading =
        profileQuery.isPending ||
        (profileQuery.isFetching && !profile);

    const error =
        formError ||
        (profileQuery.error
            ? profileQuery.error.message
            : "");

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