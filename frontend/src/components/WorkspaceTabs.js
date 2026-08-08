import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';
import navConfig from '../config/navConfig';

/**
 * WorkspaceTabs Component
 * Provides a browser-in-browser workspace tab bar allowing users to switch between
 * active modules and opened records seamlessly.
 */
const WorkspaceTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tabs, setTabs] = useState(() => {
    const saved = sessionStorage.getItem('crm_workspace_tabs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { id: '/', label: 'Dashboard', path: '/dashboard', icon: 'dashboard', closable: false }
    ];
  });

  // Keep tabs synchronized with location
  useEffect(() => {
    const path = location.pathname;
    const currentNav = navConfig.find((n) => path.startsWith(n.path));

    if (currentNav && !tabs.some((t) => t.path === currentNav.path)) {
      const newTab = {
        id: currentNav.path,
        label: currentNav.label,
        path: currentNav.path,
        icon: currentNav.icon || 'document',
        closable: currentNav.path !== '/dashboard'
      };
      const updated = [...tabs, newTab];
      setTabs(updated);
      sessionStorage.setItem('crm_workspace_tabs', JSON.stringify(updated));
    }
  }, [location, tabs]);

  const handleTabClick = (path) => {
    navigate(path);
  };

  const handleCloseTab = (e, tabId) => {
    e.stopPropagation();
    const updated = tabs.filter((t) => t.id !== tabId);
    setTabs(updated);
    sessionStorage.setItem('crm_workspace_tabs', JSON.stringify(updated));

    // If closing active tab, navigate to previous tab or dashboard
    if (location.pathname.startsWith(tabId)) {
      const lastTab = updated[updated.length - 1] || { path: '/dashboard' };
      navigate(lastTab.path);
    }
  };

  return (
    <div className="workspace-tab-bar">
      <div className="workspace-tabs-container">
        {tabs.map((tab, tIdx) => {
          const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          return (
            <div
              key={`ws-tab-${tab.id}-${tIdx}`}
              className={`workspace-tab ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.path)}
            >
              <Icon name={tab.icon} size={14} className="tab-icon" />
              <span className="tab-label">{tab.label}</span>
              {tab.closable && (
                <button
                  type="button"
                  className="tab-close-btn"
                  onClick={(e) => handleCloseTab(e, tab.id)}
                  title="Close tab"
                >
                  <Icon name="close" size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkspaceTabs;
