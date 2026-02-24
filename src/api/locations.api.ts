import apiClient from './client';
import { LocationsCompleteResponse } from '../types/location.types';

export const locationsAPI = {
  /**
   * GET /locations/complete
   * Listar países con provincias y ciudades
   */
  getLocationsComplete: async (): Promise<LocationsCompleteResponse> => {
    const response = await apiClient.get<LocationsCompleteResponse>('/locations/complete');
    return response.data;
  },
};
