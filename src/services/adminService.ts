import api from '@/lib/axios';
import { User } from '@/types/user';

// 1. Definimos los tipos para los parámetros y la respuesta paginada de Usuarios
export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: string;
  estado?: string;
  municipio?: string;
  tipoUsuario?: string;
}

// Estructura de respuesta paginada
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
    // Limpiar params de valores vacíos
    const cleanParams: Record<string, string | number | boolean> = {};
    if (params) {
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.search && params.search.trim() !== '')
        cleanParams.search = params.search;
      if (params.role) cleanParams.role = params.role;
      if (params.isActive !== undefined) cleanParams.isActive = params.isActive;
      if (params.estado) cleanParams.estado = params.estado;
      if (params.municipio) cleanParams.municipio = params.municipio;
      if (params.tipoUsuario) cleanParams.tipoUsuario = params.tipoUsuario;
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
  
  updateAccountStatus: async (id: string, data: { estadoCuenta: string; fechaVencimientoAcceso?: string }) => {
    const response = await api.patch(`/admin/users/${id}/estado-cuenta`, data);
    return response.data;
  },

};
