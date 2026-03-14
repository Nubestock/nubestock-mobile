/**
 * Tests para src/utils/cache.ts
 * Usa el mock global de mocks.ts; solo comprobamos comportamiento (no espiar llamadas).
 */
import {
  saveToCache,
  getFromCache,
  clearCache,
  cacheSales,
  getCachedSales,
  cacheProduction,
  getCachedProduction,
  cacheProducts,
  getCachedProducts,
} from '../../src/utils/cache';

describe('cache', () => {
  describe('saveToCache / getFromCache', () => {
    it('saveToCache no lanza', async () => {
      await expect(saveToCache('key1', { foo: 'bar' })).resolves.toBeUndefined();
    });

    it('getFromCache retorna null sin datos en storage', async () => {
      const result = await getFromCache<{ foo: string }>('key2');
      expect(result).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('clearCache no lanza', async () => {
      await expect(clearCache('key3')).resolves.toBeUndefined();
    });
  });

  describe('cacheSales / getCachedSales', () => {
    it('cacheSales no lanza y getCachedSales retorna null por defecto', async () => {
      await expect(cacheSales([{ id: 1, total: 100 }])).resolves.toBeUndefined();
      const cached = await getCachedSales();
      expect(cached).toBeNull();
    });
  });

  describe('cacheProduction / getCachedProduction', () => {
    it('cacheProduction no lanza y getCachedProduction retorna null por defecto', async () => {
      await expect(cacheProduction([{ id: 1, quantity: 50 }])).resolves.toBeUndefined();
      const cached = await getCachedProduction();
      expect(cached).toBeNull();
    });
  });

  describe('cacheProducts / getCachedProducts', () => {
    it('cacheProducts no lanza y getCachedProducts retorna null por defecto', async () => {
      await expect(cacheProducts([{ id: 1, name: 'A' }])).resolves.toBeUndefined();
      const cached = await getCachedProducts();
      expect(cached).toBeNull();
    });
  });
});
