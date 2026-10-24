"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api";
import { profileSchema } from "@/feature/profile/schema/profile-schema";
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

export function useProfile() {
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const methods = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues,
    });

    const { reset, setError: setFieldError } = methods;

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const result = await getEmployeeProfile();

            setProfile(result);
            reset(profileToForm(result));
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                router.replace("/");
                return;
            }

            setError(err instanceof Error ? err.message : "Unable to load your profile");
        } finally {
            setLoading(false);
        }
    }, [reset, router]);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    async function saveProfile(values: ProfileFormValues) {
        if (!profile) return;

        setError("");
        setNotice("");

        const addingPhone = !profile.phone?.trim() && Boolean(values.phone.trim());

        try {
            const result = await updateEmployeeProfile(
                values,
                profile
            );

            setProfile(result.profile);
            reset(profileToForm(result.profile));

            setNotice(addingPhone ? "Phone Number Added Successfully" : result.message);
        } catch (err) {
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
            setNotice(`${label} copied to clipboard`);
            setError("");
        } catch {
            setError(`Unable to copy ${label.toLowerCase()}`);
        }
    }

    function cancelChanges() {
        router.push("/dashboard");
    }

    return {
        methods,
        profile,
        loading,
        error,
        notice,
        loadProfile,
        saveProfile,
        copyText,
        cancelChanges,
    };
}