/**
 * Tests para src/styles/typography.ts
 */
import { TYPOGRAPHY } from '../../src/styles/typography';

describe('typography', () => {
  it('define encabezados h1-h4', () => {
    expect(TYPOGRAPHY.h1.fontSize).toBe(32);
    expect(TYPOGRAPHY.h1.fontWeight).toBe('700');
    expect(TYPOGRAPHY.h2.fontSize).toBe(24);
    expect(TYPOGRAPHY.h4.fontSize).toBe(18);
  });

  it('define body y caption', () => {
    expect(TYPOGRAPHY.body1.fontSize).toBe(16);
    expect(TYPOGRAPHY.body2.fontSize).toBe(14);
    expect(TYPOGRAPHY.caption.fontSize).toBe(12);
    expect(TYPOGRAPHY.caption.color).toBe('#6B7280');
  });

  it('define estilos de botón', () => {
    expect(TYPOGRAPHY.button.fontSize).toBe(16);
    expect(TYPOGRAPHY.button.fontWeight).toBe('600');
    expect(TYPOGRAPHY.button.color).toBe('#FFFFFF');
  });
});
