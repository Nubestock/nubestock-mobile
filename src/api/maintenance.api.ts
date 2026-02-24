import apiClient from './client';
import {
  Maintenance,
  MaintenanceListResponse,
  MaintenanceCreate,
  MaintenanceUpdate,
  MaintenanceHistory,
  MaintenanceHistoryListResponse,
  MaintenanceHistoryCreate,
  MaintenanceHistoryUpdate,
} from '../types/machinery.types';

export const maintenanceAPI = {
  /**
   * GET /maintenance
   * Listar todos los mantenimientos
   */
  getMaintenances: async (params?: {
    id_machinery?: number;
    type?: 'PRV' | 'COR';
    is_active?: boolean;
  }): Promise<MaintenanceListResponse> => {
    const response = await apiClient.get<MaintenanceListResponse>('/maintenance', {
      params: {
        ...(params?.id_machinery && { id_machinery: params.id_machinery }),
        ...(params?.type && { type: params.type }),
        ...(params?.is_active !== undefined && { is_active: params.is_active }),
      },
    });
    return response.data;
  },

  /**
   * GET /maintenance/:id
   * Obtener detalle de un mantenimiento
   */
  getMaintenanceById: async (id: number): Promise<Maintenance> => {
    const response = await apiClient.get<{ success: boolean; data: Maintenance }>(
      `/maintenance/${id}`
    );
    return response.data.data;
  },

  /**
   * POST /maintenance
   * Crear nuevo mantenimiento
   */
  createMaintenance: async (maintenance: MaintenanceCreate): Promise<Maintenance> => {
    const response = await apiClient.post<{ success: boolean; data: Maintenance }>(
      '/maintenance',
      maintenance
    );
    return response.data.data;
  },

  /**
   * PUT /maintenance/:id
   * Actualizar mantenimiento existente
   */
  updateMaintenance: async (
    id: number,
    maintenance: MaintenanceUpdate
  ): Promise<Maintenance> => {
    const response = await apiClient.put<{ success: boolean; data: Maintenance }>(
      `/maintenance/${id}`,
      maintenance
    );
    return response.data.data;
  },

  /**
   * DELETE /maintenance/:id
   * Eliminar mantenimiento (soft delete)
   */
  deleteMaintenance: async (id: number): Promise<void> => {
    await apiClient.delete(`/maintenance/${id}`);
  },

  /**
   * GET /maintenance/history
   * Listar historial de mantenimientos
   */
  getMaintenanceHistory: async (params?: {
    id_mantainance?: number;
    id_machinery?: number;
  }): Promise<MaintenanceHistoryListResponse> => {
    const response = await apiClient.get<MaintenanceHistoryListResponse>('/maintenance/history', {
      params: {
        ...(params?.id_mantainance && { id_mantainance: params.id_mantainance }),
        ...(params?.id_machinery && { id_machinery: params.id_machinery }),
      },
    });
    return response.data;
  },

  /**
   * GET /maintenance/history/:id
   * Obtener detalle de un registro de historial
   */
  getMaintenanceHistoryById: async (id: number): Promise<MaintenanceHistory> => {
    const response = await apiClient.get<{ success: boolean; data: MaintenanceHistory }>(
      `/maintenance/history/${id}`
    );
    return response.data.data;
  },

  /**
   * POST /maintenance/history
   * Crear nuevo registro en el historial
   */
  createMaintenanceHistory: async (
    history: MaintenanceHistoryCreate
  ): Promise<MaintenanceHistory> => {
    const response = await apiClient.post<{ success: boolean; data: MaintenanceHistory }>(
      '/maintenance/history',
      history
    );
    return response.data.data;
  },

  /**
   * PUT /maintenance/history/:id
   * Actualizar registro de historial
   */
  updateMaintenanceHistory: async (
    id: number,
    history: MaintenanceHistoryUpdate
  ): Promise<MaintenanceHistory> => {
    const response = await apiClient.put<{ success: boolean; data: MaintenanceHistory }>(
      `/maintenance/history/${id}`,
      history
    );
    return response.data.data;
  },

  /**
   * DELETE /maintenance/history/:id
   * Eliminar registro de historial
   */
  deleteMaintenanceHistory: async (id: number): Promise<void> => {
    await apiClient.delete(`/maintenance/history/${id}`);
  },
};
