import { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import PriceLineChart from '../components/charts/PriceLineChart';
import { PRICE_HISTORY, formatCurrency, formatPercent } from '../data/mockData';

// Icon components
const ArrowUpIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
    </svg>
);

const ArrowDownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
    </svg>
);

// Metric Card Component
function MetricCard({ title, value, subtitle, showChange = true, change = 0 }) {
    const isPositive = change >= 0;

    return (
        <Card className="metric-card">
            <div className="card-title" style={{ marginBottom: '12px' }}>{title}</div>
            <div className="metric-value">{value}</div>
            {showChange && (
                <div className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    <span>{formatPercent(change)}</span>
                </div>
            )}
            {subtitle && <div className="metric-label">{subtitle}</div>}
        </Card>
    );
}

// Exchange Item Component
function ExchangeItem({ exchange }) {
    const colors = {
        binance: '#f3ba2f',
        airtm: '#28459a',   // AirTM Blue
        wallbit: '#18181b', // Wallbit Black
        takenos: '#22c55e', // Takenos Green
        bcb: '#1e3a8a',     // BCB Dark Blue
    };

    return (
        <div className="exchange-item">
            <div
                className="exchange-logo"
                style={{ backgroundColor: colors[exchange.exchange] || '#3b82f6' }}
            >
                {exchange.name.charAt(0)}
            </div>
            <div className="exchange-info">
                <div className="exchange-name">{exchange.name}</div>
                <div className="exchange-pair">USD/BOB</div>
            </div>
            <div className="exchange-price">
                <div className="exchange-price-value">
                    {formatCurrency(exchange.last)}
                </div>
                <div className="exchange-price-details">
                    <span className="text-success">Bid: {formatCurrency(exchange.bid)}</span>
                    <span className="text-danger">Ask: {formatCurrency(exchange.ask)}</span>
                </div>
            </div>
        </div>
    );
}

// Time period options
const TIME_PERIODS = [
    { key: '1h', label: '1H' },
    { key: '24h', label: '24H' },
    { key: '7d', label: '7D' },
    { key: '30d', label: '1M' },
    { key: '1y', label: '1Y' }
];

function Dashboard() {
    const [selectedPeriod, setSelectedPeriod] = useState('24h');
    const [currentData, setCurrentData] = useState({ prices: [], average: 0, source: 'Loading...' });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    const priceHistoryData = PRICE_HISTORY[selectedPeriod] || PRICE_HISTORY['24h'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/v1/prices/current');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setCurrentData({
                    prices: data.prices,
                    average: data.average,
                    source: data.source
                });
                setLastUpdate(new Date());
                setIsLoading(false);
                setError(null);
            } catch (err) {
                console.error("API Fetch Error:", err);
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchData();
        // Poll every 30 seconds (US1: auto-refresh)
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const { prices, average, source } = currentData;

    // Get the first (and only) exchange price for Bid/Ask display
    const primaryExchange = prices[0] || {};
    const spread = primaryExchange.bid && primaryExchange.ask
        ? Math.abs(primaryExchange.bid - primaryExchange.ask).toFixed(2)
        : '0.00';

    if (isLoading && prices.length === 0) {
        return <div className="main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    }

    return (
        <main className="main">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">
                        Real-time dollar price tracking
                        {error && <span style={{ color: 'var(--color-danger)', marginLeft: '10px' }}>(Offline Mode)</span>}
                        {lastUpdate && !error && (
                            <span style={{ marginLeft: '10px', opacity: 0.7 }}>
                                Last update: {lastUpdate.toLocaleTimeString()}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Metrics Grid - US1: Ver valor del dólar paralelo */}
            <div className="metrics-grid">
                <MetricCard
                    title="Current USD/BOB Price"
                    value={formatCurrency(average)}
                    showChange={false}
                    subtitle={source || "Average"}
                />
                <MetricCard
                    title="Best Bid (Sell USDT)"
                    value={formatCurrency(primaryExchange.bid || 0)}
                    showChange={false}
                    subtitle="Price to sell your USDT"
                />
                <MetricCard
                    title="Best Ask (Buy USDT)"
                    value={formatCurrency(primaryExchange.ask || 0)}
                    showChange={false}
                    subtitle="Price to buy USDT"
                />
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Left Column - Chart (US2: Ver gráficos históricos) */}
                <div>
                    <Card title="Price History"
                        subtitle="* Simulated data for demonstration"
                        action={
                            <div className="nav-tabs">
                                {TIME_PERIODS.map(period => (
                                    <button
                                        key={period.key}
                                        className={`nav-tab ${selectedPeriod === period.key ? 'active' : ''}`}
                                        onClick={() => setSelectedPeriod(period.key)}
                                    >
                                        {period.label}
                                    </button>
                                ))}
                            </div>
                        }>
                        <div style={{ minHeight: '300px' }}>
                            <PriceLineChart data={priceHistoryData} height={300} />
                        </div>
                    </Card>
                </div>

                {/* Right Column - Exchange Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                    {/* Exchange Prices */}
                    <Card title="Exchange Prices" subtitle={`Live data from ${source || 'Multipie Sources'}`}>
                        <div className="exchange-list">
                            {prices.map((exchange) => (
                                <ExchangeItem key={exchange.exchange + exchange.name} exchange={exchange} />
                            ))}
                        </div>
                    </Card>

                    {/* Price Details */}
                    <Card title="Price Details">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                                <span className="text-muted">Spread</span>
                                <span className="text-primary">{spread} BOB</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                                <span className="text-muted">Source</span>
                                <Badge variant="success">Binance P2P</Badge>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                <span className="text-muted">Auto-refresh</span>
                                <span>Every 30s</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
}

export default Dashboard;
