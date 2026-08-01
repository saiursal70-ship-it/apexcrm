import React, { useState } from 'react';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [toastMsg, setToastMsg] = useState(null);

  // Form states initialized with user/default data
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Shruti Joshi',
    email: user?.email || 'admin@crm.com',
    phone: '+91 98765 43210',
    designation: 'System Administrator'
  });

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

  const [notifForm, setNotifForm] = useState({
    emailAlerts: true,
    whatsappAlerts: true,
    leadCaptureAlerts: true,
    dailyDigest: false
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    enable2FA: false
  });

  const [apiForm, setApiForm] = useState({
    whatsappApiKey: 'wa_live_992838491823901923',
    webhookUrl: 'https://api.crmoverview.com/v1/webhooks/leads'
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = (e, sectionName) => {
    e.preventDefault();
    showToast(`✅ ${sectionName} saved successfully!`);
  };

  const navItems = [
    { id: 'profile', label: 'My Profile', icon: 'user', desc: 'Edit personal details and role' },
    { id: 'company', label: 'Company Profile', icon: 'building', desc: 'Manage company & GST details' },
    { id: 'branding', label: 'Branding', icon: 'palette', desc: 'Custom logo and theme accent' },
    { id: 'theme', label: 'Theme Preferences', icon: 'sun', desc: 'Light / Dark mode settings' },
    { id: 'notifications', label: 'Notification Settings', icon: 'bell', desc: 'Email & WhatsApp alert preferences' },
    { id: 'security', label: 'Security & Password', icon: 'shield', desc: 'Update credentials & 2FA' },
    { id: 'api', label: 'API Configurations', icon: 'key', desc: 'WhatsApp API & Webhook endpoints' },
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

              <form onSubmit={(e) => handleSave(e, 'Profile Settings')} className="settings-form">
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

              <form onSubmit={(e) => handleSave(e, 'Notification Preferences')} className="settings-form">
                <div className="toggle-list">
                  <div className="toggle-row">
                    <div>
                      <h4 className="toggle-title">WhatsApp Instant Alerts</h4>
                      <p className="toggle-sub">Receive instant WhatsApp notifications when new high-value leads register.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifForm.whatsappAlerts}
                      onChange={(e) => setNotifForm({ ...notifForm, whatsappAlerts: e.target.checked })}
                    />
                  </div>

                  <div className="toggle-row">
                    <div>
                      <h4 className="toggle-title">Email Notification Alerts</h4>
                      <p className="toggle-sub">Receive email notifications when deals move to Negotiation or Closed Won stages.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifForm.emailAlerts}
                      onChange={(e) => setNotifForm({ ...notifForm, emailAlerts: e.target.checked })}
                    />
                  </div>

                  <div className="toggle-row">
                    <div>
                      <h4 className="toggle-title">Lead Assignment Notifications</h4>
                      <p className="toggle-sub">Alert assigned team members when new sales leads are assigned.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifForm.leadCaptureAlerts}
                      onChange={(e) => setNotifForm({ ...notifForm, leadCaptureAlerts: e.target.checked })}
                    />
                  </div>
                </div>

                <div className="settings-form-actions">
                  <button type="submit" className="btn btn-primary">Save Preferences</button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Security &amp; Password</h2>
                <p>Update account access credentials and multi-factor authentication.</p>
              </div>

              <form onSubmit={(e) => handleSave(e, 'Password & Security')} className="settings-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={securityForm.currentPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="settings-form-actions">
                  <button type="submit" className="btn btn-primary">Update Password</button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 7: API CONFIGURATIONS */}
          {activeTab === 'api' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>API Configurations</h2>
                <p>Manage WhatsApp Gateway API keys and Webhook integration endpoints.</p>
              </div>

              <form onSubmit={(e) => handleSave(e, 'API Gateway Settings')} className="settings-form">
                <div className="form-group">
                  <label>WhatsApp Gateway API Key</label>
                  <input
                    type="text"
                    value={apiForm.whatsappApiKey}
                    onChange={(e) => setApiForm({ ...apiForm, whatsappApiKey: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Lead Webhook Endpoint URL</label>
                  <input
                    type="text"
                    value={apiForm.webhookUrl}
                    onChange={(e) => setApiForm({ ...apiForm, webhookUrl: e.target.value })}
                  />
                </div>

                <div className="settings-form-actions">
                  <button type="submit" className="btn btn-primary">Save API Config</button>
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
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
