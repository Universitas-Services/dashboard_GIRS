import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authService } from '@/services/authService';
import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthStorage,
} from '@/lib/authStorage';

// URL base desde variables de entorno
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 1. Instancia PÚBLICA (Sin interceptores)
// Se usa para Login y Refresh Token en authService.
export const axiosPublic = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 2. Instancia PRIVADA (Con interceptores)
// Se usará para todo el resto de la aplicación.
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- VARIABLES DE ESTADO PARA REFRESH ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Función para procesar la cola de peticiones en espera
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    } else {
      prom.reject(new Error('No token provided'));
    }
  });
  failedQueue = [];
};

// --- INTERCEPTOR DE REQUEST ---
// Inyecta siempre el token más fresco antes de salir
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTOR DE RESPONSE ---
// Maneja errores 401 y la lógica de reintento
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Si es un error 401 y NO es un reintento previo
    if (error.response?.status === 401 && !originalRequest._retry) {
      // CASO A: Ya se está refrescando el token.
      // Encolamos esta petición para que espere al nuevo token.
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // CASO B: Somos la primera petición en fallar. Iniciamos el refresh.
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenStr = getRefreshToken();

      // Si no hay refresh token, no podemos hacer nada -> Logout forzado
      if (!refreshTokenStr) {
        clearAuthStorage();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // 1. Llamamos al servicio (usa axiosPublic, así que es seguro)
        const response = await authService.refreshToken(refreshTokenStr);

        // 2. Guardamos los nuevos tokens
        setAuthTokens(response);

        // 3. Actualizamos la cabecera de la petición original
        originalRequest.headers['Authorization'] =
          `Bearer ${response.access_token}`;

        // 4. Procesamos la cola: liberamos a las peticiones en espera con el nuevo token
        processQueue(null, response.access_token);

        // 5. Reintentamos la petición original
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla (ej. token expirado o revocado):
        // Rechazamos toda la cola y hacemos logout.
        processQueue(refreshError as Error, null);

        clearAuthStorage();
        if (typeof window !== 'undefined') window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        // Siempre liberamos la bandera al terminar
        isRefreshing = false;
      }
    }

    // Si es otro error, lo dejamos pasar
    return Promise.reject(error);
  }
);

export default api;
