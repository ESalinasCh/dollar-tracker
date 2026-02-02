import React from 'react';
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import PropTypes from 'prop-types';

// Custom tooltip component
function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="glass" style={{
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                minWidth: '180px'
            }}>
                <p className="text-sm text-secondary" style={{ marginBottom: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                        <span style={{ color: entry.color, fontSize: '0.8rem', marginRight: '6px' }}>●</span>
                        <span className="text-sm text-muted" style={{ marginRight: '8px' }}>
                            {entry.name === 'price' ? 'Paralelo' : entry.name}:
                        </span>
                        <span className="font-semibold" style={{ color: '#fff' }}>
                            ${entry.value.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.string,
};

/**
 * PriceLineChart Component
 * Displays price history as an area chart with gradient fill
 */
function PriceLineChart({ data, height = 300, showGrid = true }) {
    // Transform data for the chart
    const chartData = data.map((point, index) => ({
        name: new Date(point.timestamp).toLocaleTimeString('es-BO', {
            hour: '2-digit',
            minute: '2-digit'
        }),
        price: point.close,
        bcb_price: point.reference_close || null,
        volume: point.volume,
        index
    }));

    // Calculate min/max for Y axis domain (considering both lines)
    const prices = data.map(d => d.close);
    const bcbPrices = data.map(d => d.reference_close).filter(p => p !== null && p !== undefined);
    const allPrices = [...prices, ...bcbPrices];

    // Fallback if no data
    const minPrice = allPrices.length ? Math.min(...allPrices) * 0.999 : 0;
    const maxPrice = allPrices.length ? Math.max(...allPrices) * 1.001 : 10;

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>

                {showGrid && (
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                        vertical={false}
                    />
                )}

                <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                />

                <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[minPrice, maxPrice]}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                    width={60}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Main Price Area (Blue) */}
                <Area
                    type="monotone"
                    dataKey="price"
                    name="Promedio Paralelo"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#priceGradient)"
                    animationDuration={1000}
                />

                {/* BCB Reference Line (Red) */}
                <Area
                    type="monotone"
                    dataKey="bcb_price"
                    name="BCB (Oficial)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="none" // No fill for reference line
                    animationDuration={1000}
                    connectNulls={true}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

PriceLineChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        timestamp: PropTypes.string.isRequired,
        close: PropTypes.number.isRequired,
        volume: PropTypes.number,
    })).isRequired,
    height: PropTypes.number,
    showGrid: PropTypes.bool,
};

export default PriceLineChart;
