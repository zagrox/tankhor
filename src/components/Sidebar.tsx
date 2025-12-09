

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingBag, 
  Newspaper, 
  User,
  Sun,
  Moon,
  Settings,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Users
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { appLogo, appConfig } = useAppContext(); // Get the app logo and config from context
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed

  useEffect(() => {
    // Sync with local storage/system pref
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const navLinks = [
    { name: 'خانه', path: '/', icon: <Home size={24} /> },
    { name: 'فید اجتماعی', path: '/social', icon: <Users size={24} /> },
    { name: 'فروشگاه', path: '/marketplace', icon: <ShoppingBag size={24} /> },
    { name: 'دسته‌بندی', path: '/filters', icon: <LayoutGrid size={24} /> },
    { name: 'وبلاگ', path: '/blog', icon: <Newspaper size={24} /> },
  ];

  const secondaryLinks = [
    { name: 'سبد خرید', path: '/cart', icon: <ShoppingCart size={24} /> },
    { name: 'پروفایل', path: '/profile', icon: <User size={24} /> },
    { name: 'تنظیمات', path: '/settings', icon: <Settings size={24} /> },
  ];

  return (
    <>
      {/* --- Desktop Sidebar --- */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            {appLogo ? (
              <img src={appLogo} alt={appConfig?.app_title || "Tankhor Logo"} className="sidebar-logo-img" />
            ) : (
              <span className="logo-dot">.</span>
            )}
            <span className="logo-text">{appConfig?.app_title || 'تن‌خور'}</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
                title={isCollapsed ? link.name : ''}
              >
                {link.icon}
                <span className="link-text">{link.name}</span>
              </Link>
            ))}
          </div>

          <div className="nav-divider"></div>

          <div className="nav-section">
            {secondaryLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
                title={isCollapsed ? link.name : ''}
              >
                {link.icon}
                <span className="link-text">{link.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="collapse-btn"
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            aria-label="Toggle Theme"
            title={isDarkMode ? 'روشن' : 'تاریک'}
          >
            {isDarkMode ? (
              <>
                <Sun size={20} className="text-yellow-400" />
                <span className="link-text">روشن</span>
              </>
            ) : (
              <>
                <Moon size={20} />
                <span className="link-text">تاریک</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* --- Mobile Bottom Navigation --- */}
      <nav className="mobile-bottom-nav">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`mobile-nav-item ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.icon}
            <span className="mobile-nav-label">{link.name}</span>
          </Link>
        ))}
        
        {/* Mobile Theme Toggle (Mini) */}
        <button onClick={toggleTheme} className="mobile-nav-item">
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          <span className="mobile-nav-label">تم</span>
        </button>

        {/* Mobile Cart */}
        <Link to="/cart" className="mobile-nav-item">
          <ShoppingCart size={24} />
          <span className="mobile-nav-label">سبد</span>
        </Link>
      </nav>
    </>
  );
};

export default Sidebar;