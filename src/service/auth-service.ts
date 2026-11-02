import { apiFetch } from "@/lib/api";
import type { SignInValues, SignUpValues } from "@/feature/auth/schema/auth-schema";
import type { VerifyResponse, AuthenticatedUser } from "@/types/dashboard";

type AuthResponse = {
    message: string;
    user: AuthenticatedUser;
};

export function signIn(values: SignInValues) {
    return apiFetch<AuthResponse>("/sign", {
        method: "POST",
        body: JSON.stringify(values),
    });
}

export function signUp(values: SignUpValues) {
    const { name, email, password } = values;

    return apiFetch<AuthResponse>("/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
    });
}

export function verifyCurrentUser() {
    return apiFetch<VerifyResponse>("/verify-token");
}

export function logoutUser() {
    return apiFetch<{ message: string }>("/logout", {
        method: "POST",
    });
}