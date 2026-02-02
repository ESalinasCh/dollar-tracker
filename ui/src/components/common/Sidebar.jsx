import React from 'react';
import PropTypes from 'prop-types';
import logo from '../../assets/logo.png';

// Simple icon components
const icons = {
    dashboard: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
    ),
    charts: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
        </svg>
    ),
    dollar: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
};

function Sidebar({ currentPage, onNavigate, isOpen, onClose }) {
    // Navigation items - US1-6 scope only
    const navItems = [
        { id: 'dashboard', label: 'Inicio', icon: 'dashboard' },
        { id: 'charts', label: 'Gráficos', icon: 'charts' },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="sidebar-overlay hide-desktop"
                    onClick={onClose}
                />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src={logo} alt="Dollar Tracker Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
                        <div className="sidebar-logo-text">
                            Dollar<span>Tracker</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <ul className="nav-list">
                            {navItems.map((item) => (
                                <li key={item.id}>
                                    <button
                                        className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                                        onClick={() => {
                                            onNavigate(item.id);
                                            onClose();
                                        }}
                                    >
                                        <span className="nav-item-icon">
                                            {icons[item.icon]}
                                        </span>
                                        <span className="nav-item-label">{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
            </aside>
        </>
    );
}

Sidebar.propTypes = {
    currentPage: PropTypes.string.isRequired,
    onNavigate: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
};

Sidebar.defaultProps = {
    isOpen: false,
    onClose: () => { },
};

export default Sidebar;
