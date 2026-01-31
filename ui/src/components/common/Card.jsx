import PropTypes from 'prop-types';

/**
 * Card Component
 * Glassmorphism-styled container for content
 */
function Card({
    children,
    className = '',
    title,
    subtitle,
    action,
    interactive = false,
    ...props
}) {
    const cardClasses = [
        'card',
        interactive ? 'card-interactive' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={cardClasses} {...props}>
            {(title || action) && (
                <div className="card-header">
                    <div>
                        {title && <h3 className="card-title">{title}</h3>}
                        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="card-body">
                {children}
            </div>
        </div>
    );
}

Card.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    action: PropTypes.node,
    interactive: PropTypes.bool,
};

export default Card;
