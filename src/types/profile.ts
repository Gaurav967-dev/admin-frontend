export type TaskKey = | "office_tour" | "management_intro" | "work_tools" | "meet_colleagues" | "duties_journal" | "requests_handling" | "activity_tracking";

export type OnboardingTask = {
    key: TaskKey;
    label: string;
    enabled: boolean;
    progress: number;
};

export type ProfileData = {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: "admin" | "user";

    phone: string | null;
    position: string | null;
    team: string | null;
    manager: string | null;
    lead: string | null;

    onboarding_start: string | null;
    onboarding_required: boolean;

    tasks: OnboardingTask[];

    onboarding_progress: number;
    onboarding_status: string;
    created_at: string | null;
};

export type ProfileFormValues = {
    first_name: string;
    last_name: string;
    email: string;

    phone: string;
    position: string;
    team: string;
    manager: string;
    lead: string;

    onboarding_start: string;
    onboarding_required: boolean;

    tasks: OnboardingTask[];
};

export type ProfileSaveResponse = {
    message: string;
    profile: ProfileData;
};