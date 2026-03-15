import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { productionAPI } from '../../api/production.api';
import { DailyProductionItem } from '../../types/production.types';
import { useThemeColors } from '../../constants/colors';
import { formatDate } from '../../utils/formatting';
import Loading from '../../components/common/Loading';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';

const ProductionDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { showLoading } = useProtectedRoute();
  const [item, setItem] = useState<DailyProductionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const id = params.id ? Number.parseInt(params.id, 10) : NaN;
    if (Number.isNaN(id)) {
      setError('ID inválido');
      setIsLoading(false);
      return;
    }
    loadProduction(id);
  }, [params.id]);

  const loadProduction = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      let found: DailyProductionItem | null = null;
      let page = 1;
      const limit = 50;
      while (page <= 5) {
        const response = await productionAPI.getDailyProductions({ page, limit });
        const list = response.data?.productions ?? [];
        found = list.find((p: DailyProductionItem) => p.id === id) ?? null;
        if (found) break;
        if (list.length < limit) break;
        page += 1;
      }
      setItem(found);
      if (!found) setError('Producción no encontrada');
    } catch (err) {
      console.error('Error loading production detail:', err);
      setError('No se pudo cargar el detalle');
    } finally {
      setIsLoading(false);
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
      case 'pending': return colors.WARNING;
      case 'completed': return colors.SUCCESS;
      default: return colors.TEXT_SECONDARY;
    }
  };

  if (showLoading || isLoading) {
    return <Loading />;
  }

  if (error || !item) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.SURFACE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.ERROR} />
          <Text style={styles.errorText}>{error || 'No encontrado'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(item.status);
  const totalConsumed = typeof item.production_details?.total_consumed === 'string'
    ? Number.parseFloat(item.production_details.total_consumed)
    : Number(item.production_details?.total_consumed) || 0;
  const totalWaste = typeof item.production_details?.total_waste === 'string'
    ? Number.parseFloat(item.production_details.total_waste)
    : Number(item.production_details?.total_waste) || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.SURFACE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de producción</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
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
              <Ionicons name="calendar-outline" size={16} color={colors.TEXT_SECONDARY} />
              <Text style={styles.infoText}>{formatDate(item.creation_date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color={colors.TEXT_SECONDARY} />
              <Text style={styles.infoText}>{item.user_name || 'Usuario'}</Text>
            </View>
            {item.category_name ? (
              <View style={styles.infoRow}>
                <Ionicons name="pricetag-outline" size={16} color={colors.TEXT_SECONDARY} />
                <Text style={styles.infoText}>{item.category_name}</Text>
              </View>
            ) : null}
            {item.sku ? (
              <View style={styles.infoRow}>
                <Ionicons name="barcode-outline" size={16} color={colors.TEXT_SECONDARY} />
                <Text style={styles.infoText}>{item.sku}</Text>
              </View>
            ) : null}
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
            {totalWaste > 0 ? (
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Desperdicio</Text>
                <Text style={[styles.metricValue, styles.wasteValue]}>{totalWaste.toFixed(2)}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.PRIMARY,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backIcon: { padding: 4 },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.SURFACE,
    },
    headerSpacer: { width: 32 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16 },
    card: {
      backgroundColor: colors.SURFACE,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    productName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.TEXT_PRIMARY,
      flex: 1,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusText: { fontSize: 12, fontWeight: '600' },
    cardBody: { gap: 12, marginBottom: 16 },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    infoText: {
      fontSize: 14,
      color: colors.TEXT_PRIMARY,
    },
    metricsRow: {
      flexDirection: 'row',
      gap: 16,
      flexWrap: 'wrap',
    },
    metric: {
      minWidth: 80,
    },
    metricLabel: {
      fontSize: 12,
      color: colors.TEXT_SECONDARY,
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.TEXT_PRIMARY,
    },
    wasteValue: { color: colors.ERROR },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    errorText: {
      fontSize: 16,
      color: colors.TEXT_PRIMARY,
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 24,
    },
    backButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: colors.PRIMARY,
      borderRadius: 8,
    },
    backButtonText: {
      fontSize: 16,
      color: colors.SURFACE,
      fontWeight: '600',
    },
  });

export default ProductionDetailScreen;
