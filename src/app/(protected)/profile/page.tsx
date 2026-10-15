"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { ArrowLeftIcon } from "@/components/icons/arrow-left";
import { Copy } from "lucide-react";

import { apiFetch, ApiError } from "@/lib/api";

import { profileToForm, profileToPayload, calculateProgress } from "@/lib/profile";

import type { ProfileData, ProfileFormValues, ProfileSaveResponse, TaskKey } from "@/types/profile";

type TextField = | "first_name" | "last_name" | "email" | "phone" | "position" | "team" | "manager" | "lead";

// A reusable labeled input for the profile.
function ProfileField({ id, label, value, onChange, onCopy, type = "text", placeholder = "", required = false, readOnly = false }: {
  id: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  onCopy?: () => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-[11px] text-slate-500"
      >
        {label}
      </Label>

      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          className={`h-8 rounded-lg border-0 bg-[#f8f9fb] px-3 text-xs dark:bg-slate-800
            ${onCopy ? "pr-10" : ""}
          `}
        />

        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            disabled={!value}
            aria-label={`Copy ${label}`}
            title={`Copy ${label}`}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#6048ce] disabled:opacity-40"
          >
            <Copy size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [form, setForm] = useState<ProfileFormValues | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState<"full" | null>(null);

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

  async function copyText(label: string, value: string) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied to clipboard`);
      setError("");
    } catch {
      setError(`Unable to copy ${label.toLowerCase()}`);
    }
  }

  const actionButtons = (
    <>
      <Button
        type="submit"
        disabled={saving !== null}
        className="h-9 bg-[#292d32] text-white"
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>

      <Button
        type="button"
        variant="secondary"
        disabled={saving !== null}
        onClick={() => {
          setForm(profileToForm(profile));
          setError("");
          setNotice("");
        }}
        className="h-9"
      >
        Cancel
      </Button>
    </>
  );
  
  return (
    <div className="mx-auto w-full max-w-[1150px]">

      {/* Page header */}
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="text-slate-600 hover:text-[#6048ce]"
          >
            <ArrowLeftIcon size={19} />
          </Link>

          <h2 className="truncate text-xl font-semibold text-slate-900 dark:text-white">
            {profile.first_name} {profile.last_name}
          </h2>
        </div>

        <span className="shrink-0 text-xs text-slate-500">
          EMP-{String(profile.user_id).padStart(5, "0")}
        </span>
      </div>

      {error && (
        <p role="alert" className="mb-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {notice && (
        <p role="status" className="mb-2 text-xs text-green-600">
          {notice}
        </p>
      )}

      <form
        onSubmit={saveFullProfile}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7"
      >

        {/* Left: Photo and employee details */}
        <section className="min-w-0 space-y-3">

          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Profile Image
          </h3>

          <Image
            src="/images/profile-avatar.jpg"
            alt="Employee profile photo"
            width={144}
            height={144}
            className="size-36 rounded-xl object-cover"
          />

          <h3 className="pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Employee Details
          </h3>

          <div className="space-y-2">
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
              onCopy={() => void copyText("Email", form.email)}
            />

            <ProfileField
              id="phone"
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={(value) => updateText("phone", value)}
              onCopy={() => void copyText("Phone number", form.phone)}
            />

            <ProfileField
              id="position"
              label="Position"
              value={form.position}
              onChange={(value) => updateText("position", value)}
            />
          </div>

          {/* Desktop buttons */}
          <div className="hidden grid-cols-2 gap-2 pt-2 lg:grid">
            {actionButtons}
          </div>
        </section>

        {/* Middle: Role and team information */}
        <section className="min-w-0 space-y-4">

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Role
            </h3>

            <Input
              value={profile.role === "admin" ? "Administrator" : "Employee"}
              readOnly
              aria-label="Role"
              className="h-9 border-0 bg-[#f8f9fb] text-xs dark:bg-slate-800"
            />
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Team
            </h3>

            <ProfileField
              id="team"
              label="Team / Department"
              value={form.team}
              placeholder="Engineering"
              onChange={(value) => updateText("team", value)}
            />

            <ProfileField
              id="manager"
              label="Manager"
              value={form.manager}
              placeholder="Manager name"
              onChange={(value) => updateText("manager", value)}
            />

            <ProfileField
              id="lead"
              label="Team Lead"
              value={form.lead}
              placeholder="Team lead name"
              onChange={(value) => updateText("lead", value)}
            />
          </div>
        </section>

        {/* Right: Onboarding */}
        <section className="min-w-0 space-y-3">

          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Onboarding
          </h3>

          <div className="space-y-1">
            <Label
              htmlFor="onboarding-start"
              className="text-[11px] text-slate-500"
            >
              Starts On
            </Label>

            <Input
              id="onboarding-start"
              type="date"
              value={form.onboarding_start}
              onChange={(e) => setForm((current) => current ? { ...current, onboarding_start: e.target.value } : current)}
              className="h-8 border-0 bg-[#f8f9fb] text-xs dark:bg-slate-800"
            />
          </div>

          <div className="flex items-center justify-between gap-3 py-1">
            <Label
              htmlFor="onboarding-required"
              className="text-xs"
            >
              Onboarding required
            </Label>

            <Switch
              id="onboarding-required"
              checked={form.onboarding_required}
              onCheckedChange={(checked) => setForm((current) => current ? { ...current, onboarding_required: checked } : current)}
            />
          </div>

          {/* Read-only progress */}
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

          <div>
            {form.tasks.map((task) => (
              <div
                key={task.key}
                className="border-b border-slate-100 py-1.5 last:border-0 dark:border-slate-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Switch
                      checked={task.enabled}
                      disabled={!form.onboarding_required}
                      onCheckedChange={(checked) =>
                        updateTask(task.key, { enabled: checked })
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
        </section>
        {/* Mobile and tablet buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3 md:col-span-2 lg:hidden">
          {actionButtons}
        </div>
      </form>
    </div>
  );
}