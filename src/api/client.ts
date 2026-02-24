import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../constants/config';
import { getStoredToken, clearStoredToken } from '../utils/storage';

// Crear instancia de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Interceptor de Request - Agregar token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getStoredToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    // Log detallado para register-materials
    if (config.url?.includes('register-materials')) {
      console.log('[API Request] Body:', JSON.stringify(config.data, null, 2));
      console.log('[API Request] Headers:', {
        'Content-Type': config.headers['Content-Type'],
        'Authorization': config.headers.Authorization ? 'Bearer ***' : 'No token',
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor de Response - Manejo de errores
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url} - Status: ${response.status}`);
    
    // Log detallado para register-materials
    if (response.config.url?.includes('register-materials')) {
      console.log('[API Response] Data:', JSON.stringify(response.data, null, 2));
    }
    
    return response;
  },
  async (error: AxiosError) => {
    console.error('[API Response Error]', error.response?.status, error.message);
    
    // Log detallado de errores para register-materials
    if (error.config?.url?.includes('register-materials')) {
      console.error('[API Response Error] Request que falló:', JSON.stringify(error.config.data, null, 2));
      console.error('[API Response Error] Response error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    }
    
    // Si es 401, limpiar token y redirigir al login
    if (error.response?.status === 401) {
      await clearStoredToken();
      // Aquí podrías disparar un evento para redirigir al login
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper para extraer mensaje de error
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Error desconocido';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Error desconocido';
};
