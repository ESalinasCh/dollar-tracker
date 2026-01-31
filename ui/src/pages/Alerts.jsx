import { useState } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { ALERTS, CURRENT_PRICES } from '../data/mockData';

// Icons
const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

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

// Alert type options
const ALERT_TYPES = [
    { value: 'price_above', label: 'Price Above' },
    { value: 'price_below', label: 'Price Below' },
    { value: 'percent_change', label: '% Change' }
];

// Exchange options
const EXCHANGE_OPTIONS = [
    { value: 'all', label: 'All Exchanges' },
    { value: 'binance', label: 'Binance' },
    { value: 'kraken', label: 'Kraken' },
    { value: 'coinbase', label: 'Coinbase' },
    { value: 'bitso', label: 'Bitso' },
    { value: 'huobi', label: 'Huobi' }
];

// Alert Item Component
function AlertItem({ alert, onToggle, onDelete }) {
    const isUp = alert.type === 'price_above';
    const isPercent = alert.type === 'percent_change';

    return (
        <div className="alert-item" style={{
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)'
        }}>
            <div className={`alert-icon ${isUp ? 'up' : 'down'}`}>
                {isUp ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {isPercent ? `${alert.threshold}% Change` : `USD ${isUp ? '>' : '<'} ${alert.threshold.toFixed(2)}`}
                </div>
                <div className="text-sm text-secondary">
                    {alert.exchange === 'all' ? 'All exchanges' : alert.exchange}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <Badge
                    variant={alert.enabled ? 'success' : 'neutral'}
                    withDot
                    animated={alert.enabled}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onToggle(alert.id)}
                >
                    {alert.enabled ? 'Active' : 'Paused'}
                </Badge>
                <button
                    className="btn btn-ghost"
                    onClick={() => onDelete(alert.id)}
                    style={{ padding: '8px', color: 'var(--color-danger)' }}
                >
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
}

function Alerts() {
    const [alerts, setAlerts] = useState(ALERTS);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'price_above',
        threshold: CURRENT_PRICES.average,
        exchange: 'all'
    });

    const handleToggle = (id) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
        ));
    };

    const handleDelete = (id) => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newAlert = {
            id: `alert-${Date.now()}`,
            type: formData.type,
            threshold: parseFloat(formData.threshold),
            exchange: formData.exchange,
            enabled: true,
            createdAt: new Date().toISOString(),
            triggeredAt: null
        };
        setAlerts(prev => [newAlert, ...prev]);
        setShowForm(false);
        setFormData({
            type: 'price_above',
            threshold: CURRENT_PRICES.average,
            exchange: 'all'
        });
    };

    const activeCount = alerts.filter(a => a.enabled).length;
    const pausedCount = alerts.filter(a => !a.enabled).length;
    const priceAboveCount = alerts.filter(a => a.type === 'price_above').length;
    const priceBelowCount = alerts.filter(a => a.type === 'price_below').length;

    return (
        <main className="main">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Price Alerts</h1>
                    <p className="page-subtitle">
                        Get notified when prices reach your target
                    </p>
                </div>
                <div className="page-actions">
                    <Badge variant="primary" size="lg">
                        {activeCount} Active
                    </Badge>
                    <Button variant="primary" onClick={() => setShowForm(!showForm)}>
                        <BellIcon />
                        {showForm ? 'Cancel' : 'New Alert'}
                    </Button>
                </div>
            </div>

            {/* Alert Form */}
            {showForm && (
                <Card title="Create New Alert" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-lg)' }}>
                            <div className="form-group">
                                <label className="form-label">Alert Type</label>
                                <select
                                    className="input"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    {ALERT_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    {formData.type === 'percent_change' ? 'Percentage' : 'Target Price (USD)'}
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.threshold}
                                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                                    step={formData.type === 'percent_change' ? '0.1' : '0.01'}
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Exchange</label>
                                <select
                                    className="input"
                                    value={formData.exchange}
                                    onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                                >
                                    {EXCHANGE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                Create Alert
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Two Column Layout */}
            <div className="dashboard-grid">
                {/* Left Column - Alerts List */}
                <div>
                    <Card title="Your Alerts" subtitle={`${alerts.length} total alerts configured`}>
                        {alerts.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: 'var(--spacing-2xl)',
                                color: 'var(--color-text-muted)'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>🔔</div>
                                <div>No alerts configured yet</div>
                                <div className="text-sm" style={{ marginTop: '8px' }}>
                                    Click "New Alert" to create your first price alert
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {alerts.map(alert => (
                                    <AlertItem
                                        key={alert.id}
                                        alert={alert}
                                        onToggle={handleToggle}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column - Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                    {/* Current Price Reference */}
                    <Card title="Current Price" subtitle="Use as reference for alerts">
                        <div style={{
                            padding: 'var(--spacing-lg)',
                            background: 'var(--color-accent-light)',
                            borderRadius: 'var(--radius-md)',
                            textAlign: 'center'
                        }}>
                            <div className="text-3xl font-bold text-accent" style={{ marginBottom: 'var(--spacing-xs)' }}>
                                ${CURRENT_PRICES.average.toFixed(4)}
                            </div>
                            <div className="text-sm text-secondary">USD/BOB Average</div>
                        </div>
                    </Card>

                    {/* Alert Statistics */}
                    <Card title="Alert Statistics" subtitle="Overview of your alerts">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--spacing-sm) 0',
                                borderBottom: '1px solid var(--color-border)'
                            }}>
                                <span className="text-secondary">Total Alerts</span>
                                <span className="font-bold">{alerts.length}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--spacing-sm) 0',
                                borderBottom: '1px solid var(--color-border)'
                            }}>
                                <span className="text-secondary">Active</span>
                                <Badge variant="success">{activeCount}</Badge>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--spacing-sm) 0',
                                borderBottom: '1px solid var(--color-border)'
                            }}>
                                <span className="text-secondary">Paused</span>
                                <Badge variant="neutral">{pausedCount}</Badge>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--spacing-sm) 0',
                                borderBottom: '1px solid var(--color-border)'
                            }}>
                                <span className="text-secondary">Price Above</span>
                                <span className="font-medium text-success">{priceAboveCount}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--spacing-sm) 0'
                            }}>
                                <span className="text-secondary">Price Below</span>
                                <span className="font-medium text-danger">{priceBelowCount}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Tips */}
                    <Card title="Quick Tips" subtitle="How to use alerts">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--color-success)' }}>↑</span>
                                <div>
                                    <div className="font-medium">Price Above</div>
                                    <div className="text-sm text-muted">Get notified when USD rises above your target</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--color-danger)' }}>↓</span>
                                <div>
                                    <div className="font-medium">Price Below</div>
                                    <div className="text-sm text-muted">Get notified when USD drops below your target</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--color-warning)' }}>%</span>
                                <div>
                                    <div className="font-medium">Percent Change</div>
                                    <div className="text-sm text-muted">Get notified on significant price movements</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
}

export default Alerts;
