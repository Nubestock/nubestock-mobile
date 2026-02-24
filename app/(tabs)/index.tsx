import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { canAccessSales, canAccessProduction, canAccessProducts, canAccessCustomers } from '@/src/utils/permissions';
import Loading from '@/src/components/common/Loading';

export default function IndexScreen() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // El AuthGuard ya maneja la redirección al login si no está autenticado
    // Solo necesitamos redirigir según permisos si está autenticado
    if (isLoading || !isAuthenticated) return;

    if (user) {
      // Priorizar producción para operadores, luego ventas, luego otros módulos
      if (canAccessProduction(user)) {
        router.replace('/(tabs)/production');
      } else if (canAccessSales(user)) {
        router.replace('/(tabs)/sales');
      } else if (canAccessProducts(user)) {
        router.replace('/(tabs)/products');
      } else if (canAccessCustomers(user)) {
        router.replace('/(tabs)/customers');
      } else {
        router.replace('/(tabs)/profile');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return <Loading />;
}
