'use client';

import { useAcl } from '@/hooks/useAcl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { AclService } from '../services/AclService';

export const useAclManagement = () => {
    const { hasPermission } = useAcl();
    const queryClient = useQueryClient();

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

    // --- Queries ---
    
    const { data: usersData, isLoading: isUsersLoading } = useQuery({
        queryKey: ['acl', 'users'],
        queryFn: () => AclService.getUsers(),
        enabled: hasPermission('acl.read'),
    });

    const { data: rolesData, isLoading: isRolesLoading } = useQuery({
        queryKey: ['acl', 'roles'],
        queryFn: () => AclService.getRoles(),
        enabled: hasPermission('acl.read'),
    });

    const users = usersData?.data || [];
    const roles = rolesData?.data || [];
    const isLoading = isUsersLoading || isRolesLoading;

    // --- Mutations ---

    const saveUserMutation = useMutation({
        mutationFn: (payload: typeof userForm) => {
            if (editingUser) {
                return AclService.updateUser(editingUser.id, payload);
            }
            return AclService.createUser(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['acl', 'users'] });
            closeUserModal();
        },
        onError: (error) => {
            console.error('Failed to save user:', error);
            alert('Error saving user');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id, type }: { id: string; type: 'user' | 'role' }) => {
            if (type === 'user') {
                return AclService.deleteUser(id);
            }
            return AclService.deleteRole(id);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['acl', variables.type === 'user' ? 'users' : 'roles'] });
            setConfirmDelete({ open: false, id: null, type: 'user' });
        },
        onError: (error, variables) => {
            console.error(`Failed to delete ${variables.type}:`, error);
            alert(`Error deleting ${variables.type}`);
        }
    });

    const syncMutation = useMutation({
        mutationFn: () => AclService.syncPermissions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['acl'] });
        },
        onError: (error) => {
            console.error('Failed to sync permissions:', error);
            alert('Error syncing permissions');
        }
    });

    // --- Handlers ---

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
        saveUserMutation.mutate(userForm);
    }, [saveUserMutation, userForm]);

    const openDeleteConfirmation = useCallback((id: string, type: 'user' | 'role') => {
        setConfirmDelete({ open: true, id, type });
    }, []);

    const handleDelete = useCallback(async () => {
        if (!confirmDelete.id) return;
        deleteMutation.mutate({ id: confirmDelete.id, type: confirmDelete.type });
    }, [deleteMutation, confirmDelete]);

    const updateUserForm = useCallback((updates: Partial<typeof userForm>) => {
        setUserForm(prev => ({ ...prev, ...updates }));
    }, []);

    const handleSync = useCallback(async () => {
        syncMutation.mutate();
    }, [syncMutation]);

    return {
        users,
        roles,
        isLoading: isLoading || saveUserMutation.isPending || deleteMutation.isPending || syncMutation.isPending,
        isUserModalOpen,
        editingUser,
        userForm,
        confirmDelete,
        handleSync,
        openUserModal,
        closeUserModal,
        handleSaveUser,
        openDeleteConfirmation,
        handleDelete,
        updateUserForm,
        setConfirmDelete
    };
};
