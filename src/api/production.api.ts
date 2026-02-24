import apiClient from './client';
import {
  ProductionReport,
  ProductionReportCreate,
  ProductionListResponse,
  ProductionDailyRequest,
  ProductionDailyResponse,
  StockInsufficientResponse,
  DailyProductionListResponse,
  RegisterMaterialsRequest,
  RegisterMaterialsResponse,
} from '../types/production.types';

export const productionAPI = {
  /**
   * GET /production/daily
   * Obtener lista de producción diaria
   */
  getDailyProductions: async (
    params?: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      id_user?: number;
      id_product?: number;
      status?: 'pending' | 'completed';
    }
  ): Promise<DailyProductionListResponse> => {
    const response = await apiClient.get<DailyProductionListResponse>('/production/daily', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        ...(params?.startDate && { startDate: params.startDate }),
        ...(params?.endDate && { endDate: params.endDate }),
        ...(params?.id_user && { id_user: params.id_user }),
        ...(params?.id_product && { id_product: params.id_product }),
        ...(params?.status && { status: params.status }),
      },
    });
    return response.data;
  },

  /**
   * GET /production-reports
   * Obtener lista de reportes de producción (legacy)
   */
  getReports: async (page = 1, limit = 20): Promise<ProductionListResponse> => {
    const response = await apiClient.get<ProductionListResponse>('/production-reports', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * GET /production-reports/:id
   * Obtener detalle de un reporte
   */
  getReportById: async (id: number): Promise<ProductionReport> => {
    const response = await apiClient.get<{ success: boolean; data: ProductionReport }>(
      `/production-reports/${id}`
    );
    return response.data.data;
  },

  /**
   * POST /production-reports
   * Crear nuevo reporte de producción
   */
  createReport: async (report: ProductionReportCreate): Promise<ProductionReport> => {
    const response = await apiClient.post<{ success: boolean; data: ProductionReport }>(
      '/production-reports',
      report
    );
    return response.data.data;
  },

  /**
   * PUT /production-reports/:id
   * Actualizar reporte existente
   */
  updateReport: async (id: number, report: Partial<ProductionReportCreate>): Promise<ProductionReport> => {
    const response = await apiClient.put<{ success: boolean; data: ProductionReport }>(
      `/production-reports/${id}`,
      report
    );
    return response.data.data;
  },

  /**
   * DELETE /production-reports/:id
   * Eliminar reporte (solo Admin)
   */
  deleteReport: async (id: number): Promise<void> => {
    await apiClient.delete(`/production-reports/${id}`);
  },

  /**
   * POST /production/daily
   * Registrar producción diaria
   */
  registerDailyProduction: async (
    request: ProductionDailyRequest
  ): Promise<ProductionDailyResponse> => {
    const response = await apiClient.post<ProductionDailyResponse>('/production/daily', request);
    return response.data;
  },

  /**
   * POST /production/register-materials
   * Registrar consumo de materiales para producción
   */
  registerMaterials: async (
    request: RegisterMaterialsRequest
  ): Promise<RegisterMaterialsResponse> => {
    console.log('[productionAPI.registerMaterials] Enviando request:', {
      id_product: request.id_product,
      materials_count: request.materials.length,
      materials: request.materials.map(m => ({
        id_product: m.id_product,
        quantity_used: m.quantity_used,
        waste: m.waste,
        has_details: !!m.details,
      })),
    });
    
    const response = await apiClient.post<RegisterMaterialsResponse>('/production/register-materials', request);
    
    console.log('[productionAPI.registerMaterials] Response recibido:', {
      success: response.data.success,
      message: response.data.message,
      production_pending_ids: response.data.data?.production_pending_ids,
      materials_consumed_count: response.data.data?.materials_consumed?.length,
    });
    
    return response.data;
  },
};
