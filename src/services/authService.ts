import { axiosPublic } from '@/lib/axios';

// Estandarizamos a snake_case para coincidir con el backend y el estándar OAuth
export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
// --- SERVICIO ---

export const authService = {
  // INICIAR SESIÓN
  // Usamos axiosPublic para evitar interceptores en el login
  login: async (credentials: LoginCredentials): Promise<AuthTokenResponse> => {
    const response = await axiosPublic.post<AuthTokenResponse>(
      '/admin/auth/login',
      credentials
    );
    return response.data;
  },

  // REFRESCAR TOKEN
  // Usamos axiosPublic.
  // Si usáramos 'api', un fallo aquí (401) dispararía el interceptor de nuevo -> bucle infinito.
  refreshToken: async (token: string): Promise<AuthTokenResponse> => {
    // Enviamos el token según lo espere tu backend.
    // Asumo que lo espera en el body como { refresh_token: ... }
    const response = await axiosPublic.post<AuthTokenResponse>(
      '/admin/auth/refresh',
      {
        refreshToken: token,
      }
    );

    return response.data;
  },

  // LOGOUT
  logout: async () => {
    return axiosPublic.post('/admin/auth/logout');
  },
};
