import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { salesAPI } from '../../api/sales.api';
import { customersAPI } from '../../api/customers.api';
import { productsAPI } from '../../api/products.api';
import { SaleCreate, PaymentMethod, SaleStatus } from '../../types/sales.types';
import { Customer } from '../../types/customer.types';
import { Product } from '../../types/product.types';
import { useThemeColors } from '../../constants/colors';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { formatDateShort, formatCurrency } from '../../utils/formatting';
import { getErrorMessage } from '../../api/client';

interface ProductItem {
  id_product: number;
  quantity: number;
  product_name?: string;
  unit_price?: number;
}

const CreateSaleScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [productItems, setProductItems] = useState<ProductItem[]>([]);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const COLORS = useThemeColors();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);

  const [formData, setFormData] = useState<Partial<SaleCreate>>({
    method: 'cash',
    status: 'pending',
    dispatch_guide: '',
    notes: '',
    due_date: new Date().toISOString(),
  });

  useEffect(() => {
    loadClients();
    loadProducts();
  }, []);

  const loadClients = async () => {
    try {
      const response = await customersAPI.getCustomers(1, 100);
      setClients(response.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getProducts('PF', 1, 100);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const addProduct = (productId?: number) => {
    const idToAdd = productId ?? selectedProduct;
    if (!idToAdd) {
      Alert.alert('Error', 'Selecciona un producto');
      return;
    }

    const product = products.find((p) => p.id === idToAdd);
    if (!product) return;

    const existingIndex = productItems.findIndex(
      (item) => item.id_product === idToAdd
    );

    if (existingIndex >= 0) {
      Alert.alert('Error', 'Este producto ya está agregado');
      return;
    }

    setProductItems([
      ...productItems,
      {
        id_product: idToAdd,
        quantity: 1,
        product_name: product.name,
        unit_price: typeof product.price === 'string' ? Number.parseFloat(product.price) : (product.price || 0),
      },
    ]);
    setSelectedProduct(null);
    setShowProductPicker(false);
  };

  const removeProduct = (index: number) => {
    setProductItems(productItems.filter((_, i) => i !== index));
  };

  const updateProductQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    const updated = [...productItems];
    updated[index].quantity = quantity;
    setProductItems(updated);
  };

  const calculateTotal = (): number => {
    const total = productItems.reduce((total, item) => {
      const price = item.unit_price || 0;
      const quantity = item.quantity;
      return total + (price * quantity);
    }, 0);
    // Redondear a 2 decimales para evitar errores de precisión
    return Math.round(total * 100) / 100;
  };

  const handleSubmit = async () => {
    if (!selectedClient) {
      Alert.alert('Error', 'Selecciona un cliente');
      return;
    }

    if (productItems.length === 0) {
      Alert.alert('Error', 'Agrega al menos un producto');
      return;
    }

    if (!formData.dispatch_guide) {
      Alert.alert('Error', 'La guía de despacho es requerida');
      return;
    }

    if (!formData.due_date) {
      Alert.alert('Error', 'La fecha de vencimiento es requerida');
      return;
    }

    setIsLoading(true);
    try {
      const saleData: SaleCreate = {
        id_client: selectedClient,
        total_amount: calculateTotal(),
        method: formData.method || 'cash',
        status: formData.status || 'pending',
        due_date: formData.due_date,
        dispatch_guide: formData.dispatch_guide,
        notes: formData.notes || '',
        products: productItems.map((item) => ({
          id_product: item.id_product,
          quantity: item.quantity,
        })),
      };

      await salesAPI.createSale(saleData);
      Alert.alert('Éxito', 'Venta creada exitosamente', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const selectedClientName = clients.find((c) => c.id === selectedClient)?.name || 'Seleccionar cliente';

  // Filtrar clientes por búsqueda
  const filteredClients = useMemo(() => {
    if (!clientSearchTerm.trim()) return clients;
    const searchLower = clientSearchTerm.toLowerCase().trim();
    return clients.filter((client) => {
      const nameMatch = client.name.toLowerCase().includes(searchLower);
      const identificationMatch = client.identification.toLowerCase().includes(searchLower);
      return nameMatch || identificationMatch;
    });
  }, [clients, clientSearchTerm]);

  // Filtrar productos por búsqueda
  const filteredProducts = useMemo(() => {
    const availableProducts = products.filter((p) => !productItems.some((item) => item.id_product === p.id));
    if (!productSearchTerm.trim()) return availableProducts;
    const searchLower = productSearchTerm.toLowerCase().trim();
    return availableProducts.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const skuMatch = product.sku.toLowerCase().includes(searchLower);
      return nameMatch || skuMatch;
    });
  }, [products, productItems, productSearchTerm]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.title}>Nueva Venta</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowClientPicker(true)}
          >
            <Text style={[styles.pickerText, !selectedClient && styles.placeholderText]}>
              {selectedClientName}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        {/* Productos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos *</Text>
          {productItems.map((item, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
                    {item.product_name}
                  </Text>
                  <Text style={styles.productPrice}>
                    ${(item.unit_price || 0).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} c/u
                  </Text>
                </View>
              </View>
              <View style={styles.productActions}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateProductQuantity(index, item.quantity - 1)}
                >
                  <Ionicons name="remove" size={20} color={COLORS.PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateProductQuantity(index, item.quantity + 1)}
                >
                  <Ionicons name="add" size={20} color={COLORS.PRIMARY} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeProduct(index)}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.ERROR || '#FF3B30'} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addProductButton}
            onPress={() => setShowProductPicker(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color={COLORS.PRIMARY} />
            <Text style={styles.addProductText}>Agregar Producto</Text>
          </TouchableOpacity>
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>{formatCurrency(calculateTotal())}</Text>
        </View>

        {/* Método de pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.method}
              onValueChange={(value) => setFormData({ ...formData, method: value as PaymentMethod })}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Efectivo" value="cash" />
              <Picker.Item label="Tarjeta" value="card" />
              <Picker.Item label="Crédito" value="credit" />
              <Picker.Item label="Transferencia" value="transfer" />
              <Picker.Item label="Cheque" value="check" />
              <Picker.Item label="Otro" value="other" />
            </Picker>
          </View>
        </View>

        {/* Estado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as SaleStatus })}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Pendiente" value="pending" />
              <Picker.Item label="Pagado" value="paid" />
              <Picker.Item label="Completado" value="completed" />
              <Picker.Item label="Vencido" value="overdue" />
              <Picker.Item label="Cancelado" value="cancelled" />
            </Picker>
          </View>
        </View>

        {/* Fecha de vencimiento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fecha de vencimiento *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              // Por ahora usamos la fecha actual, se puede mejorar con un date picker
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setFormData({ ...formData, due_date: tomorrow.toISOString() });
            }}
          >
            <Text style={styles.pickerText}>
              {formData.due_date ? formatDateShort(formData.due_date) : 'Seleccionar fecha'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        {/* Guía de despacho */}
        <View style={styles.section}>
          <Input
            label="Guía de despacho *"
            placeholder="Ej: 2103ASD"
            value={formData.dispatch_guide}
            onChangeText={(text) => setFormData({ ...formData, dispatch_guide: text })}
            required
          />
        </View>

        {/* Notas */}
        <View style={styles.section}>
          <Input
            label="Notas"
            placeholder="Notas adicionales (opcional)"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={3}
          />
        </View>

        <Button
          title="Crear Venta"
          onPress={handleSubmit}
          isLoading={isLoading}
          style={styles.submitButton}
        />
      </ScrollView>

      {/* Modal para seleccionar cliente */}
      <Modal
        visible={showClientPicker}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowClientPicker(false);
          setClientSearchTerm('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
              <TouchableOpacity onPress={() => {
                setShowClientPicker(false);
                setClientSearchTerm('');
              }}>
                <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre o identificación..."
                value={clientSearchTerm}
                onChangeText={setClientSearchTerm}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {clientSearchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setClientSearchTerm('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={COLORS.TEXT_SECONDARY} />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={filteredClients}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedClient(item.id);
                    setShowClientPicker(false);
                    setClientSearchTerm('');
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  <Text style={styles.modalItemSubtext}>
                    {item.identification} {item.email ? `• ${item.email}` : ''}
                  </Text>
                  {item.full_location && (
                    <Text style={styles.modalItemSubtext}>{item.full_location}</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar producto */}
      <Modal
        visible={showProductPicker}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowProductPicker(false);
          setProductSearchTerm('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Producto</Text>
              <TouchableOpacity onPress={() => {
                setShowProductPicker(false);
                setProductSearchTerm('');
              }}>
                <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre o SKU..."
                value={productSearchTerm}
                onChangeText={setProductSearchTerm}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {productSearchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setProductSearchTerm('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={COLORS.TEXT_SECONDARY} />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    addProduct(item.id);
                  }}
                >
                  <View style={styles.modalItemHeader}>
                    <View style={styles.modalItemNameContainer}>
                      <Text style={styles.modalItemText} numberOfLines={1} ellipsizeMode="tail">
                        {item.name}
                      </Text>
                      <Text style={styles.modalItemSubtext}>
                        SKU: {item.sku}
                      </Text>
                    </View>
                    {item.price && (
                      <View style={styles.modalItemPriceContainer}>
                        <Text style={styles.modalItemPrice}>
                          ${(typeof item.price === 'string' ? Number.parseFloat(item.price) : item.price).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                        {item.measure_name && (
                          <Text style={styles.modalItemPriceUnit}>
                            / {item.measure_name}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                  {item.category_name && (
                    <Text style={styles.modalItemSubtext}>
                      {item.category_name}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.TEXT_SECONDARY,
  },
  pickerContainer: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 180 : 50,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.SURFACE,
  },
  pickerItem: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  productItem: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  productInfo: {
    marginBottom: 8,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: 12,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    flexShrink: 0,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  quantityButton: {
    padding: 8,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  addProductText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    marginLeft: 8,
    fontWeight: '500',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  submitButton: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.SURFACE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  modalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  modalItemNameContainer: {
    flex: 1,
    marginRight: 12,
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  modalItemSubtext: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  modalItemPriceContainer: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  modalItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginBottom: 2,
  },
  modalItemPriceUnit: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
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
});

export default CreateSaleScreen;
