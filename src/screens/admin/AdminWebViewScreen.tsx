import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';
import { useThemeColors } from '../../constants/colors';

const AdminWebViewScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
      return () => {
        navigation.setOptions({ tabBarStyle: undefined });
      };
    }, [navigation])
  );

  const adminUrl =
    (Constants.expoConfig?.extra?.adminDashboardUrl as string | undefined) ||
    ((Constants as any).manifest?.extra?.adminDashboardUrl as string | undefined) ||
    '';

  if (!adminUrl) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.title}>Administrador</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.WARNING} />
          <Text style={styles.emptyText}>
            Falta configurar la URL del dashboard de administración.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.title}>Administrador</Text>
        <View style={styles.placeholder} />
      </View>
      <WebView
        source={{ uri: adminUrl }}
        style={styles.webview}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
      />
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
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.SURFACE,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER,
    },
    backButton: {
      padding: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.TEXT_PRIMARY,
    },
    placeholder: {
      width: 40,
    },
    webview: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      textAlign: 'center',
    },
  });

export default AdminWebViewScreen;
