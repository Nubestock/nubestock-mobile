import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { salesAPI } from '../../api/sales.api';
import { Sale } from '../../types/sales.types';
import { useThemeColors } from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/formatting';
import Loading from '../../components/common/Loading';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';

const SalesListScreen = () => {
  const router = useRouter();
  const { showLoading } = useProtectedRoute();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    loadSales(1);
  }, []);

  const loadSales = async (pageNum: number) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      
      const response = await salesAPI.getSales(pageNum, 20);
      
      if (pageNum === 1) {
        setSales(response.data);
      } else {
        setSales((prev) => [...prev, ...response.data]);
      }
      
      setHasMore(response.pagination.page < response.pagination.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSales(1);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadSales(page + 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed': return colors.SUCCESS;
      case 'pending': return colors.WARNING;
      case 'overdue': return colors.ERROR;
      case 'cancelled': return colors.TEXT_SECONDARY;
      default: return colors.TEXT_SECONDARY;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencido';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'transfer': return 'Transferencia';
      case 'credit': return 'Crédito';
      case 'check': return 'Cheque';
      case 'other': return 'Otro';
      default: return method;
    }
  };

  const renderSaleCard = ({ item }: { item: Sale }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/sales/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.customerName}>{item.client_name || 'Cliente'}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        {item.sale_date && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.TEXT_SECONDARY} />
            <Text style={styles.infoText}>
              Fecha venta: {formatDate(item.sale_date)}
            </Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={colors.TEXT_SECONDARY} />
          <Text style={styles.infoText}>
            Creada: {formatDate(item.creation_date)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.TEXT_SECONDARY} />
          <Text style={styles.infoText}>
            Vence: {formatDate(item.due_date)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={16} color={colors.TEXT_SECONDARY} />
          <Text style={styles.infoText}>{getPaymentMethodLabel(item.method)}</Text>
        </View>
        
        {item.dispatch_guide && (
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={16} color={colors.TEXT_SECONDARY} />
            <Text style={styles.infoText}>Guía: {item.dispatch_guide}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>
          {formatCurrency(typeof item.total_amount === 'string' ? Number.parseFloat(item.total_amount) : item.total_amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (showLoading || (isLoading && page === 1)) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={sales}
        renderItem={renderSaleCard}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.PRIMARY]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading && page > 1 ? (
            <ActivityIndicator size="small" color={colors.PRIMARY} style={styles.footer} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color={colors.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>No hay ventas registradas</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/sales/create')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: colors.BACKGROUND,
  },
  card: {
    backgroundColor: colors.SURFACE,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.PRIMARY,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  footer: {
    marginVertical: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
  },
});

export default SalesListScreen;
