import './styles/index.css';
import './styles/components.css';
import './styles/layout.css';

import { useState } from 'react';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'charts':
        return <div className="main"><h1>Charts - Coming Soon</h1></div>;
      case 'reports':
        return <div className="main"><h1>Reports - Coming Soon</h1></div>;
      case 'alerts':
        return <div className="main"><h1>Alerts - Coming Soon</h1></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-content">
        <Header
          title={currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
          onMenuClick={() => setSidebarOpen(true)}
        />
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
