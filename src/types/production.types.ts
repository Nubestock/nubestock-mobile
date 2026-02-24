export interface ProductionReport {
  id: number;
  id_product: number;
  product_name?: string;
  id_machinery: number;
  machinery_name?: string;
  production_date: string; // ISO date
  quantity_produced: number;
  quantity_waste: number;
  batch_number?: string;
  operator_name?: string;
  shift: Shift;
  notes?: string;
  creation_date: string;
}

export type Shift = 'morning' | 'afternoon' | 'night';

export interface ProductionReportCreate {
  id_product: number;
  id_machinery: number;
  production_date: string; // ISO date
  quantity_produced: number;
  quantity_waste?: number;
  batch_number?: string;
  shift: Shift;
  notes?: string;
}

export interface ProductionListResponse {
  success: boolean;
  data: ProductionReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// ============================================
// PRODUCCIÓN DIARIA - Listado
// ============================================

/**
 * Item de producción diaria del listado
 */
export interface DailyProductionItem {
  id: number;
  id_product: number;
  id_user: number;
  quantity: number;
  type: 'PROD';
  direction: '+';
  is_pending: boolean;
  creation_date: string;
  modification_date: string | null;
  user_name: string;
  product_name: string;
  sku: string;
  category_name: string;
  status: 'pending' | 'completed';
  production_details: ProductionDailyDetails;
}

/**
 * Resumen de producción diaria
 */
export interface DailyProductionSummary {
  total: number;
  total_pending: number;
  total_completed: number;
  in_current_page: {
    pending: number;
    completed: number;
  };
}

/**
 * Respuesta del listado de producción diaria
 */
export interface DailyProductionListResponse {
  success: boolean;
  message?: string;
  data: {
    productions: DailyProductionItem[];
    summary: DailyProductionSummary;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

// ============================================
// PRODUCCIÓN DIARIA - Nuevos Tipos
// ============================================

/**
 * Material de una receta con información de stock
 * Nota: quantity, current_stock y has_waste pueden no venir del backend
 * y necesitarán ser obtenidos por separado
 */
export interface RecipeMaterial {
  id: number;
  name: string;
  code: string;
  type: 'MP';
  quantity?: number; // Cantidad necesaria por unidad de PF (puede no venir del backend)
  measure_name: string;
  current_stock?: number; // Stock actual (puede no venir del backend)
  has_waste?: boolean; // Si el material puede tener desperdicio (puede no venir del backend)
}

/**
 * Receta de un producto final
 */
export interface ProductRecipe {
  id_product: number;
  product_name: string;
  sku: string;
  receipe_id: number;
  creation_date: string;
  modification_date: string | null;
  materials: RecipeMaterial[];
}

/**
 * Respuesta de receta de producto
 */
export interface ProductRecipeResponse {
  success: boolean;
  data: ProductRecipe[];
  count: number;
  totalRecipes: number;
  timestamp: string;
}

/**
 * Material consumido en una producción
 */
export interface MaterialConsumed {
  id_product: number;
  name: string;
  sku: string;
  quantity_used: number | string;
  waste: number | string;
  effective_quantity: number;
  has_waste: boolean;
  current_stock: number | string;
  transaction_id: number;
  details: string | null;
}

/**
 * Detalles de producción diaria
 */
export interface ProductionDailyDetails {
  materials_consumed: MaterialConsumed[];
  total_consumed: string | number;
  total_waste: string | number;
  registered_by: number;
  registered_at: string;
  completed_at?: string;
}

/**
 * Producción diaria registrada
 */
export interface ProductionDaily {
  production_id: number;
  id_product: number;
  product_name: string;
  sku: string;
  quantity: number;
  status: 'pending' | 'in_process' | 'completed';
  materials_consumed: MaterialConsumed[];
  registered_by: number;
  registered_at: string;
}

/**
 * Request para registrar producción diaria
 */
export interface ProductionDailyRequest {
  id_product: number;
  quantity: number;
}

/**
 * Response de producción diaria registrada
 */
export interface ProductionDailyResponse {
  success: boolean;
  message?: string;
  data: ProductionDaily;
  timestamp: string;
}

/**
 * Material para registro de consumo
 */
export interface MaterialConsumptionRequest {
  id_product: number;
  quantity_used: number;
  waste: number;
  details?: string | null; // Foto en base64
}

/**
 * Request para registrar consumo de materiales
 */
export interface RegisterMaterialsRequest {
  id_product: number; // Producto final
  materials: MaterialConsumptionRequest[];
}

/**
 * Material consumido en respuesta
 */
export interface MaterialConsumedResponse {
  id_product: number;
  name: string;
  sku: string;
  quantity_used: number;
  waste: number;
  effective_quantity: number;
  has_waste: boolean;
  current_stock: number;
  transaction_id: number;
  pending_transaction_id: number;
  details: string | null;
}

/**
 * Resumen de consumo de materiales
 */
export interface MaterialsConsumptionSummary {
  total_consumed: number;
  total_waste: number;
  status: 'pending' | 'completed';
  transactions_count: number;
  pending_transactions_count: number;
}

/**
 * Response de registro de materiales
 */
export interface RegisterMaterialsResponse {
  success: boolean;
  message?: string;
  data: {
    production_pending_ids: number[];
    product_final: {
      id: number;
      name: string;
      sku: string;
    };
    materials_consumed: MaterialConsumedResponse[];
    summary: MaterialsConsumptionSummary;
  };
  timestamp: string;
}

/**
 * Error de stock insuficiente
 */
export interface InsufficientMaterial {
  id_product: number;
  name: string;
  required: number;
  available: number;
  missing: number;
}

/**
 * Response de error de stock insuficiente
 */
export interface StockInsufficientResponse {
  success: false;
  message: string;
  data: {
    insufficient_materials: InsufficientMaterial[];
  };
  timestamp: string;
}
