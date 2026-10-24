import type { DashboardResponse, PaginatedUsersResponse } from "@/types/dashboard";

export type UserFilter = | "all" | "active" | "inactive" | "admins";

export type TableResponse = DashboardResponse & Partial<PaginatedUsersResponse>;

export type UserSavePayload = {
    name: string;
    email: string;
    role: "user" | "admin";
    is_active: boolean;
    password?: string;
};

export type UserMutationResponse = {
    message: string;
    user: import("@/types/dashboard").DashboardUser;
};