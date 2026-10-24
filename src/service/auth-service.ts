import { apiFetch } from "@/lib/api";

import type { SignInValues, SignUpValues } from "@/feature/auth/schema/auth-schema";

type AuthResponse = {
    message: string;
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
        body: JSON.stringify({name, email, password}),
    });
}