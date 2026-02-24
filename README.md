# 📱 Nutregam Mobile App

Aplicación móvil para Nutregam que permite a los usuarios de producción y ventas registrar información en tiempo real, sincronizándose con el sistema centralizado basado en Azure Functions.

## 📋 Tabla de Contenidos

1. [Información General](#información-general)
2. [Arquitectura de la Aplicación](#arquitectura-de-la-aplicación)
3. [Configuración Inicial](#configuración-inicial)
4. [Sistema de Autenticación](#sistema-de-autenticación)
5. [Sistema de Roles y Permisos](#sistema-de-roles-y-permisos)
6. [API Reference](#api-reference)
7. [Módulo de Ventas](#módulo-de-ventas)
8. [Módulo de Producción](#módulo-de-producción)
9. [Sistema de Diseño](#sistema-de-diseño)
10. [Componentes Reutilizables](#componentes-reutilizables)
11. [Navegación](#navegación)
12. [Manejo de Estado](#manejo-de-estado)
13. [Almacenamiento Local](#almacenamiento-local)
14. [Ejemplos de Integración](#ejemplos-de-integración)
15. [Mejores Prácticas](#mejores-prácticas)
16. [Testing](#testing)
17. [Deployment](#deployment)

---

## 1. Información General

### 🎯 Objetivo
Aplicación móvil para Nutregam que permite a los usuarios de producción y ventas registrar información en tiempo real, sincronizándose con el sistema centralizado basado en Azure Functions.

### Usuarios Objetivo
- **2 Usuarios de Producción (Operadores)**: Registro de producción diaria
- **Usuarios de Ventas (Vendedores)**: Gestión de ventas
- **Usuarios Provisionales**: Acceso limitado según permisos

### 🛠️ Stack Tecnológico
- **Framework**: React Native + Expo
- **Lenguaje**: TypeScript
- **Estado Global**: React Context API / Zustand
- **Navegación**: Expo Router
- **HTTP Client**: Axios
- **Almacenamiento**: AsyncStorage / SecureStore
- **UI Components**: React Native Paper / Custom Components
- **Validación**: Yup + Formik
- **Backend**: Azure Functions (REST API)

### 🎨 Diseño
- **Identidad Corporativa**: Verde #006A4E
- **Estilo**: Minimalista, profesional, colores mate
- **Responsive**: Optimizado para móviles (iOS y Android)

---

## 2. Arquitectura de la Aplicación

### Estructura de Carpetas

```
nubestock-mobile/
├── app/                          # Expo Router
│   ├── (tabs)/                   # Tabs navigation
│   │   ├── sales.tsx
│   │   ├── production.tsx
│   │   ├── profile.tsx
│   │   └── _layout.tsx
│   ├── login.tsx
│   └── _layout.tsx
├── src/
│   ├── api/                      # Configuración y llamadas API
│   │   ├── client.ts
│   │   ├── auth.api.ts
│   │   ├── sales.api.ts
│   │   ├── production.api.ts
│   │   ├── products.api.ts
│   │   ├── customers.api.ts
│   │   └── machinery.api.ts
│   ├── components/               # Componentes reutilizables
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Loading.tsx
│   ├── screens/                 # Pantallas de la app
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   ├── sales/
│   │   │   └── SalesListScreen.tsx
│   │   ├── production/
│   │   │   └── ProductionListScreen.tsx
│   │   └── shared/
│   │       └── ProfileScreen.tsx
│   ├── context/                 # Context API
│   │   └── AuthContext.tsx
│   ├── hooks/                   # Custom hooks
│   │   └── useAuth.ts
│   ├── types/                   # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── sales.types.ts
│   │   ├── production.types.ts
│   │   ├── product.types.ts
│   │   ├── customer.types.ts
│   │   └── machinery.types.ts
│   ├── utils/                   # Utilidades
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   ├── storage.ts
│   │   └── permissions.ts
│   ├── constants/               # Constantes
│   │   ├── colors.ts
│   │   ├── config.ts
│   │   └── permissions.ts
│   └── styles/                  # Estilos globales
│       ├── theme.ts
│       └── typography.ts
├── assets/                      # Recursos estáticos
├── app.config.js               # Configuración de Expo (con variables de entorno)
├── .env                        # Variables de entorno (no se sube al repo)
├── .env.example                # Plantilla de variables de entorno
├── package.json
└── tsconfig.json
```

---

## 3. Configuración Inicial

### Instalación de Dependencias

```bash
# Instalar dependencias
npm install

# Para desarrollo iOS
npm run ios

# Para desarrollo Android
npm run android

# Para desarrollo web
npm run web
```

### ⚙️ Configuración del Cliente API

La configuración del API se maneja mediante variables de entorno. 

#### Configurar Variables de Entorno

1. **Copiar el archivo de ejemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Editar el archivo `.env` con tus valores:**
   ```env
   # API Configuration
   API_URL=https://nutregam-api.azurewebsites.net/api
   API_TIMEOUT=30000
   
   # App Configuration
   APP_NAME=Nutregam
   APP_VERSION=1.0.0
   AUTO_REFRESH_INTERVAL=30000
   DEFAULT_PAGE_SIZE=20
   ```

3. **Para desarrollo local, ajusta `API_URL`:**
   ```env
   API_URL=http://localhost:7071/api
   ```

**Nota:** El archivo `.env` está en `.gitignore` y no se subirá al repositorio. Usa `.env.example` como plantilla.

---

## 4. Sistema de Autenticación

### Login

El sistema de autenticación utiliza:
- **SecureStore** para almacenar tokens de forma segura
- **AsyncStorage** para datos de usuario no sensibles
- **Context API** para estado global de autenticación

### Ejemplo de uso:

```typescript
import { useAuth } from '@/src/context/AuthContext';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // ...
};
```

---

## 5. Sistema de Roles y Permisos

### Roles Disponibles

- **Administrador**: Acceso completo
- **Vendedor**: Acceso a ventas y clientes
- **Operador**: Acceso a producción

### Verificación de Permisos

```typescript
import { canAccessSales, canAccessProduction } from '@/src/utils/permissions';

const { user } = useAuth();

if (canAccessSales(user)) {
  // Mostrar módulo de ventas
}
```

---

## 6. API Reference

### 📚 Swagger Documentation

**Backend Swagger URL**: `https://nutregam-api.azurewebsites.net/api/swagger/ui`

### Endpoints Disponibles

#### Autenticación
- `POST /auth/login` - Login de usuario
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/change-password` - Cambiar contraseña

#### Ventas
- `GET /sales` - Listar ventas
- `GET /sales/:id` - Detalle de venta
- `POST /sales` - Crear venta
- `PUT /sales/:id` - Actualizar venta
- `DELETE /sales/:id` - Eliminar venta

#### Producción
- `GET /production-reports` - Listar reportes
- `GET /production-reports/:id` - Detalle de reporte
- `POST /production-reports` - Crear reporte
- `PUT /production-reports/:id` - Actualizar reporte
- `DELETE /production-reports/:id` - Eliminar reporte

---

## 7. Módulo de Ventas

### Características
- Listado de ventas con paginación
- Crear nuevas ventas
- Ver detalles de ventas
- Filtros por estado de pago

### Pantallas
- `SalesListScreen` - Lista de ventas
- `CreateSaleScreen` - Crear venta (pendiente)
- `SaleDetailScreen` - Detalle de venta (pendiente)

---

## 8. Módulo de Producción

### Características
- Listado de reportes de producción
- Crear nuevos reportes
- Ver detalles de reportes
- Cálculo de eficiencia

### Pantallas
- `ProductionListScreen` - Lista de reportes
- `CreateProductionScreen` - Crear reporte (pendiente)
- `ProductionDetailScreen` - Detalle de reporte (pendiente)

---

## 9. Sistema de Diseño

### 🎨 Paleta de Colores

- **Primario**: `#006A4E` (Verde Nutregam)
- **Éxito**: `#10B981`
- **Advertencia**: `#F59E0B`
- **Error**: `#EF4444`
- **Info**: `#3B82F6`

Ver `src/constants/colors.ts` para la paleta completa.

---

## 10. Componentes Reutilizables

### Button
```typescript
<Button
  title="Guardar"
  onPress={handleSave}
  variant="primary"
  size="md"
  isLoading={false}
/>
```

### Input
```typescript
<Input
  label="Email"
  placeholder="tu@email.com"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  required
/>
```

### Card
```typescript
<Card>
  <Text>Contenido</Text>
</Card>
```

---

## 11. Navegación

La aplicación utiliza **Expo Router** para la navegación. Las rutas están protegidas según los permisos del usuario.

### Estructura de Navegación
- `/login` - Pantalla de login
- `/(tabs)/sales` - Módulo de ventas
- `/(tabs)/production` - Módulo de producción
- `/(tabs)/profile` - Perfil de usuario

---

## 12. Manejo de Estado

### Context API
- `AuthContext` - Estado de autenticación

### Zustand (Opcional)
Para estado más complejo, se puede usar Zustand. Ver `src/stores/` para ejemplos.

---

## 13. Almacenamiento Local

### SecureStore
- Tokens de autenticación

### AsyncStorage
- Datos de usuario
- Caché de datos

---

## 14. Ejemplos de Integración

### Crear una nueva venta

```typescript
import { salesAPI } from '@/src/api/sales.api';

const createSale = async () => {
  try {
    const sale = await salesAPI.createSale({
      id_customer: 1,
      sale_date: new Date().toISOString(),
      payment_status: 'pending',
      payment_method: 'cash',
      items: [
        { id_product: 1, quantity: 10, unit_price: 1000 }
      ]
    });
    console.log('Venta creada:', sale);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 15. Mejores Prácticas

### Checklist de Desarrollo

1. **Seguridad:**
   - Usar SecureStore para tokens
   - Validar inputs en cliente y servidor
   - Nunca almacenar contraseñas en texto plano

2. **Performance:**
   - Usar FlatList para listas largas
   - Implementar paginación
   - Lazy loading de componentes

3. **UX:**
   - Feedback visual en todas las acciones
   - Loading states
   - Error handling

4. **Código:**
   - TypeScript estricto
   - Componentes reutilizables
   - Separación de concerns

---

## 16. Testing

### 🧪 Testing con Jest

```bash
npm test
```

Ejemplo de test:
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '@/src/screens/auth/LoginScreen';

describe('LoginScreen', () => {
  it('should render correctly', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
  });
});
```

---

## 17. Deployment

### Build con EAS

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

---

## 🆘 Soporte y Contacto

Para dudas o problemas técnicos:
1. Consultar Swagger del backend
2. Revisar logs de la consola
3. Documentación de Expo/React Native

---

**Versión:** 1.0.0  
**Última actualización:** Enero 2026  
**Desarrollado para:** Nutregam - Sistema de Gestión de Producción y Ventas
