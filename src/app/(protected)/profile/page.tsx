"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { ArrowLeftIcon } from "@/components/icons/arrow-left";
import { BriefcaseBusinessIcon } from "@/components/icons/briefcase-business";
import { CalendarDaysIcon } from "@/components/icons/calendar-days";
import { ClipboardCheckIcon } from "@/components/icons/clipboard-check";
import { UserIcon } from "@/components/icons/user";

import { apiFetch, ApiError } from "@/lib/api";

import { profileToForm, profileToPayload, calculateProgress } from "@/lib/profile";

import type { ProfileData, ProfileFormValues, ProfileSaveResponse, TaskKey } from "@/types/profile";

type TextField = | "first_name" | "last_name" | "email" | "phone" | "position" | "team" | "manager" | "lead";

// A reusable labeled input for the profile.
function ProfileField({ id, label, value, onChange, type = "text", placeholder = "", required = false, readOnly = false }: {
  id: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-xs font-medium text-slate-500 dark:text-slate-400"
      >
        {label}
      </Label>

      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        className={`h-11 rounded-xl border-transparent bg-[#f8f9fb] px-4 text-sm text-slate-900 shadow-none focus-visible:border-[#6048ce] focus-visible:ring-[#6048ce]/20 dark:bg-slate-800 dark:text-white
          ${readOnly ? "cursor-default opacity-70" : ""}
        `}
      />
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [form, setForm] = useState<ProfileFormValues | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState<"full" | "onboarding" | null>(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Load profile

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiFetch<ProfileData>("/profile");

      setProfile(result);
      setForm(profileToForm(result));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/");
        return;
      }

      setError(err instanceof Error ? err.message : "Unable to load your profile");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // Form editing

  function updateText( field: TextField, value: string) {
    setForm((current) => current ? { ...current, [field]: value } : current);

    setNotice("");
  }

  function updateTask(
    key: TaskKey,
    changes: {
      enabled?: boolean;
      progress?: number;
    }
  ) {
    setForm((current) => {
      if (!current) return current;

      return {
        ...current,
        tasks: current.tasks.map((task) => task.key === key ? { ...task, ...changes } : task),
      };
    });

    setNotice("");
  }

  // PUT /profile

  async function saveFullProfile(event: FormEvent<HTMLFormElement>)
  {
    event.preventDefault();

    if (!form || saving) return;

    setError("");
    setNotice("");

    if (form.first_name.trim().length < 2) {
      setError("First name must contain at least 2 characters");
      return;
    }

    setSaving("full");

    try {
      const result = await apiFetch<ProfileSaveResponse>(
        "/profile",
        {
          method: "PUT",
          body: JSON.stringify(profileToPayload(form)),
        }
      );

      setProfile(result.profile);
      setForm(profileToForm(result.profile));
      setNotice(result.message);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your profile");
    } finally {
      setSaving(null);
    }
  }

  // PATCH /profile

  async function saveOnboarding() {
    if (!form || saving) return;

    setError("");
    setNotice("");
    setSaving("onboarding");

    try {
      // Only onboarding fields are updated.
      const result = await apiFetch<ProfileSaveResponse>(
        "/profile",
        {
          method: "PATCH",
          body: JSON.stringify({
            onboarding_start: form.onboarding_start || null,
            onboarding_required: form.onboarding_required,
            tasks: profileToPayload(form).tasks,
          }),
        }
      );

      setProfile(result.profile);

      // Preserve unsaved edits in employee details.
      setForm((current) =>
        current
          ? {
              ...current,
              onboarding_start: result.profile.onboarding_start ?? "",
              onboarding_required: result.profile.onboarding_required,
              tasks: result.profile.tasks,
            }
          : current
      );

      setNotice("Onboarding updated successfully");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save onboarding");
    } finally {
      setSaving(null);
    }
  }

  // Page states

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
      >
        <div className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#6048ce]" />

        <p className="text-sm text-slate-500">
          Loading employee profile...
        </p>
      </div>
    );
  }

  if (!form || !profile) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
        <p role="alert" className="text-sm text-red-600">
          {error || "Profile could not be loaded."}
        </p>

        <Button
          type="button"
          onClick={loadProfile}
          className="mt-4 bg-[#6048ce] text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const progress = calculateProgress(form);
  const hasEnabledTasks = form.tasks.some(
    (task) => task.enabled
  );

  const status = !form.onboarding_required ? "Not Required" : !hasEnabledTasks ? "Not Started" : progress === 100 ? "Completed" : progress > 0 ? "Onboarding" : "Not Started";

  return (
    <div className="mx-auto max-w-[1400px]">

      {/* Page heading */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#6048ce] hover:text-[#6048ce] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <ArrowLeftIcon
              size={20}
              className="flex size-5 items-center justify-center"
            />
          </Link>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {profile.first_name} {profile.last_name}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Employee profile and onboarding management
            </p>
          </div>
        </div>

        <span className="rounded-full bg-purple-50 px-4 py-2 text-xs font-medium text-[#6048ce] dark:bg-purple-950/40 dark:text-purple-300">
          Employee ID: EMP-{String(profile.user_id).padStart(5, "0")}
        </span>
      </div>

      {/* Success message */}
      {notice && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400"
        >
          {notice}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30"
        >
          {error}
        </div>
      )}

      <form onSubmit={saveFullProfile}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">

          {/* Column 1 - Employee Details */}
          <section className="min-w-0 rounded-xl border bg-white p-4 dark:bg-slate-900">

            <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40">
                <UserIcon
                  size={20}
                  className="flex size-5 items-center justify-center text-[#6048ce]"
                />
              </div>

              <div>
                <h3 className="font-semibold leading-6 text-slate-900 dark:text-white">
                  Employee Details
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Personal information
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <ProfileField
                id="first-name"
                label="First Name"
                value={form.first_name}
                required
                onChange={(value) => updateText("first_name", value)}
              />

              <ProfileField
                id="last-name"
                label="Last Name"
                value={form.last_name}
                onChange={(value) => updateText("last_name", value)}
              />

              <ProfileField
                id="email"
                label="Email Address"
                type="email"
                value={form.email}
                required
                onChange={(value) => updateText("email", value)}
              />

              <ProfileField
                id="phone"
                label="Phone Number"
                type="tel"
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={(value) => updateText("phone", value)}
              />

              <ProfileField
                id="position"
                label="Position"
                placeholder="Software Developer"
                value={form.position}
                onChange={(value) => updateText("position", value)}
              />
            </div>
          </section>

          {/* Column 2 - Organization */}
          <section className="min-w-0 rounded-xl border bg-white p-4 dark:bg-slate-900">

            <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
                <BriefcaseBusinessIcon
                  size={20}
                  className="flex size-5 items-center justify-center text-blue-500"
                />
              </div>

              <div>
                <h3 className="font-semibold leading-6 text-slate-900 dark:text-white">
                  Organization
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Role and team information
                </p>
              </div>
            </div>

            <div className="space-y-3">

              {/* Role comes from the auth database */}
              <ProfileField
                id="role"
                label="Role"
                value={ profile.role === "admin" ? "Administrator" : "Employee" }
                readOnly
              />

              <p className="-mt-3 text-xs text-slate-400">
                Only an administrator can change account roles.
              </p>

              <ProfileField
                id="team"
                label="Team / Department"
                placeholder="Engineering"
                value={form.team}
                onChange={(value) => updateText("team", value)}
              />

              <ProfileField
                id="manager"
                label="Manager"
                placeholder="Manager's name"
                value={form.manager}
                onChange={(value) => updateText("manager", value)}
              />

              <ProfileField
                id="lead"
                label="Team Lead"
                placeholder="Team lead's name"
                value={form.lead}
                onChange={(value) => updateText("lead", value)}
              />

              <div className="rounded-xl bg-[#f8f9fc] p-4 dark:bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Account Information
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">
                    Account ID
                  </span>

                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    #{profile.user_id}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">
                    Account Type
                  </span>

                  <span className="text-sm font-medium capitalize text-[#6048ce]">
                    {profile.role}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Column 3 - Onboarding */}
          <section className="min-w-0 rounded-xl border bg-white p-4 dark:bg-slate-900">

            <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/40">
                <ClipboardCheckIcon
                  size={20}
                  className="flex size-5 items-center justify-center text-green-500"
                />
              </div>

              <div>
                <h3 className="font-semibold leading-6 text-slate-900 dark:text-white">
                  Onboarding
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Employee onboarding progress
                </p>
              </div>
            </div>

            <div className="space-y-6">

              {/* Start date */}
              <div className="space-y-2">
                <Label
                  htmlFor="onboarding-start"
                  className="text-xs text-slate-500 dark:text-slate-400"
                >
                  Starts On
                </Label>

                
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center justify-center">
                    <CalendarDaysIcon
                      size={18}
                      className="flex size-[18px] items-center justify-center text-slate-400"
                    />
                  </div>

                  <Input
                    id="onboarding-start"
                    type="date"
                    value={form.onboarding_start}
                    onChange={(event) => setForm((current) => current ? { ...current, onboarding_start: event.target.value } : current)}
                    className="h-11 rounded-xl border-0 bg-[#f8f9fb] pl-10 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Onboarding enabled */}
              <div className="flex items-center justify-between gap-4">
                <Label
                  htmlFor="onboarding-required"
                  className="text-sm font-medium"
                >
                  Onboarding required
                </Label>

                <Switch
                  id="onboarding-required"
                  checked={form.onboarding_required}
                  onCheckedChange={(checked) => setForm((current) => current ? { ...current, onboarding_required: checked } : current)}
                  className="data-[state=checked]:bg-[#6048ce]"
                />
              </div>

              {/* Progress summary */}
              <div className="rounded-xl bg-[#f8f9fc] p-4 dark:bg-slate-800/60">

                <p className="mb-3 text-xs font-medium text-slate-500">
                  Current Status
                </p>

                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
                    {status}
                  </span>

                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {progress}%
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-label="Overall onboarding progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                >
                  <div
                    className="h-full rounded-full bg-[#6048ce] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Onboarding tasks */}
              <div>
                <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Onboarding Scripts
                </h4>

                <div className="space-y-4">
                  {form.tasks.map((task) => (
                    <div
                      key={task.key}
                      className="border-b border-slate-100 pb-4 last:border-0 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-2">
                          <Switch
                            checked={task.enabled}
                            disabled={!form.onboarding_required}
                            onCheckedChange={(checked) => updateTask(task.key, { enabled: checked })}
                            aria-label={`Enable ${task.label}`}
                            className="scale-90 data-[state=checked]:bg-blue-500"
                          />

                          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                            {task.label}
                          </span>
                        </div>

                        <span className="text-xs font-semibold text-slate-500">
                          {task.progress}%
                        </span>
                      </div>

                      <div
                        role="progressbar"
                        aria-label={`${task.label} progress`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={task.progress}
                        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                      >
                        <div
                          className="h-full rounded-full bg-sky-500 transition-all"
                          style={{
                            width: `${task.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partial update */}
              <Button
                type="button"
                variant="outline"
                disabled={saving !== null}
                onClick={saveOnboarding}
                className="w-full rounded-xl dark:border-slate-700"
              >
                {saving === "onboarding" ? "Saving Onboarding..." : "Save Onboarding"}
              </Button>
            </div>
          </section>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row">

          <Button
            type="button"
            variant="outline"
            disabled={saving !== null}
            onClick={() => {
              setForm(profileToForm(profile));
              setError("");
              setNotice("");
            }}
            className="h-11 min-w-40 rounded-xl dark:border-slate-700"
          >
            Reset Changes
          </Button>

          <Button
            type="submit"
            disabled={saving !== null}
            className="h-11 min-w-44 rounded-xl bg-[#292d32] text-white hover:bg-black dark:bg-[#6048ce] dark:hover:bg-[#5039b7]"
          >
            {saving === "full" ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}