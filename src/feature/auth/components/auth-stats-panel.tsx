"use client";

import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";

type Stats = {
    total_users: number;
    active_users: number;
    admins: number;
};

export default function AuthStatsPanel() {
    const {
        data: stats,
        isError,
    } = useQuery<Stats>({
        queryKey: ["public-stats"],

        queryFn: async ({ signal }) => {
            const response = await fetch(
                `${API_URL}/public-stats`,
                {
                    signal,
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error("Stats unavailable");
            }

            return (await response.json()) as Stats;
        },

        staleTime: 30_000,
        retry: false,
    });

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
        <section className="flex min-h-[320px] min-w-0 items-center bg-[#3155e7] px-4 py-8 text-white sm:px-6 md:h-full md:min-h-0 md:items-start md:rounded-l-[28px] md:overflow-y-auto md:px-6 md:pt-12 md:pb-8 lg:px-8 lg:pt-14">
            <div className="w-full min-h-0">
                <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                    Smart tools.
                    <br />
                    Stronger teams.
                </h2>

                <p className="mt-3 text-sm text-blue-100">
                    Manage your workspace in one place.
                </p>

                <div className="mt-5 rounded-xl bg-white p-3 text-slate-900 shadow-lg md:mt-6 md:p-5">
                    <h3 className="text-sm font-semibold md:text-base">
                        Expinova Dashboard
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
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
                                    {isError ? "—" : card.value ?? "..."}
                                </p>
                            </div>
                        ))}
                    </div>

                    {isError && (
                        <p
                            role="status"
                            className="mt-1 text-xs text-red-500"
                        >
                            Statistics unavailable.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}