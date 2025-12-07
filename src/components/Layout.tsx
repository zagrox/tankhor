import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout-container">
      {/* Sidebar (Desktop Side / Mobile Bottom) */}
      <Sidebar />

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