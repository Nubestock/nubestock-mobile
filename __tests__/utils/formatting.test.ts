/**
 * Tests para src/utils/formatting.ts
 */
import { formatCurrency, formatDate, formatDateShort, formatDateTime } from '../../src/utils/formatting';

describe('formatting', () => {
  describe('formatCurrency', () => {
    it('formatea un número como moneda USD', () => {
      expect(formatCurrency(100)).toMatch(/100[.,]00/);
      expect(formatCurrency(0)).toMatch(/0[.,]00/);
      expect(formatCurrency(1234.56)).toMatch(/1[.\s]?234[.,]56/);
    });

    it('acepta string numérico', () => {
      expect(formatCurrency('50')).toMatch(/50[.,]00/);
    });

    it('retorna valor cero para NaN o inválido', () => {
      expect(formatCurrency(NaN)).toMatch(/0[.,]00/);
      expect(formatCurrency('')).toMatch(/0[.,]00/);
      expect(formatCurrency('abc')).toMatch(/0[.,]00/);
    });
  });

  describe('formatDate', () => {
    it('formatea fecha ISO a formato legible', () => {
      const result = formatDate('2024-06-15');
      expect(result).toContain('2024');
      expect(result).not.toBe('Sin fecha');
      expect(result).not.toBe('Fecha inválida');
    });

    it('retorna "Sin fecha" para null/undefined/vacío', () => {
      expect(formatDate(null)).toBe('Sin fecha');
      expect(formatDate(undefined)).toBe('Sin fecha');
      expect(formatDate('')).toBe('Sin fecha');
    });

    it('retorna "Fecha inválida" para string inválido', () => {
      expect(formatDate('no-es-fecha')).toBe('Fecha inválida');
      expect(formatDate('2024-13-45')).toBe('Fecha inválida');
    });
  });

  describe('formatDateShort', () => {
    it('formatea fecha a formato corto con año', () => {
      const result = formatDateShort('2024-01-15');
      expect(result).toContain('2024');
      expect(result).toMatch(/\d{2}[-\/]\d{2}[-\/]2024/);
    });
  });

  describe('formatDateTime', () => {
    it('formatea fecha con hora', () => {
      const result = formatDateTime('2024-06-15T14:30:00');
      expect(result).toContain('2024');
      expect(result).toContain('15');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });
});
