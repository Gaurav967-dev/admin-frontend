"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SearchContextType = {
    search: string;
    setSearch: (value: string) => void;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({
    children
}: {
    children: ReactNode
}) {
    const [search, setSearch] = useState("");

    return (
        <SearchContext.Provider value={{ search, setSearch }}>
            {children}
        </SearchContext.Provider>
    );
}

export function useDashboardSearch() {
    const context = useContext(SearchContext);

    if (!context) {
        throw new Error("useDashboardSearch must be inside SearchProviders");
    }

    return context;
}