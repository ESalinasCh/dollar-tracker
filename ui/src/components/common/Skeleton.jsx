import PropTypes from 'prop-types';

/**
 * Skeleton loading component for placeholder content
 */
function Skeleton({
    variant = 'text',
    width,
    height,
    className = '',
    count = 1,
    style = {}
}) {
    const baseStyle = {
        backgroundColor: 'var(--color-bg-hover)',
        borderRadius: variant === 'circle' ? '50%' : 'var(--radius-sm)',
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        ...style
    };

    const variants = {
        text: {
            height: height || '16px',
            width: width || '100%'
        },
        title: {
            height: height || '24px',
            width: width || '60%'
        },
        circle: {
            width: width || '40px',
            height: height || '40px'
        },
        rect: {
            width: width || '100%',
            height: height || '100px'
        },
        chart: {
            width: width || '100%',
            height: height || '300px'
        },
        card: {
            width: width || '100%',
            height: height || '120px'
        }
    };

    const variantStyle = variants[variant] || variants.text;

    if (count > 1) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className={`skeleton ${className}`}
                        style={{ ...baseStyle, ...variantStyle }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={`skeleton ${className}`}
            style={{ ...baseStyle, ...variantStyle }}
        />
    );
}

Skeleton.propTypes = {
    variant: PropTypes.oneOf(['text', 'title', 'circle', 'rect', 'chart', 'card']),
    width: PropTypes.string,
    height: PropTypes.string,
    className: PropTypes.string,
    count: PropTypes.number,
    style: PropTypes.object
};

/**
 * Card skeleton for loading states
 */
function CardSkeleton({ hasHeader = true, lines = 3 }) {
    return (
        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
            {hasHeader && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <Skeleton variant="title" width="40%" />
                </div>
            )}
            <Skeleton variant="text" count={lines} />
        </div>
    );
}

CardSkeleton.propTypes = {
    hasHeader: PropTypes.bool,
    lines: PropTypes.number
};

/**
 * Chart skeleton for loading states
 */
function ChartSkeleton({ height = '300px' }) {
    return (
        <div style={{ position: 'relative' }}>
            <Skeleton variant="chart" height={height} />
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'var(--color-text-muted)',
                fontSize: '14px'
            }}>
                Loading chart...
            </div>
        </div>
    );
}

ChartSkeleton.propTypes = {
    height: PropTypes.string
};

/**
 * List skeleton for loading states
 */
function ListSkeleton({ items = 5, hasAvatar = false }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                    {hasAvatar && <Skeleton variant="circle" />}
                    <div style={{ flex: 1 }}>
                        <Skeleton variant="text" width="70%" style={{ marginBottom: '8px' }} />
                        <Skeleton variant="text" width="40%" height="12px" />
                    </div>
                </div>
            ))}
        </div>
    );
}

ListSkeleton.propTypes = {
    items: PropTypes.number,
    hasAvatar: PropTypes.bool
};

/**
 * Metrics grid skeleton
 */
function MetricsSkeleton({ count = 3 }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${count}, 1fr)`,
            gap: 'var(--spacing-lg)'
        }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card" style={{ padding: 'var(--spacing-lg)' }}>
                    <Skeleton variant="text" width="60%" style={{ marginBottom: '12px' }} />
                    <Skeleton variant="title" width="40%" height="32px" style={{ marginBottom: '8px' }} />
                    <Skeleton variant="text" width="50%" height="12px" />
                </div>
            ))}
        </div>
    );
}

MetricsSkeleton.propTypes = {
    count: PropTypes.number
};

export { Skeleton, CardSkeleton, ChartSkeleton, ListSkeleton, MetricsSkeleton };
export default Skeleton;
