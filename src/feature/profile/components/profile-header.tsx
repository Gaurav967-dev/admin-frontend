import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon } from "@/components/icons/arrow-left";
import ProfileActions from "./profile-actions";
import type { ProfileData } from "../type/profile-type";

type Props = {
    profile: ProfileData;
    onCancel: () => void;
};

export default function ProfileHeader({
    profile,
    onCancel,
}: Props) {
    const addedOn = profile.created_at
        ? new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "UTC",
        })
            .format(new Date(profile.created_at))
            .replaceAll("/", ".")
        : "Unavailable";

    return (
        <div className="sticky top-0 z-40 -mx-3 mb-3 flex flex-nowrap items-center gap-2 border-b border-slate-100 bg-white px-3 py-2 shadow-sm sm:-mx-5 sm:px-5 lg:-mx-6 lg:px-6 dark:border-slate-800 dark:bg-[#171c28]">

            <div className="flex min-w-0 flex-1 items-center gap-2">
                <Link
                    href="/dashboard"
                    aria-label="Back to dashboard"
                    className="shrink-0 text-slate-600 hover:text-[#6048ce]"
                >
                    <ArrowLeftIcon size={18} />
                </Link>

                <Image
                    src="/images/profile-avatar.jpg"
                    alt={`${profile.first_name} ${profile.last_name}`}
                    width={40}
                    height={40}
                    className="size-9 shrink-0 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                />

                <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-slate-900 dark:text-white sm:text-xl">
                        {profile.first_name} {profile.last_name}
                    </h2>

                    <p className="truncate text-[10px] text-slate-500 lg:hidden">
                        Added on {addedOn}
                    </p>
                </div>
            </div>

            <span className="hidden shrink-0 text-xs text-slate-500 lg:inline">
                Added on {addedOn}
            </span>

            <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-1 sm:gap-2">
                <ProfileActions
                    compact
                    onCancel={onCancel}
                />
            </div>
        </div>
    );
}