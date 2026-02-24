import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { productsAPI } from '../../api/products.api';
import { Product } from '../../types/product.types';
import { useThemeColors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatting';
import Loading from '../../components/common/Loading';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';

const ProductsListScreen = () => {
  const { showLoading } = useProtectedRoute();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'PF' | 'MP'>('PF');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const COLORS = useThemeColors();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);

  useEffect(() => {
    loadProducts(1);
  }, [selectedType]);

  const loadProducts = async (pageNum: number) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      
      const response = await productsAPI.getProducts(selectedType, pageNum, 50);
      
      if (pageNum === 1) {
        setProducts(response.data);
      } else {
        setProducts((prev) => [...prev, ...response.data]);
      }
      
      setHasMore(response.pagination ? response.pagination.page < response.pagination.totalPages : false);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    loadProducts(1);
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadProducts(page + 1);
    }
  };

  // Filtrar productos por búsqueda
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const searchLower = searchTerm.toLowerCase().trim();
    return products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const skuMatch = product.sku.toLowerCase().includes(searchLower);
      const categoryMatch = product.category_name?.toLowerCase().includes(searchLower);
      return nameMatch || skuMatch || categoryMatch;
    });
  }, [products, searchTerm]);

  const renderProduct = ({ item }: { item: Product }) => {
    const price = typeof item.price === 'string' ? Number.parseFloat(item.price) : (item.price || 0);
    const quantity = typeof item.quantity === 'string' ? Number.parseInt(item.quantity) : (item.quantity || 0);
    const minStock = typeof item.min_stock === 'string' ? Number.parseInt(item.min_stock) : (item.min_stock || 0);
    
    const isLowStock = quantity <= minStock;

    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <View style={styles.productNameContainer}>
            <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
            <Text style={styles.productSku}>SKU: {item.sku}</Text>
          </View>
          {price > 0 && (
            <View style={styles.productPriceContainer}>
              <Text style={styles.productPrice}>
                {formatCurrency(price)}
              </Text>
              {item.measure_name && (
                <Text style={styles.productPriceUnit}>
                  / {item.measure_name}
                </Text>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.productDetails}>
          {item.category_name && (
            <View style={styles.detailRow}>
              <Ionicons name="pricetag-outline" size={14} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.detailText}>{item.category_name}</Text>
            </View>
          )}
          {item.origin_name && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.detailText}>{item.origin_name}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Ionicons 
              name={isLowStock ? "warning-outline" : "cube-outline"} 
              size={14} 
              color={isLowStock ? COLORS.ERROR || '#FF3B30' : COLORS.TEXT_SECONDARY} 
            />
            <Text style={[styles.detailText, isLowStock && styles.lowStockText]}>
              Stock: {quantity} {item.measure_name || ''}
              {minStock > 0 && ` (Mín: ${minStock})`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
      </View>
    );
  };

  if (showLoading || isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Productos</Text>
      </View>

      {/* Filtro de tipo */}
      <View style={styles.typeFilter}>
        <TouchableOpacity
          style={[styles.typeButton, selectedType === 'PF' && styles.typeButtonActive]}
          onPress={() => {
            setSelectedType('PF');
            setPage(1);
            setProducts([]);
          }}
        >
          <Text style={[styles.typeButtonText, selectedType === 'PF' && styles.typeButtonTextActive]}>
            Productos Finales
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, selectedType === 'MP' && styles.typeButtonActive]}
          onPress={() => {
            setSelectedType('MP');
            setPage(1);
            setProducts([]);
          }}
        >
          <Text style={[styles.typeButtonText, selectedType === 'MP' && styles.typeButtonTextActive]}>
            Materias Primas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, SKU o categoría..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de productos */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>
              {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const createStyles = (COLORS: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.SURFACE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  typeFilter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  typeButtonTextActive: {
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 10,
  },
  clearButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  productCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productNameContainer: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  productPriceContainer: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginBottom: 2,
  },
  productPriceUnit: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  productDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  lowStockText: {
    color: COLORS.ERROR || '#FF3B30',
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ProductsListScreen;
