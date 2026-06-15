'use client';

import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import React, { createContext, useContext, useState } from 'react';

export interface HeaderState {
    title?: string | React.ReactNode;
    subtitle?: string;
    breadcrumbItems?: BreadcrumbItem[];
}

interface HeaderContextType {
    headerState: HeaderState;
    setHeaderState: React.Dispatch<React.SetStateAction<HeaderState>>;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
    const [headerState, setHeaderState] = useState<HeaderState>({});
    return (
        <HeaderContext.Provider value={{ headerState, setHeaderState }}>
            {children}
        </HeaderContext.Provider>
    );
};

export const useHeader = () => {
    const context = useContext(HeaderContext);
    if (!context) {
        // Return dummy state if used outside of HeaderProvider (e.g., non-admin pages)
        return {
            headerState: {},
            setHeaderState: () => {},
        };
    }
    return context;
};
