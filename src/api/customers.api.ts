import apiClient from './client';
import { Customer, CustomersListResponse } from '../types/customer.types';

export const customersAPI = {
  /**
   * GET /clients
   * Listar clientes con paginación
   */
  getCustomers: async (page = 1, limit = 20): Promise<CustomersListResponse> => {
    const response = await apiClient.get<CustomersListResponse>('/clients', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * GET /clients/:id
   * Obtener detalle de cliente
   */
  getCustomerById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get<{ success: boolean; data: Customer }>(`/clients/${id}`);
    return response.data.data;
  },

  /**
   * POST /clients
   * Crear nuevo cliente
   */
  createCustomer: async (customer: Omit<Customer, 'id' | 'creation_date' | 'modification_date'>): Promise<Customer> => {
    const response = await apiClient.post<{ success: boolean; data: Customer }>('/clients', customer);
    return response.data.data;
  },

  /**
   * PUT /clients/:id
   * Actualizar cliente existente
   */
  updateCustomer: async (id: number, customer: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.put<{ success: boolean; data: Customer }>(`/clients/${id}`, customer);
    return response.data.data;
  },
};
