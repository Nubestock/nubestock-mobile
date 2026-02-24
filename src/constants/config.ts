import Constants from 'expo-constants';

// Obtener variables de entorno desde app.config.js
const getEnvVar = (key: string, defaultValue: string): string => {
  const value = Constants.expoConfig?.extra?.[key];
  return value || defaultValue;
};

export const API_CONFIG = {
  // URL del backend Azure Functions (desde .env)
  BASE_URL: getEnvVar('apiUrl', 'https://nutregam-api.azurewebsites.net/api'),
  
  // Código de autenticación para Azure Functions (desde .env)
  API_CODE: getEnvVar('apiUrlCode', ''),
  
  // Timeout en milisegundos (desde .env)
  TIMEOUT: Number.parseInt(getEnvVar('apiTimeout', '30000'), 10),
  
  // Headers por defecto
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const APP_CONFIG = {
  APP_NAME: getEnvVar('appName', 'Nutregam'),
  VERSION: getEnvVar('appVersion', '1.0.0'),
  
  // Refresh automático en milisegundos (desde .env)
  AUTO_REFRESH_INTERVAL: Number.parseInt(getEnvVar('autoRefreshInterval', '30000'), 10),
  
  // Paginación (desde .env)
  DEFAULT_PAGE_SIZE: Number.parseInt(getEnvVar('defaultPageSize', '20'), 10),
};
