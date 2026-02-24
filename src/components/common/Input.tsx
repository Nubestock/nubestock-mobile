import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextInputProps as RNTextInputProps } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { useThemeColors } from '../../constants/colors';

interface InputProps extends Omit<RNTextInputProps, 'mode' | 'error' | 'style'> {
  label?: string;
  error?: string;
  required?: boolean;
  mode?: 'flat' | 'outlined';
  style?: ViewStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  required = false,
  style,
  secureTextEntry,
  mode = 'outlined',
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry;
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Construir el label con asterisco si es requerido
  const labelText = label ? (required ? `${label} *` : label) : undefined;

  // Props específicas que PaperTextInput acepta
  const paperInputProps: any = {
    keyboardType: props.keyboardType,
    autoCapitalize: props.autoCapitalize,
    autoComplete: props.autoComplete,
    autoCorrect: props.autoCorrect,
    maxLength: props.maxLength,
    editable: props.editable,
    onBlur: props.onBlur,
    onFocus: props.onFocus,
    multiline: props.multiline,
    numberOfLines: props.numberOfLines,
    textContentType: props.textContentType,
    returnKeyType: props.returnKeyType,
    onSubmitEditing: props.onSubmitEditing,
    blurOnSubmit: props.blurOnSubmit,
  };

  return (
    <View style={[styles.container, style]}>
      <PaperTextInput
        label={labelText}
        value={props.value as string}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        secureTextEntry={isPassword && !isPasswordVisible}
        error={!!error}
        mode={mode}
        style={styles.input}
        contentStyle={styles.inputContent}
        outlineStyle={styles.outlineStyle}
        right={
          isPassword ? (
            <PaperTextInput.Icon
              icon={isPasswordVisible ? 'eye' : 'eye-off'}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              color={colors.TEXT_SECONDARY}
            />
          ) : undefined
        }
        {...paperInputProps}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    input: {
      backgroundColor: colors.SURFACE,
    },
    inputContent: {
      fontSize: 16,
      color: colors.TEXT_PRIMARY,
    },
    outlineStyle: {
      borderColor: colors.BORDER,
    },
    errorText: {
      fontSize: 12,
      color: colors.ERROR,
      marginTop: 4,
      marginLeft: 12,
    },
  });

export default Input;
