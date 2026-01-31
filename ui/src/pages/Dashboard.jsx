import { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import PriceLineChart from '../components/charts/PriceLineChart';
import { PRICE_HISTORY, ALERTS, formatCurrency, formatPercent, formatVolume } from '../data/mockData';

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

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

// Metric Card Component
function MetricCard({ title, value, change, subtitle }) {
    const isPositive = change >= 0;

    return (
        <Card className="metric-card">
            <div className="card-title" style={{ marginBottom: '12px' }}>{title}</div>
            <div className="metric-value">{value}</div>
            <div className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                <span>{formatPercent(change)}</span>
            </div>
            {subtitle && <div className="metric-label">{subtitle}</div>}
        </Card>
    );
}

// Exchange Item Component
function ExchangeItem({ exchange }) {
    const isPositive = exchange.change_24h >= 0;
    const colors = {
        binance: '#f3ba2f',
        kraken: '#5741d9',
        coinbase: '#0052ff',
        bitso: '#00c389',
        huobi: '#1c2e5a',
        exchangerate_api: '#2c3e50',
        dolarapi: '#27ae60',
        bluelytics: '#2980b9',
        dolarapi_binance: '#f3ba2f',
        dolarapi_oficial: '#2c3e50'
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
                <div className={`exchange-price-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '↑' : '↓'} {formatPercent(exchange.change_24h || 0)}
                </div>
            </div>
        </div>
    );
}

// Alert Item Component  
function AlertItem({ alert }) {
    const isUp = alert.type === 'price_above';

    return (
        <div className="alert-item">
            <div className={`alert-icon ${isUp ? 'up' : 'down'}`}>
                {isUp ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </div>
            <div className="alert-info">
                <div className="alert-condition">
                    USD {isUp ? '>' : '<'} {alert.threshold.toFixed(2)}
                </div>
                <div className="alert-exchange">
                    {alert.exchange === 'all' ? 'All exchanges' : alert.exchange}
                </div>
            </div>
            <Badge
                variant={alert.enabled ? 'success' : 'neutral'}
                withDot
                animated={alert.enabled}
            >
                {alert.enabled ? 'Active' : 'Paused'}
            </Badge>
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
    const [currentData, setCurrentData] = useState({ prices: [], average: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const priceHistoryData = PRICE_HISTORY[selectedPeriod] || PRICE_HISTORY['24h'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/v1/prices/current');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setCurrentData({
                    prices: data.prices,
                    average: data.average
                });
                setIsLoading(false);
            } catch (err) {
                console.error("API Fetch Error:", err);
                // Fallback to mock data on error? Or show error state
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchData();
        // Poll every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const { prices, average } = currentData;

    // Calculate total volume (if available)
    const totalVolume = prices.reduce((sum, p) => sum + (p.volume_24h || 0), 0);

    // Calculate average change
    const avgChange = prices.length > 0
        ? prices.reduce((sum, p) => sum + (p.change_24h || 0), 0) / prices.length
        : 0;

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
                        Real-time dollar price tracking across exchanges
                        {error && <span style={{ color: 'red', marginLeft: '10px' }}>(Offline Mode)</span>}
                    </p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-secondary">
                        Export
                    </button>
                    <button className="btn btn-primary">
                        <PlusIcon /> Add Alert
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="metrics-grid">
                <MetricCard
                    title="Current USD/BOB Price"
                    value={formatCurrency(average)}
                    change={avgChange}
                    subtitle="Average across exchanges"
                />
                <MetricCard
                    title="24h Change"
                    value={formatPercent(avgChange)}
                    change={avgChange}
                    subtitle="From yesterday"
                />
                <MetricCard
                    title="24h Volume"
                    value={formatVolume(totalVolume)}
                    change={0}
                    subtitle="Total trading volume"
                />
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Left Column - Chart */}
                <div>
                    <Card title="Price History" action={
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

                {/* Right Column - Exchanges & Alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                    {/* Exchanges */}
                    <Card title="Exchange Prices">
                        <div className="exchange-list">
                            {prices.map((exchange) => (
                                <ExchangeItem key={exchange.exchange + exchange.name} exchange={exchange} />
                            ))}
                        </div>
                    </Card>

                    {/* Alerts */}
                    <Card
                        title="Active Alerts"
                        action={<Badge variant="primary">{ALERTS.filter(a => a.enabled).length} Active</Badge>}
                    >
                        <div className="alerts-panel">
                            {ALERTS.slice(0, 3).map((alert) => (
                                <AlertItem key={alert.id} alert={alert} />
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
}

export default Dashboard;
