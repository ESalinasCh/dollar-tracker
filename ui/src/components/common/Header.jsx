import React from 'react';
import PropTypes from 'prop-types';
import NotificationCenter from './NotificationCenter';

// Icon components
const MenuIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

function Header({ title, onMenuClick }) {

    return (
        <header className="header">
            <div className="header-left">
                {/* Mobile menu button */}
                <button
                    className="header-action hide-desktop"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                >
                    <MenuIcon />
                </button>

                <div>
                    <h1 className="header-title">{title}</h1>
                    <div className="header-breadcrumb hide-mobile">
                        <span>Home</span>
                        <span>/</span>
                        <span className="text-primary">{title}</span>
                    </div>
                </div>
            </div>

            <div className="header-right">
                {/* Notifications */}
                <NotificationCenter />

                {/* User avatar */}
                <div
                    className="header-action"
                    style={{
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}
                >
                    U
                </div>
            </div>
        </header>
    );
}

Header.propTypes = {
    title: PropTypes.string.isRequired,
    onMenuClick: PropTypes.func.isRequired,
};

export default Header;
