import React, { useState } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useNotifications, NOTIFICATION_TYPES } from '../context/NotificationContext';
import { REPORTS, CURRENT_PRICES, formatVolume } from '../data/mockData';

// Icons
const FileIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
);

// Report types
const REPORT_TYPES = [
    { value: 'daily', label: 'Daily Report' },
    { value: 'weekly', label: 'Weekly Report' },
    { value: 'monthly', label: 'Monthly Report' },
    { value: 'custom', label: 'Custom Range' }
];

// Format options
const FORMAT_OPTIONS = [
    { value: 'pdf', label: 'PDF Document', icon: '📄' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: '📊' },
    { value: 'csv', label: 'CSV File', icon: '📋' }
];

// Exchange options for filtering
const EXCHANGE_OPTIONS = [
    { value: 'all', label: 'All Exchanges' },
    { value: 'binance', label: 'Binance' },
    { value: 'kraken', label: 'Kraken' },
    { value: 'coinbase', label: 'Coinbase' },
    { value: 'bitso', label: 'Bitso' },
    { value: 'huobi', label: 'Huobi' }
];

function formatFileSize(bytes) {
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
    if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)} KB`;
    return `${bytes} B`;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Report History Item
function ReportItem({ report }) {
    const formatIcons = {
        pdf: '📄',
        excel: '📊',
        csv: '📋'
    };

    return (
        <div className="report-item" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg-tertiary)',
            transition: 'all 0.2s ease'
        }}>
            <div style={{ fontSize: '24px' }}>
                {formatIcons[report.format] || '📄'}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    {report.name}
                </div>
                <div className="text-sm text-secondary">
                    {report.dateRange.from === report.dateRange.to
                        ? formatDate(report.dateRange.from)
                        : `${formatDate(report.dateRange.from)} - ${formatDate(report.dateRange.to)}`
                    }
                </div>
            </div>
            <div className="text-sm text-muted" style={{ textAlign: 'right' }}>
                <div>{formatFileSize(report.size)}</div>
                <div>{report.format.toUpperCase()}</div>
            </div>
            <Badge variant={report.status === 'completed' ? 'success' : 'warning'}>
                {report.status}
            </Badge>
            <button className="btn btn-secondary" style={{ padding: '8px' }}>
                <DownloadIcon />
            </button>
        </div>
    );
}

function Reports() {
    const { showToast } = useNotifications();
    const [reports, setReports] = useState(REPORTS);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        type: 'weekly',
        format: 'pdf',
        exchanges: 'all',
        dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        includeCharts: true,
        includeSummary: true
    });

    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsGenerating(true);

        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newReport = {
            id: `report-${Date.now()}`,
            name: `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Report - ${formatDate(formData.dateTo)}`,
            dateRange: { from: formData.dateFrom, to: formData.dateTo },
            type: formData.type,
            format: formData.format,
            size: Math.floor(Math.random() * 2000000) + 100000,
            createdAt: new Date().toISOString(),
            status: 'completed'
        };

        setReports(prev => [newReport, ...prev]);
        setIsGenerating(false);

        showToast({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Report Generated',
            message: `Your ${formData.type} report is ready for download`
        });
    };

    // Calculate preview stats
    const { prices, average } = CURRENT_PRICES;
    const minPrice = Math.min(...prices.map(p => p.last));
    const maxPrice = Math.max(...prices.map(p => p.last));
    const totalVolume = prices.reduce((sum, p) => sum + p.volume24h, 0);

    return (
        <main className="main">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports</h1>
                    <p className="page-subtitle">
                        Generate and download price reports
                    </p>
                </div>
                <div className="page-actions">
                    <Badge variant="neutral" size="lg">
                        {reports.length} Reports
                    </Badge>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Left Column - Report Form */}
                <div>
                    <Card title="Generate New Report" subtitle="Configure your report parameters">
                        <form onSubmit={handleGenerate}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                {/* Report Type */}
                                <div className="form-group">
                                    <label className="form-label">Report Type</label>
                                    <select
                                        className="input"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        {REPORT_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Range */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <CalendarIcon /> From Date
                                        </label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={formData.dateFrom}
                                            onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <CalendarIcon /> To Date
                                        </label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={formData.dateTo}
                                            onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Exchange Filter */}
                                <div className="form-group">
                                    <label className="form-label">Exchanges</label>
                                    <select
                                        className="input"
                                        value={formData.exchanges}
                                        onChange={(e) => setFormData({ ...formData, exchanges: e.target.value })}
                                    >
                                        {EXCHANGE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Format Selection */}
                                <div className="form-group">
                                    <label className="form-label">Export Format</label>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                        {FORMAT_OPTIONS.map(format => (
                                            <button
                                                key={format.value}
                                                type="button"
                                                className={`btn ${formData.format === format.value ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => setFormData({ ...formData, format: format.value })}
                                                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--spacing-md)' }}
                                            >
                                                <span style={{ fontSize: '20px', marginBottom: '4px' }}>{format.icon}</span>
                                                <span style={{ fontSize: '12px' }}>{format.value.toUpperCase()}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="form-group">
                                    <label className="form-label">Include in Report</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.includeCharts}
                                                onChange={(e) => setFormData({ ...formData, includeCharts: e.target.checked })}
                                            />
                                            <span>Price charts and visualizations</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.includeSummary}
                                                onChange={(e) => setFormData({ ...formData, includeSummary: e.target.checked })}
                                            />
                                            <span>Statistical summary</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={isGenerating}
                                    style={{ width: '100%' }}
                                >
                                    {isGenerating ? (
                                        <>
                                            <RefreshIcon /> Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FileIcon /> Generate Report
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Right Column - Preview & History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                    {/* Preview */}
                    <Card title="Report Preview" subtitle="Data that will be included">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
                            <div className="metric-card" style={{ padding: 'var(--spacing-md)' }}>
                                <div className="text-sm text-secondary">Average Price</div>
                                <div className="text-xl font-bold text-primary">${average.toFixed(4)}</div>
                            </div>
                            <div className="metric-card" style={{ padding: 'var(--spacing-md)' }}>
                                <div className="text-sm text-secondary">Price Range</div>
                                <div className="text-xl font-bold">${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}</div>
                            </div>
                            <div className="metric-card" style={{ padding: 'var(--spacing-md)' }}>
                                <div className="text-sm text-secondary">Total Volume</div>
                                <div className="text-xl font-bold">{formatVolume(totalVolume)}</div>
                            </div>
                            <div className="metric-card" style={{ padding: 'var(--spacing-md)' }}>
                                <div className="text-sm text-secondary">Exchanges</div>
                                <div className="text-xl font-bold">{prices.length}</div>
                            </div>
                        </div>
                    </Card>

                    {/* Report History */}
                    <Card title="Report History" subtitle="Previously generated reports">
                        {reports.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>📋</div>
                                <div>No reports generated yet</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {reports.map(report => (
                                    <ReportItem key={report.id} report={report} />
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </main>
    );
}

export default Reports;
