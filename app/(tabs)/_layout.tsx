import { Tabs, useSegments, usePathname, useRouter } from 'expo-router';
import React, { useMemo, useEffect } from 'react';
import { ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { canAccessSales, canAccessProduction, canAccessProducts, canAccessCustomers, canAccessAdmin } from '@/src/utils/permissions';
import { useThemeColors } from '@/src/constants/colors';

export default function TabLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const COLORS = useThemeColors();
  const isAdminOnly = canAccessAdmin(user);

  // Admin solo debe ver la pestaña Admin: si está en otra tab, redirigir a admin
  useEffect(() => {
    if (!isAdminOnly || !user) return;
    const onAdminRoute = pathname.startsWith('/admin') || (segments as string[]).includes('admin');
    if (!onAdminRoute) {
      router.replace('/(tabs)/admin');
    }
  }, [isAdminOnly, user, pathname, segments, router]);

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
  // Admin: tab bar siempre oculta, solo ve la vista del dashboard (WebView)
  const shouldHideTabBar = isAdminOnly || !isMainTabRoute || isAdminRoute;
  const tabBarStyle = useMemo(() => {
    if (!shouldHideTabBar) return undefined;
    return { display: 'none' } as ViewStyle;
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
          href: isAdminOnly ? null : (canAccessProduction(user) ? undefined : null),
        }}
      />
      
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Ventas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
          href: isAdminOnly ? null : (canAccessSales(user) ? undefined : null),
        }}
      />
      
      <Tabs.Screen
        name="products"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
          href: isAdminOnly ? null : (canAccessProducts(user) ? undefined : null),
        }}
      />

      <Tabs.Screen
        name="customers"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          href: isAdminOnly ? null : (canAccessCustomers(user) ? undefined : null),
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
          href: isAdminOnly ? null : undefined,
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
