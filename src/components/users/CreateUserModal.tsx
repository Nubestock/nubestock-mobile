import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useThemeColors } from '../../constants/colors';
import Input from '../common/Input';
import Button from '../common/Button';
import { locationsAPI } from '../../api/locations.api';
import { LocationCountry } from '../../types/location.types';
import { usersAPI, CreateUserRequest } from '../../api/users.api';
import { getErrorMessage } from '../../api/client';

interface CreateUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Configuración de países con límites de dígitos telefónicos
const COUNTRY_PHONE_CONFIG: Record<string, { code: string; maxDigits: number }> = {
  EC: { code: '+593', maxDigits: 9 }, // Ecuador: 9 dígitos (sin el código de país)
};

type UserCreateForm = {
  name: string;
  email: string;
  password: string;
  phone: string;
  is_active: boolean;
};

const initialForm: UserCreateForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  is_active: true,
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

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [formData, setFormData] = useState<UserCreateForm>(initialForm);
  const [locations, setLocations] = useState<LocationCountry[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('EC'); // Ecuador por defecto
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof UserCreateForm, string>>>({});

  useEffect(() => {
    if (visible) {
      loadLocations();
      // Establecer Ecuador como país por defecto
      setSelectedCountryCode('EC');
      resetForm();
    }
  }, [visible]);

  const loadLocations = async () => {
    try {
      const response = await locationsAPI.getLocationsComplete();
      setLocations(response.data);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setSelectedCountryCode('EC');
    setErrors({});
  };

  const handlePhoneChange = (text: string) => {
    // Limpiar y dejar solo números
    const cleaned = cleanPhoneNumber(text);
    const maxDigits = COUNTRY_PHONE_CONFIG[selectedCountryCode]?.maxDigits || 10;
    
    // Limitar a máximo de dígitos
    const limited = cleaned.slice(0, maxDigits);
    
    setFormData({ ...formData, phone: limited });
    
    // Limpiar error de teléfono si existe
    if (errors.phone) {
      setErrors({ ...errors, phone: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserCreateForm, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El formato del correo no es válido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    const maxDigits = COUNTRY_PHONE_CONFIG[selectedCountryCode]?.maxDigits || 10;
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (formData.phone.length < maxDigits) {
      newErrors.phone = `El teléfono debe tener ${maxDigits} dígitos`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    try {
      const payload: CreateUserRequest = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone,
        is_active: formData.is_active,
      };

      await usersAPI.createUser(payload);
      Alert.alert('Éxito', 'Usuario creado exitosamente');
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCountry = useMemo(
    () => locations.find((country) => country.is_code === selectedCountryCode),
    [locations, selectedCountryCode]
  );

  const phoneConfig = COUNTRY_PHONE_CONFIG[selectedCountryCode] || { code: '', maxDigits: 10 };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Crear Usuario</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Input
              label="Nombre completo *"
              placeholder="Nombre del usuario"
              value={formData.name}
              onChangeText={(text) => {
                setFormData({ ...formData, name: text });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              error={errors.name}
              required
            />

            <Input
              label="Correo electrónico *"
              placeholder="usuario@ejemplo.com"
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
            />

            <Input
              label="Contraseña *"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              secureTextEntry
              error={errors.password}
              required
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>País *</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={selectedCountryCode}
                  onValueChange={(value) => {
                    setSelectedCountryCode(value);
                    // Limpiar teléfono al cambiar país
                    setFormData({ ...formData, phone: '' });
                    if (errors.phone) setErrors({ ...errors, phone: undefined });
                  }}
                  itemStyle={styles.pickerItem}
                >
                  {locations.map((country) => (
                    <Picker.Item
                      key={country.id}
                      label={`${country.name} (${country.is_code})`}
                      value={country.is_code}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <Input
              label={`Teléfono * (${phoneConfig.code})`}
              placeholder={`${phoneConfig.maxDigits} dígitos`}
              value={formData.phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={phoneConfig.maxDigits}
              error={errors.phone}
              required
            />

            {formData.phone.length > 0 && (
              <Text style={styles.phoneHelper}>
                {formData.phone.length} / {phoneConfig.maxDigits} dígitos
              </Text>
            )}

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Usuario activo</Text>
              <TouchableOpacity
                style={[
                  styles.switch,
                  formData.is_active && styles.switchActive,
                ]}
                onPress={() =>
                  setFormData({ ...formData, is_active: !formData.is_active })
                }
              >
                <View
                  style={[
                    styles.switchThumb,
                    formData.is_active && styles.switchThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Cancelar"
                onPress={onClose}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title="Crear Usuario"
                onPress={handleCreate}
                loading={isCreating}
                style={styles.createButton}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.OVERLAY,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.SURFACE,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '90%',
      paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.TEXT_PRIMARY,
    },
    closeButton: {
      padding: 4,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      gap: 16,
    },
    pickerContainer: {
      marginBottom: 8,
    },
    pickerLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.TEXT_PRIMARY,
      marginBottom: 8,
    },
    picker: {
      borderWidth: 1,
      borderColor: colors.BORDER,
      borderRadius: 8,
      backgroundColor: colors.SURFACE,
      overflow: 'hidden',
    },
    pickerItem: {
      color: colors.TEXT_PRIMARY,
    },
    phoneHelper: {
      fontSize: 12,
      color: colors.TEXT_SECONDARY,
      marginTop: -8,
      marginBottom: 8,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    switchLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.TEXT_PRIMARY,
    },
    switch: {
      width: 50,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.BORDER,
      justifyContent: 'center',
      paddingHorizontal: 2,
    },
    switchActive: {
      backgroundColor: colors.PRIMARY,
    },
    switchThumb: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.SURFACE,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    switchThumbActive: {
      transform: [{ translateX: 20 }],
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    cancelButton: {
      flex: 1,
    },
    createButton: {
      flex: 1,
    },
  });

export default CreateUserModal;
