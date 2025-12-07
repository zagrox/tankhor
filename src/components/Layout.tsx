import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import SecondarySidebar from './SecondarySidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const showSecondarySidebar = location.pathname === '/marketplace';

  const containerClass = `layout-container ${showSecondarySidebar ? 'with-secondary-sidebar' : ''}`;

  return (
    <div className={containerClass}>
      {/* Sidebar (Desktop Side / Mobile Bottom) */}
      <Sidebar />

      {/* Contextual Secondary Sidebar (Marketplace Filters) */}
      {showSecondarySidebar && <SecondarySidebar />}

      {/* Main Content Area */}
      <div className="layout-content-wrapper">
        <main className="main-content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;