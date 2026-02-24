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
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { customersAPI } from '../../api/customers.api';
import { locationsAPI } from '../../api/locations.api';
import { Customer } from '../../types/customer.types';
import { LocationCountry, LocationProvince, LocationCity } from '../../types/location.types';
import { useThemeColors } from '../../constants/colors';
import Loading from '../../components/common/Loading';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { getErrorMessage } from '../../api/client';

type CustomerCreateForm = {
  name: string;
  identification: string;
  identification_type: 'CED' | 'RUC';
  email: string;
  phone: string;
  address: string;
  requires_credit: boolean;
  credit_limit: string;
  credit_days: string;
};

const initialForm: CustomerCreateForm = {
  name: '',
  identification: '',
  identification_type: 'CED',
  email: '',
  phone: '',
  address: '',
  requires_credit: false,
  credit_limit: '0',
  credit_days: '0',
};

// Configuración de países con límites de dígitos telefónicos
const COUNTRY_PHONE_CONFIG: Record<string, { code: string; maxDigits: number }> = {
  EC: { code: '+593', maxDigits: 9 }, // Ecuador: 9 dígitos (sin el código de país)
};

/**
 * Valida formato de correo electrónico
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Limpia el número de teléfono, dejando solo dígitos
 */
const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Limpia el número de identificación, dejando solo dígitos
 */
const cleanIdentification = (identification: string): string => {
  return identification.replace(/\D/g, '');
};

// Configuración de tipos de identificación con límites de dígitos
const IDENTIFICATION_CONFIG: Record<string, number> = {
  CED: 10, // Cédula: 10 dígitos
  RUC: 13, // RUC: 13 dígitos
};

