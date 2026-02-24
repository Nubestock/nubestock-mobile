export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
  timestamp: string;
}

export interface RoleDetail {
  idrole: string;
  namerole: string;
  description?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  last_login?: string;
  creation_date?: string;
  roles?: string[]; // ['Administrador', 'Vendedor', 'Operador']
  rolesDetails?: RoleDetail[]; // Información completa de roles desde el JWT
  permissions?: string[]; // Permisos del sistema desde el JWT (ej: ['clients_read', 'sales_write', 'admin'])
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
