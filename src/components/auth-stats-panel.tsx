"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";

type Stats = {
    total_users: number;
    active_users: number;
    admins: number;
};

export default function AuthStatsPanel() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!API_URL) {
            setError(true);
            return;
        }

        const controller = new AbortController;

        fetch(`${API_URL}/public-stats`, {
            signal: controller.signal,
            cache: "no-store",
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Stats unavailable");
                }
                return response.json();
            })
            .then((data: Stats) => setStats(data))
            .catch((err) => {
                if (err.name !== "AbortError") {
                    setError(true);
                }
            });

        return () => controller.abort();
    }, []);

    const cards = [
        {
            label: "Total Users",
            value: stats?.total_users,
        },
        {
            label: "Active Users",
            value: stats?.active_users,
        },
        {
            label: "Admins",
            value: stats?.admins,
        },
    ];

    return (
        <section className="flex min-w-0 items-center bg-[#3155e7] p-4 text-white md:h-full md:min-h-0 md:overflow-hidden md:p-6 lg:p-8">
            <div className="w-full min-h-0">
                <h2 className="hidden text-2xl font-bold leading-tight md:block lg:text-4xl">
                    Smart tools.
                    <br />
                    Stronger teams.
                </h2>

                <p className="mt-3 hidden text-sm text-blue-100 md:block">
                    Manage your workspace in one place.
                </p>

                <div className="rounded-xl bg-white p-2 text-slate-900 shadow-lg md:mt-6 md:p-5">
                    <h3 className="hidden font-semibold md:block">
                        Expinova Dashboard
                    </h3>

                    <p className="mt-1 hidden text-xs text-slate-500 md:block">
                        Live user statistics
                    </p>

                    <div className="grid grid-cols-3 gap-1.5 md:mt-5 md:gap-3">
                        {cards.map((card) => (
                            <div
                                key={card.label}
                                className="min-w-0 rounded-lg bg-slate-50 p-2 md:p-3"
                            >
                                <p className="text-[10px] leading-tight text-slate-500 sm:text-xs">
                                    {card.label}
                                </p>

                                <p className="mt-1 text-lg font-bold md:text-2xl">
                                    {error ? "—" : card.value ?? "..."}
                                </p>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <p role="status" className="mt-1 text-xs text-red-500">
                            Statistics unavailable.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}