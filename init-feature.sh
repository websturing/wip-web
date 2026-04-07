#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   NEXT.JS 16 FEATURE GENERATOR V4      ${NC}"
echo -e "${BLUE}========================================${NC}"

# Input Handling
read -p "Nama Fitur (ex: GLNumber): " FEATURE_NAME_RAW
read -p "Nama Komponen Utama (ex: GLTable): " COMPONENT_NAME

# Formatting Names
FEATURE_NAME=$(echo "$FEATURE_NAME_RAW" | sed 's/ /-/g')
LOWER_FEATURE=$(echo "$FEATURE_NAME_RAW" | sed 's/\([a-z0-9]\)\([A-Z]\)/\1-\2/g' | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')

FILE_NAME="${COMPONENT_NAME}"
HOOK_NAME="use${COMPONENT_NAME}"
SERVICE_NAME="${COMPONENT_NAME}Service"
FEATURE_PATH="features/$FEATURE_NAME"

# Buat Semua Folder
mkdir -p "$FEATURE_PATH/components"
mkdir -p "$FEATURE_PATH/hooks"
mkdir -p "$FEATURE_PATH/services"
mkdir -p "$FEATURE_PATH/types"
mkdir -p "$FEATURE_PATH/pages"

echo -e "\nPilih komponen yang ingin dibuat:"
echo "1) Full Set (Component, Hook, Service, Type, Page)"
echo "2) UI Set (Component & Hook)"
echo "3) Logic Set (Service & Type)"
echo "4) Page Saja"
read -p "Pilihan [1-4]: " CHOICE

# --- FUNCTIONS ---

gen_component() {
    cat <<EOF > "$FEATURE_PATH/components/$FILE_NAME.tsx"
'use client';

import React from 'react';
import { ${HOOK_NAME} } from '../hooks/${HOOK_NAME}';
import { Icon } from '@/app/components/ui/Icon';

export const ${FILE_NAME} = () => {
    const { data, isLoading } = ${HOOK_NAME}();

    if (isLoading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8 bg-white rounded-2xl border border-zinc-100 transition-all">
            <div className="flex items-center gap-4 mb-6 text-[#111827]">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <Icon icon="solar:bolt-bold-duotone" className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">${FILE_NAME}</h2>
                    <p className="text-zinc-500 text-xs font-medium">Part of ${FEATURE_NAME} module</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Content Placeholder */}
                <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 border-dashed min-h-[160px] flex flex-col items-center justify-center text-zinc-400 group hover:border-blue-200 transition-colors">
                    <Icon icon="solar:box-bold-duotone" className="w-6 h-6 mb-2 opacity-20 group-hover:opacity-40 transition-opacity" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Workspace</span>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 border-dashed min-h-[160px] flex flex-col items-center justify-center text-zinc-400 group hover:border-blue-200 transition-colors">
                    <Icon icon="solar:chart-2-bold-duotone" className="w-6 h-6 mb-2 opacity-20 group-hover:opacity-40 transition-opacity" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Analytics</span>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 border-dashed min-h-[160px] flex flex-col items-center justify-center text-zinc-400 group hover:border-blue-200 transition-colors">
                    <Icon icon="solar:user-rounded-bold-duotone" className="w-6 h-6 mb-2 opacity-20 group-hover:opacity-40 transition-opacity" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Collaborators</span>
                </div>
            </div>
        </div>
    );
};
EOF
    echo -e "${GREEN}✅ Component (${FILE_NAME}.tsx) created.${NC}"
}

gen_hook() {
    cat <<EOF > "$FEATURE_PATH/hooks/${HOOK_NAME}.ts"
'use client';

import { useState, useEffect } from 'react';

export const ${HOOK_NAME} = () => {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Fetch initialization if needed
    }, []);

    return {
        data,
        isLoading,
        error,
        setData
    };
};
EOF
    echo -e "${GREEN}✅ Hook (${HOOK_NAME}.ts) created.${NC}"
}

gen_service() {
    cat <<EOF > "$FEATURE_PATH/services/${SERVICE_NAME}.ts"
export class ${SERVICE_NAME} {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    static async getAll() {
        try {
            const response = await fetch(\`\${this.baseUrl}/${LOWER_FEATURE}\`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching ${LOWER_FEATURE}:', error);
            throw error;
        }
    }

    static async getById(id: string | number) {
        try {
            const response = await fetch(\`\${this.baseUrl}/${LOWER_FEATURE}/\${id}\`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching ${LOWER_FEATURE} by ID:', error);
            throw error;
        }
    }
}
EOF
    echo -e "${GREEN}✅ Service (${SERVICE_NAME}.ts) created.${NC}"
}

gen_types() {
    cat <<EOF > "$FEATURE_PATH/types/index.ts"
export interface ${COMPONENT_NAME} {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface ${COMPONENT_NAME}State {
    data: ${COMPONENT_NAME}[];
    loading: boolean;
    error: string | null;
}
EOF
    echo -e "${GREEN}✅ Types (index.ts) created.${NC}"
}

gen_page() {
    # 1. Tentukan path app
    read -p "Apakah ini fitur Admin? (y/n): " IS_ADMIN
    
    if [ "$IS_ADMIN" == "y" ]; then
        APP_PATH="app/admin/$LOWER_FEATURE"
    else
        APP_PATH="app/$LOWER_FEATURE"
    fi

    # 2. Buat REAL PAGE di folder fitur
    cat <<EOF > "$FEATURE_PATH/pages/${COMPONENT_NAME}Page.tsx"
import React from 'react';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { ${FILE_NAME} } from '../components/${FILE_NAME}';

export default function ${COMPONENT_NAME}Page() {
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: '${FEATURE_NAME}', icon: 'solar:widget-bold-duotone' },
    ];

    return (
        <div className="animate-in fade-in duration-700">
            <PageHeader 
                items={breadcrumbItems}
                title="${FEATURE_NAME}"
                subtitle="Management"
                description="Manage and monitor your ${FEATURE_NAME} operations efficiently."
            />

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
                <${FILE_NAME} />
            </div>
        </div>
    );
}
EOF

    # 3. Buat PROXY PAGE di folder app
    mkdir -p "$APP_PATH"
    cat <<EOF > "$APP_PATH/page.tsx"
export { default } from '@/features/${FEATURE_NAME}/pages/${COMPONENT_NAME}Page';
EOF

    echo -e "${GREEN}✅ Feature Page created.${NC}"
    echo -e "${GREEN}✅ App Route Proxy created.${NC}"
}


# --- EXECUTION ---
case $CHOICE in
    1)
        gen_component; gen_hook; gen_service; gen_types; gen_page
        ;;
    2)
        gen_component; gen_hook
        ;;
    3)
        gen_service; gen_types
        ;;
    4)
        gen_page
        ;;
esac

# Export index handling
if [ "$CHOICE" -ne 4 ]; then
    cat <<EOF > "$FEATURE_PATH/index.ts"
export * from './components/${FILE_NAME}';
export * from './hooks/${HOOK_NAME}';
export * from './services/${SERVICE_NAME}';
export * from './types';
export { default as ${COMPONENT_NAME}Page } from './pages/${COMPONENT_NAME}Page';
EOF
    echo -e "${GREEN}✅ index.ts created.${NC}"
fi

chmod +x "$FEATURE_PATH" 2>/dev/null || true

echo -e "\n${BLUE}Success! Feature structure for ${CYAN}$FEATURE_NAME${BLUE} is complete.${NC}"
echo -e "${YELLOW}URL Route:${NC} /$( [ "$IS_ADMIN" == "y" ] && echo "admin/" )$LOWER_FEATURE"
