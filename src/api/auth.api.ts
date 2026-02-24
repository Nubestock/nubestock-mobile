import apiClient from './client';
import { LoginRequest, LoginResponse, ChangePasswordRequest } from '../types/auth.types';

export const authAPI = {
  /**
   * POST /auth/login
   * Login de usuario
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * POST /auth/change-password
   * Cambiar contraseña del usuario autenticado
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/auth/change-password', data);
  },

  /**
   * POST /auth/logout
   * Cerrar sesión
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
