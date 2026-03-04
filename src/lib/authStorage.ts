import { AuthTokenResponse } from '@/services/authService';

const ACCESS_TOKEN_KEY = 'accessToken'; // Clave interna en localStorage
const REFRESH_TOKEN_KEY = 'refreshToken'; // Clave interna en localStorage

// Verificación de entorno (Next.js SSR safety)
const isBrowser = typeof window !== 'undefined';

// --- Getters y Setters Básicos ---

export const getAccessToken = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setAccessToken = (token: string | null) => {
  if (!isBrowser) return;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

export const setRefreshToken = (token: string | null) => {
  if (!isBrowser) return;
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

// --- Funciones Compuestas ---

// Guarda ambos tokens recibidos del backend
export const setAuthTokens = (tokens: AuthTokenResponse | null) => {
  if (tokens) {
    // Aquí mapeamos la respuesta snake_case del backend a nuestro storage
    setAccessToken(tokens.access_token);
    setRefreshToken(tokens.refresh_token);
  } else {
    clearAuthStorage();
  }
};

export const clearAuthStorage = () => {
  if (!isBrowser) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // Limpia cualquier otro dato de sesión si existiera
};

export const getIsAuthenticated = (): boolean => {
  return !!getAccessToken() && !!getRefreshToken();
};
