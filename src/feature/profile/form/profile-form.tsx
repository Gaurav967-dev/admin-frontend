"use client";

import type { FormEventHandler } from "react";
import EmployeeDetails from "../components/employee-details";
import TeamDetails from "../components/team-details";
import OnboardingSection from "../components/onboarding-section";
import ProfileActions from "../components/profile-actions";
import type { ProfileData } from "../type/profile-type";

type Props = {
    profile: ProfileData;
    onSubmit: FormEventHandler<HTMLFormElement>;
    onCopy: (label: string, value: string) => void;
    onCancel: () => void;
};

export default function ProfileForm({
    profile,
    onSubmit,
    onCopy,
    onCancel,
}: Props) {
    return (
        <form
            id="employee-profile-form"
            noValidate
            onSubmit={onSubmit}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7"
        >
            <EmployeeDetails
                profile={profile}
                onCopy={onCopy}
                onCancel={onCancel}
            />

            <TeamDetails profile={profile} />

            <OnboardingSection />

            {/* Mobile and tablet buttons */}
            <div className="mt-3 grid grid-cols-2 gap-2 md:col-span-2 lg:hidden">
                <ProfileActions onCancel={onCancel} />
            </div>
        </form>
    );
}