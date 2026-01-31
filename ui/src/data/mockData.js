// Mock data for Dollar Tracker application (US1-6 Scope)
// This file contains simulated data for development

export const EXCHANGES = [
  {
    id: 'binance',
    name: 'Binance P2P',
    logo: '/logos/binance.svg',
    color: '#f3ba2f'
  }
];

// Current prices mock data (US1)
export const CURRENT_PRICES = {
  timestamp: new Date().toISOString(),
  baseCurrency: 'USD',
  quoteCurrency: 'BOB',
  prices: [
    {
      exchange: 'binance',
      name: 'Binance P2P (USDT)',
      bid: 9.33,
      ask: 9.10,
      last: 9.21,
      change24h: 0.0,
      volume24h: null,
      updatedAt: new Date().toISOString()
    }
  ],
  average: 9.21,
  bestBuy: { exchange: 'binance', price: 9.33 },
  bestSell: { exchange: 'binance', price: 9.10 }
};

// Generate price history data points (US2)
function generatePriceHistory(days = 7, basePrice = 9.20) {
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
  '1h': generatePriceHistory(0.042, 9.20),
  '24h': generatePriceHistory(1, 9.15),
  '7d': generatePriceHistory(7, 9.10),
  '30d': generatePriceHistory(30, 9.00),
  '1y': generatePriceHistory(365, 8.50)
};

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
  formatCurrency,
  formatPercent,
  formatVolume
};
