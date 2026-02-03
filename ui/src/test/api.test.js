import { describe, it, expect } from 'vitest';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

describe('API Configuration', () => {
  it('has a valid API_BASE_URL', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
  });

  it('has all required endpoints defined', () => {
    expect(API_ENDPOINTS.PRICES_CURRENT).toBeDefined();
    expect(API_ENDPOINTS.PRICES_HISTORY).toBeDefined();
    expect(API_ENDPOINTS.HEALTH).toBeDefined();
  });

  it('endpoints contain the base URL', () => {
    expect(API_ENDPOINTS.PRICES_CURRENT).toContain('/api/v1/prices/current');
    expect(API_ENDPOINTS.PRICES_HISTORY).toContain('/api/v1/prices/history');
    expect(API_ENDPOINTS.HEALTH).toContain('/health');
  });
});
