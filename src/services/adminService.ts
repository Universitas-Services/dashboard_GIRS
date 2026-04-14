import api from '@/lib/axios';
import { User, CRMNotesResponse, CRMNote } from '@/types/user';

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
  estadoCuenta?: string;
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
      if (params.estadoCuenta) cleanParams.estadoCuenta = params.estadoCuenta;
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

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  bulkDeleteUsers: async (userIds: string[]) => {
    const response = await api.post(`/admin/users/bulk-delete`, { userIds });
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

  convertToPrivateTrial: async (id: string) => {
    const response = await api.patch(`/admin/users/${id}/convert-to-private-trial`);
    return response.data;
  },

  convertToPublic: async (id: string) => {
    const response = await api.patch(`/admin/users/${id}/convert-to-public`);
    return response.data;
  },

  // --- CRM NOTES ---
  getCrmNotes: async (userId: string, page: number = 1, limit: number = 5): Promise<CRMNotesResponse> => {
    const response = await api.get<CRMNotesResponse>(`/admin/users/${userId}/crm-notes`, {
      params: { page, limit }
    });
    return response.data;
  },

  createCrmNote: async (userId: string, data: { content: string; etiqueta: string | null }): Promise<CRMNote> => {
    const response = await api.post<CRMNote>(`/admin/users/${userId}/crm-notes`, data);
    return response.data;
  },

  updateCrmNote: async (noteId: string, data: { content?: string; etiqueta?: string | null }): Promise<CRMNote> => {
    const response = await api.patch<CRMNote>(`/admin/crm-notes/${noteId}`, data);
    return response.data;
  },

  deleteCrmNote: async (noteId: string): Promise<void> => {
    const response = await api.delete(`/admin/crm-notes/${noteId}`);
    return response.data;
  },

  // --- TERRITORIO ---
  getEstados: async () => {
    const response = await api.get('/territorio/estados');
    return response.data;
  },

  getMunicipios: async (estadoId: number) => {
    const response = await api.get(`/territorio/municipios/${estadoId}`);
    return response.data;
  },

  // --- SUBSCRIPTIONS ---
  addSubscriptionDays: async (id: string) => {
    const response = await api.patch(`/admin/users/${id}/add-subscription`);
    return response.data;
  },

  subtractSubscriptionDays: async (id: string) => {
    const response = await api.patch(`/admin/users/${id}/subtract-subscription`);
    return response.data;
  },
};
