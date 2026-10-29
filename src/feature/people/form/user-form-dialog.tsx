"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FieldError from "@/components/custom-ui/field-error";

import { createUserSchema, editUserSchema, type UserFormValues } from "../schema/user-schema";
import { createUser, updateUser } from "@/service/user-service";
import { ApiError } from "@/lib/api";
import { applyServerValidationErrors } from "@/lib/form-errors";
import { useMutation } from "@tanstack/react-query";
import PasswordInput from "@/components/custom-ui/password-input";
import type { DashboardUser } from "@/types/dashboard";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingUser: DashboardUser | null;
    onSaved: (message: string) => void;
};

const defaultValues: UserFormValues = {
    name: "",
    email: "",
    password: "",
    role: "user",
    is_active: true,
};

export default function UserFormDialog({
    open,
    onOpenChange,
    editingUser,
    onSaved,
}: Props) {
    const isEdit = editingUser !== null;

    const saveUserMutation = useMutation({
        mutationFn: async (values: UserFormValues) => {
            const { password, ...commonValues } = values;

            if (editingUser) {
                return updateUser(editingUser.id, {
                    ...commonValues,
                    ...(password ? { password } : {}),
                });
            }

            return createUser({
                ...commonValues,
                password,
            });
        },
    });

    const {
        register,
        control,
        reset,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<UserFormValues>({
        resolver: zodResolver(
            isEdit ? editUserSchema : createUserSchema
        ),
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues,
    });

    // Fill fields when Create or Edit opens.
    useEffect(() => {
        if (!open) return;

        reset(
            editingUser
                ? {
                    name: editingUser.name,
                    email: editingUser.email,
                    password: "",
                    role: editingUser.role as "user" | "admin",
                    is_active: editingUser.is_active,
                }
                : defaultValues
        );
    }, [open, editingUser, reset]);

    async function onSubmit(values: UserFormValues) {
        try {
            const result = await saveUserMutation.mutateAsync(values);

            onSaved(result.message);
            onOpenChange(false);
        } catch (error) {
            if (
                applyServerValidationErrors<UserFormValues>(
                    error,
                    setError,
                    [
                        "name",
                        "email",
                        "password",
                        "role",
                        "is_active",
                    ]
                )
            ) {
                return;
            }

            if (
                error instanceof ApiError &&
                error.status === 409
            ) {
                setError("email", {
                    type: "server",
                    message: "Email already registered",
                });
                return;
            }

            setError("root.server", {
                type: "server",
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to save user",
            });
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!isSubmitting) {
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
                        {isEdit
                            ? "Update the user's account information."
                            : "Enter the details to create a new account."}
                    </DialogDescription>
                    {!isEdit && (
                        <p className="text-xs text-slate-500">
                            <span className="text-red-600">*</span> Required fields
                        </p>
                    )}
                </DialogHeader>

                <form
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-4 space-y-5"
                >
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="user-name">
                            Full Name <span className="text-red-600" aria-hidden="true">*</span>
                        </Label>

                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="user-name"
                                    name={field.name}
                                    ref={field.ref}
                                    value={field.value}
                                    onBlur={field.onBlur}
                                    onChange={(event) => {
                                        const lettersOnly = event.target.value.replace(/[^\p{L} ]/gu, "");
                                        field.onChange(lettersOnly);
                                    }}
                                    placeholder="Enter full name"
                                    autoComplete="name"
                                    required
                                    aria-invalid={!!errors.name}
                                />
                            )}
                        />

                        <FieldError message={errors.name?.message} />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="user-email">
                            Email Address <span className="text-red-600" aria-hidden="true">*</span>
                        </Label>

                        <Input
                            id="user-email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            {...register("email")}
                            aria-invalid={!!errors.email}
                        />
                        <FieldError message={errors.email?.message} />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="user-password">
                            {isEdit ? "New Password (Optional)" : (
                                <>
                                    Password <span className="text-red-600" aria-hidden="true">*</span>
                                </>
                            )}
                        </Label>

                        <PasswordInput
                            id="user-password"
                            autoComplete="new-password"
                            placeholder={
                                isEdit
                                    ? "Leave blank to keep existing password"
                                    : "Minimum 12 characters"
                            }
                            {...register("password")}
                            required={!isEdit}
                            aria-invalid={!!errors.password}
                        />

                        <p className="text-xs text-slate-500">
                            12-128 characters, including uppercase, lowercase, a number and a special character.
                        </p>

                        <FieldError message={errors.password?.message} />
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <Label htmlFor="user-role">
                            User Role <span className="text-red-600" aria-hidden="true">*</span>
                        </Label>

                        <select
                            id="user-role"
                            required
                            {...register("role")}
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>

                        <FieldError message={errors.role?.message} />
                    </div>

                    {/* Account status */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
                            <Controller
                                name="is_active"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="user-active"
                                        checked={field.value}
                                        onBlur={field.onBlur}
                                        onCheckedChange={(checked) =>
                                            field.onChange(checked === true)
                                        }
                                        aria-required={!isEdit}
                                        aria-invalid={!!errors.is_active}
                                        aria-describedby={
                                            errors.is_active
                                                ? "user-active-error"
                                                : undefined
                                        }
                                    />
                                )}
                            />

                            <div>
                                <Label
                                    htmlFor="user-active"
                                    className="cursor-pointer"
                                >
                                    Active Account{" "}
                                    {!isEdit && (
                                        <span
                                            className="text-red-600"
                                            aria-hidden="true"
                                        >
                                            *
                                        </span>
                                    )}
                                </Label>

                                <p className="mt-1 text-xs text-slate-500">
                                    {isEdit
                                        ? "Uncheck to deactivate this account."
                                        : "Active Account must be checked to create a user."
                                    }
                                </p>
                            </div>
                        </div>

                        <FieldError
                            id="user-active-error"
                            message={errors.is_active?.message}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#6048ce] text-white hover:bg-[#5039b7]"
                        >
                            {isSubmitting
                                ? "Saving..."
                                : isEdit
                                    ? "Save Changes"
                                    : "Create User"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}