"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { ProfileFormValues } from "../type/profile-type";

type Props = {
    compact?: boolean;
    onCancel: () => void;
};

export default function ProfileActions({
    compact = false,
    onCancel,
}: Props) {
    const {
        formState: { isSubmitting },
    } = useFormContext<ProfileFormValues>();

    return (
        <>
            <Button
                type="submit"
                form="employee-profile-form"
                disabled={isSubmitting}
                aria-label="Save Changes"
                className={
                    compact
                        ? "h-8 shrink-0 bg-[#292d32] px-2 text-[11px] text-white hover:bg-black sm:px-3 sm:text-xs"
                        : "h-9 bg-[#292d32] text-white hover:bg-black"
                }
            >
                {compact ? (
                    <>
                        <span className="sm:hidden">
                            {isSubmitting ? "Saving" : "Save"}
                        </span>
                        <span className="hidden sm:inline">
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </span>
                    </>
                ) : (
                    isSubmitting ? "Saving..." : "Save Changes"
                )}
            </Button>

            <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={onCancel}
                className={
                    compact
                        ? "h-8 shrink-0 px-2 text-[11px] sm:px-3 sm:text-xs"
                        : "h-9"
                }
            >
                Cancel
            </Button>
        </>
    );
}