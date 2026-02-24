import { TextStyle } from 'react-native';

export const TYPOGRAPHY: Record<string, TextStyle> = {
  // Encabezados
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: '#111827',
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: '#111827',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: '#111827',
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: '#111827',
  },
  
  // Cuerpo
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#111827',
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#111827',
  },
  
  // Otros
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#6B7280',
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#FFFFFF',
  },
};
