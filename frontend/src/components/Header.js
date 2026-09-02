import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from './Icon';
import ApexDevLogo from './ApexDevLogo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { animateDropdownEnter, animateButtonPulse, animate } from '../utils/animations';

const defaultAvatar = process.env.PUBLIC_URL + '/avatar.png';

const defaultNotifications = [
  {
    id: 1,
    title: 'New Lead Captured',
    text: 'Bharat Sharma registered from Website Inquiry.',
    type: 'users',
    time: '10 mins ago',
    read: false,
    color: '#4f46e5',
    bg: '#e0e7ff',
    route: '/leads'
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
    route: '/deals'
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
    route: '/tasks'
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
    route: '/invoices'
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
    route: '/leads'
  },
];

const Header = ({ pageTitle, onMenuClick, onAddClick, showAdd, searchValue, onSearchChange }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const searchInputRef = useRef(null);
  
  // Profile dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const notifRef = useRef(null);

  const navigate = useNavigate();

  // Fetch live notifications from backend
  const fetchBackendNotifications = React.useCallback(async () => {
    try {
      const url = user?.email 
        ? `http://localhost:5001/api/notifications?user_email=${encodeURIComponent(user.email)}`
        : 'http://localhost:5001/api/notifications';
      const res = await axios.get(url);
      if (res.data?.notifications && Array.isArray(res.data.notifications)) {
        const formatted = res.data.notifications.map(n => ({
          id: n.id,
          title: n.title,
          text: n.message,
          type: n.type === 'overdue' || n.type === 'escalated' ? 'alert' : n.type === 'comment' ? 'message' : 'check',
          time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: Boolean(n.read_status),
          color: n.type === 'escalated' ? '#ef4444' : n.type === 'overdue' ? '#f59e0b' : '#3b82f6',
          bg: n.type === 'escalated' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
          route: '/tasks'
        }));
        if (formatted.length > 0) {
          setNotifications(formatted);
        }
      }
    } catch (e) {}
  }, [user?.email]);

  useEffect(() => {
    fetchBackendNotifications();
    const interval = setInterval(fetchBackendNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchBackendNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Global Real-time Notification Listener
  useEffect(() => {
    const handleNewNotif = (e) => {
      if (e.detail) {
        const item = {
          id: Date.now(),
          title: e.detail.title || 'New CRM Alert',
          text: e.detail.text || '',
          type: e.detail.type || 'bell',
          time: 'Just now',
          read: false,
          color: e.detail.color || '#2563eb',
          bg: e.detail.bg || 'rgba(37,99,235,0.15)',
          route: e.detail.route || '/dashboard'
        };
        setNotifications((prev) => [item, ...prev]);
      }
    };
    window.addEventListener('crm-notification', handleNewNotif);
    return () => window.removeEventListener('crm-notification', handleNewNotif);
  }, []);

  // Animate dropdowns on open
  useEffect(() => {
    if (notifOpen) {
      animateDropdownEnter('.notif-dropdown');
    }
  }, [notifOpen]);

  useEffect(() => {
    if (dropdownOpen) {
      animateDropdownEnter('.profile-dropdown');
    }
  }, [dropdownOpen]);

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

  const handleThemeToggle = (e) => {
    if (e?.currentTarget) {
      animate(e.currentTarget, {
        rotate: [0, 360],
        scale: [1, 0.85, 1.15, 1],
        duration: 500,
        ease: 'outBack'
      });
    }
    toggleTheme();
  };

  const handleNotificationClick = async (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setNotifOpen(false);
    try {
      await axios.put(`http://localhost:5001/api/notifications/${item.id}/read`);
    } catch (e) {}
    if (item.route) {
      navigate(item.route);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await axios.put('http://localhost:5001/api/notifications/mark-all-read', {
        user_email: user?.email
      });
    } catch (e) {}
  };

  const removeNotification = async (e, id) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await axios.delete(`http://localhost:5001/api/notifications/${id}`);
    } catch (e) {}
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    try {
      await axios.put('http://localhost:5001/api/notifications/mark-all-read', {
        user_email: user?.email
      });
    } catch (e) {}
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
          <ApexDevLogo size={34} showText={true} textColor={isDark ? '#f8fafc' : '#0f172a'} />
        </div>
      </div>

      <div className="topbar-right">
        {/* THEME TOGGLE BUTTON */}
        <button 
          className="icon-btn theme-toggle-topbar-btn" 
          onClick={handleThemeToggle} 
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          <Icon name={isDark ? "sun" : "moon"} size={19} />
        </button>

        {/* NOTIFICATIONS DROPDOWN MENU */}
        <div className="notification-menu" ref={notifRef}>
          <button
            className="icon-btn notif-btn-wrapper"
            onClick={(e) => {
              animateButtonPulse(e.currentTarget);
              setNotifOpen(!notifOpen);
              setDropdownOpen(false);
            }}
            title="Notifications"
          >
            <Icon name="bell" size={19} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className="notif-dropdown" style={{ minWidth: '340px' }}>
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
                  <div className="notif-empty" style={{ padding: '36px 20px', textAlign: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                      <Icon name="check" size={22} />
                    </div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text, #0f172a)' }}>All Caught Up! 🎉</p>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>No pending notifications</span>
                  </div>
                ) : (
                  notifications.map((n, idx) => (
                    <div
                      className={`notif-item ${!n.read ? 'unread' : ''}`}
                      key={`notif-${n.id}-${idx}`}
                      onClick={() => handleNotificationClick(n)}
                      style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                      title={`Click to open ${n.title}`}
                    >
                      <div className="notif-icon-box" style={{ background: n.bg, color: n.color }}>
                        <Icon name={n.type} size={16} />
                      </div>
                      <div className="notif-body">
                        <div className="notif-item-header">
                          <span className="notif-item-title" style={{ fontWeight: n.read ? 600 : 800 }}>{n.title}</span>
                          <span className="notif-item-time">{n.time}</span>
                        </div>
                        <p className="notif-item-text">{n.text}</p>
                      </div>
                      <button
                        className="notif-dismiss-btn"
                        onClick={(e) => removeNotification(e, n.id)}
                        title="Dismiss"
                      >
                        <Icon name="x" size={14} />
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
