// src/types/user.ts

export type UserRole = 'USER' | 'PAID_USER' | 'ADMIN';

// 1. Definimos la interfaz del perfil aquí para reutilizarla
export interface UserProfile {
  institucion?: string;
  cargo?: string;
  // Puedes agregar otros campos del perfil si existen
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string | null;
  role: UserRole;
  telefono: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  // 2. Agregamos la propiedad profile opcional
  profile?: UserProfile;
}

export interface AdminUser {
  nombreCompleto: string;
  email: string;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface UsersResponse {
  data: User[];
  meta: PaginationMeta;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}
