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
            const { password, ...commonValues } = values;

            const result = editingUser
                ? await updateUser(editingUser.id, {
                    ...commonValues,
                    ...(password ? { password } : {}),
                })
                : await createUser({
                    ...commonValues,
                    password,
                });

            onSaved(result.message);
            onOpenChange(false);
        } catch (error) {
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
                </DialogHeader>

                <form
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-4 space-y-5"
                >
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="user-name">Full Name</Label>
                        <Input
                            id="user-name"
                            placeholder="Enter full name"
                            {...register("name")}
                            aria-invalid={!!errors.name}
                        />
                        <FieldError message={errors.name?.message} />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="user-email">Email Address</Label>
                        <Input
                            id="user-email"
                            type="email"
                            placeholder="name@example.com"
                            {...register("email")}
                            aria-invalid={!!errors.email}
                        />
                        <FieldError message={errors.email?.message} />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="user-password">
                            {isEdit ? "New Password (Optional)" : "Password"}
                        </Label>

                        <Input
                            id="user-password"
                            type="password"
                            autoComplete="new-password"
                            placeholder={
                                isEdit
                                    ? "Leave blank to keep existing password"
                                    : "Minimum 12 characters"
                            }
                            {...register("password")}
                            aria-invalid={!!errors.password}
                        />

                        <FieldError message={errors.password?.message} />
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <Label htmlFor="user-role">User Role</Label>

                        <select
                            id="user-role"
                            {...register("role")}
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>

                        <FieldError message={errors.role?.message} />
                    </div>

                    {/* Account status */}
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
                        <Controller
                            name="is_active"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="user-active"
                                    checked={field.value}
                                    onCheckedChange={(checked) =>
                                        field.onChange(checked === true)
                                    }
                                />
                            )}
                        />

                        <div>
                            <Label htmlFor="user-active" className="cursor-pointer">
                                Active Account
                            </Label>

                            <p className="mt-1 text-xs text-slate-500">
                                Active users can sign in.
                            </p>
                        </div>
                    </div>

                    <FieldError message={errors.root?.server?.message} />

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