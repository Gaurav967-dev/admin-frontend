"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function Notifications() {
    const router = useRouter();
    const queryClient = useQueryClient();

    useEffect(() => {
        function handleSessionExpired() {
            queryClient.clear();
            router.replace("/");
            router.refresh();
        }

        window.addEventListener(
            "expinova:session-expired",
            handleSessionExpired
        );

        return () => {
            window.removeEventListener(
                "expinova:session-expired",
                handleSessionExpired
            );
        };
    }, [router, queryClient]);

    return (
        <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
            visibleToasts={3}
        />
    );
}