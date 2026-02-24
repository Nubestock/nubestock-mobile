import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { salesAPI } from '../../api/sales.api';
import { SaleDetailResponse } from '../../types/sales.types';
import { useThemeColors } from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/formatting';
import Loading from '../../components/common/Loading';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import Card from '../../components/common/Card';

const SaleDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { showLoading } = useProtectedRoute();
  const [saleDetail, setSaleDetail] = useState<SaleDetailResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (params.id) {
      loadSaleDetail(Number.parseInt(params.id, 10));
    }
  }, [params.id]);

  const loadSaleDetail = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await salesAPI.getSaleById(id);
      setSaleDetail(data);
    } catch (err) {
      console.error('Error loading sale detail:', err);
      setError('No se pudo cargar el detalle de la venta');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return colors.SUCCESS;
      case 'pending':
        return colors.WARNING;
      case 'overdue':
        return colors.ERROR;
      case 'cancelled':
        return colors.TEXT_SECONDARY;
      default:
        return colors.TEXT_SECONDARY;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Vencido';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (showLoading || isLoading) {
    return <Loading />;
  }

  if (error || !saleDetail) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.ERROR} />
          <Text style={styles.errorText}>{error || 'Venta no encontrada'}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { sale, items, client } = saleDetail;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.SURFACE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Venta</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Información de la Venta */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Información de la Venta</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(sale.status) },
              ]}
            >
              <Text style={styles.statusText}>{getStatusLabel(sale.status)}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="receipt-outline" size={20} color={colors.TEXT_SECONDARY} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ID de Venta</Text>
                <Text style={styles.infoValue}>#{sale.sale_id}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.TEXT_SECONDARY} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fecha de Creación</Text>
                <Text style={styles.infoValue}>{formatDate(sale.creation_date)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.TEXT_SECONDARY} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fecha de Vencimiento</Text>
                <Text style={styles.infoValue}>{formatDate(sale.due_date)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={20} color={colors.TEXT_SECONDARY} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Guía de Despacho</Text>
                <Text style={styles.infoValue}>{sale.dispatch_guide}</Text>
              </View>
            </View>

            <View style={[styles.infoRow, styles.totalRow]}>
              <Ionicons name="cash-outline" size={24} color={colors.PRIMARY} />
              <View style={styles.infoContent}>
                <Text style={styles.totalLabel}>Total de la Venta</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(sale.total_sale)}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Información del Cliente */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Cliente</Text>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color={colors.TEXT_SECONDARY} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nombre</Text>
                <Text style={styles.infoValue}>{client.name}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="id-card-outline" size={20} color={colors.TEXT_SECONDARY} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Identificación</Text>
                <Text style={styles.infoValue}>{client.identification}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Productos */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Productos ({items.length})</Text>
          <View style={styles.itemsContainer}>
            {items.map((item, index) => {
              const subtotal = item.product_price * item.quantity;
              return (
                <View key={item.sale_detail_id} style={styles.itemRow}>
                  <View style={styles.itemNumber}>
                    <Text style={styles.itemNumberText}>{item.quantity}</Text>
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{item.product_name}</Text>
                    <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                    <View style={styles.itemQuantityRow}>
                      <Text style={styles.itemUnitPrice}>
                        {formatCurrency(item.product_price)} c/u
                      </Text>
                    </View>
                  </View>
                  <View style={styles.itemPrice}>
                    <Text style={styles.itemPriceText}>
                      {formatCurrency(subtotal)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.itemsTotalRow}>
            <Text style={styles.itemsTotalLabel}>Total:</Text>
            <Text style={styles.itemsTotalValue}>
              {formatCurrency(sale.total_sale)}
            </Text>
          </View>
        </Card>
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
    backIcon: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.SURFACE,
    },
    headerSpacer: {
      width: 32,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    card: {
      marginBottom: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.TEXT_PRIMARY,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    infoSection: {
      gap: 16,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 16,
      color: colors.TEXT_PRIMARY,
      fontWeight: '500',
    },
    totalRow: {
      marginTop: 8,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.BORDER,
    },
    totalLabel: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
      marginBottom: 4,
    },
    totalValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.PRIMARY,
    },
    itemsContainer: {
      marginTop: 8,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER,
    },
    itemNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.PRIMARY_LIGHT || colors.PRIMARY,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    itemNumberText: {
      fontSize: 14,
      fontWeight: '600',
      color: 'white',
    },
    itemContent: {
      flex: 1,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.TEXT_PRIMARY,
      marginBottom: 4,
    },
    itemSku: {
      fontSize: 12,
      color: colors.TEXT_SECONDARY,
      marginBottom: 4,
    },
    itemQuantityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    itemQuantity: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
    },
    itemUnitPrice: {
      fontSize: 12,
      color: colors.TEXT_SECONDARY,
    },
    itemPrice: {
      marginLeft: 12,
      alignItems: 'flex-end',
    },
    itemPriceText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.PRIMARY,
    },
    itemsTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 2,
      borderTopColor: colors.BORDER,
    },
    itemsTotalLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.TEXT_PRIMARY,
    },
    itemsTotalValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.PRIMARY,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    errorText: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
      marginTop: 16,
      marginBottom: 24,
      textAlign: 'center',
    },
    backButton: {
      backgroundColor: colors.PRIMARY,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    backButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default SaleDetailScreen;
