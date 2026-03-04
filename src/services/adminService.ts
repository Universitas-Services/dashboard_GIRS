import api from '@/lib/axios';
import { User } from '@/types/user';

// 1. Definimos los tipos para los parámetros y la respuesta paginada de Usuarios
export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  tipoPlan?: 'GRATIS' | 'PAGO' | 'TODOS';
  isActive?: boolean | 'TODOS';
}

// Estructura de respuesta paginada (asumimos que es similar a la de Actas)
export interface UsersResponse {
  data: User[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export const adminService = {
  // 2. CORRECCIÓN: Ahora acepta 'params' opcionales y los limpia antes de enviar
  getAllUsers: async (params?: GetUsersParams): Promise<UsersResponse> => {
    // Limpiar params de valores vacíos o 'TODOS'
    const cleanParams: Record<string, string | number | boolean> = {};
    if (params) {
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.search && params.search.trim() !== '')
        cleanParams.search = params.search;
      if (params.tipoPlan && params.tipoPlan !== 'TODOS')
        cleanParams.tipoPlan = params.tipoPlan;
      if (params.isActive !== undefined && params.isActive !== 'TODOS')
        cleanParams.isActive = params.isActive;
    }

    // Pasamos los cleanParams a la petición axios
    const response = await api.get<UsersResponse>('/admin/users', {
      params: cleanParams,
    });
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get<User>(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const response = await api.put<User>(`/admin/users/${id}`, data);
    return response.data;
  },

  // --- MODIFICACIÓN AQUÍ ---
  // Cambiamos el endpoint a /users/admin/{id} según tu requerimiento explícito
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/admin/${id}`);
    return response.data;
  },

  // Activar usuario
  toggleUserActive: async (id: string) => {
    const response = await api.patch(`/admin/users/${id}/toggle-active`);
    return response.data;
  },

  // Actualizar rol de usuario
  updateUserRole: async (userId: string, newRole: string) => {
    const response = await api.patch<User>('/admin/users/role', {
      userId,
      newRole,
    });
    return response.data;
  },

};
