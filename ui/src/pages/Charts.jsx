import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import PriceLineChart from '../components/charts/PriceLineChart';
import { PRICE_HISTORY, formatCurrency, formatPercent } from '../data/mockData';

// Time period options (US2: filtros de tiempo)
const TIME_PERIODS = [
    { key: '1h', label: '1 Hora' },
    { key: '24h', label: '24 Horas' },
    { key: '7d', label: '7 Días' },
    { key: '30d', label: '30 Días' },
    { key: '1y', label: '1 Año' }
];

function Charts() {
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [currentData, setCurrentData] = useState({ prices: [], average: 0, source: 'Calculando...' });
    const [isLoading, setIsLoading] = useState(true);

    // Fetch real-time data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/v1/prices/current');
                if (response.ok) {
                    const data = await response.json();
                    setCurrentData({
                        prices: data.prices,
                        average: data.average,
                        bestBuy: data.best_buy,
                        bestSell: data.best_sell,
                        source: data.source
                    });
                }
                setIsLoading(false);
            } catch (err) {
                console.error("API Error:", err);
                setIsLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Price history data (mock - US2 shows historical trends)
    const priceHistoryData = PRICE_HISTORY[selectedPeriod] || PRICE_HISTORY['24h'];

    // Calculate statistics from historical data
    const allPrices = priceHistoryData.map(d => d.close);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;
    const avgHistorical = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
    const changePercent = ((allPrices[allPrices.length - 1] - allPrices[0]) / allPrices[0] * 100);

    // Determine volatility rating based on price range
    const getVolatilityRating = () => {
        const volatilityPercent = (priceRange / avgHistorical) * 100;
        if (volatilityPercent < 0.5) return { rating: 'LOW', variant: 'success' };
        if (volatilityPercent < 1.5) return { rating: 'MEDIUM', variant: 'warning' };
        return { rating: 'HIGH', variant: 'danger' };
    };
    const volatility = getVolatilityRating();

    // Get primary exchange for Bid/Ask display
    const primaryExchange = currentData.prices[0] || {};

    if (isLoading) {
        return <div className="main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    }

    return (
        <main className="main">
            {/* Page Header with Period Selector (US2: seleccionar rango de fechas) */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gráficos Históricos</h1>
                    <p className="page-subtitle">
                        Análisis de tendencias y variaciones en el tiempo
                    </p>
                </div>
                <div className="page-actions">
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
                </div>
            </div>

            {/* Stats Cards (US2: valores claros) */}
            <div className="metrics-grid">
                <Card className="metric-card">
                    <div className="card-title" style={{ marginBottom: '8px' }}>Precio Actual</div>
                    <div className="metric-value">{formatCurrency(currentData.average)}</div>
                    <div className="metric-label">USD/BOB en tiempo real</div>
                </Card>

                <Card className="metric-card">
                    <div className="card-title" style={{ marginBottom: '8px' }}>Máximo del Período</div>
                    <div className="metric-value text-success">{formatCurrency(maxPrice)}</div>
                    <div className="metric-label">{TIME_PERIODS.find(p => p.key === selectedPeriod)?.label}</div>
                </Card>

                <Card className="metric-card">
                    <div className="card-title" style={{ marginBottom: '8px' }}>Mínimo del Período</div>
                    <div className="metric-value text-danger">{formatCurrency(minPrice)}</div>
                    <div className="metric-label">{TIME_PERIODS.find(p => p.key === selectedPeriod)?.label}</div>
                </Card>

                <Card className="metric-card">
                    <div className="card-title" style={{ marginBottom: '8px' }}>Volatilidad</div>
                    <div className="metric-value">
                        <Badge variant={volatility.variant}>
                            {volatility.rating}
                        </Badge>
                    </div>
                    <div className="metric-label">Rango: ±{formatCurrency(priceRange)}</div>
                </Card>
            </div>

            {/* Main Chart - Full Width (US2: gráfico histórico) */}
            <Card
                title="Evolución del Precio"
                subtitle={`* Datos simulados para demostración - ${TIME_PERIODS.find(p => p.key === selectedPeriod)?.label}`}
            >
                <div style={{ minHeight: '400px' }}>
                    <PriceLineChart data={priceHistoryData} height={400} />
                </div>
            </Card>

            {/* Two Column Layout for Details */}
            <div className="dashboard-grid" style={{ marginTop: 'var(--spacing-xl)' }}>
                {/* Period Statistics */}
                <Card title="Estadísticas del Período">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                            <span className="text-muted">Cambio en el período</span>
                            <span className={changePercent >= 0 ? 'text-success' : 'text-danger'}>
                                {formatPercent(changePercent)}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                            <span className="text-muted">Promedio histórico</span>
                            <span>{formatCurrency(avgHistorical)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                            <span className="text-muted">Rango de variación</span>
                            <span>{formatCurrency(priceRange)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                            <span className="text-muted">Puntos de datos</span>
                            <span>{priceHistoryData.length}</span>
                        </div>
                    </div>
                </Card>

                {/* Current Market Details (US6: mostrar origen) */}
                <Card title="Detalles del Mercado" subtitle={`Datos en tiempo real de ${currentData.source || 'Múltiples Fuentes'}`}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, var(--color-success-light) 0%, transparent 100%)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '4px solid var(--color-success)'
                        }}>
                            <div className="text-sm text-muted">Precio de Compra (Bid)</div>
                            <div className="text-xl font-bold">{formatCurrency(primaryExchange.bid || 0)}</div>
                            <div className="text-xs text-muted">Precio al vender USDT → BOB</div>
                        </div>
                        <div style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, var(--color-danger-light) 0%, transparent 100%)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '4px solid var(--color-danger)'
                        }}>
                            <div className="text-sm text-muted">Precio de Venta (Ask)</div>
                            <div className="text-xl font-bold">{formatCurrency(primaryExchange.ask || 0)}</div>
                            <div className="text-xs text-muted">Precio al comprar USDT → BOB</div>
                        </div>
                        <div style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, var(--color-primary-light) 0%, transparent 100%)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '4px solid var(--color-primary)'
                        }}>
                            <div className="text-sm text-muted">Spread</div>
                            <div className="text-xl font-bold">
                                {formatCurrency(Math.abs((primaryExchange.bid || 0) - (primaryExchange.ask || 0)))}
                            </div>
                            <div className="text-xs text-muted">Diferencia Bid/Ask</div>
                        </div>
                    </div>
                </Card>
            </div>
        </main>
    );
}

export default Charts;
