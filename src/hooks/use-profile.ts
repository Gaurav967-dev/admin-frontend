"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api";
import { createProfileSchema } from "@/feature/profile/schema/profile-schema";
import { profileToForm } from "@/feature/profile/utils/profile-utils";
import { getEmployeeProfile, updateEmployeeProfile } from "@/service/profile-service";
import type { ProfileData, ProfileFormValues } from "@/feature/profile/type/profile-type";
import { toast } from "sonner";
import { applyServerValidationErrors } from "@/lib/form-errors";

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
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    const methods = useForm<ProfileFormValues>({
        resolver: zodResolver(createProfileSchema(Boolean(profile?.phone?.trim()))),
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues,
    });

    const { reset, setError: setFieldError } = methods;

    useEffect(() => {
        let cancelled = false;

        getEmployeeProfile()
            .then((result) => {
                if (cancelled) return;

                setProfile(result);
                reset(profileToForm(result));
                setError("");
            })
            .catch((err: unknown) => {
                if (cancelled) return;

                if (
                    err instanceof ApiError &&
                    (err.status === 401 || err.status === 419)
                ) {
                    router.replace("/");
                    return;
                }

                setError(err instanceof Error ? err.message : "Unable to load your profile");
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [reset, router, retryCount]);

    // Called when the user clicks Try Again.
    function loadProfile() {
        setLoading(true);
        setError("");
        setRetryCount((current) => current + 1);
    }

    async function saveProfile(values: ProfileFormValues) {
        if (!profile) return;

        setError("");

        const addingPhone = !profile.phone?.trim() && Boolean(values.phone.trim());

        try {
            const result = await updateEmployeeProfile(
                values,
                profile
            );

            setProfile(result.profile);
            reset(profileToForm(result.profile));
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

            setError(err instanceof Error ? err.message : "Unable to save your profile");
        }
    }

    async function copyText(label: string, value: string) {
        if (!value) return;

        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied to clipboard`);
            setError("");
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
        setError("");
    }

    return {
        methods,
        profile,
        loading,
        error,
        loadProfile,
        saveProfile,
        copyText,
        cancelChanges,
    };
}