import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useThemeColors } from '../../constants/colors';
import { formatDate } from '../../utils/formatting';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import Loading from '../../components/common/Loading';

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showLoading } = useProtectedRoute();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  if (showLoading || !user) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color={colors.PRIMARY} />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        {(user.rolesDetails && user.rolesDetails.length > 0) || (user.roles && user.roles.length > 0) ? (
          <View style={styles.roleHeader}>
            {user.rolesDetails && user.rolesDetails.length > 0 ? (
              <Text style={styles.roleText}>{user.rolesDetails[0].namerole}</Text>
            ) : (
              <Text style={styles.roleText}>{user.roles?.[0]}</Text>
            )}
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={colors.TEXT_SECONDARY} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          {user.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.TEXT_SECONDARY} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            </View>
          )}

          {user.last_login && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.TEXT_SECONDARY} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Último acceso</Text>
                <Text style={styles.infoValue}>{formatDate(user.last_login)}</Text>
              </View>
            </View>
          )}
        </Card>

        <Button
          title="Cerrar Sesión"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />
      </View>
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
  header: {
    backgroundColor: colors.PRIMARY,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  roleHeader: {
    marginBottom: 0,
  },
  roleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoContent: {
    marginLeft: 12,
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
  logoutButton: {
    marginTop: 'auto',
  },
});

export default ProfileScreen;
