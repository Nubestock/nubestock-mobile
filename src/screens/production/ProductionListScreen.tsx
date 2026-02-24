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
import { productionAPI } from '../../api/production.api';
import { DailyProductionItem } from '../../types/production.types';
import { useThemeColors } from '../../constants/colors';
import { formatDate } from '../../utils/formatting';
import Loading from '../../components/common/Loading';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';

const ProductionListScreen = () => {
  const router = useRouter();
  const { showLoading } = useProtectedRoute();
  const [productions, setProductions] = useState<DailyProductionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const COLORS = useThemeColors();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);

  useEffect(() => {
    loadProductions(1);
  }, []);

  const loadProductions = async (pageNum: number) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      
      const response = await productionAPI.getDailyProductions({
        page: pageNum,
        limit: 20,
      });
      
      if (pageNum === 1) {
        setProductions(response.data.productions);
      } else {
        setProductions((prev) => [...prev, ...response.data.productions]);
      }
      
      setHasMore(response.data.pagination.page < response.data.pagination.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading daily productions:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProductions(1);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadProductions(page + 1);
    }
  };

  const getStatusLabel = (status: 'pending' | 'completed') => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  const getStatusColor = (status: 'pending' | 'completed') => {
    switch (status) {
      case 'pending': return COLORS.WARNING;
      case 'completed': return COLORS.SUCCESS;
      default: return COLORS.TEXT_SECONDARY;
    }
  };

  const renderProductionCard = ({ item }: { item: DailyProductionItem }) => {
    const statusColor = getStatusColor(item.status);
    const totalConsumed = typeof item.production_details.total_consumed === 'string'
      ? Number.parseFloat(item.production_details.total_consumed)
      : item.production_details.total_consumed;
    const totalWaste = typeof item.production_details.total_waste === 'string'
      ? Number.parseFloat(item.production_details.total_waste)
      : item.production_details.total_waste;
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/production/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.productName}>{item.product_name || 'Producto'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Ionicons
              name={item.status === 'completed' ? 'checkmark-circle' : 'time-outline'}
              size={14}
              color={statusColor}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.infoText}>{formatDate(item.creation_date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.infoText}>{item.user_name || 'Usuario'}</Text>
          </View>

          {item.category_name && (
            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={16} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.infoText}>{item.category_name}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Cantidad</Text>
            <Text style={styles.metricValue}>{item.quantity}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Consumido</Text>
            <Text style={styles.metricValue}>{totalConsumed.toFixed(2)}</Text>
          </View>
          {totalWaste > 0 && (
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Desperdicio</Text>
              <Text style={[styles.metricValue, styles.wasteValue]}>
                {totalWaste.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (showLoading || (isLoading && page === 1)) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={productions}
        renderItem={renderProductionCard}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading && page > 1 ? (
            <ActivityIndicator size="small" color={COLORS.PRIMARY} style={styles.footer} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cog-outline" size={64} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>No hay producciones registradas</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/production/create')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const createStyles = (COLORS: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: COLORS.BACKGROUND,
  },
  card: {
    backgroundColor: COLORS.SURFACE,
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
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
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
    color: COLORS.TEXT_SECONDARY,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: 12,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  wasteValue: {
    color: COLORS.WARNING,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.PRIMARY,
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
    color: COLORS.TEXT_SECONDARY,
  },
});

export default ProductionListScreen;
