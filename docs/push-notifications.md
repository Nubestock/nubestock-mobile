# Push Notifications: Firebase (FCM/Expo) vs Azure Notification Hubs

Este documento describe los pasos tecnicos para habilitar notificaciones push en
`nubestock-mobile` con dos alternativas:

- **Firebase/FCM + Expo Push** (recomendado para empezar)
- **Azure Notification Hubs** (integracion empresarial)

Ambas opciones **usan FCM en Android y APNs en iOS**, la diferencia esta en el
broker y flujo del backend.

---

## 1) Opcion A: Firebase/FCM + Expo Push

### 1.1 Requisitos
- Cuenta de Firebase
- Cuenta Apple Developer (para iOS)
- Development build de Expo (no Expo Go)

### 1.2 Android (FCM)
1. Crear proyecto en Firebase Console.
2. Agregar una app Android con el package:
   - `com.nubestock.mobile`
3. Descargar `google-services.json`.
4. Copiar el archivo en la raiz del proyecto:
   - `nubestock-mobile/google-services.json`
5. Reconstruir el build:
   - `npx expo run:android`

Nota: En `app.config.js` se espera el archivo y se agrega
`android.googleServicesFile` automaticamente si existe.

### 1.3 iOS (APNs)
1. En Apple Developer, crear App ID con:
   - Push Notifications = enabled
2. Generar APNs Auth Key (`.p8`) o certificados.
3. Subir credenciales a Expo:
   - `eas credentials` o panel de Expo.
4. Reconstruir el build:
   - `npx expo run:ios` (o `eas build -p ios`)

### 1.4 Backend (Expo Push)
1. Obtener el **Expo Push Token** en la app:
   - `Notifications.getExpoPushTokenAsync(...)`
2. Guardar el token en el backend (Azure, Node, etc).
3. Enviar notificaciones usando Expo Push API:
   - `https://exp.host/--/api/v2/push/send`

### 1.5 Pruebas
- Confirmar permisos de notificaciones.
- Verificar que el token se genera sin errores.
- Enviar un push de prueba desde el backend.

---

## 2) Opcion B: Azure Notification Hubs

### 2.1 Requisitos
- Azure Subscription
- Azure Notification Hub
- Credenciales FCM (Android) y APNs (iOS)

### 2.2 Android (FCM con Azure)
1. Crear proyecto en Firebase Console.
2. Agregar app Android (`com.nubestock.mobile`).
3. Descargar `google-services.json` y copiarlo en:
   - `nubestock-mobile/google-services.json`
4. En Firebase, obtener la clave del servidor o credencial FCM (segun version).
5. En Azure Notification Hub:
   - Configurar FCM con la credencial correspondiente.
6. Reconstruir el build:
   - `npx expo run:android`

### 2.3 iOS (APNs con Azure)
1. En Apple Developer:
   - Crear App ID con Push Notifications.
   - Generar APNs Auth Key (`.p8`) o certificado.
2. En Azure Notification Hub:
   - Configurar APNs con la key o certificado.
3. Reconstruir el build iOS.

### 2.4 Backend (Azure)
1. En la app, obtener el token nativo de FCM/APNs:
   - `Notifications.getDevicePushTokenAsync()`
2. Registrar el dispositivo en el backend:
   - `POST /api/machinery-alerts/device`
3. El backend registra la instalacion en Notification Hub con tags:
   - `user:{id}` y `platform:{ios|android}`
4. Envio de notificaciones:
   - Manual: `POST /api/machinery-alerts/send`
   - Automatico: Timer Trigger cada 10 minutos

Nota: Para Azure, se usan **tokens nativos** y Notification Hub gestiona el envio.

---

## 3) Diferencias clave

- **Expo Push**: mas rapido de implementar, menos control.
- **Azure Hub**: mas control, segmentacion y reglas avanzadas.
- **Ambos requieren FCM/APNs** en los dispositivos.

---

## 4) Siguiente paso recomendado

1. Terminar setup de Firebase (Android).
2. Validar token y envio con Expo Push.
3. Si se requiere integracion avanzada, migrar a Azure Hub.

