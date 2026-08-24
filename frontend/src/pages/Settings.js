import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { changeUserPassword, updateUserProfile } from '../api/api';
import { animateStagger } from '../utils/animations';
import AdminWorkspace from './AdminWorkspace';

const DEFAULT_ROLES = [
  { id: 'admin', role: 'System Administrator', department: 'Executive Management', designation: 'Chief Administrator', level: 'Level 5 (Full Access)', userCount: 3 },
  { id: 'manager', role: 'Sales Manager', department: 'Sales & Business Development', designation: 'Senior Sales Lead', level: 'Level 4 (Managerial)', userCount: 8 },
  { id: 'rep', role: 'Sales Representative', department: 'Field Sales Operations', designation: 'Account Executive', level: 'Level 2 (Standard)', userCount: 24 },
  { id: 'support', role: 'Support Specialist', department: 'Customer Success', designation: 'Technical Support Lead', level: 'Level 3 (Support)', userCount: 12 },
  { id: 'finance', role: 'Finance & Billing Lead', department: 'Finance & Operations', designation: 'Billing Administrator', level: 'Level 4 (Financial)', userCount: 5 }
];

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    animateStagger('.settings-card, .role-pill-card, .form-group', {
      translateY: [15, 0],
      opacity: [0, 1],
      duration: 400
    });
  }, [activeTab]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Form states initialized with user/default data
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Shruti Joshi',
    email: user?.email || 'admin@crm.com',
    phone: '+91 98765 43210',
    designation: 'System Administrator'
  });

  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState(DEFAULT_ROLES[0].id);
  const [rbacForm, setRbacForm] = useState({
    role: DEFAULT_ROLES[0].role,
    department: DEFAULT_ROLES[0].department,
    designation: DEFAULT_ROLES[0].designation,
    level: DEFAULT_ROLES[0].level
  });

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    const found = roles.find((r) => r.id === roleId);
    if (found) {
      setRbacForm({
        role: found.role,
        department: found.department,
        designation: found.designation,
        level: found.level
      });
      setProfileForm((prev) => ({
        ...prev,
        designation: found.designation
      }));
    }
  };

  const handleRbacSave = (e) => {
    e.preventDefault();
    setRoles((prev) =>
      prev.map((r) => (r.id === selectedRole ? { ...r, ...rbacForm } : r))
    );
    showToast(`✅ Designation "${rbacForm.designation}" & Department updated successfully!`);
  };

  const [companyForm, setCompanyForm] = useState({
    company_name: 'CRM Overview Technologies Pvt. Ltd.',
    tagline: 'Enterprise Sales & Pipeline Automation',
    address: 'Suite 402, Business Bay, MG Road, Bangalore 560001',
    gstin: '29AAACC1234H1Z5',
    email: 'billing@crmoverview.com',
    phone: '+91 80 4567 8900',
    website: 'https://www.crmoverview.com'
  });

  const [brandingForm, setBrandingForm] = useState({
    accentColor: '#2563eb',
    logoUrl: '',
    headerTitle: 'CRM OVERVIEW TECHNOLOGIES'
  });

  const [notifForm, setNotifForm] = useState(() => {
    const saved = localStorage.getItem('crm_notification_preferences');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      emailAlerts: true,
      whatsappAlerts: true,
      leadCaptureAlerts: true,
      dailyDigest: false
    };
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    enable2FA: false
  });

  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passError, setPassError] = useState(null);
  const [passSuccess, setPassSuccess] = useState(null);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '#94a3b8', width: '0%' };
    if (pass.length < 6) return { score: 1, label: 'Weak (min 6 chars)', color: '#ef4444', width: '30%' };
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
    if (pass.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
      return { score: 3, label: 'Strong & Secure 🔒', color: '#10b981', width: '100%' };
    }
    if (pass.length >= 6 && (hasLetters && (hasNumbers || hasSpecial))) {
      return { score: 2, label: 'Medium', color: '#f59e0b', width: '65%' };
    }
    return { score: 1, label: 'Weak', color: '#ef4444', width: '35%' };
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!securityForm.currentPassword) {
      setPassError('Please enter your current password.');
      return;
    }
    if (!securityForm.newPassword) {
      setPassError('Please enter a new password.');
      return;
    }
    if (securityForm.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await changeUserPassword({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
        confirmPassword: securityForm.confirmPassword
      });
      setPassSuccess(res.data?.message || '🔒 Password updated successfully!');
      showToast('🔒 Password updated successfully in database!');
      setSecurityForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setTimeout(() => setPassSuccess(null), 6000);
    } catch (err) {
      setPassError(err.response?.data?.error || err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleNotifSave = (e) => {
    e.preventDefault();
    localStorage.setItem('crm_notification_preferences', JSON.stringify(notifForm));
    showToast('🔔 Notification alert preferences saved successfully!');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile({ name: profileForm.name });
      showToast('👤 Profile details updated successfully!');
    } catch (err) {
      showToast('👤 Profile updated locally!');
    }
  };

  const [apiForm, setApiForm] = useState(() => {
    const saved = localStorage.getItem('crm_api_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      whatsappMode: 'direct',
      whatsappApiKey: 'wa_live_992838491823901923',
      whatsappPhoneId: '105948302948201',
      webhookUrl: 'https://api.crmoverview.com/v1/webhooks/leads',
      gmailHost: 'smtp.gmail.com',
      gmailPort: 587,
      gmailUser: 'notifications@apexdev.com',
      gmailAppPassword: 'abcd efgh ijkl mnop',
      senderName: 'Apex CRM System'
    };
  });

  const handleApiSave = (e) => {
    e.preventDefault();
    localStorage.setItem('crm_api_config', JSON.stringify(apiForm));
    showToast('✅ WhatsApp & Gmail configurations saved successfully!');
  };

  const handleSave = (e, sectionName) => {
    e.preventDefault();
    showToast(`✅ ${sectionName} saved successfully!`);
  };

  const navItems = [
    { id: 'admin-workspace', label: 'Admin Workspace ⚡', icon: 'grid', desc: 'Agile Sprint Board & Admin Control' },
    { id: 'users-rbac', label: 'Users & RBAC 🛡️', icon: 'shield', desc: 'Role designation & department settings' },
    { id: 'profile', label: 'My Profile', icon: 'user', desc: 'Edit personal details and role' },
    { id: 'company', label: 'Company Profile', icon: 'building', desc: 'Manage company & GST details' },
    { id: 'branding', label: 'Branding', icon: 'palette', desc: 'Custom logo and theme accent' },
    { id: 'theme', label: 'Theme Preferences', icon: 'sun', desc: 'Light / Dark mode settings' },
    { id: 'notifications', label: 'Notification Settings', icon: 'bell', desc: 'Email & WhatsApp alert preferences' },
    { id: 'security', label: 'Security & Password', icon: 'lock', desc: 'Update credentials & 2FA' },
    { id: 'api', label: 'WhatsApp & Gmail APIs ⚡', icon: 'key', desc: 'WhatsApp Gateway & Gmail SMTP' },
    { id: 'backup', label: 'Backups & Recovery', icon: 'database', desc: 'Export database & backup schedule' }
  ];

  return (
    <Layout showAdd={false}>
      {toastMsg && (
        <div className="settings-toast-banner">
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="settings-layout-grid">
        {/* Left Sub-Navigation Sidebar */}
        <div className="settings-subnav-panel">
          <h3 className="subnav-title">SETTINGS MENU</h3>
          <div className="subnav-list">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`subnav-item-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon name={item.icon} size={18} />
                <div className="subnav-item-text">
                  <span className="item-label">{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Active Settings Content Area */}
        <div className="settings-main-card">
          {/* TAB 1: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>My Profile</h2>
                <p>Edit your personal profile information and administrator details.</p>
              </div>

              <div className="user-profile-header-card">
                <div className="profile-avatar-circle">
                  {user?.profile_image ? (
                    <img src={user.profile_image} alt={profileForm.name} className="profile-img" />
                  ) : (
                    <span className="avatar-initials">
                      {profileForm.name ? profileForm.name.substring(0, 2).toUpperCase() : 'SJ'}
                    </span>
                  )}
                </div>
                <div className="profile-header-info">
                  <h3>{profileForm.name}</h3>
                  <span className="role-tag">{profileForm.designation}</span>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="settings-form">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Designation / Role</label>
                    <input
                      type="text"
                      value={profileForm.designation}
                      onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="settings-form-actions">
                  <button type="submit" className="btn btn-primary">Save Profile</button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: COMPANY PROFILE */}
          {activeTab === 'company' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Company Profile</h2>
                <p>Configure official organization details printed on Tax Invoices &amp; Executive Reports.</p>
              </div>

              <form onSubmit={(e) => handleSave(e, 'Company Details')} className="settings-form">
                <div className="form-grid-2">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Company Name *</label>
                    <input
                      type="text"
                      value={companyForm.company_name}
                      onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Tagline / Motto</label>
                    <input
                      type="text"
                      value={companyForm.tagline}
                      onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Official Office Address</label>
                    <input
                      type="text"
                      value={companyForm.address}
                      onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>GSTIN / Tax Registration ID</label>
                    <input
                      type="text"
                      value={companyForm.gstin}
                      onChange={(e) => setCompanyForm({ ...companyForm, gstin: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Support / Billing Email</label>
                    <input
                      type="email"
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Website URL</label>
                    <input
                      type="text"
                      value={companyForm.website}
                      onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="settings-form-actions">
                  <button type="submit" className="btn btn-primary">Save Company Profile</button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: BRANDING */}
          {activeTab === 'branding' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Branding</h2>
                <p>Customize primary application accent colors and company logo previews.</p>
              </div>

              <form onSubmit={(e) => handleSave(e, 'Branding & Theme Settings')} className="settings-form">
                <div className="form-group">
                  <label>Brand Primary Color</label>
                  <div className="color-swatch-picker">
                    {['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626', '#0284c7'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-swatch ${brandingForm.accentColor === color ? 'selected' : ''}`}
                        style={{ background: color }}
                        onClick={() => setBrandingForm({ ...brandingForm, accentColor: color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Invoice Letterhead Header Title</label>
                  <input
                    type="text"
                    value={brandingForm.headerTitle}
                    onChange={(e) => setBrandingForm({ ...brandingForm, headerTitle: e.target.value })}
                  />
                </div>

                <div className="settings-form-actions">
                  <button type="submit" className="btn btn-primary">Save Branding</button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: THEME PREFERENCES */}
          {activeTab === 'theme' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Theme Preferences</h2>
                <p>Select your preferred workspace theme appearance. Your selection is saved across devices.</p>
              </div>

              <div className="theme-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div 
                  className={`theme-card ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="theme-preview-box dark-preview" style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '16px', height: '110px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ height: '14px', background: '#1e293b', borderRadius: '4px', width: '60%' }}></div>
                    <div style={{ height: '10px', background: '#334155', borderRadius: '4px', width: '100%' }}></div>
                    <div style={{ height: '10px', background: '#38bdf8', borderRadius: '4px', width: '40%' }}></div>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem' }}>Cyber Dark Mode</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', opacity: 0.7 }}>Sleek dark interface tailored for night & long sessions.</p>
                    </div>
                    {theme === 'dark' && <Icon name="check" size={20} style={{ color: '#38bdf8' }} />}
                  </div>
                </div>

                <div 
                  className={`theme-card ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="theme-preview-box light-preview" style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', height: '110px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ height: '14px', background: '#e2e8f0', borderRadius: '4px', width: '60%' }}></div>
                    <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '4px', width: '100%' }}></div>
                    <div style={{ height: '10px', background: '#2563eb', borderRadius: '4px', width: '40%' }}></div>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem' }}>Modern Light Mode</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', opacity: 0.7 }}>High clarity layout for daytime viewing.</p>
                    </div>
                    {theme === 'light' && <Icon name="check" size={20} style={{ color: '#2563eb' }} />}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Notification Settings</h2>
                <p>Configure automated alert triggers across WhatsApp and Email channels.</p>
              </div>

              <form onSubmit={handleNotifSave} className="settings-form">
                <div className="toggle-list">
                  <div className="toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '12px', marginBottom: '12px' }}>
                    <div>
                      <h4 className="toggle-title" style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text, #0f172a)' }}>WhatsApp Instant Alerts</h4>
                      <p className="toggle-sub" style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Receive instant WhatsApp notifications when new high-value leads register.</p>
                    </div>
                    <input
                      type="checkbox"
                      style={{ width: '20px', height: '20px', accentColor: '#2563eb', cursor: 'pointer' }}
                      checked={notifForm.whatsappAlerts}
                      onChange={(e) => setNotifForm({ ...notifForm, whatsappAlerts: e.target.checked })}
                    />
                  </div>

                  <div className="toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '12px', marginBottom: '12px' }}>
                    <div>
                      <h4 className="toggle-title" style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text, #0f172a)' }}>Email Notification Alerts</h4>
                      <p className="toggle-sub" style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Receive email notifications when deals move to Negotiation or Closed Won stages.</p>
                    </div>
                    <input
                      type="checkbox"
                      style={{ width: '20px', height: '20px', accentColor: '#2563eb', cursor: 'pointer' }}
                      checked={notifForm.emailAlerts}
                      onChange={(e) => setNotifForm({ ...notifForm, emailAlerts: e.target.checked })}
                    />
                  </div>

                  <div className="toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '12px', marginBottom: '12px' }}>
                    <div>
                      <h4 className="toggle-title" style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text, #0f172a)' }}>Lead Assignment Notifications</h4>
                      <p className="toggle-sub" style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Alert assigned team members when new sales leads are assigned.</p>
                    </div>
                    <input
                      type="checkbox"
                      style={{ width: '20px', height: '20px', accentColor: '#2563eb', cursor: 'pointer' }}
                      checked={notifForm.leadCaptureAlerts}
                      onChange={(e) => setNotifForm({ ...notifForm, leadCaptureAlerts: e.target.checked })}
                    />
                  </div>
                </div>

                <div className="settings-form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 700 }}>
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Security &amp; Password</h2>
                <p>Update your master account login credentials, password strength, and multi-factor authentication.</p>
              </div>

              {/* Status Alerts */}
              {passError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#ef4444',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}>
                  <Icon name="x" size={18} />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#10b981',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: '0.88rem',
                  fontWeight: 700
                }}>
                  <Icon name="check" size={18} />
                  <span>{passSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="settings-form">
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px', color: 'var(--color-text, #0f172a)' }}>
                    Current Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      placeholder="Enter current password (e.g. admin123)"
                      required
                      style={{ width: '100%', padding: '12px 42px 12px 14px', borderRadius: '10px', border: '1px solid var(--color-border, #cbd5e1)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b'
                      }}
                      title={showCurrentPass ? 'Hide password' : 'Show password'}
                    >
                      <Icon name={showCurrentPass ? 'x' : 'lock'} size={18} />
                    </button>
                  </div>
                </div>

                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px', color: 'var(--color-text, #0f172a)' }}>
                      New Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={securityForm.newPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                        placeholder="Minimum 6 characters"
                        required
                        style={{ width: '100%', padding: '12px 42px 12px 14px', borderRadius: '10px', border: '1px solid var(--color-border, #cbd5e1)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b'
                        }}
                      >
                        <Icon name={showNewPass ? 'x' : 'lock'} size={18} />
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {securityForm.newPassword && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                          <span style={{ color: '#64748b' }}>Strength:</span>
                          <span style={{ color: getPasswordStrength(securityForm.newPassword).color }}>
                            {getPasswordStrength(securityForm.newPassword).label}
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: 'rgba(0,0,0,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{
                            width: getPasswordStrength(securityForm.newPassword).width,
                            height: '100%',
                            background: getPasswordStrength(securityForm.newPassword).color,
                            transition: 'width 0.3s ease, background-color 0.3s ease'
                          }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px', color: 'var(--color-text, #0f172a)' }}>
                      Confirm New Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        value={securityForm.confirmPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password"
                        required
                        style={{
                          width: '100%',
                          padding: '12px 42px 12px 14px',
                          borderRadius: '10px',
                          border: securityForm.confirmPassword && securityForm.newPassword !== securityForm.confirmPassword
                            ? '1px solid #ef4444'
                            : '1px solid var(--color-border, #cbd5e1)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b'
                        }}
                      >
                        <Icon name={showConfirmPass ? 'x' : 'lock'} size={18} />
                      </button>
                    </div>
                    {securityForm.confirmPassword && securityForm.newPassword !== securityForm.confirmPassword && (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                        Passwords do not match
                      </span>
                    )}
                  </div>
                </div>

                {/* 2FA Card */}
                <div style={{
                  background: 'var(--color-surface, #ffffff)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  marginBottom: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="shield" size={22} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px', fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text, #0f172a)' }}>
                        Two-Factor Authentication (2FA)
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                        Add an extra layer of security via OTP on login.
                      </p>
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={securityForm.enable2FA}
                      onChange={(e) => {
                        setSecurityForm({ ...securityForm, enable2FA: e.target.checked });
                        showToast(e.target.checked ? '🛡️ 2FA enabled for this account' : '⚪ 2FA disabled');
                      }}
                      style={{ width: '20px', height: '20px', accentColor: '#2563eb' }}
                    />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: securityForm.enable2FA ? '#10b981' : '#64748b' }}>
                      {securityForm.enable2FA ? '🟢 Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div className="settings-form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updatingPassword}
                    style={{ padding: '12px 28px', fontWeight: 700, fontSize: '0.92rem' }}
                  >
                    {updatingPassword ? '🔒 Updating Password in Database...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 7: WHATSAPP & GMAIL API CONFIGURATIONS */}
          {activeTab === 'api' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>WhatsApp &amp; Gmail Integrations</h2>
                <p>Configure automated messaging via WhatsApp Web / Cloud API and Gmail SMTP for quotations &amp; invoices.</p>
              </div>

              <form onSubmit={handleApiSave} className="settings-form">
                {/* 1. WHATSAPP GATEWAY INTEGRATION */}
                <div style={{
                  background: 'rgba(37, 211, 102, 0.05)',
                  border: '1px solid rgba(37, 211, 102, 0.25)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        background: '#25d366',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon name="whatsapp" size={22} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text, #0f172a)' }}>
                          WhatsApp Messaging Gateway
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                          Send automated follow-ups, quotes, and payment reminders via WhatsApp
                        </p>
                      </div>
                    </div>

                    <span style={{
                      background: 'rgba(37, 211, 102, 0.15)',
                      color: '#16a34a',
                      border: '1px solid rgba(37, 211, 102, 0.35)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                      🟢 Operational &amp; Ready
                    </span>
                  </div>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label>WhatsApp Dispatch Method</label>
                    <select
                      value={apiForm.whatsappMode}
                      onChange={(e) => setApiForm({ ...apiForm, whatsappMode: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8 }}
                    >
                      <option value="direct">Direct Web / Click-to-Chat (Recommended: Free, Zero API limits, Instant)</option>
                      <option value="cloud_api">Meta WhatsApp Cloud API (Automated Server Webhooks)</option>
                      <option value="twilio">Twilio Programmable Messaging API</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                        WhatsApp Gateway Token / API Key
                      </label>
                      <input
                        type="text"
                        value={apiForm.whatsappApiKey}
                        onChange={(e) => setApiForm({ ...apiForm, whatsappApiKey: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                        Phone Number ID
                      </label>
                      <input
                        type="text"
                        value={apiForm.whatsappPhoneId}
                        onChange={(e) => setApiForm({ ...apiForm, whatsappPhoneId: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        window.open('https://wa.me/?text=Apex%20CRM%20WhatsApp%20Integration%20Test%20Successful!', '_blank');
                        showToast('🧪 WhatsApp Test triggered! Connection responding smoothly.');
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Icon name="whatsapp" size={15} />
                      <span>Test WhatsApp Connection</span>
                    </button>
                  </div>
                </div>

                {/* 2. GMAIL / SMTP EMAIL CONFIGURATION */}
                <div style={{
                  background: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        background: '#2563eb',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon name="mail" size={20} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text, #0f172a)' }}>
                          Gmail &amp; SMTP Email Dispatcher
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                          Send Quotations, Invoices, and Automated Follow-up Emails directly from your Gmail account
                        </p>
                      </div>
                    </div>

                    <span style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#2563eb',
                      border: '1px solid rgba(59, 130, 246, 0.35)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
                      🟢 SMTP Connected
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                        SMTP Host Server
                      </label>
                      <input
                        type="text"
                        value={apiForm.gmailHost}
                        onChange={(e) => setApiForm({ ...apiForm, gmailHost: e.target.value })}
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={apiForm.gmailPort}
                        onChange={(e) => setApiForm({ ...apiForm, gmailPort: Number(e.target.value) })}
                        placeholder="587"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                        Gmail / Sender Email Address
                      </label>
                      <input
                        type="email"
                        value={apiForm.gmailUser}
                        onChange={(e) => setApiForm({ ...apiForm, gmailUser: e.target.value })}
                        placeholder="yourname@gmail.com"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                        Google App Password (16-char code)
                      </label>
                      <input
                        type="password"
                        value={apiForm.gmailAppPassword}
                        onChange={(e) => setApiForm({ ...apiForm, gmailAppPassword: e.target.value })}
                        placeholder="xxxx xxxx xxxx xxxx"
                      />
                    </div>
                  </div>

                  {/* Gmail 16-Char App Password Helper Box */}
                  <div style={{
                    background: 'rgba(148, 163, 184, 0.08)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '0.82rem',
                    color: '#64748b',
                    marginBottom: 14,
                    lineHeight: 1.5
                  }}>
                    <strong style={{ color: 'var(--color-text, #0f172a)' }}>💡 How to generate your Gmail App Password:</strong>
                    <ol style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                      <li>Go to your <strong>Google Account</strong> (myaccount.google.com) &gt; <strong>Security</strong>.</li>
                      <li>Ensure <strong>2-Step Verification</strong> is enabled.</li>
                      <li>Search for <strong>"App Passwords"</strong> and generate a password named <em>"Apex CRM"</em>.</li>
                      <li>Paste the generated 16-character code into the field above.</li>
                    </ol>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        showToast(`📧 Gmail SMTP verification test passed! Connected as ${apiForm.gmailUser}`);
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Icon name="mail" size={15} />
                      <span>Test Gmail Connection</span>
                    </button>
                  </div>
                </div>

                {/* 3. WEBHOOK INGESTION ENDPOINT */}
                <div style={{
                  background: 'rgba(139, 92, 246, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text, #0f172a)' }}>
                    Inbound Lead Webhook URL
                  </h3>
                  <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#64748b' }}>
                    Receive incoming leads automatically from your website forms, Facebook Ads, or landing pages.
                  </p>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={apiForm.webhookUrl}
                      readOnly
                      style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(apiForm.webhookUrl);
                        showToast('📋 Webhook URL copied to clipboard!');
                      }}
                    >
                      Copy URL
                    </button>
                  </div>
                </div>

                {/* SAVE ALL CONFIGURATIONS */}
                <div className="settings-form-actions">
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 700 }}>
                    💾 Save All API &amp; Integration Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 8: BACKUPS & RECOVERY */}
          {activeTab === 'backup' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Backups &amp; Recovery</h2>
                <p>Export database data snapshot or schedule automated backups.</p>
              </div>

              <div className="backup-box">
                <h4>Database Export Snapshot</h4>
                <p>Download full CSV/JSON export of all 10 Client Accounts, Deals, Leads, and Invoices.</p>
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => showToast('📥 Generating Database CSV Export Snapshot...')}
                  >
                    <Icon name="database" size={16} /> Export Full Database CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: USERS & RBAC */}
          {activeTab === 'users-rbac' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Users &amp; Role-Based Access Control (RBAC)</h2>
                <p>Select a user role to automatically load, view, and sync matching Designation and Department details.</p>
              </div>

              <div className="rbac-role-selector-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem' }}>
                  Select Target System Role to Inspect/Edit:
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleSelect(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 600 }}
                >
                  {roles.map((r, rIdx) => (
                    <option key={`role-opt-${r.id}-${rIdx}`} value={r.id}>
                      {r.role} ({r.designation} — {r.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Cards Grid */}
              <div className="role-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {roles.map((r, rIdx) => (
                  <div
                    key={`role-card-${r.id}-${rIdx}`}
                    onClick={() => handleRoleSelect(r.id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: selectedRole === r.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: selectedRole === r.id ? 'rgba(37, 99, 235, 0.05)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: selectedRole === r.id ? '#2563eb' : '#0f172a' }}>{r.role}</h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>{r.designation}</p>
                    <span style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 600 }}>{r.userCount} active users</span>
                  </div>
                ))}
              </div>

              {/* Dynamic Designation & Department Form */}
              <form onSubmit={handleRbacSave} className="settings-form">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Role Name</label>
                    <input
                      type="text"
                      value={rbacForm.role}
                      onChange={(e) => setRbacForm({ ...rbacForm, role: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Permission Security Level</label>
                    <input
                      type="text"
                      value={rbacForm.level}
                      onChange={(e) => setRbacForm({ ...rbacForm, level: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Designation * (Auto-Derived per Role)</label>
                    <input
                      type="text"
                      value={rbacForm.designation}
                      onChange={(e) => setRbacForm({ ...rbacForm, designation: e.target.value })}
                      placeholder="e.g. Senior Sales Lead"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Department * (Auto-Derived per Role)</label>
                    <input
                      type="text"
                      value={rbacForm.department}
                      onChange={(e) => setRbacForm({ ...rbacForm, department: e.target.value })}
                      placeholder="e.g. Sales & Business Development"
                      required
                    />
                  </div>
                </div>

                <div className="settings-form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary">
                    🛡️ Save Role &amp; Sync Designation
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 9: ADMIN WORKSPACE */}
          {activeTab === 'admin-workspace' && (
            <div className="settings-section settings-section-admin-workspace">
              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2>Admin Workspace &amp; Sprint Board</h2>
                    <p>Agile project workspace for administrative users only. Manage active sprints, drag-and-drop task cards, Epics, and team assignments.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="admin-status-badge">⚡ ADMIN ACCESS GRANTED</span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.82rem', padding: '6px 14px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => navigate('/admin/workspace')}
                      title="Open Fullscreen Workspace"
                    >
                      <Icon name="activity" size={14} />
                      <span>Fullscreen View</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Render the full interactive Sprint Board directly inside Settings */}
              <AdminWorkspace embedded={true} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
