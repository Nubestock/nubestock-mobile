/**
 * Tests para src/utils/permissions.ts
 */
import {
  hasSystemPermission,
  hasAnySystemPermission,
  canAccessSales,
  canAccessProduction,
  canAccessProducts,
  canAccessClients,
  canAccessCustomers,
  canCreateSales,
  canCreateProduction,
  canDeleteSales,
  canDeleteProduction,
  canCreateClients,
  canReadClients,
} from '../../src/utils/permissions';
import { User } from '../../src/types/auth.types';

describe('permissions', () => {
  const adminUser: User = {
    id: 1,
    name: 'Admin',
    email: 'admin@test.com',
    is_active: true,
    permissions: ['admin'],
  };

  const salesUser: User = {
    id: 2,
    name: 'Vendedor',
    email: 'v@test.com',
    is_active: true,
    permissions: ['sales_read', 'sales_write', 'clients_read'],
  };

  const operatorUser: User = {
    id: 3,
    name: 'Operador',
    email: 'op@test.com',
    is_active: true,
    permissions: ['production_read', 'production_write'],
  };

  describe('hasSystemPermission', () => {
    it('retorna false si user es null', () => {
      expect(hasSystemPermission(null, 'sales_read')).toBe(false);
    });

    it('retorna true si user tiene admin', () => {
      expect(hasSystemPermission(adminUser, 'sales_read')).toBe(true);
      expect(hasSystemPermission(adminUser, 'any_permission')).toBe(true);
    });

    it('retorna true si user tiene el permiso específico', () => {
      expect(hasSystemPermission(salesUser, 'sales_read')).toBe(true);
    });

    it('retorna false si user no tiene el permiso', () => {
      expect(hasSystemPermission(salesUser, 'users_manage')).toBe(false);
    });
  });

  describe('hasAnySystemPermission', () => {
    it('retorna false si user es null', () => {
      expect(hasAnySystemPermission(null, ['sales_read'])).toBe(false);
    });

    it('retorna true si user tiene admin', () => {
      expect(hasAnySystemPermission(adminUser, ['users_manage'])).toBe(true);
    });

    it('retorna true si user tiene al menos uno', () => {
      expect(hasAnySystemPermission(salesUser, ['sales_read', 'users_manage'])).toBe(true);
    });

    it('retorna false si user no tiene ninguno', () => {
      expect(hasAnySystemPermission(operatorUser, ['sales_read', 'clients_write'])).toBe(false);
    });
  });

  describe('canAccessSales', () => {
    it('retorna true para admin', () => {
      expect(canAccessSales(adminUser)).toBe(true);
    });
    it('retorna true para usuario con permiso de ventas', () => {
      expect(canAccessSales(salesUser)).toBe(true);
    });
    it('retorna false para operador sin ventas', () => {
      expect(canAccessSales(operatorUser)).toBe(false);
    });
  });

  describe('canAccessProduction', () => {
    it('retorna true para operador con production_read', () => {
      expect(canAccessProduction(operatorUser)).toBe(true);
    });
    it('retorna false para vendedor sin production', () => {
      expect(canAccessProduction(salesUser)).toBe(false);
    });
  });

  describe('canAccessProducts / canAccessClients', () => {
    it('canAccessProducts para admin', () => {
      expect(canAccessProducts(adminUser)).toBe(true);
    });
    it('canAccessClients para usuario con clients_read', () => {
      expect(canAccessClients(salesUser)).toBe(true);
    });
    it('canAccessCustomers es alias de canAccessClients', () => {
      expect(canAccessCustomers(salesUser)).toBe(canAccessClients(salesUser));
    });
  });

  describe('canCreateSales / canDeleteSales', () => {
    it('canCreateSales con sales_write', () => {
      expect(canCreateSales(salesUser)).toBe(true);
    });
    it('canDeleteSales requiere SALES_MANAGE', () => {
      const manageUser: User = { ...salesUser, permissions: ['sales_manage'] };
      expect(canDeleteSales(manageUser)).toBe(true);
      expect(canDeleteSales(salesUser)).toBe(false);
    });
  });

  describe('canCreateProduction / canDeleteProduction', () => {
    it('canCreateProduction con production_write', () => {
      expect(canCreateProduction(operatorUser)).toBe(true);
    });
    it('canDeleteProduction con production_write', () => {
      expect(canDeleteProduction(operatorUser)).toBe(true);
    });
  });

  describe('canCreateClients / canReadClients', () => {
    it('canReadClients con clients_read', () => {
      expect(canReadClients(salesUser)).toBe(true);
    });
    it('canCreateClients con clients_write', () => {
      const writeUser: User = { ...salesUser, permissions: ['clients_read', 'clients_write'] };
      expect(canCreateClients(writeUser)).toBe(true);
    });
  });
});
