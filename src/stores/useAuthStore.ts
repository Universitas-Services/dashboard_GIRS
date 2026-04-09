import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { authService, LoginCredentials } from '@/services/authService';
import {
  setAuthTokens,
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
} from '@/lib/authStorage';

interface AuthState {
  status: 'idle' | 'loading' | 'error';
  isAuthenticated: boolean;

  // Acciones
  login: (data: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuthOnLoad: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  isAuthenticated: false,

  login: async (data) => {
    if (get().status === 'loading') return;
    set({ status: 'loading' });

    try {
      const tokens = await authService.login(data);
      setAuthTokens(tokens);
      set({
        isAuthenticated: true,
        status: 'idle',
      });
    } catch (error) {
      set({ status: 'error', isAuthenticated: false });
      throw error;
    }
  },

  logout: () => {
    clearAuthStorage();
    set({
      isAuthenticated: false,
      status: 'idle',
    });
    authService
      .logout()
      .catch((e) => console.error('Error logout backend:', e));
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  checkAuthOnLoad: async () => {
    // Si ya estamos autenticados, no hacemos nada
    if (get().isAuthenticated) return;

    set({ status: 'loading' });

    const token = getAccessToken();
    const refreshToken = getRefreshToken();

    // 1. Si NO hay refresh token, no hay nada que hacer -> Logout
    // (El accessToken solo no sirve de mucho si no podemos renovarlo)
    if (!refreshToken) {
      set({ isAuthenticated: false, status: 'idle' });
      return;
    }

    // Variable para decidir si necesitamos renovar
    let shouldRefresh = false;

    // 2. Verificamos el Access Token
    if (!token) {
      // Si no hay access token pero sí refresh token, intentamos renovar
      shouldRefresh = true;
    } else {
      try {
        const decoded: { exp: number } = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Si expiró o expira en menos de 10 segundos
        if (decoded.exp < currentTime + 10) {
          console.log('AuthStore: Token expirado. Se requiere refresh.');
          shouldRefresh = true;
        }
      } catch {
        // --- CORRECCIÓN CLAVE ---
        // Si jwtDecode falla (token corrupto/invalido manualmente),
        // NO hacemos logout. Asumimos que necesitamos un token nuevo limpio.
        console.warn(
          'AuthStore: Token inválido o corrupto. Intentando refresh...'
        );
        shouldRefresh = true;
      }
    }

    // 3. Ejecutamos la lógica de decisión
    if (shouldRefresh) {
      try {
        // Intentamos revivir la sesión con el Refresh Token
        console.log('AuthStore: Ejecutando refresh token...');
        const newTokens = await authService.refreshToken(refreshToken);

        // Si tuvimos éxito:
        setAuthTokens(newTokens);
        set({ isAuthenticated: true, status: 'idle' });
        console.log('AuthStore: Sesión recuperada exitosamente.');
      } catch (refreshError) {
        // AHORA SÍ: Si el refresh falla, es el fin del camino.
        console.error(
          'AuthStore: Falló el refresh token. Cerrando sesión.',
          refreshError
        );
        get().logout();
      }
    } else {
      // El token es válido y no ha expirado
      set({ isAuthenticated: true, status: 'idle' });
    }
  },
}));
