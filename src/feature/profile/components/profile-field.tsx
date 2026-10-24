"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldError from "@/components/custom-ui/field-error";
import type { ProfileFormValues } from "../type/profile-type";

type FieldName = | "first_name" | "last_name" | "phone" | "position" | "team" | "manager" | "lead";

type Props = {
    name: FieldName;
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    readOnly?: boolean;
    onCopy?: (value: string) => void;
};

export default function ProfileField({
    name,
    id,
    label,
    type = "text",
    placeholder = "",
    readOnly = false,
    onCopy,
}: Props) {
    const { control } = useFormContext<ProfileFormValues>();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <div className="space-y-2">
                    <Label
                        htmlFor={id}
                        className="text-[11px] text-slate-500"
                    >
                        {label}
                    </Label>

                    <div className="relative">
                        <Input
                            {...field}
                            id={id}
                            type={type}
                            value={field.value ?? ""}
                            placeholder={placeholder}
                            readOnly={readOnly}
                            aria-invalid={!!fieldState.error}
                            aria-describedby={fieldState.error ? `${id}-error` : undefined}
                            className={`h-8 rounded-lg border-0 bg-[#f8f9fb] px-3 text-xs dark:bg-slate-800 ${onCopy ? "pr-10" : ""
                                }`}
                        />

                        {onCopy && (
                            <button
                                type="button"
                                onClick={() => onCopy(field.value)}
                                disabled={!field.value}
                                aria-label={`Copy ${label}`}
                                title={`Copy ${label}`}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#6048ce] disabled:opacity-40"
                            >
                                <Copy size={15} />
                            </button>
                        )}
                    </div>

                    <FieldError
                        id={`${id}-error`}
                        message={fieldState.error?.message}
                    />
                </div>
            )}
        />
    );
}