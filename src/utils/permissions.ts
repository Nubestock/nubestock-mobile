import { User } from '../types/auth.types';
import { SYSTEM_PERMISSIONS } from '../constants/permissions';

/**
 * Verifica si el usuario tiene un permiso específico del sistema
 * Los permisos vienen del JWT en formato: resource_action (ej: clients_read, sales_write)
 */
export const hasSystemPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  
  // Si el usuario tiene el permiso "admin", tiene acceso a todo
  if (user.permissions?.includes(SYSTEM_PERMISSIONS.ADMIN)) {
    return true;
  }
  
  // Verificar si tiene el permiso específico
  return user.permissions?.includes(permission) || false;
};

/**
 * Verifica si el usuario tiene alguno de los permisos especificados
 */
export const hasAnySystemPermission = (user: User | null, permissions: string[]): boolean => {
  if (!user) return false;
  
  // Si el usuario tiene el permiso "admin", tiene acceso a todo
  if (user.permissions?.includes(SYSTEM_PERMISSIONS.ADMIN)) {
    return true;
  }
  
  // Verificar si tiene alguno de los permisos
  return permissions.some(permission => user.permissions?.includes(permission)) || false;
};

// Funciones de conveniencia para verificar permisos específicos

export const canAccessSales = (user: User | null): boolean => {
  return hasAnySystemPermission(user, [
    SYSTEM_PERMISSIONS.SALES_READ,
    SYSTEM_PERMISSIONS.SALES_WRITE,
    SYSTEM_PERMISSIONS.SALES_MANAGE,
  ]);
};

export const canAccessProduction = (user: User | null): boolean => {
  return hasAnySystemPermission(user, [
    SYSTEM_PERMISSIONS.PRODUCTION_READ,
    SYSTEM_PERMISSIONS.PRODUCTION_WRITE,
  ]);
};

export const canAccessProducts = (user: User | null): boolean => {
  return hasAnySystemPermission(user, [
    SYSTEM_PERMISSIONS.PRODUCTS_READ,
    SYSTEM_PERMISSIONS.PRODUCTS_WRITE,
  ]);
};

export const canAccessClients = (user: User | null): boolean => {
  return hasAnySystemPermission(user, [
    SYSTEM_PERMISSIONS.CLIENTS_READ,
    SYSTEM_PERMISSIONS.CLIENTS_WRITE,
  ]);
};

// Alias para compatibilidad (deprecated - usar canAccessClients)
export const canAccessCustomers = canAccessClients;

export const canCreateSales = (user: User | null): boolean => {
  return hasAnySystemPermission(user, [
    SYSTEM_PERMISSIONS.SALES_WRITE,
    SYSTEM_PERMISSIONS.SALES_MANAGE,
  ]);
};

export const canCreateProduction = (user: User | null): boolean => {
  return hasSystemPermission(user, SYSTEM_PERMISSIONS.PRODUCTION_WRITE);
};

export const canDeleteSales = (user: User | null): boolean => {
  return hasSystemPermission(user, SYSTEM_PERMISSIONS.SALES_MANAGE);
};

export const canDeleteProduction = (user: User | null): boolean => {
  // No hay permiso específico de delete para producción, solo write
  return hasSystemPermission(user, SYSTEM_PERMISSIONS.PRODUCTION_WRITE);
};

export const canCreateClients = (user: User | null): boolean => {
  return hasSystemPermission(user, SYSTEM_PERMISSIONS.CLIENTS_WRITE);
};

export const canReadClients = (user: User | null): boolean => {
  return hasSystemPermission(user, SYSTEM_PERMISSIONS.CLIENTS_READ);
};
