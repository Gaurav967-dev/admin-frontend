"use client";

import { useState, type ComponentProps } from "react";
import { EyeOff } from "lucide-react"
import { EyeIcon } from "@/components/icons/eye";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = Omit<ComponentProps<typeof Input>, "type">;

export default function PasswordInput({
    className,
    ...props
}: Props) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <Input
                {...props}
                type={visible ? "text" : "password"}
                className={cn("pr-12", className)}
            />

            <button
                type="button"
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                onClick={() => setVisible((current) => !current)}
                className="absolute inset-y-0 right-2 flex w-9 items-center justify-center rounded text-slate-500 hover:text-[#6048ce] focus-visible:outline-2 focus-visible:outline-[#6048ce]"
            >
                {visible ? (
                    <EyeOff size={20} aria-hidden="true" />
                ) : (
                    <EyeIcon size={20} className="size-5" />
                )}
            </button>
        </div>
    );
}