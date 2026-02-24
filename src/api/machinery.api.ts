import apiClient from './client';
import {
  Machinery,
  MachineryListResponse,
  MachineryCreate,
  MachineryUpdate,
} from '../types/machinery.types';

export const machineryAPI = {
  /**
   * GET /machinery
   * Listar todas las maquinarias
   */
  getMachinery: async (params?: {
    search?: string;
    is_active?: boolean;
  }): Promise<MachineryListResponse> => {
    const response = await apiClient.get<MachineryListResponse>('/machinery', {
      params: {
        ...(params?.search && { search: params.search }),
        ...(params?.is_active !== undefined && { is_active: params.is_active }),
      },
    });
    return response.data;
  },

  /**
   * GET /machinery/:id
   * Obtener detalle de una maquinaria
   */
  getMachineryById: async (id: number): Promise<Machinery> => {
    const response = await apiClient.get<{ success: boolean; data: Machinery }>(`/machinery/${id}`);
    return response.data.data;
  },

  /**
   * POST /machinery
   * Crear nueva maquinaria
   */
  createMachinery: async (machinery: MachineryCreate): Promise<Machinery> => {
    const response = await apiClient.post<{ success: boolean; data: Machinery }>(
      '/machinery',
      machinery
    );
    return response.data.data;
  },

  /**
   * PUT /machinery/:id
   * Actualizar maquinaria existente
   */
  updateMachinery: async (id: number, machinery: MachineryUpdate): Promise<Machinery> => {
    const response = await apiClient.put<{ success: boolean; data: Machinery }>(
      `/machinery/${id}`,
      machinery
    );
    return response.data.data;
  },

  /**
   * DELETE /machinery/:id
   * Eliminar maquinaria (soft delete)
   */
  deleteMachinery: async (id: number): Promise<void> => {
    await apiClient.delete(`/machinery/${id}`);
  },
};
