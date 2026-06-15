import { apiClient } from '@/lib/api';

export class AclService {
    static async getUsers() {
        const res = await apiClient.get('/acl/users');
        return await res.json();
    }

    static async createUser(payload: any) {
        const res = await apiClient.post('/acl/users', payload);
        if (!res.ok) throw new Error('Failed to create user');
        return await res.json();
    }

    static async updateUser(id: string | number, payload: any) {
        const res = await apiClient.put(`/acl/users/${id}`, payload);
        if (!res.ok) throw new Error('Failed to update user');
        return await res.json();
    }

    static async deleteUser(id: string | number) {
        const res = await apiClient.delete(`/acl/users/${id}`);
        return await res.json();
    }

    static async getRoles() {
        const res = await apiClient.get('/acl/roles');
        return await res.json();
    }

    static async createRole(payload: any) {
        const res = await apiClient.post('/acl/roles', payload);
        if (!res.ok) throw new Error('Failed to create role');
        return await res.json();
    }

    static async updateRole(id: string | number, payload: any) {
        const res = await apiClient.put(`/acl/roles/${id}`, payload);
        if (!res.ok) throw new Error('Failed to update role');
        return await res.json();
    }

    static async deleteRole(id: string | number) {
        const res = await apiClient.delete(`/acl/roles/${id}`);
        return await res.json();
    }

    static async getPermissions() {
        const res = await apiClient.get('/acl/permissions');
        return await res.json();
    }

    static async updateRolePermissions(roleId: string | number, permissions: string[]) {
        const res = await apiClient.post(`/acl/roles/${roleId}/permissions`, { permissions });
        return await res.json();
    }

    static async syncRoleMenus(roleId: string | number, menuIds: string[]) {
        const res = await apiClient.post(`/acl/roles/${roleId}/menus`, { menu_ids: menuIds });
        return await res.json();
    }

    static async createPermission(payload: any) {
        const res = await apiClient.post('/acl/permissions', payload);
        if (!res.ok) throw new Error('Failed to create permission');
        return await res.json();
    }

    static async updatePermission(id: string | number, payload: any) {
        const res = await apiClient.put(`/acl/permissions/${id}`, payload);
        if (!res.ok) throw new Error('Failed to update permission');
        return await res.json();
    }

    static async deletePermission(id: string | number) {
        const res = await apiClient.delete(`/acl/permissions/${id}`);
        return await res.json();
    }

    static async syncPermissions() {
        const res = await apiClient.post('/acl/sync', {});
        return await res.json();
    }
}
