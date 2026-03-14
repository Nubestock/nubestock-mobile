/**
 * Tests para src/constants/permissions.ts
 */
import { UserRole, SYSTEM_PERMISSIONS, ROLE_PERMISSIONS } from '../../src/constants/permissions';

describe('permissions constants', () => {
  describe('UserRole', () => {
    it('define los roles del sistema', () => {
      expect(UserRole.ADMINISTRADOR).toBe('Administrador');
      expect(UserRole.VENDEDOR).toBe('Vendedor');
      expect(UserRole.OPERADOR).toBe('Operador');
    });
  });

  describe('SYSTEM_PERMISSIONS', () => {
    it('define permisos de usuarios', () => {
      expect(SYSTEM_PERMISSIONS.USERS_READ).toBe('users_read');
      expect(SYSTEM_PERMISSIONS.USERS_WRITE).toBe('users_write');
    });

    it('define permisos de ventas y producción', () => {
      expect(SYSTEM_PERMISSIONS.SALES_READ).toBe('sales_read');
      expect(SYSTEM_PERMISSIONS.PRODUCTION_WRITE).toBe('production_write');
    });

    it('define permiso admin', () => {
      expect(SYSTEM_PERMISSIONS.ADMIN).toBe('admin');
    });
  });

  describe('ROLE_PERMISSIONS', () => {
    it('administrador tiene todos los permisos', () => {
      const admin = ROLE_PERMISSIONS[UserRole.ADMINISTRADOR];
      expect(admin.sales.read).toBe(true);
      expect(admin.sales.create).toBe(true);
      expect(admin.production.delete).toBe(true);
      expect(admin.clients.read).toBe(true);
    });

    it('vendedor no puede eliminar ventas ni producción', () => {
      const vendedor = ROLE_PERMISSIONS[UserRole.VENDEDOR];
      expect(vendedor.sales.delete).toBe(false);
      expect(vendedor.production.read).toBe(false);
    });

    it('operador tiene solo producción y reportes', () => {
      const operador = ROLE_PERMISSIONS[UserRole.OPERADOR];
      expect(operador.production.create).toBe(true);
      expect(operador.clients.read).toBe(false);
    });
  });
});
