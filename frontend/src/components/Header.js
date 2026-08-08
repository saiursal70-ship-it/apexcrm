import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import ApexDevLogo from './ApexDevLogo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const defaultAvatar = process.env.PUBLIC_URL + '/avatar.png';

const initialNotifications = [
  {
    id: 1,
    title: 'New Lead Captured',
    text: 'Bharat Sharma registered from Website Inquiry.',
    type: 'users',
    time: '10 mins ago',
    read: false,
    color: '#4f46e5',
    bg: '#e0e7ff',
  },
  {
    id: 2,
    title: 'Deal Stage Updated',
    text: 'ABC Corp - CRM Deal moved to Negotiation (₹8,50,000).',
    type: 'target',
    time: '25 mins ago',
    read: false,
    color: '#059669',
    bg: '#d1fae5',
  },
  {
    id: 3,
    title: 'Task High Priority',
    text: 'Send proposal to Bharat Industries due today.',
    type: 'check',
    time: '1 hour ago',
    read: false,
    color: '#d97706',
    bg: '#fef3c7',
  },
  {
    id: 4,
    title: 'Payment Received',
    text: 'Invoice INV-1001 of ₹8,50,000 marked as Paid.',
    type: 'invoice',
    time: '2 hours ago',
    read: true,
    color: '#db2777',
    bg: '#fce7f3',
  },
  {
    id: 5,
    title: 'WhatsApp Message Sent',
    text: 'Lead Greeting message delivered to Ramesh Gupta.',
    type: 'whatsapp',
    time: '3 hours ago',
    read: true,
    color: '#15803d',
    bg: '#dcfce7',
  },
];

const Header = ({ pageTitle, onMenuClick, onAddClick, showAdd, searchValue, onSearchChange }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const searchInputRef = useRef(null);
  
  // Profile dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Notification dropdown state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const notifRef = useRef(null);

  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Global Keyboard Shortcut (Ctrl+K or Cmd+K) to focus search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const avatarUrl = (user?.profile_image && user.profile_image.startsWith('http'))
    ? user.profile_image
    : defaultAvatar;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn menu-toggle-btn" onClick={onMenuClick} title="Toggle Sidebar">
          <Icon name="menu" size={20} />
        </button>
        <div className="header-brand-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ApexDevLogo size={36} showText={true} />
        </div>
      </div>

      <div className="topbar-right">
        {/* THEME TOGGLE BUTTON */}
        <button 
          className="icon-btn theme-toggle-topbar-btn" 
          onClick={toggleTheme} 
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          <Icon name={isDark ? "sun" : "moon"} size={19} />
        </button>

        {/* NOTIFICATIONS DROPDOWN MENU */}
        <div className="notification-menu" ref={notifRef}>
          <button
            className="icon-btn notif-btn-wrapper"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setDropdownOpen(false);
            }}
            title="Notifications"
          >
            <Icon name="bell" size={19} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <div>
                  <h3 className="notif-title">Notifications</h3>
                  <span className="notif-subtext">{unreadCount} unread messages</span>
                </div>
                {unreadCount > 0 && (
                  <button className="notif-link-btn" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <Icon name="bell" size={28} />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n, idx) => (
                    <div className={`notif-item ${!n.read ? 'unread' : ''}`} key={`notif-${n.id}-${idx}`}>
                      <div className="notif-icon-box" style={{ background: n.bg, color: n.color }}>
                        <Icon name={n.type} size={16} />
                      </div>
                      <div className="notif-body">
                        <div className="notif-item-header">
                          <span className="notif-item-title">{n.title}</span>
                          <span className="notif-item-time">{n.time}</span>
                        </div>
                        <p className="notif-item-text">{n.text}</p>
                      </div>
                      <button
                        className="notif-dismiss-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(n.id);
                        }}
                        title="Dismiss"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="notif-footer">
                  <button className="notif-footer-btn" onClick={clearAllNotifications}>
                    Clear all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PROFILE DROPDOWN MENU */}
        <div className="profile-menu" ref={dropdownRef}>
          <button
            className="profile-trigger"
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifOpen(false);
            }}
          >
            <img
              src={avatarUrl}
              alt={user?.name || 'User'}
              className="profile-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
            />
            <span className="profile-name">{user?.name || 'User'}</span>
            <Icon name="chevronDown" size={15} />
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <img
                  src={avatarUrl}
                  alt={user?.name || 'User'}
                  className="profile-avatar-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }}
                />
                <div>
                  <p className="dropdown-name">{user?.name}</p>
                  <p className="dropdown-email">{user?.email}</p>
                </div>
              </div>
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <Icon name="logout" size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
