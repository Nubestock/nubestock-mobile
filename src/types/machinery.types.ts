export interface Machinery {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  creation_date: string;
  modification_date: string | null;
}

export interface MachineryListResponse {
  success: boolean;
  data: Machinery[];
  timestamp: string;
}

export interface MachineryCreate {
  name: string;
  description: string;
  is_active?: boolean;
}

export interface MachineryUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface Maintenance {
  id: number;
  id_machinery: number;
  name: string;
  type: 'PRV' | 'COR'; // PRV = Preventivo, COR = Correctivo
  is_active: boolean;
  creation_date: string;
  modification_date: string | null;
  next_maintainance_value: number | null; // Días desde el último mantenimiento
  last_mantainance_date: string;
  // Campos adicionales de JOINs
  machinery_name?: string;
  machinery_description?: string;
}

export interface MaintenanceListResponse {
  success: boolean;
  data: Maintenance[];
  timestamp: string;
}

export interface MaintenanceCreate {
  id_machinery: number;
  name: string;
  type: 'PRV' | 'COR';
  is_active?: boolean;
  next_maintainance_value?: number | null;
  last_mantainance_date: string; // ISO date string
}

export interface MaintenanceUpdate {
  id_machinery?: number;
  name?: string;
  type?: 'PRV' | 'COR';
  is_active?: boolean;
  next_maintainance_value?: number | null;
  last_mantainance_date?: string; // ISO date string
}

export interface MaintenanceAttachment {
  id: number;
  content: string; // Base64 o URL
}

export interface MaintenanceDetails {
  attachments: MaintenanceAttachment[];
}

export interface MaintenanceHistory {
  id: number;
  id_mantainance: number;
  id_user: number;
  details: MaintenanceDetails; // Objeto parseado desde JSON
  price: number;
  creation_date: string;
  modification_date: string | null;
  next_mantainance_date: string | null; // ISO date string
  // Campos adicionales de JOINs
  maintenance_name?: string;
  maintenance_type?: 'PRV' | 'COR';
  machinery_name?: string;
  user_name?: string;
  user_email?: string;
}

export interface MaintenanceHistoryListResponse {
  success: boolean;
  data: MaintenanceHistory[];
  timestamp: string;
}

export interface MaintenanceHistoryCreate {
  id_mantainance: number;
  details: MaintenanceDetails;
  price: number;
  next_mantainance_date?: string | null; // ISO date string
}

export interface MaintenanceHistoryUpdate {
  details?: MaintenanceDetails;
  price?: number;
  next_mantainance_date?: string | null; // ISO date string
}

// ========== MACHINERY ALERTS ==========

export interface MachineryAlert {
  id: number;
  id_mantainance: number;
  type: string; // Tipo de alerta (ej. 'MAINTENANCE_DUE')
  date: string; // ISO date string
  title: string;
  message: string;
  is_sent: boolean;
  creation_date: string;
  // Campos adicionales de JOINs (solo en listados)
  maintenance_name?: string;
  maintenance_type?: 'PRV' | 'COR';
  machinery_name?: string;
}

export interface MachineryAlertListResponse {
  success: boolean;
  data: MachineryAlert[];
  timestamp: string;
}

export interface MachineryAlertCreate {
  id_mantainance: number;
  type: string;
  date: string; // ISO date string
  title: string;
  message: string;
  is_sent?: boolean;
  user_ids?: number[]; // IDs de usuarios a los que asignar la alerta
}

export interface UserAlert {
  id: number;
  title: string;
  message: string;
  type: string;
  date: string; // ISO date string
  creation_date: string;
  is_read: boolean;
  read_date: string | null;
  maintenance_name?: string;
  maintenance_type?: 'PRV' | 'COR';
  machinery_name?: string;
}

export interface UserAlertsListResponse {
  success: boolean;
  data: UserAlert[];
  timestamp: string;
}

export interface UserDevice {
  id: number;
  id_user: number;
  device_token: string;
  platform: 'ios' | 'android' | 'web';
  is_active: boolean;
  creation_date: string;
  modification_date: string | null;
}

export interface UserDeviceListResponse {
  success: boolean;
  data: UserDevice[];
  timestamp: string;
}

export interface UserDeviceRegister {
  device_token: string;
  platform: 'ios' | 'android' | 'web';
}
