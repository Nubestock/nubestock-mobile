/**
 * Tests para getErrorMessage de src/api/client.ts
 * (La instancia axios y los interceptors se prueban con integración o mock completo)
 */
import axios from 'axios';
import { getErrorMessage } from '../../src/api/client';

describe('api client', () => {
  describe('getErrorMessage', () => {
    it('extrae message de AxiosError con response.data.message', () => {
      const error = Object.assign(new Error('Network'), {
        isAxiosError: true,
        response: { data: { message: 'Credenciales inválidas' } },
      }) as axios.AxiosError;
      expect(getErrorMessage(error)).toBe('Credenciales inválidas');
    });

    it('usa error.message si no hay response.data.message', () => {
      const error = Object.assign(new Error('Timeout'), {
        isAxiosError: true,
        response: { data: {} },
      }) as axios.AxiosError;
      expect(getErrorMessage(error)).toBe('Timeout');
    });

    it('usa error.message para Error estándar', () => {
      expect(getErrorMessage(new Error('Algo falló'))).toBe('Algo falló');
    });

    it('retorna "Error desconocido" para valores no Error', () => {
      expect(getErrorMessage('string')).toBe('Error desconocido');
      expect(getErrorMessage(null)).toBe('Error desconocido');
    });
  });
});
