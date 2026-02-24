import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';

/**
 * Hook que protege una ruta individual
 * Redirige al login si el usuario no está autenticado
 */
export const useProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return {
    isAuthenticated,
    isLoading,
    showLoading: isLoading || !isAuthenticated,
  };
};

/**
 * Componente HOC para proteger pantallas
 */
export const withAuthProtection = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    const { showLoading } = useProtectedRoute();

    if (showLoading) {
      return <Loading />;
    }

    return <Component {...props} />;
  };
};
