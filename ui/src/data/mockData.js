// Mock data for Dollar Tracker application
// This file contains simulated historical data for development
// Real-time price data comes from the API

export const EXCHANGES = [
  {
    id: 'binance',
    name: 'Binance',
    logo: '/logos/binance.svg',
    color: '#f3ba2f'
  }
];

// Generate price history data points (simulated for US2)
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

// Historical price data (US2: Ver gráficos históricos)
export const PRICE_HISTORY = {
  '1h': generatePriceHistory(0.042, 6.95), // ~1 hour
  '24h': generatePriceHistory(1, 6.90),
  '7d': generatePriceHistory(7, 6.85),
  '30d': generatePriceHistory(30, 6.70),
  '1y': generatePriceHistory(365, 6.50)
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

export default {
  EXCHANGES,
  PRICE_HISTORY,
  formatCurrency,
  formatPercent
};
