export enum UserRole {
  ADMINISTRADOR = 'Administrador',
  VENDEDOR = 'Vendedor',
  OPERADOR = 'Operador',
}

/**
 * Permisos del sistema según la base de datos
 * Los permisos reales vienen del JWT y tienen formato: resource_action
 * Ejemplos: clients_read, clients_write, sales_read, sales_write, sales_manage, etc.
 */
export const SYSTEM_PERMISSIONS = {
  // Users
  USERS_READ: 'users_read',
  USERS_WRITE: 'users_write',
  USERS_MANAGE: 'users_manage',
  
  // Inventory
  INVENTORY_MANAGE: 'inventory_manage',
  
  // Products
  PRODUCTS_READ: 'products_read',
  PRODUCTS_WRITE: 'products_write',
  
  // Production
  PRODUCTION_READ: 'production_read',
  PRODUCTION_WRITE: 'production_write',
  
  // Sales
  SALES_READ: 'sales_read',
  SALES_WRITE: 'sales_write',
  SALES_MANAGE: 'sales_manage',
  
  // Clients (no "customers")
  CLIENTS_READ: 'clients_read',
  CLIENTS_WRITE: 'clients_write',
  
  // Reports
  REPORTS_VIEW: 'reports_view',
  
  // Stats
  STATS_READ: 'stats_read',
  
  // Roles
  ROLES_READ: 'roles_read',
  ROLES_WRITE: 'roles_write',
  
  // System
  ADMIN: 'admin',
} as const;

/**
 * Mapeo de permisos a recursos (para compatibilidad con el sistema anterior)
 * @deprecated Usar directamente los permisos del JWT
 */
export const ROLE_PERMISSIONS = {
  [UserRole.ADMINISTRADOR]: {
    sales: { read: true, create: true, update: true, delete: true },
    production: { read: true, create: true, update: true, delete: true },
    products: { read: true, create: true, update: true, delete: true },
    clients: { read: true, create: true, update: true, delete: true },
    reports: { read: true },
  },
  [UserRole.VENDEDOR]: {
    sales: { read: true, create: true, update: true, delete: false },
    production: { read: false, create: false, update: false, delete: false },
    products: { read: true, create: false, update: false, delete: false },
    clients: { read: true, create: true, update: true, delete: false },
    reports: { read: true },
  },
  [UserRole.OPERADOR]: {
    sales: { read: false, create: false, update: false, delete: false },
    production: { read: true, create: true, update: true, delete: false },
    products: { read: true, create: false, update: false, delete: false },
    clients: { read: false, create: false, update: false, delete: false },
    reports: { read: true },
  },
};
