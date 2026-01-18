import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import PropTypes from 'prop-types';

// Exchange colors
const EXCHANGE_COLORS = {
    binance: '#f3ba2f',
    kraken: '#5741d9',
    coinbase: '#0052ff',
    bitso: '#00c389',
    huobi: '#1c2e5a'
};

// Custom tooltip
function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="glass" style={{
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                minWidth: '140px'
            }}>
                <p className="text-sm font-medium text-primary" style={{ marginBottom: '4px' }}>
                    {data.name}
                </p>
                <p className="text-lg font-bold" style={{ color: data.color }}>
                    ${data.price.toFixed(4)}
                </p>
                <p className={`text-xs ${data.change >= 0 ? 'text-success' : 'text-danger'}`}>
                    {data.change >= 0 ? '↑' : '↓'} {Math.abs(data.change).toFixed(2)}%
                </p>
            </div>
        );
    }
    return null;
}

CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
};

/**
 * ExchangeComparison Component
 * Bar chart comparing prices across different exchanges
 */
function ExchangeComparison({ data, height = 250 }) {
    // Transform data for chart
    const chartData = data.map(exchange => ({
        name: exchange.name,
        price: exchange.last,
        change: exchange.change24h,
        color: EXCHANGE_COLORS[exchange.exchange] || '#3b82f6'
    }));

    // Calculate domain
    const prices = data.map(d => d.last);
    const minPrice = Math.min(...prices) * 0.998;
    const maxPrice = Math.max(...prices) * 1.002;

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                barSize={40}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                    vertical={false}
                />

                <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
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

                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />

                <Bar
                    dataKey="price"
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

ExchangeComparison.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        exchange: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        last: PropTypes.number.isRequired,
        change24h: PropTypes.number.isRequired,
    })).isRequired,
    height: PropTypes.number,
};

export default ExchangeComparison;
