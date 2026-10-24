"use client";

import { Input } from "@/components/ui/input";
import ProfileField from "./profile-field";
import type { ProfileData } from "../type/profile-type";

type Props = {
    profile: ProfileData;
};

export default function TeamDetails({ profile }: Props) {
    return (
        <section className="min-w-0 space-y-4">
            <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                </h3>

                <Input
                    value={
                        profile.role === "admin"
                            ? "Administrator"
                            : "Employee"
                    }
                    readOnly
                    aria-label="Role"
                    className="h-9 border-0 bg-[#f8f9fb] text-xs dark:bg-slate-800"
                />
            </div>

            <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Team
                </h3>

                <ProfileField
                    name="team"
                    id="team"
                    label="Team / Department"
                    placeholder="Engineering"
                />

                <ProfileField
                    name="manager"
                    id="manager"
                    label="Manager"
                    placeholder="Manager name"
                />

                <ProfileField
                    name="lead"
                    id="lead"
                    label="Team Lead"
                    placeholder="Team lead name"
                />
            </div>
        </section>
    );
}