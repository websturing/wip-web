'use client';

import { useAcl } from '@/hooks/useAcl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { AclService } from '../services/AclService';
import { MenuService } from '../services/MenuService';

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
        permissions: [] as string[],
        menus: [] as string[]
    });

    // Permission Form State
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<any>(null);
    const [permissionForm, setPermissionForm] = useState({
        name: '',
        feature: '',
        action: 'read',
        label: ''
    });

    // Menu Form State
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<any>(null);
    const [menuForm, setMenuForm] = useState({
        name: '',
        path: '',
        icon: '',
        parent_id: '',
        platform: 'web',
        sort_order: 0
    });

    // Delete confirmation state
    const [confirmDelete, setConfirmDelete] = useState<{ 
        open: boolean; 
        id: string | null; 
        type: 'user' | 'role' | 'permission' | 'menu'
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

    const { data: menusData, isLoading: isMenusLoading } = useQuery({
        queryKey: ['acl', 'menus', 'all'],
        queryFn: () => MenuService.getAllMenus(),
        enabled: hasPermission('acl.read'),
    });

    const users = usersData?.data || [];
    const roles = rolesData?.data || [];
    const permissions = permissionsData?.data || [];
    const menus = menusData?.data || [];
    const isLoading = isUsersLoading || isRolesLoading || isPermissionsLoading || isMenusLoading;

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
        mutationFn: async (payload: typeof roleForm) => {
            let roleResponse;
            if (editingRole) {
                roleResponse = await AclService.updateRole(editingRole.id, payload);
            } else {
                roleResponse = await AclService.createRole(payload);
            }
            const roleId = roleResponse.data?.id || editingRole?.id;
            if (roleId && payload.menus.length > 0) {
                await AclService.syncRoleMenus(roleId, payload.menus);
            }
            return roleResponse;
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

    const savePermissionMutation = useMutation({
        mutationFn: (payload: typeof permissionForm) => {
            if (editingPermission) {
                return AclService.updatePermission(editingPermission.id, payload);
            }
            return AclService.createPermission(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['acl', 'permissions'] });
            closePermissionModal();
        },
        onError: (error) => {
            console.error('Failed to save permission:', error);
            alert('Error saving permission');
        }
    });

    const saveMenuMutation = useMutation({
        mutationFn: (payload: typeof menuForm) => {
            if (editingMenu) {
                return MenuService.updateMenu(editingMenu.id, payload);
            }
            return MenuService.createMenu(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['acl', 'menus'] });
            closeMenuModal();
        },
        onError: (error) => {
            console.error('Failed to save menu:', error);
            alert('Error saving menu');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id, type }: { id: string; type: 'user' | 'role' | 'permission' | 'menu' }) => {
            if (type === 'user') return AclService.deleteUser(id);
            if (type === 'role') return AclService.deleteRole(id);
            if (type === 'permission') return AclService.deletePermission(id);
            return MenuService.deleteMenu(id);
        },
        onSuccess: (_, variables) => {
            const queryKeyMap = {
                'user': 'users',
                'role': 'roles',
                'permission': 'permissions',
                'menu': 'menus'
            };
            queryClient.invalidateQueries({ queryKey: ['acl', queryKeyMap[variables.type]] });
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
                permissions: role.permissions?.map((p: any) => p.name) || [],
                menus: role.menus?.map((m: any) => m.id.toString()) || []
            });
        } else {
            setEditingRole(null);
            setRoleForm({
                name: '',
                description: '',
                permissions: [],
                menus: []
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
            permissions: [],
            menus: []
        });
    }, []);

    const handleSaveRole = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        saveRoleMutation.mutate(roleForm);
    }, [saveRoleMutation, roleForm]);

    // Permission Handlers
    const openPermissionModal = useCallback((permission: any = null) => {
        if (permission) {
            setEditingPermission(permission);
            setPermissionForm({
                name: permission.name,
                feature: permission.feature,
                action: permission.action,
                label: permission.label || ''
            });
        } else {
            setEditingPermission(null);
            setPermissionForm({
                name: '',
                feature: '',
                action: 'read',
                label: ''
            });
        }
        setIsPermissionModalOpen(true);
    }, []);

    const closePermissionModal = useCallback(() => {
        setIsPermissionModalOpen(false);
        setEditingPermission(null);
        setPermissionForm({
            name: '',
            feature: '',
            action: 'read',
            label: ''
        });
    }, []);

    const handleSavePermission = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        savePermissionMutation.mutate(permissionForm);
    }, [savePermissionMutation, permissionForm]);

    // Menu Handlers
    const openMenuModal = useCallback((menu: any = null) => {
        if (menu) {
            setEditingMenu(menu);
            setMenuForm({
                name: menu.name,
                path: menu.path,
                icon: menu.icon || '',
                parent_id: menu.parent_id?.toString() || '',
                platform: menu.platform || 'web',
                sort_order: menu.sort_order || 0
            });
        } else {
            setEditingMenu(null);
            setMenuForm({
                name: '',
                path: '',
                icon: '',
                parent_id: '',
                platform: 'web',
                sort_order: 0
            });
        }
        setIsMenuModalOpen(true);
    }, []);

    const closeMenuModal = useCallback(() => {
        setIsMenuModalOpen(false);
        setEditingMenu(null);
        setMenuForm({
            name: '',
            path: '',
            icon: '',
            parent_id: '',
            platform: 'web',
            sort_order: 0
        });
    }, []);

    const handleSaveMenu = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        saveMenuMutation.mutate(menuForm);
    }, [saveMenuMutation, menuForm]);

    const openDeleteConfirmation = useCallback((id: string, type: 'user' | 'role' | 'permission' | 'menu') => {
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

    const updatePermissionForm = useCallback((updates: Partial<typeof permissionForm>) => {
        setPermissionForm(prev => ({ ...prev, ...updates }));
    }, []);

    const updateMenuForm = useCallback((updates: Partial<typeof menuForm>) => {
        setMenuForm(prev => ({ ...prev, ...updates }));
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

    const toggleMenuInRoleForm = useCallback((menuId: string) => {
        setRoleForm(prev => {
            const current = prev.menus;
            const next = current.includes(menuId)
                ? current.filter(id => id !== menuId)
                : [...current, menuId];
            return { ...prev, menus: next };
        });
    }, []);

    const handleSync = useCallback(async () => {
        syncMutation.mutate();
    }, [syncMutation]);

    return {
        users,
        roles,
        permissions,
        menus,
        isLoading: isLoading || saveUserMutation.isPending || saveRoleMutation.isPending || savePermissionMutation.isPending || saveMenuMutation.isPending || deleteMutation.isPending || syncMutation.isPending,
        isUserModalOpen,
        editingUser,
        userForm,
        isRoleModalOpen,
        editingRole,
        roleForm,
        isPermissionModalOpen,
        editingPermission,
        permissionForm,
        isMenuModalOpen,
        editingMenu,
        menuForm,
        confirmDelete,
        handleSync,
        openUserModal,
        closeUserModal,
        handleSaveUser,
        openRoleModal,
        closeRoleModal,
        handleSaveRole,
        openPermissionModal,
        closePermissionModal,
        handleSavePermission,
        openMenuModal,
        closeMenuModal,
        handleSaveMenu,
        openDeleteConfirmation,
        handleDelete,
        updateUserForm,
        updateRoleForm,
        updatePermissionForm,
        updateMenuForm,
        togglePermissionInRoleForm,
        toggleMenuInRoleForm,
        setConfirmDelete,
        handleUpdateRolePermissions: async (roleId: number, permissions: string[]) => {
            await updateRolePermissionsMutation.mutateAsync({ roleId, permissions });
        }
    };
};
