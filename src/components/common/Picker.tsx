import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Picker as RNPicker } from '@react-native-picker/picker';
import { useThemeColors } from '../../constants/colors';

interface PickerItem {
  label: string;
  value: string | number;
}

interface PickerProps {
  label?: string;
  selectedValue: string | number | null;
  onValueChange: (value: string | number) => void;
  items: PickerItem[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

const Picker: React.FC<PickerProps> = ({
  label,
  selectedValue,
  onValueChange,
  items,
  placeholder = 'Seleccionar...',
  required = false,
  error,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={[styles.pickerContainer, error && styles.pickerContainerError]}>
        <RNPicker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          dropdownIconColor={colors.TEXT_SECONDARY}
        >
          {placeholder && (
            <RNPicker.Item label={placeholder} value="" enabled={false} />
          )}
          {items.map((item) => (
            <RNPicker.Item
              key={item.value?.toString()}
              label={item.label}
              value={item.value}
            />
          ))}
        </RNPicker>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  required: {
    color: colors.ERROR,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.SURFACE,
  },
  pickerContainerError: {
    borderColor: colors.ERROR,
  },
  picker: {
    height: Platform.OS === 'ios' ? 180 : 50,
    color: colors.TEXT_PRIMARY,
    backgroundColor: colors.SURFACE,
  },
  pickerItem: {
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
  },
  errorText: {
    fontSize: 14,
    color: colors.ERROR,
    marginTop: 4,
  },
});

export default Picker;
