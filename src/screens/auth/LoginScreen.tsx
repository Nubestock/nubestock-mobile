import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFormik } from 'formik';
import { useAuth } from '../../context/AuthContext';
import { loginSchema } from '../../utils/validation';
import { getErrorMessage } from '../../api/client';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useThemeColors } from '../../constants/colors';

const LoginScreen = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await login(values);
        // El AuthGuard se encargará de redirigir según los permisos
        // No necesitamos redirigir manualmente aquí
      } catch (error) {
        Alert.alert('Error', getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
          <Text style={styles.title}>Nutregam</Text>
          <Text style={styles.subtitle}>Iniciar Sesión</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="tu@email.com"
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            required
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            onBlur={formik.handleBlur('password')}
            error={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            required
          />

          <Button
            title="Iniciar Sesión"
            onPress={() => formik.handleSubmit()}
            isLoading={isLoading}
            style={styles.submitButton}
          />
          <Button
            title="Login de administrador"
            onPress={() => router.push('/(tabs)/admin')}
            variant="outline"
            style={styles.adminButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.TEXT_SECONDARY,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: 8,
  },
  adminButton: {
    marginTop: 12,
  },
});

export default LoginScreen;
