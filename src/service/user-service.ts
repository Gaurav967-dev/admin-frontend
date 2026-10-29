import { apiFetch } from "@/lib/api";

import type { UserFilter, TableResponse, UserSavePayload, UserMutationResponse } from "@/feature/people/type/people-type";
import type { DashboardUser } from "@/types/dashboard";

type FetchUserOptions = {
    management: boolean;
    page: number;
    pageSize: number;
    search: string;
    filter: UserFilter;
};

export function fetchUsers({
    management,
    page,
    pageSize,
    search,
    filter,
}: FetchUserOptions) {
    if (!management) {
        return apiFetch<TableResponse>("/dashboard");
    }

    const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        search,
        status_filter: filter === "active" || filter === "inactive" ? filter : "all",
        role_filter: filter === "admins" ? "admin" : "all",
    });

    return apiFetch<TableResponse>(`/user?${params.toString()}`);
}

export function createUser(payload: UserSavePayload) {
    return apiFetch<UserMutationResponse>("/user", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function updateUser(userId: number, payload: UserSavePayload) {
    return apiFetch<UserMutationResponse>(`/user?user_id=${userId}`,
        {
            method: "PUT",
            body: JSON.stringify(payload),
        }
    );
}

export function deleteUser(userId: number) {
    return apiFetch<{ message: string }>(`/user?user_id=${userId}`,
        {
            method: "DELETE",
        }
    );
}

export function getUserById(userId: number) {
    return apiFetch<DashboardUser>(`/user/${userId}`);
}