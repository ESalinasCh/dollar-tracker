import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import Badge from './Badge';

// Icons
const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const CheckAllIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="17 6 9 17 4 12" />
        <polyline points="22 6 14 17" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

function formatTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function NotificationItem({ notification, onMarkRead, onRemove }) {
    const typeColors = {
        alert: '#8b5cf6',
        success: 'var(--color-success)',
        error: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        info: 'var(--color-primary)'
    };

    return (
        <div
            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            style={{
                padding: 'var(--spacing-md)',
                borderBottom: '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                opacity: notification.read ? 0.7 : 1
            }}
            onClick={() => onMarkRead(notification.id)}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-start' }}>
                <div
                    style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: notification.read ? 'transparent' : typeColors[notification.type] || typeColors.info,
                        marginTop: '6px',
                        flexShrink: 0
                    }}
                />
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                        {notification.title}
                    </div>
                    <div className="text-sm text-secondary" style={{ marginBottom: '4px' }}>
                        {notification.message}
                    </div>
                    <div className="text-xs text-muted">
                        {formatTimeAgo(notification.timestamp)}
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(notification.id);
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: 'var(--color-text-muted)',
                        opacity: 0.6
                    }}
                >
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
}

function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                className="btn btn-ghost notification-bell"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    padding: '8px'
                }}
            >
                <BellIcon />
                {unreadCount > 0 && (
                    <span
                        className="notification-badge animate-pulse"
                        style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            backgroundColor: 'var(--color-danger)',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 700,
                            minWidth: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="notification-dropdown animate-fade-in"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: 'var(--spacing-sm)',
                        width: '360px',
                        backgroundColor: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)',
                        overflow: 'hidden',
                        zIndex: 1000
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: 'var(--spacing-md)',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <span style={{ fontWeight: 600 }}>Notifications</span>
                            {unreadCount > 0 && (
                                <Badge variant="primary" size="sm">{unreadCount} new</Badge>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                            <button
                                className="btn btn-ghost"
                                onClick={markAllAsRead}
                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                title="Mark all as read"
                            >
                                <CheckAllIcon />
                            </button>
                            <button
                                className="btn btn-ghost"
                                onClick={clearAll}
                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                title="Clear all"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{
                                padding: 'var(--spacing-2xl)',
                                textAlign: 'center',
                                color: 'var(--color-text-muted)'
                            }}>
                                <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}>🔔</div>
                                <div>No notifications</div>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <NotificationItem
                                    key={notif.id}
                                    notification={notif}
                                    onMarkRead={markAsRead}
                                    onRemove={removeNotification}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationCenter;
