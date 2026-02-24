export interface Sale {
  id: number;
  id_client: number;
  id_user: number;
  sale_date: string | null; // ISO date, puede ser null
  total_amount: string | number; // Puede venir como string desde la BD
  status: SaleStatus;
  method: PaymentMethod;
  due_date: string; // ISO date
  dispatch_guide: string;
  notes?: string | null;
  is_active: boolean;
  creation_date: string; // ISO date
  modification_date: string | null; // ISO date, puede ser null
  // Campos adicionales de JOINs (solo en listado)
  client_name?: string;
  identification?: string;
  user_name?: string;
  items?: SaleItem[]; // Detalles de la venta (solo en GET /sales/{id})
}

export type SaleStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'completed';
export type PaymentMethod = 'cash' | 'card' | 'credit' | 'transfer' | 'check' | 'other';

export interface SaleItem {
  id: number;
  id_sale: number;
  id_product: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface SaleCreate {
  id_client: number;
  total_amount: number;
  method: PaymentMethod;
  status?: SaleStatus; // Opcional, por defecto 'pending'
  due_date: string; // ISO date
  dispatch_guide: string;
  notes?: string;
  products: Array<{
    id_product: number;
    quantity: number;
  }>;
  // Alias para compatibilidad
  details?: Array<{
    id_product: number;
    quantity: number;
  }>;
}

export interface SaleItemCreate {
  id_product: number;
  quantity: number;
  unit_price: number;
}

export interface SalesListResponse {
  success: boolean;
  data: Sale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// Respuesta del detalle de venta
export interface SaleDetailResponse {
  success: boolean;
  data: {
    sale: {
      status: SaleStatus;
      sale_id: number;
      due_date: string;
      total_sale: number;
      creation_date: string;
      dispatch_guide: string;
    };
    items: Array<{
      sku: string;
      product_name: string;
      product_price: number;
      sale_detail_id: number;
      quantity: number; // Cantidad del producto
    }>;
    client: {
      name: string;
      identification: string;
    };
  };
  timestamp: string;
}
