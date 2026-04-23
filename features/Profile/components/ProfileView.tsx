'use client';

import { Icon } from '@/app/components/ui/Icon';
import React, { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { ProfileService } from '../services/ProfileService';

export const ProfileView = () => {
    const { profile, isLoading, refresh } = useProfile();
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

    React.useEffect(() => {
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
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
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
            setMessage({ type: 'error', text: 'Passwords do not match!' });
            return;
        }
        setIsUpdatingPassword(true);
        setMessage(null);
        try {
            await ProfileService.changePassword(passwordData);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to change password' });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center p-24">
            <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            {/* Notification */}
            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                    <Icon icon={message.type === 'success' ? "solar:check-circle-bold" : "solar:danger-bold"} className="w-5 h-5" />
                    <span className="text-sm font-bold tracking-tight">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Identity Section */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <Icon icon="solar:user-circle-bold-duotone" className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">My Identity</h2>
                                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">Personal Information</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 pl-1">FULL NAME</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-zinc-900 text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 pl-1">EMAIL ADDRESS</label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-zinc-900 text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 pl-1">ASSIGNED ROLE</label>
                                <div className="px-6 py-4 bg-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-between cursor-not-allowed">
                                    <span className="font-bold text-zinc-500 text-sm">{profile?.role?.name || 'User'}</span>
                                    <Icon icon="solar:lock-bold-duotone" className="w-4 h-4 text-zinc-400" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingProfile}
                                className="w-full py-4.5 bg-zinc-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isUpdatingProfile ? 'Updating...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Password Section */}
                <div className="bg-zinc-900 rounded-[2.5rem] p-10 border border-zinc-800 shadow-2xl relative overflow-hidden group">
                    {/* Background Noise/Gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="relative z-10 text-white">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                <Icon icon="solar:lock-keyhole-bold-duotone" className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tighter">Security</h2>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Change Password</p>
                            </div>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 pl-1">CURRENT PASSWORD</label>
                                <input
                                    type="password"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-white/20 outline-none transition-all font-bold text-white text-sm placeholder:text-white/10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 pl-1">NEW PASSWORD</label>
                                <input
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-white/20 outline-none transition-all font-bold text-white text-sm placeholder:text-white/10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 pl-1">CONFIRM NEW PASSWORD</label>
                                <input
                                    type="password"
                                    value={passwordData.new_password_confirmation}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-white/20 outline-none transition-all font-bold text-white text-sm placeholder:text-white/10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingPassword}
                                className="w-full py-4.5 bg-white text-zinc-900 rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
                            >
                                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
