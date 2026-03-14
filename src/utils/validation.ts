import * as Yup from 'yup';

// Patrón permisivo: acepta emails con múltiples puntos en la parte local (ej. jeremy.eoon.q@outlook.com)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .matches(EMAIL_REGEX, 'Email inválido')
    .required('El email es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('La contraseña actual es requerida'),
  newPassword: Yup.string()
    .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
    .required('La nueva contraseña es requerida'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Las contraseñas no coinciden')
    .required('Confirma la contraseña'),
});

export const saleSchema = Yup.object().shape({
  id_customer: Yup.number()
    .required('Debe seleccionar un cliente'),
  sale_date: Yup.string()
    .required('La fecha es requerida'),
  payment_status: Yup.string()
    .oneOf(['paid', 'pending', 'partial'], 'Estado de pago inválido')
    .required('El estado de pago es requerido'),
  payment_method: Yup.string()
    .oneOf(['cash', 'card', 'transfer', 'credit'], 'Método de pago inválido')
    .required('El método de pago es requerido'),
  items: Yup.array()
    .min(1, 'Debe agregar al menos un producto')
    .required('Los productos son requeridos'),
});

export const productionSchema = Yup.object().shape({
  id_product: Yup.number()
    .required('Debe seleccionar un producto'),
  id_machinery: Yup.number()
    .required('Debe seleccionar una máquina'),
  production_date: Yup.string()
    .required('La fecha es requerida'),
  quantity_produced: Yup.number()
    .positive('La cantidad producida debe ser mayor a 0')
    .required('La cantidad producida es requerida'),
  shift: Yup.string()
    .oneOf(['morning', 'afternoon', 'night'], 'Turno inválido')
    .required('El turno es requerido'),
});
