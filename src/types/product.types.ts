export interface Product {
  id: number;
  id_category: number;
  id_origin: number;
  id_measure: number;
  name: string;
  sku: string;
  type: 'PF' | 'MP'; // Producto Final o Materia Prima
  min_stock: string | number; // Puede venir como string desde la BD
  quantity: string | number; // Puede venir como string desde la BD
  price: string | number; // Precio, puede venir como string desde la BD
  is_active: boolean;
  creation_date: string;
  modification_date: string | null;
  // Campos adicionales de JOINs (solo en listado)
  category_name?: string;
  origin_name?: string;
  measure_name?: string;
  measure_description?: string;
}

export interface ProductsListResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

/**
 * Producto con información de receta (para producción diaria)
 */
export interface ProductWithRecipe extends Product {
  has_recipe?: boolean; // Indica si el producto tiene receta configurada
}
