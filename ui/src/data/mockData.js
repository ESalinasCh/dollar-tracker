// Utility functions for Dollar Tracker application
// Historical price data now comes from the API

// Helper function to format currency
export function formatCurrency(value, decimals = 2) {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
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
  formatCurrency,
  formatPercent
};
