import { z } from "zod";

const taskKeys = [
    "office_tour",
    "management_intro",
    "work_tools",
    "meet_colleagues",
    "duties_journal",
    "requests_handling",
    "activity_tracking",
] as const;

const taskSchema = z.object({
    key: z.enum(taskKeys),
    label: z.string(),
    enabled: z.boolean(),
    progress: z.number().int().min(0).max(100),
});

const optionalText = z.string().trim().max(100);

export const profileSchema = z.object({
    first_name: z.string().trim()
        .min(2, "First name must contain at least 2 characters")
        .max(80, "First name is too long"),

    last_name: z.string().trim()
        .max(80, "Last name is too long"),

    // Email is displayed but cannot be edited on Profile.
    email: z.string(),

    phone: z.string(),

    position: optionalText,
    team: optionalText,
    manager: optionalText,
    lead: optionalText,

    onboarding_start: z.string().refine(
        (value) =>
            !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
        "Enter a valid date"
    ),

    onboarding_required: z.boolean(),

    tasks: z.array(taskSchema)
        .length(7, "Exactly seven onboarding tasks are required")
        .refine(
            (tasks) =>
                new Set(tasks.map((task) => task.key)).size === 7,
            "Every onboarding task must appear once"
        ),
});

export function createProfileSchema(
    phoneAlreadySaved: boolean
) {
    return profileSchema.superRefine((values, ctx) => {
        if (phoneAlreadySaved) return;

        const phone = values.phone.trim();

        // Phone is optional until first entry.
        if (!phone) return;

        // Validate only newly entered number.
        if (
            phone.length > 20 ||
            !/^\+?[1-9]\d{6,14}$/.test(phone)
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["phone"],
                message: "Enter 7-15 digits, optionally starting with +"
            });
        }
    });
}