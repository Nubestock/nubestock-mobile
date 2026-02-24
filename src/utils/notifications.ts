import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { machineryAlertsAPI } from '../api/machineryAlerts.api';

/**
 * Verifica si la app est? ejecut?ndose en Expo Go
 * @returns true si est? en Expo Go, false si es un development build o producci?n
 */
export function isRunningInExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient';
}

/**
 * Configura el comportamiento de las notificaciones cuando la app est? en primer plano
 * Solo se configura si no est? en Expo Go
 */
if (!isRunningInExpoGo()) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    console.warn('No se pudo configurar el handler de notificaciones:', error);
  }
}

/**
 * Solicita permisos de notificaciones
 * @returns true si se otorgaron permisos, false en caso contrario
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  // En Expo Go, las notificaciones push no est?n soportadas
  if (isRunningInExpoGo()) {
    console.warn('Las notificaciones push no est?n disponibles en Expo Go. Usa un development build.');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error al solicitar permisos de notificaciones:', error);
    return false;
  }
}

/**
 * Obtiene el token del dispositivo para notificaciones push
 * @returns El token del dispositivo o null si no se puede obtener
 */
export async function getDeviceToken(): Promise<string | null> {
  // En Expo Go, las notificaciones push no est?n soportadas
  if (isRunningInExpoGo()) {
    console.warn('Las notificaciones push no est?n disponibles en Expo Go. Usa un development build.');
    return null;
  }

  try {
    // Verificar permisos primero
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Permisos de notificaciones no otorgados');
      return null;
    }

    // Obtener el token nativo del dispositivo (FCM/APNs)
    const tokenData = await Notifications.getDevicePushTokenAsync();
    return typeof tokenData?.data === 'string' ? tokenData.data : null;
  } catch (error: any) {
    // Manejar espec?ficamente el error de Expo Go
    if (error?.message?.includes('Expo Go') || error?.message?.includes('development build')) {
      console.warn('Las notificaciones push requieren un development build. Error:', error.message);
    } else {
      console.error('Error al obtener token del dispositivo:', error);
    }
    return null;
  }
}

/**
 * Detecta la plataforma del dispositivo
 * @returns 'ios', 'android' o 'web'
 */
export function getDevicePlatform(): 'ios' | 'android' | 'web' {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
}

/**
 * Registra el dispositivo en el backend para recibir notificaciones push
 * @returns true si se registr? exitosamente, false en caso contrario
 */
export async function registerDeviceForPushNotifications(): Promise<boolean> {
  // En Expo Go, las notificaciones push no est?n soportadas
  if (isRunningInExpoGo()) {
    console.warn('Las notificaciones push no est?n disponibles en Expo Go. El dispositivo no se registrar?.');
    console.info('Para usar notificaciones push, crea un development build: https://docs.expo.dev/develop/development-builds/introduction/');
    return false;
  }

  try {
    // Obtener token del dispositivo
    const deviceToken = await getDeviceToken();
    if (!deviceToken) {
      console.warn('No se pudo obtener el token del dispositivo');
      return false;
    }

    // Detectar plataforma
    const platform = getDevicePlatform();

    // Registrar en el backend
    await machineryAlertsAPI.registerDevice({
      device_token: deviceToken,
      platform,
    });

    console.log('Dispositivo registrado exitosamente para notificaciones push');
    return true;
  } catch (error: any) {
    // Manejar espec?ficamente el error de Expo Go
    if (error?.message?.includes('Expo Go') || error?.message?.includes('development build')) {
      console.warn('Las notificaciones push requieren un development build. El dispositivo no se registrar?.');
    } else {
      console.error('Error al registrar dispositivo para notificaciones push:', error);
    }
    // No lanzamos el error para que no interrumpa el flujo de login
    return false;
  }
}
