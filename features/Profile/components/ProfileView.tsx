'use client';

import { Icon } from '@/app/components/ui/Icon';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { ProfileService } from '../services/ProfileService';

type Tab = 'identity' | 'security' | 'sessions' | 'preferences';

const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'identity', label: 'Identity', icon: 'solar:user-id-bold' },
    { id: 'security', label: 'Security', icon: 'solar:shield-keyhole-bold' },
    { id: 'sessions', label: 'Session Login', icon: 'solar:devices-bold' },
    { id: 'preferences', label: 'Preferences', icon: 'solar:settings-bold' },
];

export const ProfileView = () => {
    const { profile, isLoading, refresh } = useProfile();
    const [activeTab, setActiveTab] = useState<Tab>('identity');

    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [profileData, setProfileData] = useState({
        name: '',
        email: ''
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    useEffect(() => {
        if (profile) {
            setProfileData({
                name: profile.name,
                email: profile.email
            });
        }
    }, [profile]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        setMessage(null);
        try {
            await ProfileService.updateProfile(profileData);
            setMessage({ type: 'success', text: 'Profile identity updated successfully!' });
            refresh();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            setMessage({ type: 'error', text: 'New passwords do not match!' });
            return;
        }
        setIsUpdatingPassword(true);
        setMessage(null);
        try {
            await ProfileService.changePassword(passwordData);
            setMessage({ type: 'success', text: 'Security credentials updated!' });
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Verification failed' });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center p-32">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 blur-xl bg-blue-500/20 rounded-full animate-pulse"></div>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen pb-10">
            {/* Soft Ambient Background */}
            <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-500/5 blur-[80px] md:blur-[120px]  pointer-events-none -z-10 animate-pulse"></div>

            <div className="mx-auto space-y-6 md:space-y-8">

                {/* Compact Header Area */}
                <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10 bg-white/60 backdrop-blur-3xl p-6 md:p-10 rounded-[1rem] md:rounded-[2rem] border border-white/60 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="relative">
                        <div className="w-20 h-20 md:w-32 md:h-32 bg-zinc-900 rounded-full p-1 border border-white/20 shadow-xl">
                            <div className="w-full h-full bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden">
                                {profile?.name ? (
                                    <span className="text-2xl md:text-4xl font-black text-white/90 lowercase tracking-tighter">
                                        {profile.name.charAt(0)}<span className="text-blue-500">.</span>
                                    </span>
                                ) : (
                                    <Icon icon="solar:user-bold" className="w-8 md:w-12 h-8 md:h-12 text-white/20" />
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 md:w-10 md:h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-emerald-500">
                            <Icon icon="solar:check-read-bold" className="w-4 h-4 md:w-6 md:h-6" />
                        </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1 md:space-y-2">
                        <h1 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tighter">
                            {profile?.name}
                        </h1>
                        <p className="text-zinc-500 font-medium text-xs md:text-sm flex items-center justify-center sm:justify-start gap-2">
                            <Icon icon="solar:letter-bold" className="w-3 md:w-4 h-3 md:h-4 text-zinc-300" />
                            {profile?.email}
                        </p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                            <span className="px-3 md:px-5 py-1 bg-blue-600 text-white rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                                {profile?.role?.name || 'Authorized'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200 shadow-inner overflow-x-auto hide-scrollbar w-max animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-white text-zinc-900 shadow-sm"
                                    : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50"
                            )}
                        >
                            <Icon icon={tab.icon} className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-blue-500" : "text-zinc-400")} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Notification */}
                {message && (
                    <div className={cn(
                        "p-4 md:p-5 rounded-2xl flex items-center gap-3 md:gap-4 animate-in slide-in-from-top-2 duration-400 border shadow-sm",
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                    )}>
                        <Icon icon={message.type === 'success' ? "solar:verified-check-bold" : "solar:shield-warning-bold"} className="w-5 md:w-6 h-5 md:h-6" />
                        <span className="text-xs md:text-sm font-bold truncate flex-1">{message.text}</span>
                        <button onClick={() => setMessage(null)} className="opacity-60 hover:opacity-100 transition-opacity">
                            <Icon icon="solar:close-circle-bold" className="w-4 md:w-5 h-4 md:h-5" />
                        </button>
                    </div>
                )}

                {/* Tab Contents */}
                <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* IDENTITY TAB */}
                    {activeTab === 'identity' && (
                        <div className="bg-white/60 backdrop-blur-2xl p-6 md:p-10 rounded-[2rem] border border-white shadow-sm relative overflow-hidden group">
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg md:text-xl font-black text-zinc-900 tracking-tighter">Identity Settings</h3>
                                    <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-6 md:space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        <div className="space-y-2 group/input">
                                            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1 group-focus-within/input:text-blue-500 transition-colors">NAME</label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full px-5 md:px-6 py-4 md:py-4 bg-white border border-zinc-100 rounded-2xl focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-zinc-900 text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 group/input">
                                            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1 group-focus-within/input:text-blue-500 transition-colors">EMAIL</label>
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                className="w-full px-5 md:px-6 py-4 md:py-4 bg-white border border-zinc-100 rounded-2xl focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-zinc-900 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">SYSTEM ROLE</label>
                                        <div className="px-5 md:px-6 py-4 md:py-4 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-between opacity-60">
                                            <span className="font-bold text-zinc-500 text-sm">{profile?.role?.name || 'Standard'}</span>
                                            <Icon icon="solar:lock-bold" className="w-3 md:w-4 h-3 md:h-4 text-zinc-300" />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isUpdatingProfile}
                                        className="w-full sm:w-auto px-10 py-4 bg-zinc-900 text-white rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                                    >
                                        {isUpdatingProfile ? 'Syncing...' : 'Save Identity'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="bg-white/60 backdrop-blur-2xl p-6 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg md:text-xl font-black text-zinc-900 tracking-tighter">Security Credentials</h3>
                                    <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
                                </div>

                                <form onSubmit={handleChangePassword} className="space-y-5 md:space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">CURRENT PASSKEY</label>
                                        <input
                                            type="password"
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                            className="w-full px-5 md:px-6 py-4 md:py-4 bg-white/5 border border-zinc-100 rounded-2xl focus:bg-white/10 outline-none transition-all font-bold text-zinc-900 text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">NEW PASSKEY</label>
                                        <input
                                            type="password"
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                            className="w-full px-5 md:px-6 py-4 md:py-4 bg-white/5 border border-zinc-100 rounded-2xl focus:bg-white/10 outline-none transition-all font-bold text-zinc-900 text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">CONFIRM PASSKEY</label>
                                        <input
                                            type="password"
                                            value={passwordData.new_password_confirmation}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                            className="w-full px-5 md:px-6 py-4 md:py-4 bg-white/5 border border-zinc-100 rounded-2xl focus:bg-white/10 outline-none transition-all font-bold text-zinc-900 text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isUpdatingPassword}
                                        className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-blue-500 transition-all disabled:opacity-50 shadow-xl"
                                    >
                                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* SESSIONS TAB */}
                    {activeTab === 'sessions' && (
                        <div className="bg-white/60 backdrop-blur-2xl p-6 md:p-10 rounded-[2rem] border border-white shadow-sm flex flex-col items-center justify-center text-center space-y-4 py-20">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
                                <Icon icon="solar:devices-bold" className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 tracking-tighter">Session Login</h3>
                            <p className="text-sm text-zinc-500 max-w-sm">
                                View and manage your active login sessions across different devices.
                                <br /> <span className="font-bold text-blue-500">Coming soon!</span>
                            </p>
                        </div>
                    )}

                    {/* PREFERENCES TAB */}
                    {activeTab === 'preferences' && (
                        <div className="bg-white/60 backdrop-blur-2xl p-6 md:p-10 rounded-[2rem] border border-white shadow-sm flex flex-col items-center justify-center text-center space-y-4 py-20">
                            <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mb-2">
                                <Icon icon="solar:settings-bold" className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 tracking-tighter">Preferences</h3>
                            <p className="text-sm text-zinc-500 max-w-sm">
                                Customize your notification settings, themes, and locale.
                                <br /> <span className="font-bold text-zinc-400">In development</span>
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
