import apiClient from './client';
import { User } from '../types/auth.types';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  is_active?: boolean;
}

export interface CreateUserResponse {
  success: boolean;
  data: User;
  message?: string;
  timestamp: string;
}

export interface UsersListResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export const usersAPI = {
  /**
   * GET /users
   * Listar usuarios con paginación
   */
  getUsers: async (page = 1, limit = 20, search?: string, is_active?: boolean): Promise<UsersListResponse> => {
    const response = await apiClient.get<UsersListResponse>('/users', {
      params: { page, limit, search, is_active },
    });
    return response.data;
  },

  /**
   * GET /users/:id
   * Obtener detalle de usuario
   */
  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<{ success: boolean; data: User }>(`/users/${id}`);
    return response.data.data;
  },

  /**
   * POST /users
   * Crear nuevo usuario
   */
  createUser: async (user: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<CreateUserResponse>('/users', user);
    return response.data.data;
  },

  /**
   * PUT /users/:id
   * Actualizar usuario existente
   */
  updateUser: async (id: number, user: Partial<CreateUserRequest>): Promise<User> => {
    const response = await apiClient.put<{ success: boolean; data: User }>(`/users/${id}`, user);
    return response.data.data;
  },

  /**
   * DELETE /users/:id
   * Eliminar usuario
   */
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
