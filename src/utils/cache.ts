import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  SALES: 'cache_sales',
  PRODUCTION: 'cache_production',
  PRODUCTS: 'cache_products',
};

export const saveToCache = async <T>(key: string, data: T): Promise<void> => {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

export const getFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonData = await AsyncStorage.getItem(key);
    return jsonData ? JSON.parse(jsonData) : null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

export const clearCache = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Funciones específicas
export const cacheSales = (sales: any[]) => saveToCache(CACHE_KEYS.SALES, sales);
export const getCachedSales = () => getFromCache<any[]>(CACHE_KEYS.SALES);

export const cacheProduction = (reports: any[]) => saveToCache(CACHE_KEYS.PRODUCTION, reports);
export const getCachedProduction = () => getFromCache<any[]>(CACHE_KEYS.PRODUCTION);

export const cacheProducts = (products: any[]) => saveToCache(CACHE_KEYS.PRODUCTS, products);
export const getCachedProducts = () => getFromCache<any[]>(CACHE_KEYS.PRODUCTS);
