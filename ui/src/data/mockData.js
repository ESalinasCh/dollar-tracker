// Mock data for Dollar Tracker application
// This file contains simulated data for development

export const EXCHANGES = [
  {
    id: 'binance',
    name: 'Binance',
    logo: '/logos/binance.svg',
    color: '#f3ba2f'
  },
  {
    id: 'kraken',
    name: 'Kraken',
    logo: '/logos/kraken.svg',
    color: '#5741d9'
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    logo: '/logos/coinbase.svg',
    color: '#0052ff'
  },
  {
    id: 'bitso',
    name: 'Bitso',
    logo: '/logos/bitso.svg',
    color: '#00c389'
  },
  {
    id: 'huobi',
    name: 'Huobi',
    logo: '/logos/huobi.svg',
    color: '#1c2e5a'
  }
];

// Current prices mock data
export const CURRENT_PRICES = {
  timestamp: new Date().toISOString(),
  baseCurrency: 'USD',
  quoteCurrency: 'BOB',
  prices: [
    {
      exchange: 'binance',
      name: 'Binance',
      bid: 6.95,
      ask: 6.98,
      last: 6.97,
      change24h: 0.42,
      volume24h: 1250000,
      updatedAt: new Date().toISOString()
    },
    {
      exchange: 'kraken',
      name: 'Kraken',
      bid: 6.94,
      ask: 6.97,
      last: 6.96,
      change24h: 0.35,
      volume24h: 890000,
      updatedAt: new Date().toISOString()
    },
    {
      exchange: 'coinbase',
      name: 'Coinbase',
      bid: 6.96,
      ask: 6.99,
      last: 6.98,
      change24h: 0.50,
      volume24h: 1100000,
      updatedAt: new Date().toISOString()
    },
    {
      exchange: 'bitso',
      name: 'Bitso',
      bid: 6.93,
      ask: 6.96,
      last: 6.95,
      change24h: 0.28,
      volume24h: 450000,
      updatedAt: new Date().toISOString()
    },
    {
      exchange: 'huobi',
      name: 'Huobi',
      bid: 6.95,
      ask: 6.98,
      last: 6.97,
      change24h: 0.42,
      volume24h: 680000,
      updatedAt: new Date().toISOString()
    }
  ],
  average: 6.966,
  bestBuy: { exchange: 'bitso', price: 6.93 },
  bestSell: { exchange: 'coinbase', price: 6.99 }
};

// Generate price history data points
function generatePriceHistory(days = 7, basePrice = 6.95) {
  const dataPoints = [];
  const now = new Date();
  const pointsPerDay = 24; // hourly data
  
  for (let i = days * pointsPerDay; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const volatility = 0.02;
    const randomChange = (Math.random() - 0.5) * volatility;
    const open = basePrice + randomChange;
    const close = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * 0.01;
    const low = Math.min(open, close) - Math.random() * 0.01;
    
    dataPoints.push({
      timestamp: timestamp.toISOString(),
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
      volume: Math.floor(Math.random() * 100000) + 50000
    });
    
    basePrice = close;
  }
  
  return dataPoints;
}

export const PRICE_HISTORY = {
  '1h': generatePriceHistory(0.042, 6.95), // ~1 hour
  '24h': generatePriceHistory(1, 6.90),
  '7d': generatePriceHistory(7, 6.85),
  '30d': generatePriceHistory(30, 6.70),
  '1y': generatePriceHistory(365, 6.50)
};

// Volatility data
export const VOLATILITY = {
  period: '24h',
  volatility: 0.8,
  rating: 'low', // low, medium, high
  standardDeviation: 0.023,
  range: {
    min: 6.90,
    max: 6.99
  }
};

// Sample alerts
export const ALERTS = [
  {
    id: 'alert-001',
    type: 'price_above',
    threshold: 7.00,
    exchange: 'all',
    enabled: true,
    createdAt: '2026-01-15T10:00:00Z',
    triggeredAt: null
  },
  {
    id: 'alert-002',
    type: 'price_below',
    threshold: 6.90,
    exchange: 'all',
    enabled: true,
    createdAt: '2026-01-15T10:30:00Z',
    triggeredAt: null
  },
  {
    id: 'alert-003',
    type: 'percent_change',
    threshold: 1.0,
    exchange: 'binance',
    enabled: false,
    createdAt: '2026-01-16T08:00:00Z',
    triggeredAt: '2026-01-16T14:30:00Z'
  }
];

// Sample reports
export const REPORTS = [
  {
    id: 'report-001',
    name: 'Weekly Report - Jan 10-17',
    dateRange: { from: '2026-01-10', to: '2026-01-17' },
    type: 'weekly',
    format: 'pdf',
    size: 1200000,
    createdAt: '2026-01-17T08:00:00Z',
    status: 'completed'
  },
  {
    id: 'report-002',
    name: 'Daily Report - Jan 16',
    dateRange: { from: '2026-01-16', to: '2026-01-16' },
    type: 'daily',
    format: 'excel',
    size: 450000,
    createdAt: '2026-01-16T23:00:00Z',
    status: 'completed'
  }
];

// Helper function to format currency
export function formatCurrency(value, decimals = 2) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

// Helper function to format percentage
export function formatPercent(value) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

// Helper function to format volume
export function formatVolume(value) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value}`;
}

export default {
  EXCHANGES,
  CURRENT_PRICES,
  PRICE_HISTORY,
  VOLATILITY,
  ALERTS,
  REPORTS,
  formatCurrency,
  formatPercent,
  formatVolume
};
