/**
 * Tests para src/utils/validation.ts
 */
import {
  loginSchema,
  changePasswordSchema,
  saleSchema,
  productionSchema,
} from '../../src/utils/validation';

describe('validation', () => {
  describe('loginSchema', () => {
    it('valida credenciales correctas', async () => {
      await expect(
        loginSchema.validate({ email: 'test@example.com', password: '123456' })
      ).resolves.toEqual({ email: 'test@example.com', password: '123456' });
    });

    it('valida email con varios puntos en la parte local', async () => {
      await expect(
        loginSchema.validate({ email: 'jeremy.eoon.q@outlook.com', password: '123456' })
      ).resolves.toEqual({ email: 'jeremy.eoon.q@outlook.com', password: '123456' });
    });

    it('rechaza email inválido', async () => {
      await expect(
        loginSchema.validate({ email: 'invalid', password: '123456' })
      ).rejects.toThrow();
    });

    it('rechaza contraseña corta', async () => {
      await expect(
        loginSchema.validate({ email: 'a@b.com', password: '12345' })
      ).rejects.toThrow();
    });

    it('rechaza campos vacíos', async () => {
      await expect(loginSchema.validate({ email: '', password: '' })).rejects.toThrow();
    });
  });

  describe('changePasswordSchema', () => {
    it('valida datos correctos', async () => {
      await expect(
        changePasswordSchema.validate({
          currentPassword: 'old123',
          newPassword: 'new1234',
          confirmPassword: 'new1234',
        })
      ).resolves.toBeDefined();
    });

    it('rechaza cuando las contraseñas no coinciden', async () => {
      await expect(
        changePasswordSchema.validate({
          currentPassword: 'old123',
          newPassword: 'new1234',
          confirmPassword: 'other1234',
        })
      ).rejects.toThrow();
    });
  });

  describe('saleSchema', () => {
    it('valida venta correcta', async () => {
      await expect(
        saleSchema.validate({
          id_customer: 1,
          sale_date: '2024-01-15',
          payment_status: 'paid',
          payment_method: 'cash',
          items: [{ id_product: 1, quantity: 2 }],
        })
      ).resolves.toBeDefined();
    });

    it('rechaza payment_status inválido', async () => {
      await expect(
        saleSchema.validate({
          id_customer: 1,
          sale_date: '2024-01-15',
          payment_status: 'invalid',
          payment_method: 'cash',
          items: [{}],
        })
      ).rejects.toThrow();
    });

    it('rechaza items vacío', async () => {
      await expect(
        saleSchema.validate({
          id_customer: 1,
          sale_date: '2024-01-15',
          payment_status: 'pending',
          payment_method: 'transfer',
          items: [],
        })
      ).rejects.toThrow();
    });
  });

  describe('productionSchema', () => {
    it('valida producción correcta', async () => {
      await expect(
        productionSchema.validate({
          id_product: 1,
          id_machinery: 1,
          production_date: '2024-01-15',
          quantity_produced: 100,
          shift: 'morning',
        })
      ).resolves.toBeDefined();
    });

    it('rechaza quantity_produced no positivo', async () => {
      await expect(
        productionSchema.validate({
          id_product: 1,
          id_machinery: 1,
          production_date: '2024-01-15',
          quantity_produced: 0,
          shift: 'afternoon',
        })
      ).rejects.toThrow();
    });

    it('rechaza turno inválido', async () => {
      await expect(
        productionSchema.validate({
          id_product: 1,
          id_machinery: 1,
          production_date: '2024-01-15',
          quantity_produced: 50,
          shift: 'invalid',
        })
      ).rejects.toThrow();
    });
  });
});
