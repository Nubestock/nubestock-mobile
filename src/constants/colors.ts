import { useColorScheme } from 'react-native';

const BRAND_COLORS = {
  // Identidad Corporativa
  PRIMARY: '#006A4E',           // Verde Nutregam
  PRIMARY_LIGHT: '#009973',     // Verde claro
  PRIMARY_DARK: '#004D38',      // Verde oscuro
  
  // Colores Semánticos
  SUCCESS: '#10B981',
  SUCCESS_LIGHT: '#D1FAE5',
  WARNING: '#F59E0B',
  WARNING_LIGHT: '#FEF3C7',
  ERROR: '#EF4444',
  ERROR_LIGHT: '#FEE2E2',
  INFO: '#3B82F6',
  INFO_LIGHT: '#DBEAFE',
};

export const LIGHT_COLORS = {
  ...BRAND_COLORS,
  // Neutrales (Mate)
  BACKGROUND: '#F9FAFB',        // Gris muy claro
  SURFACE: '#FFFFFF',           // Blanco
  BORDER: '#E5E7EB',            // Gris claro para bordes
  
  // Texto
  TEXT_PRIMARY: '#111827',      // Negro mate
  TEXT_SECONDARY: '#6B7280',    // Gris medio
  TEXT_DISABLED: '#D1D5DB',     // Gris claro
  
  // Overlay
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
};

export const DARK_COLORS = {
  ...BRAND_COLORS,
  // Neutrales (Dark)
  BACKGROUND: '#0B0F14',
  SURFACE: '#111827',
  BORDER: '#1F2937',

  // Texto
  TEXT_PRIMARY: '#F9FAFB',
  TEXT_SECONDARY: '#9CA3AF',
  TEXT_DISABLED: '#4B5563',

  // Overlay
  OVERLAY: 'rgba(0, 0, 0, 0.6)',
};

export const useThemeColors = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
};

export const COLORS = LIGHT_COLORS;
