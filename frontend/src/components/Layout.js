import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';
import Icon from './Icon';
import navConfig from '../config/navConfig';

const Layout = ({ children, onAddClick, showAdd, searchValue, onSearchChange }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const location = useLocation();
  const searchInputRef = useRef(null);

  const currentNav = navConfig.find((n) => location.pathname.startsWith(n.path));
  const pageTitle = currentNav ? currentNav.label : 'Dashboard';

  const handleMenuToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  // Global Keyboard Shortcut (Ctrl+K or Cmd+K) to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isSearchActive = onSearchChange || searchValue !== undefined;

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={`main-area ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          pageTitle={pageTitle}
          onMenuClick={handleMenuToggle}
          onAddClick={onAddClick}
          showAdd={showAdd}
        />
        <div className="page-content">
          <div className="content-page-header">
            <h1 className="content-page-title">{pageTitle}</h1>
          </div>

          {/* PROFESSIONAL SEARCH BAR POSITIONED BELOW SECTION TITLE */}
          {isSearchActive && (
            <div className="content-search-wrapper">
              <div className="content-search-box">
                <Icon name="search" size={18} className="search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={`Search ${pageTitle.toLowerCase()}, records, leads, deals...`}
                  value={searchValue || ''}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                />
                {searchValue && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => onSearchChange && onSearchChange('')}
                    title="Clear search"
                  >
                    <Icon name="close" size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {children}
        </div>
      </div>
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};

export default Layout;
