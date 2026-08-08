import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';
import ApexDevLogo from './ApexDevLogo';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ collapsed, mobileOpen, setMobileOpen }) => {
  const { user } = useAuth();

  const navGroups = [
    {
      groupLabel: 'MAIN MENU',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: 'grid' },
        { path: '/leads', label: 'Leads', icon: 'users' },
        { path: '/contacts', label: 'Contacts', icon: 'contact' },
        { path: '/deals', label: 'Deals', icon: 'target' },
      ],
    },
    {
      groupLabel: 'MANAGEMENT',
      items: [
        { path: '/admin/workspace', label: 'Admin Board ⚡', icon: 'grid' },
        { path: '/tasks', label: 'Tasks', icon: 'check' },
        { path: '/appointments', label: 'Appointments', icon: 'calendar' },
        { path: '/invoices', label: 'Invoices', icon: 'invoice' },
        { path: '/quotations', label: 'Quotations', icon: 'quotation' },
      ],
    },
    {
      groupLabel: 'ANALYTICS & SYSTEM',
      items: [
        { path: '/reports', label: 'Reports', icon: 'chart' },
        { path: '/settings', label: 'Settings', icon: 'settings' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <ApexDevLogo size={collapsed ? 34 : 38} showText={!collapsed} />
          </div>
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((group, idx) => (
            <div className="sidebar-group" key={`sidebar-group-${group.groupLabel}-${idx}`}>
              {!collapsed && <span className="sidebar-group-label">{group.groupLabel}</span>}
              {group.items.map((item, itemIdx) => (
                <NavLink
                  key={`sidebar-item-${item.path}-${itemIdx}`}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : ''}
                >
                  <div className="link-icon-wrap">
                    <Icon name={item.icon} size={19} />
                  </div>
                  {!collapsed && <span className="link-label">{item.label}</span>}
                  <span className="active-glow-indicator"></span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer Widget */}
        {!collapsed && (
          <div className="sidebar-footer-widget">
            <div className="user-profile-mini">
              <div className="user-avatar-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="user-mini-info">
                <span className="user-mini-name">{user?.name || 'Alex Dev'}</span>
                <span className="user-mini-role">System Admin</span>
              </div>
              <span className="status-online-dot"></span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
