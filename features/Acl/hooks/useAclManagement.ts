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
        role_id: '',
        status: 'active' as 'active' | 'inactive'
    });

    // Role Form State
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [roleForm, setRoleForm] = useState({
        name: '',
        description: '',
        permissions: [] as string[]
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

    const { data: permissionsData, isLoading: isPermissionsLoading } = useQuery({
        queryKey: ['acl', 'permissions'],
        queryFn: () => AclService.getPermissions(),
        enabled: hasPermission('acl.read'),
    });

    const users = usersData?.data || [];
    const roles = rolesData?.data || [];
    const permissions = permissionsData?.data || [];
    const isLoading = isUsersLoading || isRolesLoading || isPermissionsLoading;

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

    const saveRoleMutation = useMutation({
        mutationFn: (payload: typeof roleForm) => {
            if (editingRole) {
                return AclService.updateRole(editingRole.id, payload);
            }
            return AclService.createRole(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['acl', 'roles'] });
            closeRoleModal();
        },
        onError: (error) => {
            console.error('Failed to save role:', error);
            alert('Error saving role');
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

    const updateRolePermissionsMutation = useMutation({
        mutationFn: ({ roleId, permissions }: { roleId: number; permissions: string[] }) => 
            AclService.updateRolePermissions(roleId, permissions),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['acl', 'roles'] });
        },
        onError: (error) => {
            console.error('Failed to update role permissions:', error);
            alert('Error updating permissions');
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
                role_id: user.role_id?.toString() || '',
                status: user.status || 'active'
            });
        } else {
            setEditingUser(null);
            setUserForm({
                name: '',
                email: '',
                password: '',
                role_id: '',
                status: 'active'
            });
        }
        setIsUserModalOpen(true);
    }, []);

    const closeUserModal = useCallback(() => {
        setIsUserModalOpen(false);
        setEditingUser(null);
        setUserForm({
            name: '',
            email: '',
            password: '',
            role_id: '',
            status: 'active'
        });
    }, []);

    const handleSaveUser = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        saveUserMutation.mutate(userForm);
    }, [saveUserMutation, userForm]);

    const openRoleModal = useCallback((role: any = null) => {
        if (role) {
            setEditingRole(role);
            setRoleForm({
                name: role.name,
                description: role.description || '',
                permissions: role.permissions?.map((p: any) => p.name) || []
            });
        } else {
            setEditingRole(null);
            setRoleForm({
                name: '',
                description: '',
                permissions: []
            });
        }
        setIsRoleModalOpen(true);
    }, []);

    const closeRoleModal = useCallback(() => {
        setIsRoleModalOpen(false);
        setEditingRole(null);
        setRoleForm({
            name: '',
            description: '',
            permissions: []
        });
    }, []);

    const handleSaveRole = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        saveRoleMutation.mutate(roleForm);
    }, [saveRoleMutation, roleForm]);

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

    const updateRoleForm = useCallback((updates: Partial<typeof roleForm>) => {
        setRoleForm(prev => ({ ...prev, ...updates }));
    }, []);

    const togglePermissionInRoleForm = useCallback((permissionName: string) => {
        setRoleForm(prev => {
            const current = prev.permissions;
            const next = current.includes(permissionName)
                ? current.filter(p => p !== permissionName)
                : [...current, permissionName];
            return { ...prev, permissions: next };
        });
    }, []);

    const handleSync = useCallback(async () => {
        syncMutation.mutate();
    }, [syncMutation]);

    return {
        users,
        roles,
        permissions,
        isLoading: isLoading || saveUserMutation.isPending || saveRoleMutation.isPending || deleteMutation.isPending || syncMutation.isPending,
        isUserModalOpen,
        editingUser,
        userForm,
        isRoleModalOpen,
        editingRole,
        roleForm,
        confirmDelete,
        handleSync,
        openUserModal,
        closeUserModal,
        handleSaveUser,
        openRoleModal,
        closeRoleModal,
        handleSaveRole,
        openDeleteConfirmation,
        handleDelete,
        updateUserForm,
        updateRoleForm,
        togglePermissionInRoleForm,
        setConfirmDelete,
        handleUpdateRolePermissions: async (roleId: number, permissions: string[]) => {
            await updateRolePermissionsMutation.mutateAsync({ roleId, permissions });
        }
    };
};
