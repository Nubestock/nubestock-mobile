import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../api/auth.api';
import { User, LoginRequest } from '../types/auth.types';
import {
  storeToken,
  getStoredToken,
  clearStoredToken,
  storeRefreshToken,
  getStoredRefreshToken,
  clearStoredRefreshToken,
  storeTokenExpiresIn,
  getStoredTokenExpiresIn,
  clearStoredTokenExpiresIn,
  storeUser,
  getStoredUser,
  clearStoredUser,
  clearAllAuthData,
} from '../utils/storage';
import { decodeJWT } from '../utils/jwt';
import { registerDeviceForPushNotifications } from '../utils/notifications';
import { UserRole } from '../constants/permissions';

/** Error lanzado cuando un administrador intenta entrar por el login normal */
export const ADMIN_MUST_USE_ADMIN_ENTRY = 'ADMIN_MUST_USE_ADMIN_ENTRY';

function isAdminUser(user: User): boolean {
  const roles = user.roles || [];
  const permissions = user.permissions || [];
  return (
    roles.some(
      (r) =>
        r === UserRole.ADMINISTRADOR ||
        r.toLowerCase() === 'admin' ||
        r.toLowerCase() === 'administrador'
    ) || permissions.includes('admin')
  );
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario y token al inicio
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedRefreshToken, storedUser, storedExpiresIn] = await Promise.all([
        getStoredToken(),
        getStoredRefreshToken(),
        getStoredUser(),
        getStoredTokenExpiresIn(),
      ]);

      if (storedToken && storedUser) {
        // Extraer información del JWT (roles, rolesDetails, permissions)
        const decodedToken = decodeJWT(storedToken);
        const userWithJWTData: User = {
          ...storedUser,
          roles: decodedToken?.roles || storedUser.roles || [],
          rolesDetails: decodedToken?.rolesDetails || storedUser.rolesDetails || [],
          permissions: decodedToken?.permissions || storedUser.permissions || [],
        };
        
        setToken(storedToken);
        setUser(userWithJWTData);
        if (storedRefreshToken) {
          setRefreshToken(storedRefreshToken);
        }
        if (storedExpiresIn) {
          setExpiresIn(storedExpiresIn);
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authAPI.login(credentials);
      
      const { token: newToken, refreshToken: newRefreshToken, user: newUser, expiresIn: newExpiresIn } = response.data;
      
      // Decodificar JWT para extraer rolesDetails y permissions
      const decodedToken = decodeJWT(newToken);
      const userWithJWTData: User = {
        ...newUser,
        // Extraer información del JWT
        roles: decodedToken?.roles || newUser.roles || [],
        rolesDetails: decodedToken?.rolesDetails || newUser.rolesDetails || [],
        permissions: decodedToken?.permissions || newUser.permissions || [],
      };

      // Admin y resto de usuarios: mismo flujo; la redirección según rol la hace AuthGuard
      // Guardar en estado y storage
      setToken(newToken);
      setUser(userWithJWTData);
      setRefreshToken(newRefreshToken);
      setExpiresIn(newExpiresIn);
      
      await Promise.all([
        storeToken(newToken),
        storeRefreshToken(newRefreshToken),
        storeUser(userWithJWTData),
        storeTokenExpiresIn(newExpiresIn),
      ]);

      // Registrar dispositivo para notificaciones push (en segundo plano, no bloquea el login)
      registerDeviceForPushNotifications().catch((error) => {
        console.error('Error al registrar dispositivo (no crítico):', error);
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar estado y storage
      setToken(null);
      setUser(null);
      setRefreshToken(null);
      setExpiresIn(null);
      await clearAllAuthData();
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        expiresIn,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
