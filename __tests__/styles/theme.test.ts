/**
 * Tests para src/styles/theme.ts
 */
import { THEME } from '../../src/styles/theme';

describe('theme', () => {
  it('exporta colors y typography', () => {
    expect(THEME.colors).toBeDefined();
    expect(THEME.typography).toBeDefined();
  });

  it('define spacing', () => {
    expect(THEME.spacing.xs).toBe(4);
    expect(THEME.spacing.sm).toBe(8);
    expect(THEME.spacing.md).toBe(16);
    expect(THEME.spacing.lg).toBe(24);
    expect(THEME.spacing.xl).toBe(32);
  });

  it('define borderRadius', () => {
    expect(THEME.borderRadius.sm).toBe(4);
    expect(THEME.borderRadius.full).toBe(9999);
  });

  it('define shadows', () => {
    expect(THEME.shadows.sm).toMatchObject({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    });
    expect(THEME.shadows.lg.elevation).toBe(5);
  });
});
