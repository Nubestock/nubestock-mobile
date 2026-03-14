/**
 * Tests para src/utils/jwt.ts
 */
import { decodeJWT } from '../../src/utils/jwt';

describe('jwt', () => {
  describe('decodeJWT', () => {
    it('decodifica un JWT válido y retorna el payload', () => {
      // header.payload.signature (payload = base64url de {"sub":1,"role":"admin"})
      const payload = JSON.stringify({ sub: 1, role: 'admin', permissions: ['sales_read'] });
      const payloadB64 = Buffer.from(payload, 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const token = `eyJhbGciOiJIUzI1NiJ9.${payloadB64}.signature`;
      const result = decodeJWT(token);
      expect(result).toEqual({ sub: 1, role: 'admin', permissions: ['sales_read'] });
    });

    it('retorna null para token con menos de 3 partes', () => {
      expect(decodeJWT('only.two')).toBeNull();
      expect(decodeJWT('one')).toBeNull();
    });

    it('retorna null para payload no JSON válido', () => {
      const invalidB64 = Buffer.from('not-json', 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
      const token = `a.${invalidB64}.c`;
      const result = decodeJWT(token);
      expect(result).toBeNull();
    });
  });
});
