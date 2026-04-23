export interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: {
        id: number;
        name: string;
    };
    created_at?: string;
    updated_at?: string;
}
