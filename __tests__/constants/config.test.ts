/**
 * Tests para src/constants/config.ts
 * Mockeamos expo-constants para controlar extra
 */
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      apiUrl: 'https://test-api.example.com/api',
      apiUrlCode: 'test-code',
      apiTimeout: '25000',
      appName: 'TestApp',
      appVersion: '2.0.0',
      autoRefreshInterval: '60000',
      defaultPageSize: '50',
      adminDashboardUrl: 'https://dashboard.test.com',
    },
  },
}));

import { API_CONFIG, APP_CONFIG } from '../../src/constants/config';

describe('config', () => {
  describe('API_CONFIG', () => {
    it('toma apiUrl del extra', () => {
      expect(API_CONFIG.BASE_URL).toBe('https://test-api.example.com/api');
    });

    it('toma apiUrlCode del extra', () => {
      expect(API_CONFIG.API_CODE).toBe('test-code');
    });

    it('parsea timeout como número', () => {
      expect(API_CONFIG.TIMEOUT).toBe(25000);
    });

    it('tiene headers por defecto', () => {
      expect(API_CONFIG.HEADERS['Content-Type']).toBe('application/json');
      expect(API_CONFIG.HEADERS['Accept']).toBe('application/json');
    });
  });

  describe('APP_CONFIG', () => {
    it('toma appName del extra', () => {
      expect(APP_CONFIG.APP_NAME).toBe('TestApp');
    });

    it('toma appVersion del extra', () => {
      expect(APP_CONFIG.VERSION).toBe('2.0.0');
    });

    it('parsea autoRefreshInterval como número', () => {
      expect(APP_CONFIG.AUTO_REFRESH_INTERVAL).toBe(60000);
    });

    it('parsea defaultPageSize como número', () => {
      expect(APP_CONFIG.DEFAULT_PAGE_SIZE).toBe(50);
    });
  });
});
