"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { calculateProgress } from "../utils/profile-utils";
import type { ProfileFormValues, TaskKey } from "../type/profile-type";

export default function OnboardingSection() {
    const {
        control,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<ProfileFormValues>();

    const values = watch();
    const tasks = values.tasks;
    const onboardingRequired = values.onboarding_required;

    const progress = calculateProgress(values);

    const hasEnabledTasks = tasks.some(
        (task) => task.enabled
    );

    const status = !onboardingRequired
        ? "Not Required"
        : !hasEnabledTasks
            ? "Not Started"
            : progress === 100
                ? "Completed"
                : progress > 0
                    ? "Onboarding"
                    : "Not Started";

    function updateTask(key: TaskKey, enabled: boolean) {
        setValue(
            "tasks",
            tasks.map((task) =>
                task.key === key
                    ? { ...task, enabled }
                    : task
            ),
            {
                shouldDirty: true,
                shouldValidate: true,
            }
        );
    }

    return (
        <section className="min-w-0 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Onboarding
            </h3>

            {/* Onboarding date */}
            <div className="space-y-1">
                <Label
                    htmlFor="onboarding-start"
                    className="text-[11px] text-slate-500"
                >
                    Starts On
                </Label>

                <Controller
                    name="onboarding_start"
                    control={control}
                    render={({ field, fieldState }) => (
                        <>
                            <Input
                                {...field}
                                id="onboarding-start"
                                type="date"
                                value={field.value ?? ""}
                                aria-invalid={!!fieldState.error}
                                className="h-8 border-0 bg-[#f8f9fb] text-xs dark:bg-slate-800"
                            />
                            {fieldState.error && (
                                <p role="alert" className="text-xs text-red-600">
                                    {fieldState.error.message}
                                </p>
                            )}
                        </>
                    )}
                />
            </div>

            {/* Required switch */}
            <div className="flex items-center justify-between gap-3 py-1">
                <Label
                    htmlFor="onboarding-required"
                    className="text-xs"
                >
                    Onboarding required
                </Label>

                <Controller
                    name="onboarding_required"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="onboarding-required"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    )}
                />
            </div>

            {/* Overall progress */}
            <div className="rounded-lg bg-[#f8f9fb] p-3 dark:bg-slate-800">
                <p className="mb-2 text-[11px] text-slate-500">
                    Current Status
                </p>

                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                        {status}
                    </span>

                    <span className="text-xs font-semibold">
                        {progress}%
                    </span>
                </div>

                <div
                    role="progressbar"
                    aria-label="Overall onboarding progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"
                >
                    <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <h4 className="pt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                Onboarding Scripts
            </h4>

            {/* Task switches and read-only progress */}
            <div>
                {tasks.map((task) => (
                    <div
                        key={task.key}
                        className="border-b border-slate-100 py-1.5 last:border-0 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                                <Switch
                                    checked={task.enabled}
                                    disabled={!onboardingRequired}
                                    onCheckedChange={(checked) =>
                                        updateTask(task.key, checked)
                                    }
                                    aria-label={`Enable ${task.label}`}
                                    className="scale-75"
                                />

                                <span className="text-[11px] leading-tight text-slate-700 dark:text-slate-200">
                                    {task.label}
                                </span>
                            </div>

                            <span className="shrink-0 text-[11px] text-slate-500">
                                {task.progress}%
                            </span>
                        </div>

                        <div
                            role="progressbar"
                            aria-label={`${task.label} progress`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={task.progress}
                            className="mt-1 h-1 overflow-hidden rounded-full bg-slate-200"
                        >
                            <div
                                className="h-full rounded-full bg-sky-500"
                                style={{ width: `${task.progress}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            {errors.tasks && (
                <p role="alert" className="text-xs text-red-600">
                    Please check the onboarding task values.
                </p>
            )}
        </section>
    );
}