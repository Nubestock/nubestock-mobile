import apiClient from './client';
import {
  MachineryAlert,
  MachineryAlertListResponse,
  MachineryAlertCreate,
  UserAlert,
  UserAlertsListResponse,
  UserDevice,
  UserDeviceListResponse,
  UserDeviceRegister,
} from '../types/machinery.types';

export const machineryAlertsAPI = {
  /**
   * GET /machinery-alerts
   * Listar alertas de maquinaria
   */
  getMachineryAlerts: async (params?: {
    id_mantainance?: number;
    type?: string;
    is_sent?: boolean;
    user_id?: number;
  }): Promise<MachineryAlertListResponse> => {
    const response = await apiClient.get<MachineryAlertListResponse>('/machinery-alerts', {
      params: {
        ...(params?.id_mantainance && { id_mantainance: params.id_mantainance }),
        ...(params?.type && { type: params.type }),
        ...(params?.is_sent !== undefined && { is_sent: params.is_sent }),
        ...(params?.user_id && { user_id: params.user_id }),
      },
    });
    return response.data;
  },

  /**
   * GET /machinery-alerts/user
   * Obtener alertas del usuario autenticado
   */
  getUserAlerts: async (params?: {
    is_read?: boolean;
  }): Promise<UserAlertsListResponse> => {
    const response = await apiClient.get<UserAlertsListResponse>('/machinery-alerts/user', {
      params: {
        ...(params?.is_read !== undefined && { is_read: params.is_read }),
      },
    });
    return response.data;
  },

  /**
   * GET /machinery-alerts/:id
   * Obtener alerta por ID
   */
  getMachineryAlertById: async (id: number): Promise<MachineryAlert> => {
    const response = await apiClient.get<{ success: boolean; data: MachineryAlert }>(
      `/machinery-alerts/${id}`
    );
    return response.data.data;
  },

  /**
   * POST /machinery-alerts
   * Crear alerta de maquinaria
   */
  createMachineryAlert: async (alert: MachineryAlertCreate): Promise<MachineryAlert> => {
    const response = await apiClient.post<{ success: boolean; data: MachineryAlert }>(
      '/machinery-alerts',
      alert
    );
    return response.data.data;
  },

  /**
   * PUT /machinery-alerts/:id/read
   * Marcar alerta como leída
   */
  markAlertAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/machinery-alerts/${id}/read`);
  },

  /**
   * POST /machinery-alerts/:id/assign
   * Asignar alerta a usuarios
   */
  assignAlertToUsers: async (id: number, user_ids: number[]): Promise<void> => {
    await apiClient.post(`/machinery-alerts/${id}/assign`, { user_ids });
  },

  /**
   * POST /machinery-alerts/device
   * Registrar dispositivo para notificaciones push
   */
  registerDevice: async (device: UserDeviceRegister): Promise<UserDevice> => {
    const response = await apiClient.post<{ success: boolean; data: UserDevice }>(
      '/machinery-alerts/device',
      device
    );
    return response.data.data;
  },

  /**
   * GET /machinery-alerts/device
   * Obtener dispositivos del usuario
   */
  getUserDevices: async (): Promise<UserDeviceListResponse> => {
    const response = await apiClient.get<UserDeviceListResponse>('/machinery-alerts/device');
    return response.data;
  },

  /**
   * DELETE /machinery-alerts/device/:id
   * Desregistrar dispositivo
   */
  unregisterDevice: async (id: number): Promise<void> => {
    await apiClient.delete(`/machinery-alerts/device/${id}`);
  },
};
