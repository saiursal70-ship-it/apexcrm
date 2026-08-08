import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import navConfig from '../config/navConfig';

/**
 * CommandPalette Component
 * Global modal command palette (`Ctrl + K` or `Cmd + K`) for instant navigation and quick actions.
 */
const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNav = navConfig.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const quickActions = [
    { label: 'Go to Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Create New Lead', path: '/leads?action=new', icon: 'plus' },
    { label: 'View Sales Deals', path: '/deals', icon: 'deals' },
    { label: 'Manage Invoices', path: '/invoices', icon: 'invoice' },
    { label: 'Support Tickets', path: '/tickets', icon: 'support' },
    { label: 'System Settings', path: '/settings', icon: 'settings' }
  ].filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette-container glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="command-search-header">
          <Icon name="search" size={20} className="command-search-icon" />
          <input
            type="text"
            className="command-search-input"
            placeholder="Type a command or search modules... (Ctrl + K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <span className="command-kbd-badge">ESC</span>
        </div>

        <div className="command-palette-body">
          {quickActions.length > 0 && (
            <div className="command-group">
              <span className="command-group-title">QUICK ACTIONS & NAVIGATION</span>
              {quickActions.map((action, idx) => (
                <div
                  key={idx}
                  className="command-item"
                  onClick={() => handleSelect(action.path)}
                >
                  <div className="command-item-left">
                    <Icon name={action.icon} size={16} />
                    <span>{action.label}</span>
                  </div>
                  <span className="command-item-badge">Jump</span>
                </div>
              ))}
            </div>
          )}

          {filteredNav.length > 0 && (
            <div className="command-group">
              <span className="command-group-title">ALL CRM MODULES</span>
              {filteredNav.map((item) => (
                <div
                  key={item.path}
                  className="command-item"
                  onClick={() => handleSelect(item.path)}
                >
                  <div className="command-item-left">
                    <Icon name={item.icon || 'document'} size={16} />
                    <span>{item.label}</span>
                  </div>
                  <span className="command-item-badge">Module</span>
                </div>
              ))}
            </div>
          )}

          {quickActions.length === 0 && filteredNav.length === 0 && (
            <div className="command-empty">
              <p>No matching commands found for "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
