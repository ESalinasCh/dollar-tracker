import PropTypes from 'prop-types';

// Icon components
const MenuIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const MoonIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);

function Header({ title, onMenuClick }) {
    const handleRefresh = () => {
        // Will connect to data refresh later
        console.log('Refreshing data...');
    };

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
                {/* Refresh button */}
                <button
                    className="header-action"
                    onClick={handleRefresh}
                    aria-label="Refresh data"
                >
                    <RefreshIcon />
                </button>

                {/* Notifications */}
                <button
                    className="header-action"
                    aria-label="Notifications"
                >
                    <BellIcon />
                    <span className="header-action-badge">3</span>
                </button>

                {/* Theme toggle */}
                <button
                    className="header-action"
                    aria-label="Toggle theme"
                >
                    <MoonIcon />
                </button>

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
