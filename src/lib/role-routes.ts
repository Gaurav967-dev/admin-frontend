export function getHomeRoute(role: string) {
    return role === "admin"
        ? "/dashboard"
        : "/profile";
}