/**
 * Tests para src/constants/colors.ts
 */
import { LIGHT_COLORS, DARK_COLORS, COLORS } from '../../src/constants/colors';

describe('colors', () => {
  describe('LIGHT_COLORS', () => {
    it('define colores de marca', () => {
      expect(LIGHT_COLORS.PRIMARY).toBe('#006A4E');
      expect(LIGHT_COLORS.PRIMARY_LIGHT).toBe('#009973');
      expect(LIGHT_COLORS.SUCCESS).toBeDefined();
      expect(LIGHT_COLORS.ERROR).toBeDefined();
    });

    it('define colores de fondo y superficie', () => {
      expect(LIGHT_COLORS.BACKGROUND).toBe('#F9FAFB');
      expect(LIGHT_COLORS.SURFACE).toBe('#FFFFFF');
      expect(LIGHT_COLORS.BORDER).toBeDefined();
    });

    it('define colores de texto', () => {
      expect(LIGHT_COLORS.TEXT_PRIMARY).toBe('#111827');
      expect(LIGHT_COLORS.TEXT_SECONDARY).toBeDefined();
    });
  });

  describe('DARK_COLORS', () => {
    it('hereda colores de marca', () => {
      expect(DARK_COLORS.PRIMARY).toBe(LIGHT_COLORS.PRIMARY);
    });

    it('define tema oscuro', () => {
      expect(DARK_COLORS.BACKGROUND).toBe('#0B0F14');
      expect(DARK_COLORS.SURFACE).toBe('#111827');
      expect(DARK_COLORS.TEXT_PRIMARY).toBe('#F9FAFB');
    });
  });

  describe('COLORS', () => {
    it('exporta LIGHT_COLORS por defecto', () => {
      expect(COLORS).toBe(LIGHT_COLORS);
    });
  });
});
