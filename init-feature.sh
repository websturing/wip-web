#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   NEXT.JS 16 FEATURE GENERATOR V1      ${NC}"
echo -e "${BLUE}========================================${NC}"

read -p "Nama Folder Fitur (ex: layouts): " FEATURE_NAME
read -p "Nama Komponen/File (ex: LayoutTable): " COMPONENT_NAME

# Nama file
FILE_NAME="${COMPONENT_NAME}"
HOOK_NAME="use${COMPONENT_NAME}"
SERVICE_NAME="${COMPONENT_NAME}Service"
FEATURE_PATH="features/$FEATURE_NAME"

# Buat Semua Folder
mkdir -p "$FEATURE_PATH/components"
mkdir -p "$FEATURE_PATH/hooks"
mkdir -p "$FEATURE_PATH/services"
mkdir -p "$FEATURE_PATH/types"

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

export const ${FILE_NAME} = () => {
    const { data, isLoading } = ${HOOK_NAME}();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-xl">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${FILE_NAME}
            </h2>
            <div className="mt-4">
                {/* Content Here */}
                <p className="text-zinc-500">Feature: ${FEATURE_NAME}</p>
            </div>
        </div>
    );
};
EOF
    echo -e "${GREEN}✅ Component (${FILE_NAME}.tsx) dibuat.${NC}"
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
    echo -e "${GREEN}✅ Hook (${HOOK_NAME}.ts) dibuat.${NC}"
}

gen_service() {
    cat <<EOF > "$FEATURE_PATH/services/${SERVICE_NAME}.ts"
export class ${SERVICE_NAME} {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    static async getAll() {
        try {
            const response = await fetch(\`\${this.baseUrl}/${FEATURE_NAME}\`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching ${FEATURE_NAME}:', error);
            throw error;
        }
    }

    static async getById(id: string | number) {
        try {
            const response = await fetch(\`\${this.baseUrl}/${FEATURE_NAME}/\${id}\`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching ${FEATURE_NAME} by ID:', error);
            throw error;
        }
    }
}
EOF
    echo -e "${GREEN}✅ Service (${SERVICE_NAME}.ts) dibuat.${NC}"
}

gen_types() {
    cat <<EOF > "$FEATURE_PATH/types/index.ts"
export interface ${COMPONENT_NAME}Data {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface ${COMPONENT_NAME}State {
    data: ${COMPONENT_NAME}Data[];
    loading: boolean;
    error: string | null;
}
EOF
    echo -e "${GREEN}✅ Types (index.ts) dibuat.${NC}"
}

gen_page() {
    # Buat folder route di app
    LOWER_FEATURE=$(echo "$FEATURE_NAME" | tr '[:upper:]' '[:lower:]')
    mkdir -p "app/$LOWER_FEATURE"
    cat <<EOF > "app/$LOWER_FEATURE/page.tsx"
import React from 'react';
import { ${FILE_NAME} } from '@/features/${FEATURE_NAME}/components/${FILE_NAME}';

export default function ${COMPONENT_NAME}Page() {
    return (
        <main className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-extrabold mb-8 capitalize">${FEATURE_NAME} Management</h1>
            <${FILE_NAME} />
        </main>
    );
}
EOF
    echo -e "${GREEN}✅ Page (app/$LOWER_FEATURE/page.tsx) dibuat.${NC}"
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
if [ ! -f "$FEATURE_PATH/index.ts" ] && [ "$CHOICE" -ne 4 ]; then
    cat <<EOF > "$FEATURE_PATH/index.ts"
export * from './components/${FILE_NAME}';
export * from './hooks/${HOOK_NAME}';
export * from './services/${SERVICE_NAME}';
export * from './types';
EOF
    echo -e "${GREEN}✅ index.ts (Public API) dibuat.${NC}"
fi

chmod +x "$FEATURE_PATH" 2>/dev/null || true

echo -e "\n${BLUE}Selesai! Struktur Frontend $FEATURE_NAME sudah lengkap.${NC}"
echo -e "${YELLOW}Catatan: Pastikan @/ alias terkonfigurasi di tsconfig.json ke folder root.${NC}"
