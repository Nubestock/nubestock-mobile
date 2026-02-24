import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/auth.types';

const KEYS = {
  TOKEN: 'nutregam_token',
  REFRESH_TOKEN: 'nutregam_refresh_token',
  USER: 'nutregam_user',
  TOKEN_EXPIRES_IN: 'nutregam_token_expires_in',
};

// Token (usar SecureStore para mayor seguridad)
export const storeToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(KEYS.TOKEN, token);
};

export const getStoredToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(KEYS.TOKEN);
};

export const clearStoredToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(KEYS.TOKEN);
};

// Refresh Token
export const storeRefreshToken = async (refreshToken: string): Promise<void> => {
  await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
};

export const getStoredRefreshToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
};

export const clearStoredRefreshToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
};

// Token Expiration
export const storeTokenExpiresIn = async (expiresIn: number): Promise<void> => {
  await AsyncStorage.setItem(KEYS.TOKEN_EXPIRES_IN, expiresIn.toString());
};

export const getStoredTokenExpiresIn = async (): Promise<number | null> => {
  const expiresInStr = await AsyncStorage.getItem(KEYS.TOKEN_EXPIRES_IN);
  return expiresInStr ? Number.parseInt(expiresInStr, 10) : null;
};

export const clearStoredTokenExpiresIn = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.TOKEN_EXPIRES_IN);
};

// Usuario (AsyncStorage está bien para datos no sensibles)
export const storeUser = async (user: User): Promise<void> => {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const getStoredUser = async (): Promise<User | null> => {
  const userStr = await AsyncStorage.getItem(KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const clearStoredUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.USER);
};

// Limpiar todo
export const clearAllAuthData = async (): Promise<void> => {
  await Promise.all([
    clearStoredToken(),
    clearStoredRefreshToken(),
    clearStoredUser(),
    clearStoredTokenExpiresIn(),
  ]);
};
