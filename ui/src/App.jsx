import './styles/index.css';
import './styles/components.css';
import './styles/layout.css';

import React, { useState } from 'react';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import { NotificationProvider } from './context/NotificationContext';
import ToastContainer from './components/common/Toast';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'charts':
        return <Charts />;
      case 'reports':
        return <Reports />;
      case 'alerts':
        return <Alerts />;
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
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

export default App;
