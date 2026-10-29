"use client";

import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import ProfileHeader from "../components/profile-header";
import ProfileForm from "../form/profile-form";
import { useProfile } from "@/hooks/use-profile";

export default function ProfileContainer() {
    const {
        methods,
        profile,
        loading,
        error,
        refetchProfile,
        saveProfile,
        copyText,
        cancelChanges,
    } = useProfile();

    if (loading) {
        return (
            <div
                role="status"
                className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
            >
                <div className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#6048ce]" />
                <p className="text-sm text-slate-500">
                    Loading employee profile...
                </p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
                <p role="alert" className="text-sm text-red-600">
                    {error || "Profile could not be loaded."}
                </p>

                <Button
                    type="button"
                    onClick={() => void refetchProfile()}
                    className="mt-4 bg-[#6048ce] text-white"
                >
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <div className="w-full">
                <ProfileHeader
                    profile={profile}
                    onCancel={cancelChanges}
                />

                {error && (
                    <p role="alert" className="mb-2 text-xs text-red-600">
                        {error}
                    </p>
                )}

                <ProfileForm
                    profile={profile}
                    onSubmit={methods.handleSubmit(saveProfile)}
                    onCopy={(label, value) => {
                        void copyText(label, value);
                    }}
                    onCancel={cancelChanges}
                />
            </div>
        </FormProvider>
    );
}