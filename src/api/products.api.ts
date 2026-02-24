import apiClient from './client';
import { Product, ProductsListResponse } from '../types/product.types';

export const productsAPI = {
  /**
   * GET /products?type=PF
   * Listar productos finales
   * GET /products?type=MP
   * Listar materias primas
   */
  getProducts: async (type: 'PF' | 'MP', page = 1, limit = 100): Promise<ProductsListResponse> => {
    const response = await apiClient.get<ProductsListResponse>('/products', {
      params: { type, page, limit },
    });
    return response.data;
  },

  /**
   * GET /products/:id
   * Obtener detalle de producto
   */
  getProductById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<{ success: boolean; data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  /**
   * GET /products/recipes
   * Obtener todos los productos finales con recetas
   */
  getProductsWithRecipes: async () => {
    const response = await apiClient.get('/products/recipes');
    return response.data;
  },

  /**
   * GET /products/recipes?id_product={id}
   * Obtener receta de un producto final específico
   */
  getProductRecipe: async (id_product: number) => {
    console.log('[productsAPI.getProductRecipe] Solicitando receta para producto:', id_product);
    const response = await apiClient.get('/products/recipes', {
      params: { id_product },
    });
    console.log('[productsAPI.getProductRecipe] Respuesta recibida:', {
      success: response.data.success,
      data_length: response.data.data?.length,
      products_in_response: response.data.data?.map((r: any) => ({
        id_product: r.id_product,
        product_name: r.product_name,
      })),
    });
    return response.data;
  },
};
