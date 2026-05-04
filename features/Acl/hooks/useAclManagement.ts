'use client';

import { useState, useCallback, useEffect } from 'react';
import { AclService } from '../services/AclService';
import { useAcl } from '@/hooks/useAcl';

export const useAclManagement = () => {
    const { hasPermission } = useAcl();
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // User Form State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        password: '',
        role_id: ''
    });

    // Delete confirmation state
    const [confirmDelete, setConfirmDelete] = useState<{ 
        open: boolean; 
        id: string | null; 
        type: 'user' | 'role' 
    }>({
        open: false,
        id: null,
        type: 'user'
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                AclService.getUsers(),
                AclService.getRoles()
            ]);
            setUsers(usersRes?.data || []);
            setRoles(rolesRes?.data || []);
        } catch (error) {
            console.error('Failed to fetch ACL data:', error);
            setUsers([]);
            setRoles([]);
        } finally {
            // Artificial delay for smooth transitions if needed, or just set to false
            setTimeout(() => setIsLoading(false), 500);
        }
    }, []);

    useEffect(() => {
        if (hasPermission('acl.read')) {
            fetchData();
        }
    }, [hasPermission, fetchData]);

    const handleSync = useCallback(async () => {
        setIsLoading(true);
        try {
            await AclService.syncPermissions();
            await fetchData();
        } catch (error) {
            console.error('Failed to sync permissions:', error);
            alert('Error syncing permissions');
        } finally {
            setIsLoading(false);
        }
    }, [fetchData]);

    const openUserModal = useCallback((user: any = null) => {
        if (user) {
            setEditingUser(user);
            setUserForm({
                name: user.name,
                email: user.email,
                password: '',
                role_id: user.role_id?.toString() || ''
            });
        } else {
            setEditingUser(null);
            setUserForm({ name: '', email: '', password: '', role_id: '' });
        }
        setIsUserModalOpen(true);
    }, []);

    const closeUserModal = useCallback(() => {
        setIsUserModalOpen(false);
        setEditingUser(null);
        setUserForm({ name: '', email: '', password: '', role_id: '' });
    }, []);

    const handleSaveUser = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await AclService.updateUser(editingUser.id, userForm);
            } else {
                await AclService.createUser(userForm);
            }
            closeUserModal();
            fetchData();
        } catch (error) {
            console.error('Failed to save user:', error);
            alert('Error saving user');
        }
    }, [editingUser, userForm, closeUserModal, fetchData]);

    const openDeleteConfirmation = useCallback((id: string, type: 'user' | 'role') => {
        setConfirmDelete({ open: true, id, type });
    }, []);

    const closeDeleteConfirmation = useCallback(() => {
        setConfirmDelete(prev => ({ ...prev, open: false }));
    }, []);

    const handleDelete = useCallback(async () => {
        if (!confirmDelete.id) return;
        try {
            if (confirmDelete.type === 'user') {
                await AclService.deleteUser(confirmDelete.id);
            } else {
                await AclService.deleteRole(confirmDelete.id);
            }
            setConfirmDelete({ open: false, id: null, type: 'user' });
            fetchData();
        } catch (error) {
            console.error(`Failed to delete ${confirmDelete.type}:`, error);
            alert(`Error deleting ${confirmDelete.type}`);
        }
    }, [confirmDelete, fetchData]);

    const updateUserForm = useCallback((updates: Partial<typeof userForm>) => {
        setUserForm(prev => ({ ...prev, ...updates }));
    }, []);

    return {
        users,
        roles,
        isLoading,
        isUserModalOpen,
        editingUser,
        userForm,
        confirmDelete,
        fetchData,
        handleSync,
        openUserModal,
        closeUserModal,
        handleSaveUser,
        openDeleteConfirmation,
        closeDeleteConfirmation,
        handleDelete,
        updateUserForm,
        setConfirmDelete
    };
};
