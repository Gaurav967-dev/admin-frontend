"use client";

import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { apiFetch } from "@/lib/api";
import type { DashboardUser } from "@/types/dashboard";

// Validation

const commonSchema = z.object({
    name: z.string().trim()
        .min(2, "Name must have at least 2 characters")
        .max(100, "Name is too long"),

    email: z.string().trim()
        .email("Enter a valid email address")
        .max(255, "Email is too long"),

    role: z.enum(["user", "admin"]),

    is_active: z.boolean(),
});

const createSchema = commonSchema.extend({
    password: z.string()
        .min(12, "Password must have at least 12 characters")
        .max(128, "Password is too long"),
});

const editSchema = commonSchema.extend({
    password: z.string()
        .min(12, "Password must have at least 12 characters")
        .max(128, "Password is too long")
        .optional(),
});

// Types

type FormValues = {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    is_active: boolean;
};

type FormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingUser: DashboardUser | null;
    onSaved: (message: string) => void;
};

const defaultValues: FormValues = {
    name: "",
    email: "",
    password: "",
    role: "user",
    is_active: true,
};

// Component

export default function UserFormDialog({
    open,
    onOpenChange,
    editingUser,
    onSaved,
}: FormProps) {
    const isEdit = editingUser !== null;

    const [form, setForm] = useState<FormValues>(
        defaultValues
    );

    const [errors, setErrors] = useState<
        Record<string, string>
    >({});

    const [apiError, setApiError] = useState("");
    const [loading, setLoading] = useState(false);

    // Fill the form when editing an existing user.
    useEffect(() => {
        if (!open) return;

        setForm(
            editingUser
                ? {
                    name: editingUser.name,
                    email: editingUser.email,
                    password: "",
                    role: editingUser.role as "user" | "admin",
                    is_active: editingUser.is_active,
                }
                : { ...defaultValues }
        );

        setErrors({});
        setApiError("");
    }, [open, editingUser]);

    function updateField<K extends keyof FormValues>(
        field: K,
        value: FormValues[K]
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setErrors((current) => ({
            ...current,
            [field]: "",
        }));
    }

    // Submit

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (loading) return;

        setErrors({});
        setApiError("");

        const payload = {
            name: form.name,
            email: form.email,
            role: form.role,
            is_active: form.is_active,
            ...(
                !isEdit || form.password.length > 0
                    ? { password: form.password }
                    : {}
            ),
        };

        const validation = isEdit ? editSchema.safeParse(payload) : createSchema.safeParse(payload);

        if (!validation.success) {
            const fieldErrors: Record<string, string> = {};

            validation.error.issues.forEach((issue) => {
                const field = String(issue.path[0]);

                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            });

            setErrors(fieldErrors);
            return;
        }

        setLoading(true);

        try {
            const path = isEdit ? `/user?user_id=${editingUser.id}` : "/user";

            const result = await apiFetch<{
                message: string;
                user: DashboardUser;
            }>(path, {
                method: isEdit ? "PUT" : "POST",
                body: JSON.stringify(validation.data),
            });

            onSaved(result.message);
            onOpenChange(false);

        } catch (err) {
            setApiError(
                err instanceof Error ? err.message : "Unable to save user"
            );
        } finally {
            setLoading(false);
        }
    }

    // UI

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!loading) {
                    onOpenChange(nextOpen);
                }
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {isEdit ? "Edit User" : "Create New User"}
                    </DialogTitle>

                    <DialogDescription>
                        {isEdit ? "Update the user's account information." : "Enter the details to create a new account."}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="mt-4 space-y-5"
                >
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="user-name">
                            Full Name
                        </Label>

                        <Input
                            id="user-name"
                            placeholder="Enter full name"
                            value={form.name}
                            onChange={(event) =>
                                updateField("name", event.target.value)
                            }
                            aria-invalid={!!errors.name}
                        />

                        {errors.name && (
                            <p className="text-xs text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="user-email">
                            Email Address
                        </Label>

                        <Input
                            id="user-email"
                            type="email"
                            placeholder="name@example.com"
                            value={form.email}
                            onChange={(event) => updateField("email", event.target.value)}
                            aria-invalid={!!errors.email}
                        />

                        {errors.email && (
                            <p className="text-xs text-red-500">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="user-password">
                            {isEdit ? "New Password (Optional)" : "Password"}
                        </Label>

                        <Input
                            id="user-password"
                            type="password"
                            placeholder={
                                isEdit ? "Leave blank to keep existing password" : "Minimum 12 characters"
                            }
                            autoComplete="new-password"
                            value={form.password}
                            onChange={(event) => updateField("password", event.target.value)}
                            aria-invalid={!!errors.password}
                        />

                        {errors.password && (
                            <p className="text-xs text-red-500">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <Label htmlFor="user-role">
                            User Role
                        </Label>

                        <select
                            id="user-role"
                            value={form.role}
                            onChange={(event) => updateField("role", event.target.value as "user" | "admin")
                            }
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#6048ce] focus:ring-2 focus:ring-[#6048ce]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Account Status */}
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
                        <Checkbox
                            id="user-active"
                            checked={form.is_active}
                            onCheckedChange={(checked) =>
                                updateField("is_active", checked === true)
                            }
                        />

                        <div>
                            <Label
                                htmlFor="user-active"
                                className="cursor-pointer"
                            >
                                Active Account
                            </Label>

                            <p className="mt-1 text-xs text-slate-500">
                                Active users can sign in.
                            </p>
                        </div>
                    </div>

                    {/* Backend error */}
                    {apiError && (
                        <div
                            role="alert"
                            className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30"
                        >
                            {apiError}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={loading}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[#6048ce] text-white hover:bg-[#5039b7]"
                        >
                            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}