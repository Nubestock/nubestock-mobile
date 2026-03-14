import { Tabs, useSegments, usePathname } from 'expo-router';
import React, { useMemo } from 'react';
import { ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { canAccessSales, canAccessProduction, canAccessProducts, canAccessCustomers, canAccessAdmin } from '@/src/utils/permissions';
import { useThemeColors } from '@/src/constants/colors';

export default function TabLayout() {
  const { user } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const COLORS = useThemeColors();

  // Ocultar tab bar cuando estamos en sub-rutas (ej: sales/create)
  // Las rutas principales de tabs son: sales, products, production, profile
  // Si estamos en (tabs) y hay más de 2 segments, es una sub-ruta
  // Si no estamos en (tabs), también ocultamos (estamos en otra parte del stack)
  const isInTabs = segments[0] === '(tabs)';
  const mainTabRoutes = ['sales', 'products', 'customers', 'production', 'profile'];
  const currentRoute = segments[segments.length - 1];
  const isMainTabRoute = isInTabs && mainTabRoutes.includes(currentRoute);
  const segmentList = segments as string[];
  const isAdminRoute = pathname.startsWith('/admin') || segmentList.includes('admin');
  console.log('pathname', pathname);
  console.log('segmentList', segmentList);
  console.log('isAdminRoute', isAdminRoute);
  const shouldHideTabBar = !isMainTabRoute || isAdminRoute;
  console.log('shouldHideTabBar', shouldHideTabBar);
  const tabBarStyle = useMemo(() => {
    if (!shouldHideTabBar) return undefined;
    const hiddenStyle: ViewStyle = { display: 'none' };
    return hiddenStyle;
  }, [shouldHideTabBar]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
        headerShown: false,
        tabBarStyle: tabBarStyle,
      }}>
      <Tabs.Screen
        name="production"
        options={{
          title: 'Producción',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cog-outline" size={size} color={color} />
          ),
          href: canAccessProduction(user) ? undefined : null, // Ocultar si no tiene acceso
        }}
      />
      
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Ventas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
          href: canAccessSales(user) ? undefined : null, // Ocultar si no tiene acceso
        }}
      />
      
      <Tabs.Screen
        name="products"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
          href: canAccessProducts(user) ? undefined : null, // Ocultar si no tiene acceso
        }}
      />

      <Tabs.Screen
        name="customers"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          href: canAccessCustomers(user) ? undefined : null, // Ocultar si no tiene acceso
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
          href: canAccessAdmin(user) ? undefined : null,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Ocultar del tab bar
        }}
      />
      
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Ocultar del tab bar
        }}
      />
    </Tabs>
  );
}
