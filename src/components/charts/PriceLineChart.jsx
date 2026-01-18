import {
    AreaChart,
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
                minWidth: '150px'
            }}>
                <p className="text-sm text-secondary" style={{ marginBottom: '4px' }}>
                    {label}
                </p>
                <p className="text-lg font-semibold text-primary">
                    ${payload[0].value.toFixed(4)}
                </p>
                {payload[0].payload.volume && (
                    <p className="text-xs text-muted">
                        Vol: ${(payload[0].payload.volume / 1000).toFixed(1)}K
                    </p>
                )}
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
        name: new Date(point.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        }),
        price: point.close,
        volume: point.volume,
        index
    }));

    // Calculate min/max for Y axis domain
    const prices = data.map(d => d.close);
    const minPrice = Math.min(...prices) * 0.999;
    const maxPrice = Math.max(...prices) * 1.001;

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

                <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#priceGradient)"
                    animationDuration={1000}
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
