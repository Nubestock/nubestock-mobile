/**
 * Formatea un número como moneda con decimales
 */
export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(numAmount)) return '$0.00';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

/**
 * Formatea una fecha ISO a formato legible
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Sin fecha';
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Fecha inválida';
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha ISO a formato corto (DD/MM/YYYY)
 */
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

/**
 * Formatea una fecha ISO con hora
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
