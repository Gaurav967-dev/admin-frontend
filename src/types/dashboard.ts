export type DashboardUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
};

export type DashboardResponse = {
    total_users: number;
    active_users: number;
    admins: number;
    users: DashboardUser[];
};

export type AuthenticatedUser = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export type VerifyResponse = {
    valid: boolean;
    user: AuthenticatedUser;
};

export type PaginatedUsersResponse = DashboardResponse & {
    page: number;
    page_size: number;
    filtered_total: number;
    total_pages: number;
};