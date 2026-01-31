import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge Component
 * Small status indicators and labels
 */
function Badge({
    children,
    variant = 'primary',
    withDot = false,
    animated = false,
    className = '',
    ...props
}) {
    const badgeClasses = [
        'badge',
        `badge-${variant}`,
        className
    ].filter(Boolean).join(' ');

    const dotClasses = [
        'status-dot',
        animated ? 'animated' : ''
    ].filter(Boolean).join(' ');

    return (
        <span className={badgeClasses} {...props}>
            {withDot && <span className={dotClasses} />}
            {children}
        </span>
    );
}

Badge.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'success', 'danger', 'warning', 'neutral']),
    withDot: PropTypes.bool,
    animated: PropTypes.bool,
    className: PropTypes.string,
};

export default Badge;
