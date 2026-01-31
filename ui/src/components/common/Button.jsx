import PropTypes from 'prop-types';

/**
 * Button Component
 * Reusable button with multiple variants and sizes
 */
function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconOnly = false,
    disabled = false,
    loading = false,
    className = '',
    onClick,
    ...props
}) {
    const buttonClasses = [
        'btn',
        `btn-${variant}`,
        size !== 'md' ? `btn-${size}` : '',
        iconOnly ? 'btn-icon' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={buttonClasses}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading ? (
                <span className="spinner spinner-sm" />
            ) : (
                <>
                    {icon && <span className="btn-icon-left">{icon}</span>}
                    {!iconOnly && children}
                </>
            )}
        </button>
    );
}

Button.propTypes = {
    children: PropTypes.node,
    variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'success']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    icon: PropTypes.node,
    iconOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func,
};

export default Button;
