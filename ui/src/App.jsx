import './styles/index.css';
import './styles/components.css';
import './styles/layout.css';

import React, { useState } from 'react';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Inicio';
      case 'charts':
        return 'Gráficos';
      default:
        return 'Inicio';
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'charts':
        return <Charts />;
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
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(true)}
        />
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
