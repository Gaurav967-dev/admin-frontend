"use client";

import { useState, useEffect } from "react";

type Stats = {
    total_users: number;
    active_users: number;
    admins: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
        <section className="relative flex min-w-0 flex-col justify-center overflow-hidden rounded-2xl bg-[#3155e7] p-5 text-white sm:p-8 lg:rounded-none lg:p-10">
            <div className="relative z-10">
                <h2 className="text-2xl font-bold leading-tight sm:text-3xl xl:text-4xl">
                    Smart tools.
                    <br />
                    Stronger teams.
                </h2>

                <p className="mt-3 text-sm text-blue-100 sm:text-base">
                    Manage your workspace in one place.
                </p>

                <div className="mt-6 rounded-2xl bg-white p-4 text-slate-900 shadow-xl sm:p-6 lg:mt-10">
                    <h3 className="font-semibold">
                        Expinova Dashboard
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        Live user statistics
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                        {cards.map((card) => (
                            <div
                                key={card.label}
                                className="min-w-0 rounded-xl bg-slate-50 p-2 sm:p-4"
                            >
                                <p className="text-[10px] text-slate-500 sm:text-xs">
                                    {card.label}
                                </p>

                                <p className="mt-2 text-xl font-bold sm:text-2xl">
                                    {error ? "—" : card.value ?? "..."}
                                </p>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <p role="status" className="mt-3 text-xs text-red-500">
                            Statistics are temporarily unavailable.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}