import React, { useEffect } from 'react';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { canAccessSales, canAccessProduction, canAccessAdmin } from '../../utils/permissions';
import Loading from '../common/Loading';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Componente que protege las rutas y redirige al login si el usuario no está autenticado
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

  const isLoginRoute = pathname === '/login' || segments[0] === 'login';
  const isAdminRoute = segments.includes('admin');
  const isProtectedRoute = (segments[0] === '(tabs)' || segments[0] === 'modal') && !isAdminRoute;

    // Si no está autenticado y está intentando acceder a rutas protegidas
    if (!isAuthenticated && isProtectedRoute) {
      router.replace('/login');
      return;
    }

    // Si está autenticado y está en login, redirigir según permisos
    // Admin → dashboard admin (WebView); luego producción, ventas, perfil
    if (isAuthenticated && isLoginRoute && user) {
      if (canAccessAdmin(user)) {
        router.replace('/(tabs)/admin');
      } else if (canAccessProduction(user)) {
        router.replace('/(tabs)/production');
      } else if (canAccessSales(user)) {
        router.replace('/(tabs)/sales');
      } else {
        router.replace('/(tabs)/profile');
      }
      return;
    }
  }, [isAuthenticated, isLoading, segments, pathname, user]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <Loading />;
  }

  // Si no está autenticado y está intentando acceder a rutas protegidas, mostrar loading mientras redirige
  if (!isAuthenticated && (segments[0] === '(tabs)' || segments[0] === 'modal') && !segments.includes('admin')) {
    return <Loading />;
  }

  return <>{children}</>;
};
