'use client';

import { useCallback, useEffect, useState } from 'react';
import { ProfileService } from '../services/ProfileService';
import { UserProfile } from '../types';

export const useProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await ProfileService.getProfile();
            setProfile(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch profile');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        isLoading,
        error,
        refresh: fetchProfile
    };
};
