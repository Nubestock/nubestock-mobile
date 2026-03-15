import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

/**
 * Comprueba si hay una actualización OTA (EAS Update) y avisa al usuario.
 * Solo se ejecuta en development builds y producción (no en Expo Go).
 * Tras comprobar, si hay actualización la descarga y muestra un diálogo
 * "Hay una nueva actualización disponible. ¿Aplicar ahora?".
 */
export function useCheckForAppUpdate(): void {
  const checking = useRef(false);

  useEffect(() => {
    // En Expo Go no hay EAS Update; evitar comprobaciones
    if (Constants.executionEnvironment === 'storeClient') {
      return;
    }

    const check = async () => {
      if (checking.current) return;
      try {
        checking.current = true;
        const update = await Updates.checkForUpdateAsync();
        if (!update.isAvailable) return;

        await Updates.fetchUpdateAsync();

        Alert.alert(
          'Nueva actualización disponible',
          'Hay una nueva versión de la app. ¿Aplicar ahora?',
          [
            { text: 'Más tarde', style: 'cancel' },
            {
              text: 'Aplicar ahora',
              onPress: () => {
                Updates.reloadAsync();
              },
            },
          ]
        );
      } catch (err) {
        // Red o servicio no disponible; no molestar al usuario
        if (__DEV__) {
          console.warn('Comprobación de actualización:', err);
        }
      } finally {
        checking.current = false;
      }
    };

    // Esperar un poco para no bloquear el arranque
    const t = setTimeout(check, 3000);
    return () => clearTimeout(t);
  }, []);
}
