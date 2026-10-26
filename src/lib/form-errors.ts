import type { FieldValues, FieldPath, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api";

export function applyServerValidationErrors<
    T extends FieldValues
>(
    error: unknown,
    setError: UseFormSetError<T>,
    allowedFields: readonly FieldPath<T>[]
): boolean {
    if (
        !(error instanceof ApiError) ||
        error.status !== 422
    ) {
        return false;
    }

    let matched = false;

    for (const [fieldName, message] of Object.entries(
        error.fieldErrors
    )) {
        const field = allowedFields.find(
            (name) =>
                fieldName === name ||
                fieldName.startsWith(`${name}.`)
        );

        if (!field) continue;

        setError(field, {
            type: "server",
            message,
        });

        matched = true;
    }

    // If backend error has no matching form field, display it at form level instead.
    if (!matched) {
        setError("root.server", {
            type: "server",
            message: error.message,
        });
    }

    return true;
}