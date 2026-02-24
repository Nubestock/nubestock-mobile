const fs = require('fs');
const path = require('path');

require('dotenv').config();

const googleServicesFile = process.env.GOOGLE_SERVICES_JSON || './google-services.json';
const resolvedGoogleServicesFile = path.resolve(__dirname, googleServicesFile);

module.exports = {
  expo: {
    name: 'nubestock-mobile',
    slug: 'nubestock-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'nubestockmobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.nubestock.mobile',
      ...(fs.existsSync(resolvedGoogleServicesFile)
        ? { googleServicesFile }
        : {}),
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-notifications',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: 'be7fddbc-a563-4a79-9677-12c31300fae7',
      },
      apiUrl: process.env.API_URL || 'https://nutregam-api.azurewebsites.net/api',
      apiTimeout: process.env.API_TIMEOUT || '30000',
      appName: process.env.APP_NAME || 'Nutregam',
      appVersion: process.env.APP_VERSION || '1.0.0',
      autoRefreshInterval: process.env.AUTO_REFRESH_INTERVAL || '30000',
      defaultPageSize: process.env.DEFAULT_PAGE_SIZE || '20',
      adminDashboardUrl: process.env.ADMIN_DASHBOARD_URL || '',
    },
  },
};
