import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const NotificationContext = createContext(null);

// Notification types
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    ALERT: 'alert'
};

// Sample initial notifications
const INITIAL_NOTIFICATIONS = [
    {
        id: 'notif-001',
        type: 'alert',
        title: 'Price Alert Triggered',
        message: 'USD/BOB crossed above $7.00',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: false
    },
    {
        id: 'notif-002',
        type: 'info',
        title: 'Report Ready',
        message: 'Your weekly report is ready for download',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: true
    }
];

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [toasts, setToasts] = useState([]);

    // Add a new notification
    const addNotification = useCallback((notification) => {
        const newNotif = {
            id: `notif-${Date.now()}`,
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };
        setNotifications(prev => [newNotif, ...prev]);
        return newNotif.id;
    }, []);

    // Mark notification as read
    const markAsRead = useCallback((id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    // Remove notification
    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Clear all notifications
    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    // Show toast
    const showToast = useCallback((toast) => {
        const id = `toast-${Date.now()}`;
        const newToast = {
            id,
            duration: 5000,
            type: NOTIFICATION_TYPES.INFO,
            ...toast
        };

        setToasts(prev => [...prev, newToast]);

        // Auto remove after duration
        if (newToast.duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, newToast.duration);
        }

        return id;
    }, []);

    // Dismiss toast
    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Get unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    const value = {
        notifications,
        toasts,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        showToast,
        dismissToast
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

export default NotificationContext;
