import type { ProfileData, ProfileFormValues } from "../type/profile-type";

export function profileToForm(
  profile: ProfileData
): ProfileFormValues {
  return {
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,

    phone: profile.phone ?? "",
    position: profile.position ?? "",
    team: profile.team ?? "",
    manager: profile.manager ?? "",
    lead: profile.lead ?? "",

    onboarding_start: profile.onboarding_start ?? "",
    onboarding_required: profile.onboarding_required,

    tasks: profile.tasks.map((task) => ({ ...task })),
  };
}

export function profileToPayload(
  form: ProfileFormValues
) {
  const optional = (value: string) =>
    value.trim() || null;

  return {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),

    position: optional(form.position),
    team: optional(form.team),
    manager: optional(form.manager),
    lead: optional(form.lead),

    onboarding_start: form.onboarding_start || null,
    onboarding_required: form.onboarding_required,

    // Do not send display-only labels.
    tasks: form.tasks.map(
      ({ key, enabled, progress }) => ({ key, enabled, progress })
    ),
  };
}

export function calculateProgress(
  form: ProfileFormValues
) {
  const enabled = form.tasks.filter((task) => task.enabled);

  if (enabled.length === 0) {
    return 0;
  }

  return Math.round(
    enabled.reduce((total, task) => total + task.progress, 0) / enabled.length
  );
}