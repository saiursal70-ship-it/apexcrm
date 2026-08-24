import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';
import Icon from './Icon';
import navConfig from '../config/navConfig';
import { animateStagedBloom, animate } from '../utils/animations';

const Layout = ({ children, onAddClick, showAdd, searchValue, onSearchChange }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 1024);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const location = useLocation();
  const searchInputRef = useRef(null);
  const pageContentRef = useRef(null);

  const currentNav = navConfig.find((n) => location.pathname.startsWith(n.path));
  const pageTitle = currentNav ? currentNav.label : 'Dashboard';
  const pageDescription = currentNav ? currentNav.description : '';

  const handleMenuToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  // Modern Staged Choreography Bloom on route transitions
  useEffect(() => {
    if (pageContentRef.current) {
      animateStagedBloom(pageContentRef.current);
    }
  }, [location.pathname]);

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

  const handleSearchFocus = (e) => {
    try {
      animate(e.target.parentElement, {
        scale: [1, 1.015],
        duration: 250,
        ease: 'outQuad'
      });
    } catch (err) {}
  };

  const handleSearchBlur = (e) => {
    try {
      animate(e.target.parentElement, {
        scale: [1.015, 1],
        duration: 200,
        ease: 'outQuad'
      });
    } catch (err) {}
  };

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
        <div className="page-content" ref={pageContentRef}>
          <div className="content-page-header">
            <h1 className="content-page-title">{pageTitle}</h1>
            {pageDescription && <p className="content-page-subtitle">{pageDescription}</p>}
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
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
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

