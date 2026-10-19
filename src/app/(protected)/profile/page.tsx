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

    if (!form || !profile || saving) return;

    setError("");
    setNotice("");

    if (form.first_name.trim().length < 2) {
      setError("First name must contain at least 2 characters");
      return;
    }

    const addingPhone = !profile.phone?.trim() && Boolean(form.phone.trim());

    if (addingPhone && !/^\+?[1-9]\d{6,14}$/.test(form.phone.trim())) {
      setError("Enter 7-15 digits, optionally starting with +");
      return;
    }

    const payload = {...profileToPayload(form), ...(addingPhone ? { phone: form.phone.trim() } : {})};

    setSaving("full");

    try {
      const result = await apiFetch<ProfileSaveResponse>(
        "/profile",
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      setProfile(result.profile);
      setForm(profileToForm(result.profile));
      setNotice(addingPhone ? "Phone Number Added Successfully" : result.message);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your profile");
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

  const phoneLocked = Boolean(profile.phone?.trim());

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

  function cancelChanges() {
    router.push("/dashboard");
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
        onClick={cancelChanges}
        className="h-9"
      >
        Cancel
      </Button>
    </>
  );

  const addedOn = profile.created_at ? new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(profile.created_at)).replaceAll("/", ".") : "Unavailable";
  
  return (
    <div className="mx-auto w-full max-w-[1150px]">

      {/* Page header */}
      <div className="sticky top-0 z-30 mb-3 flex flex-nowrap items-center gap-2 border-b border-slate-100 bg-white/95 py-2 backdrop-blur dark:border-slate-800 dark:bg-[#171c28]/95">
        
        {/* Left: back button, employee name */}
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

        {/* Right: sticky save, cancel */}
        <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-1 sm:gap-2">
          <Button
            type="submit"
            form="employee-profile-form"
            aria-label="Save Changes"
            disabled={saving !== null}
            className="h-8 shrink-0 bg-[#292d32] px-2 text-[11px] text-white hover:bg-black sm:px-3 sm:text-xs"
          >
            <span className="sm:hidden">
              {saving ? "Saving" : "Save"}
            </span>

            <span className="hidden sm:inline">
              {saving ? "Saving..." : "Save Changes"}
            </span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={saving !== null}
            onClick={cancelChanges}
            className="h-8 shrink-0 px-2 text-[11px] sm:px-3 sm:text-xs"
          >
            Cancel
          </Button>
        </div>
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
        id="employee-profile-form"
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
              value={profile.email}
              readOnly
              onCopy={() => void copyText("Email", profile.email)}
            />

            <ProfileField
              id="phone"
              label="Phone Number"
              type="tel"
              value={phoneLocked ? (profile.phone ?? "") : form.phone}
              placeholder={phoneLocked ? "" : "+919876543210"}
              readOnly={phoneLocked}
              onChange={phoneLocked ? undefined : (value) => updateText("phone", value)}
              onCopy={() => void copyText("Phone number", phoneLocked ? (profile.phone ?? "") : form.phone)}
            />

            {!phoneLocked && (
              <p className="text-[11px] text-slate-500">
                You can add your phone number once. After saving, it cannot be changed from your profile.
              </p>
            )}

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
        <div className="mt-3 grid grid-cols-2 gap-2 md:col-span-2 lg:hidden">
          {actionButtons}
        </div>
      </form>
    </div>
  );
}