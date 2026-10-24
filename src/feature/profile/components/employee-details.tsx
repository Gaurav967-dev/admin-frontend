"use client";

import Image from "next/image";
import { Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProfileField from "./profile-field";
import ProfileActions from "./profile-actions";
import type { ProfileData } from "../type/profile-type";

type Props = {
    profile: ProfileData;
    onCopy: (label: string, value: string) => void;
    onCancel: () => void;
};

export default function EmployeeDetails({
    profile,
    onCopy,
    onCancel,
}: Props) {
    const phoneLocked = Boolean(profile.phone?.trim());

    return (
        <section className="min-w-0 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Profile Image
            </h3>

            <Image
                src="/images/profile-avatar.jpg"
                alt="Employee profile photo"
                width={144}
                height={144}
                className="size-36 rounded-xl object-cover"
            />

            <h3 className="pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Employee Details
            </h3>

            <div className="space-y-2">
                <ProfileField
                    name="first_name"
                    id="first-name"
                    label="First Name"
                />

                <ProfileField
                    name="last_name"
                    id="last-name"
                    label="Last Name"
                />

                {/* Email is permanently read-only */}
                <div className="space-y-2">
                    <Label
                        htmlFor="email"
                        className="text-[11px] text-slate-500"
                    >
                        Email Address
                    </Label>

                    <div className="relative">
                        <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            readOnly
                            className="h-8 rounded-lg border-0 bg-[#f8f9fb] px-3 pr-10 text-xs dark:bg-slate-800"
                        />

                        <button
                            type="button"
                            onClick={() => onCopy("Email", profile.email)}
                            aria-label="Copy Email Address"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#6048ce]"
                        >
                            <Copy size={15} />
                        </button>
                    </div>
                </div>

                {/* Phone is editable only if missing */}
                <ProfileField
                    name="phone"
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    readOnly={phoneLocked}
                    placeholder={
                        phoneLocked ? "" : "+919876543210"
                    }
                    onCopy={(value) =>
                        onCopy("Phone number", value)
                    }
                />

                {!phoneLocked && (
                    <p className="text-[11px] text-slate-500">
                        You can add your phone number once.
                        After saving, it cannot be changed from your profile.
                    </p>
                )}

                <ProfileField
                    name="position"
                    id="position"
                    label="Position"
                />
            </div>

            {/* Desktop Save / Cancel */}
            <div className="hidden grid-cols-2 gap-2 pt-2 lg:grid">
                <ProfileActions onCancel={onCancel} />
            </div>
        </section>
    );
}