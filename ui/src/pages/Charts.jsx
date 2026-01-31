import React, { useState } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import PriceLineChart from '../components/charts/PriceLineChart';
import ExchangeComparison from '../components/charts/ExchangeComparison';
import { CURRENT_PRICES, PRICE_HISTORY, VOLATILITY, formatCurrency, formatPercent } from '../data/mockData';

// Time period options
const TIME_PERIODS = [
    { key: '1h', label: '1 Hour' },
    { key: '24h', label: '24 Hours' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '1y', label: '1 Year' }
];

function Charts() {
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const { prices, average } = CURRENT_PRICES;
    const priceHistoryData = PRICE_HISTORY[selectedPeriod] || PRICE_HISTORY['24h'];

    // Calculate price range
    const allPrices = priceHistoryData.map(d => d.close);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;

    return (
        <main className="main">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Charts & Analytics</h1>
                    <p className="page-subtitle">
                        Detailed price analysis and exchange comparisons
                    </p>
                </div>
                <div className="page-actions">
                    <select
                        className="input"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        style={{ minWidth: '150px' }}
                    >
                        {TIME_PERIODS.map(period => (
                            <option key={period.key} value={period.key}>
                                {period.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="metrics-grid">
                <Card className="metric-card">
                    <div className="card-title" style={{ marginBottom: '8px' }}>Current Price</div>
                    <div className="metric-value">{formatCurrency(average)}</div>
                    <div className="metric-label">USD/BOB Average</div>
                </Card>

                <Card className="metric-card">
                    <div className="card-title" style={{ marginBottom: '8px' }}>Period High</div>
                    <div className="metric-value text-success">{formatCurrency(maxPrice)}</div>
                    <div className="metric-label">Maximum price</div>
                </Card>

                <Card className="metric-card">
                    <div className="card-title" style={{ marginBottom: '8px' }}>Period Low</div>
                    <div className="metric-value text-danger">{formatCurrency(minPrice)}</div>
                    <div className="metric-label">Minimum price</div>
                </Card>

                <Card className="metric-card">
                    <div className="card-title" style={{ marginBottom: '8px' }}>Volatility</div>
                    <div className="metric-value">
                        <Badge variant={VOLATILITY.rating === 'low' ? 'success' : VOLATILITY.rating === 'medium' ? 'warning' : 'danger'}>
                            {VOLATILITY.rating.toUpperCase()}
                        </Badge>
                    </div>
                    <div className="metric-label">±{priceRange.toFixed(4)} range</div>
                </Card>
            </div>

            {/* Two Column Layout */}
            <div className="dashboard-grid">
                {/* Left Column - Main Charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                    {/* Main Price Chart */}
                    <Card title="Price History" subtitle={`Showing data for ${TIME_PERIODS.find(p => p.key === selectedPeriod)?.label}`}>
                        <div style={{ minHeight: '400px' }}>
                            <PriceLineChart data={priceHistoryData} height={400} />
                        </div>
                    </Card>

                    {/* Exchange Comparison */}
                    <Card title="Exchange Comparison" subtitle="Current prices across different exchanges">
                        <ExchangeComparison data={prices} height={300} />
                    </Card>
                </div>

                {/* Right Column - Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                    {/* Quick Insights */}
                    <Card title="Quick Insights" subtitle="Market overview">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--color-success-light)',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: '4px solid var(--color-success)'
                            }}>
                                <div className="text-sm text-secondary">Best Buy Price</div>
                                <div className="text-xl font-bold text-success">{formatCurrency(CURRENT_PRICES.bestBuy.price)}</div>
                                <div className="text-xs text-muted">{CURRENT_PRICES.bestBuy.exchange}</div>
                            </div>
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--color-danger-light)',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: '4px solid var(--color-danger)'
                            }}>
                                <div className="text-sm text-secondary">Best Sell Price</div>
                                <div className="text-xl font-bold text-danger">{formatCurrency(CURRENT_PRICES.bestSell.price)}</div>
                                <div className="text-xs text-muted">{CURRENT_PRICES.bestSell.exchange}</div>
                            </div>
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--color-warning-light)',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: '4px solid var(--color-warning)'
                            }}>
                                <div className="text-sm text-secondary">Arbitrage Spread</div>
                                <div className="text-xl font-bold text-warning">
                                    {formatCurrency(CURRENT_PRICES.bestSell.price - CURRENT_PRICES.bestBuy.price)}
                                </div>
                                <div className="text-xs text-muted">Potential profit per unit</div>
                            </div>
                        </div>
                    </Card>

                    {/* Exchange Details */}
                    <Card title="Exchange Details" subtitle="Detailed breakdown by exchange">
                        <div className="exchange-list">
                            {prices.map(exchange => (
                                <div key={exchange.exchange} className="exchange-item" style={{ padding: '12px' }}>
                                    <div className="exchange-info" style={{ flex: 1 }}>
                                        <div className="exchange-name">{exchange.name}</div>
                                        <div className="text-xs text-muted">
                                            Bid: {formatCurrency(exchange.bid)} / Ask: {formatCurrency(exchange.ask)}
                                        </div>
                                    </div>
                                    <div className="exchange-price">
                                        <div className="exchange-price-value">
                                            {formatCurrency(exchange.last)}
                                        </div>
                                        <Badge variant={exchange.change24h >= 0 ? 'success' : 'danger'} size="sm">
                                            {formatPercent(exchange.change24h)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
}

export default Charts;
