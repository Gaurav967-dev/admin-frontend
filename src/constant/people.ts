import type { UserFilter } from "@/feature/people/type/people-type";

export const DEFAULT_PAGE_SIZE = 12;

export const PAGE_SIZE_OPTIONS = [12, 20, 30, 40, 50];

export const USER_FILTERS: {
    label: string;
    value: UserFilter;
}[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Admins", value: "admins" },
];