// API Configuration
// Uses environment variable in production, falls back to localhost in development

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    PRICES_CURRENT: `${API_BASE_URL}/api/v1/prices/current`,
    PRICES_HISTORY: `${API_BASE_URL}/api/v1/prices/history`,
    STATS_VOLATILITY: `${API_BASE_URL}/api/v1/stats/volatility`,
    HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