const CustomersListScreen = () => {
  const { showLoading } = useProtectedRoute();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CustomerCreateForm>(initialForm);
  const [locations, setLocations] = useState<LocationCountry[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('EC'); // Ecuador por defecto
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerCreateForm | 'email' | 'phone', string>>>({});
  const COLORS = useThemeColors();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);

  useEffect(() => {
    loadCustomers(1);
    loadLocations();
  }, []);

  const loadCustomers = async (pageNum: number) => {
    try {
      if (pageNum === 1) setIsLoading(true);

      const response = await customersAPI.getCustomers(pageNum, 50);

      if (pageNum === 1) {
        setCustomers(response.data);
      } else {
        setCustomers((prev) => [...prev, ...response.data]);
      }

      setHasMore(
        response.pagination ? response.pagination.page < response.pagination.totalPages : false
      );
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadLocations = async () => {
    try {
      const response = await locationsAPI.getLocationsComplete();
      setLocations(response.data);
      // Establecer Ecuador como país por defecto
      const ecuador = response.data.find((country) => country.is_code === 'EC');
      if (ecuador) {
        setSelectedCountryId(ecuador.id);
        setSelectedCountryCode('EC');
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    loadCustomers(1);
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadCustomers(page + 1);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setSelectedProvinceId(null);
    setSelectedCityId(null);
    setErrors({});
    // Restablecer Ecuador como país por defecto
    const ecuador = locations.find((country) => country.is_code === 'EC');
    if (ecuador) {
      setSelectedCountryId(ecuador.id);
      setSelectedCountryCode('EC');
    } else {
      setSelectedCountryId(null);
      setSelectedCountryCode('EC');
    }
  };

  const handlePhoneChange = (text: string) => {
    // Limpiar y dejar solo números
    const cleaned = cleanPhoneNumber(text);
    const maxDigits = COUNTRY_PHONE_CONFIG[selectedCountryCode]?.maxDigits || 10;
    
    // Limitar a máximo de dígitos
    const limited = cleaned.slice(0, maxDigits);
    
    setFormData({ ...formData, phone: limited });
    
    // Validación en tiempo real
    if (limited.length > 0 && limited.length < maxDigits) {
      setErrors({ ...errors, phone: `El teléfono debe tener ${maxDigits} dígitos` });
    } else if (limited.length === maxDigits) {
      // Limpiar error si está completo
      setErrors((prev) => {
        const { phone, ...rest } = prev;
        return rest;
      });
    } else {
      // Limpiar error si está vacío
      setErrors((prev) => {
        const { phone, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleEmailChange = (text: string) => {
    setFormData({ ...formData, email: text });
    
    // Validación en tiempo real
    if (text.trim() && !validateEmail(text)) {
      setErrors({ ...errors, email: 'El formato del correo no es válido' });
    } else {
      // Limpiar error de email si es válido o está vacío
      setErrors((prev) => {
        const { email, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleIdentificationChange = (text: string) => {
    // Limpiar y dejar solo números
    const cleaned = cleanIdentification(text);
    const maxDigits = IDENTIFICATION_CONFIG[formData.identification_type] || 13;
    
    // Limitar a máximo de dígitos según el tipo
    const limited = cleaned.slice(0, maxDigits);
    
    setFormData({ ...formData, identification: limited });
    
    // Validación en tiempo real
    if (limited.length > 0 && limited.length < maxDigits) {
      setErrors({ ...errors, identification: `La identificación debe tener ${maxDigits} dígitos` });
    } else if (limited.length === maxDigits) {
      // Limpiar error si está completo
      setErrors((prev) => {
        const { identification, ...rest } = prev;
        return rest;
      });
    } else {
      // Limpiar error si está vacío
      setErrors((prev) => {
        const { identification, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleIdentificationTypeChange = (value: 'CED' | 'RUC') => {
    // Limpiar identificación al cambiar el tipo
    setFormData({ ...formData, identification_type: value, identification: '' });
    // Limpiar error si existe
    setErrors((prev) => {
      const { identification, ...rest } = prev;
      return rest;
    });
  };

  const handleCreateCustomer = async () => {
    const newErrors: Partial<Record<keyof CustomerCreateForm | 'email' | 'phone', string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    const maxIdDigits = IDENTIFICATION_CONFIG[formData.identification_type] || 13;
    if (!formData.identification.trim()) {
      newErrors.identification = 'La identificación es requerida';
    } else if (formData.identification.length < maxIdDigits) {
      newErrors.identification = `La identificación debe tener ${maxIdDigits} dígitos`;
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El formato del correo no es válido';
    }
    
    const maxDigits = COUNTRY_PHONE_CONFIG[selectedCountryCode]?.maxDigits || 10;
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (formData.phone.length < maxDigits) {
      newErrors.phone = `El teléfono debe tener ${maxDigits} dígitos`;
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }
    if (!selectedCountryId) {
      Alert.alert('Error', 'El país es requerido');
      return;
    }
    if (!selectedProvinceId) {
      Alert.alert('Error', 'La provincia es requerida');
      return;
    }
    if (!selectedCityId) {
      Alert.alert('Error', 'La ciudad es requerida');
      return;
    }

    // Si hay errores, mostrarlos y no continuar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        name: formData.name.trim(),
        identification: formData.identification.trim(),
        identification_type: formData.identification_type,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        id_province: selectedProvinceId,
        id_city: selectedCityId,
        requires_credit: formData.requires_credit,
        credit_limit: formData.requires_credit ? Number(formData.credit_limit) || 0 : 0,
        credit_days: formData.requires_credit ? Number(formData.credit_days) || 0 : 0,
      };

      const created = await customersAPI.createCustomer(payload);
      setCustomers((prev) => [created, ...prev]);
      setShowCreateModal(false);
      resetForm();
      setErrors({});
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const searchLower = searchTerm.toLowerCase().trim();
    return customers.filter((customer) => {
      const nameMatch = customer.name.toLowerCase().includes(searchLower);
      const identificationMatch = customer.identification.toLowerCase().includes(searchLower);
      return nameMatch || identificationMatch;
    });
  }, [customers, searchTerm]);

  const selectedCountry = useMemo(
    () => locations.find((country) => country.id === selectedCountryId) || null,
    [locations, selectedCountryId]
  );
  
  // Actualizar código de país cuando cambia el país seleccionado
  useEffect(() => {
    if (selectedCountry) {
      setSelectedCountryCode(selectedCountry.is_code);
      // Limpiar teléfono al cambiar país
      setFormData((prev) => ({ ...prev, phone: '' }));
      setErrors((prev) => {
        if (prev.phone) {
          const { phone, ...rest } = prev;
          return rest;
        }
        return prev;
      });
    }
  }, [selectedCountryId, selectedCountry]);

  const availableProvinces: LocationProvince[] = selectedCountry?.provinces || [];
  const selectedProvince = useMemo(
    () => availableProvinces.find((province) => province.id === selectedProvinceId) || null,
    [availableProvinces, selectedProvinceId]
  );
  const availableCities: LocationCity[] = selectedProvince?.cities || [];
  
  const phoneConfig = COUNTRY_PHONE_CONFIG[selectedCountryCode] || { code: '', maxDigits: 10 };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerHeader}>
        <View style={styles.customerNameContainer}>
          <Text style={styles.customerName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          <Text style={styles.customerId}>
            {item.identification_type} {item.identification}
          </Text>
        </View>
      </View>
      <View style={styles.customerDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={14} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={14} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.detailText}>
            {item.full_location || item.address}
          </Text>
        </View>
        {item.requires_credit && (
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={14} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.detailText}>
              Crédito: {item.credit_limit} / {item.credit_days} días
            </Text>
          </View>
        )}
      </View>
    </View>
  );

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
        <Text style={styles.title}>Clientes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o identificación..."
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

      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
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
            <Ionicons name="people-outline" size={64} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>
              {searchTerm ? 'No se encontraron clientes' : 'No hay clientes disponibles'}
            </Text>
          </View>
        }
      />

      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Cliente</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <Input
                label="Nombre"
                placeholder="Nombre del cliente"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                required
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Tipo de identificación *</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={formData.identification_type}
                    onValueChange={(value) => {
                      if (value === 'CED' || value === 'RUC') {
                        handleIdentificationTypeChange(value);
                      }
                    }}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Cédula (10 dígitos)" value="CED" />
                    <Picker.Item label="RUC (13 dígitos)" value="RUC" />
                  </Picker>
                </View>
              </View>
              <Input
                label="Identificación"
                placeholder={
                  formData.identification_type === 'CED'
                    ? '10 dígitos'
                    : formData.identification_type === 'RUC'
                    ? '13 dígitos'
                    : 'Seleccione primero el tipo'
                }
                value={formData.identification}
                onChangeText={handleIdentificationChange}
                keyboardType="number-pad"
                maxLength={IDENTIFICATION_CONFIG[formData.identification_type] || 13}
                editable={!!formData.identification_type}
                error={errors.identification}
                required
              />
              {formData.identification.length > 0 && formData.identification_type && (
                <Text style={[
                  styles.identificationHelper,
                  formData.identification.length === IDENTIFICATION_CONFIG[formData.identification_type] && styles.identificationHelperSuccess
                ]}>
                  {formData.identification.length} / {IDENTIFICATION_CONFIG[formData.identification_type]} dígitos
                </Text>
              )}
              <Input
                label="Correo"
                placeholder="usuario@ejemplo.com"
                value={formData.email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                required
              />
              <Input
                label={`Teléfono (${phoneConfig.code})`}
                placeholder={`${phoneConfig.maxDigits} dígitos`}
                value={formData.phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={phoneConfig.maxDigits}
                error={errors.phone}
                required
              />
              {formData.phone.length > 0 && (
                <Text style={[
                  styles.phoneHelper,
                  formData.phone.length === phoneConfig.maxDigits && styles.phoneHelperSuccess
                ]}>
                  {formData.phone.length} / {phoneConfig.maxDigits} dígitos
                </Text>
              )}
              <Input
                label="Dirección"
                placeholder="Dirección"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                required
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>País *</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={selectedCountryId ?? 0}
                    onValueChange={(value) => {
                      const nextValue = value ? Number(value) : null;
                      setSelectedCountryId(nextValue);
                      setSelectedProvinceId(null);
                      setSelectedCityId(null);
                    }}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Seleccionar país" value={0} />
                    {locations.map((country) => (
                      <Picker.Item 
                        key={country.id} 
                        label={`${country.name} (${country.is_code})`} 
                        value={country.id} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Provincia *</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={selectedProvinceId ?? 0}
                    onValueChange={(value) => {
                      const nextValue = value ? Number(value) : null;
                      setSelectedProvinceId(nextValue);
                      setSelectedCityId(null);
                    }}
                    enabled={availableProvinces.length > 0}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Seleccionar provincia" value={0} />
                    {availableProvinces.map((province) => (
                      <Picker.Item key={province.id} label={province.name} value={province.id} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Ciudad *</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={selectedCityId ?? 0}
                    onValueChange={(value) => setSelectedCityId(value ? Number(value) : null)}
                    enabled={availableCities.length > 0}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Seleccionar ciudad" value={0} />
                    {availableCities.map((city) => (
                      <Picker.Item key={city.id} label={city.name} value={city.id} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.creditToggle}>
                <Text style={styles.creditLabel}>Requiere crédito</Text>
                <View style={styles.creditButtons}>
                  <TouchableOpacity
                    style={[
                      styles.creditButton,
                      !formData.requires_credit && styles.creditButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, requires_credit: false })}
                  >
                    <Text
                      style={[
                        styles.creditButtonText,
                        !formData.requires_credit && styles.creditButtonTextActive,
                      ]}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.creditButton,
                      formData.requires_credit && styles.creditButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, requires_credit: true })}
                  >
                    <Text
                      style={[
                        styles.creditButtonText,
                        formData.requires_credit && styles.creditButtonTextActive,
                      ]}
                    >
                      Sí
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {formData.requires_credit && (
                <>
                  <Input
                    label="Límite de crédito"
                    placeholder="0"
                    value={formData.credit_limit}
                    onChangeText={(text) => setFormData({ ...formData, credit_limit: text })}
                    keyboardType="numeric"
                  />
                  <Input
                    label="Días de crédito"
                    placeholder="0"
                    value={formData.credit_days}
                    onChangeText={(text) => setFormData({ ...formData, credit_days: text })}
                    keyboardType="number-pad"
                  />
                </>
              )}
              <Button
                title="Crear Cliente"
                onPress={handleCreateCustomer}
                isLoading={isCreating}
                style={styles.submitButton}
              />
            </ScrollView>
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
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.SURFACE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
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
  customerCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  customerHeader: {
    marginBottom: 12,
  },
  customerNameContainer: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  customerId: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  customerDetails: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.SURFACE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  modalBody: {
    padding: 16,
    paddingBottom: 32,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    backgroundColor: COLORS.SURFACE,
    overflow: 'hidden',
    height: Platform.OS === 'ios' ? 180 : undefined,
    justifyContent: 'center',
  },
  pickerItem: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  phoneHelper: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
  },
  phoneHelperSuccess: {
    color: COLORS.SUCCESS,
    fontWeight: '600',
  },
  identificationHelper: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
  },
  identificationHelperSuccess: {
    color: COLORS.SUCCESS,
    fontWeight: '600',
  },
  creditToggle: {
    marginBottom: 16,
  },
  creditLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  creditButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  creditButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
  },
  creditButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  creditButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  creditButtonTextActive: {
    color: 'white',
  },
  submitButton: {
    marginTop: 8,
  },
});

export default CustomersListScreen;
