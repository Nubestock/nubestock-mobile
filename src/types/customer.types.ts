export interface Customer {
  id: number;
  id_city: number;
  id_province: number;
  name: string;
  identification: string;
  identification_type: 'CED' | 'RUC';
  email: string;
  phone: string;
  address: string;
  requires_credit: boolean;
  credit_limit: string | null;
  credit_days: number;
  is_active: boolean;
  creation_date: string;
  modification_date: string | null;
  // Campos adicionales de JOINs (solo en listado)
  province_name?: string;
  city_name?: string;
  country_name?: string;
  is_code?: string;
  full_location?: string;
}

export interface CustomersListResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}
