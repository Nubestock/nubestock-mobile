import apiClient from './client';
import { Sale, SaleCreate, SalesListResponse, SaleDetailResponse } from '../types/sales.types';

export const salesAPI = {
  /**
   * GET /sales
   * Obtener lista de ventas con paginación
   */
  getSales: async (page = 1, limit = 20): Promise<SalesListResponse> => {
    const response = await apiClient.get<SalesListResponse>('/sales', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * GET /sales/:id
   * Obtener detalle de una venta
   */
  getSaleById: async (id: number): Promise<SaleDetailResponse['data']> => {
    const response = await apiClient.get<SaleDetailResponse>(`/sales/${id}`);
    return response.data.data;
  },

  /**
   * POST /sales
   * Crear nueva venta
   */
  createSale: async (sale: SaleCreate): Promise<Sale> => {
    const response = await apiClient.post<{ success: boolean; data: Sale }>('/sales', sale);
    return response.data.data;
  },

  /**
   * PUT /sales/:id
   * Actualizar venta existente
   */
  updateSale: async (id: number, sale: Partial<SaleCreate>): Promise<Sale> => {
    const response = await apiClient.put<{ success: boolean; data: Sale }>(`/sales/${id}`, sale);
    return response.data.data;
  },

  /**
   * DELETE /sales/:id
   * Eliminar venta (solo Admin)
   */
  deleteSale: async (id: number): Promise<void> => {
    await apiClient.delete(`/sales/${id}`);
  },
};
