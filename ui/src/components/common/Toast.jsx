import React from 'react';
import PropTypes from 'prop-types';
import { useNotifications, NOTIFICATION_TYPES } from '../../context/NotificationContext';

// Icon components
const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const WarningIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const InfoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const getIcon = (type) => {
    switch (type) {
        case NOTIFICATION_TYPES.SUCCESS:
            return <CheckIcon />;
        case NOTIFICATION_TYPES.ERROR:
            return <XIcon />;
        case NOTIFICATION_TYPES.WARNING:
            return <WarningIcon />;
        case NOTIFICATION_TYPES.ALERT:
            return <BellIcon />;
        default:
            return <InfoIcon />;
    }
};

function Toast({ toast }) {
    const { dismissToast } = useNotifications();

    const typeStyles = {
        success: {
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))',
            borderColor: 'var(--color-success)',
            iconColor: 'var(--color-success)'
        },
        error: {
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
            borderColor: 'var(--color-danger)',
            iconColor: 'var(--color-danger)'
        },
        warning: {
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
            borderColor: 'var(--color-warning)',
            iconColor: 'var(--color-warning)'
        },
        info: {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))',
            borderColor: 'var(--color-primary)',
            iconColor: 'var(--color-primary)'
        },
        alert: {
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))',
            borderColor: '#8b5cf6',
            iconColor: '#8b5cf6'
        }
    };

    const styles = typeStyles[toast.type] || typeStyles.info;

    return (
        <div
            className="toast animate-slide-in"
            style={{
                background: styles.background,
                borderLeft: `4px solid ${styles.borderColor}`,
                backdropFilter: 'blur(12px)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--spacing-md)',
                minWidth: '320px',
                maxWidth: '420px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}
        >
            <div style={{ color: styles.iconColor, flexShrink: 0, marginTop: '2px' }}>
                {getIcon(toast.type)}
            </div>
            <div style={{ flex: 1 }}>
                {toast.title && (
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                        {toast.title}
                    </div>
                )}
                <div className="text-sm text-secondary">
                    {toast.message}
                </div>
            </div>
            <button
                onClick={() => dismissToast(toast.id)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: 'var(--color-text-muted)',
                    flexShrink: 0
                }}
            >
                <XIcon />
            </button>
        </div>
    );
}

Toast.propTypes = {
    toast: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        title: PropTypes.string,
        message: PropTypes.string.isRequired
    }).isRequired
};

function ToastContainer() {
    const { toasts } = useNotifications();

    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 'var(--spacing-xl)',
            right: 'var(--spacing-xl)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)'
        }}>
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} />
            ))}
        </div>
    );
}

export { Toast, ToastContainer };
export default ToastContainer;
