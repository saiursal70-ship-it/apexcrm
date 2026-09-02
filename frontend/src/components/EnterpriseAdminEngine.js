import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/EnterpriseAdmin.css';

const DEFAULT_WORKSPACES = [
  { id: 1, workspace_code: 'DEV-WEB', workspace_name: 'Development', container_type: 'Dev' }
];

const DEFAULT_TYPES = [
  { id: 1, type_name: 'Development', type_code: 'Dev', description: 'Engineering, software dev and devops containers' },
  { id: 2, type_name: 'Internal Department', type_code: 'Dept', description: 'Company internal divisions and operational departments' },
  { id: 3, type_name: 'Client Organization', type_code: 'Client', description: 'External client dedicated workspaces' },
  { id: 4, type_name: 'Project Group', type_code: 'Proj', description: 'Multi-disciplinary project workspaces' },
  { id: 5, type_name: 'Support Unit', type_code: 'Supp', description: 'Customer success and ticketing operations' },
  { id: 6, type_name: 'Sales & Marketing', type_code: 'Sales', description: 'Lead generation and sales pipeline operations' }
];

const DEFAULT_CLIENTS = [
  { id: 1, client_code: 'CL-ABC', client_name: 'ABC Corporation', workspace: 'Development', email: 'contact@abccorp.com', phone: '', status: 'Active' }
];

const DEFAULT_PROJECTS = [
  { id: 1, project_code: 'PRJ-GRAVITY', project_name: 'Beyond Gravity', workspace: 'Development', status: 'In Progress' }
];

const DEFAULT_BOARDS = [
  { id: 1, board_code: 'BRD-SPRINT', board_name: 'Main Agile Sprint Board', project: 'Beyond Gravity', board_type: 'Agile Board' },
  { id: 2, board_code: 'BRD-BUGFIX', board_name: 'Triage & Bug Tracker Board', project: 'Beyond Gravity', board_type: 'Bug Tracker' }
];

// Sub-nav definitions per main module
const MODULE_SUBNAV_MAP = {
  company: [
    { key: 'profile', label: '🏢 Company Profile' },
    { key: 'branches', label: '🏗️ Branches & Departments' },
    { key: 'policies', label: '📋 Working Hours & Policies' }
  ],
  branding: [
    { key: 'logo-colors', label: '🎨 Logo & Brand Colors' },
    { key: 'email-templates', label: '📧 Email Templates' },
    { key: 'doc-branding', label: '📄 Document Branding' }
  ],
  security: [
    { key: 'security-settings', label: '🔒 Security Settings' },
    { key: 'ai-engine', label: '🤖 AI Engine' },
    { key: 'integrations', label: '🔗 Integrations' },
    { key: 'audit-logs', label: '📊 Audit Logs' }
  ],
  'users-rbac': [
    { key: 'directory', label: '👤 User Directory & Accounts' },
    { key: 'rbac', label: '🛡️ Role & RBAC Access Control' },
    { key: 'workspaces', label: '⚡ Workspaces & Structure' }
  ]
};

const ALL_PERMISSIONS = ['create', 'read', 'update', 'delete', 'manage_users', 'manage_settings', 'view_reports', 'export_data'];

const EnterpriseAdminEngine = () => {
  const { token } = useAuth();
  
  // Navigation States
  const [activeMainModule, setActiveMainModule] = useState('users-rbac');
  const [activeSubNav, setActiveSubNav] = useState('workspaces');
  const [activeEntityTab, setActiveEntityTab] = useState('workspaces');

  // Data States
  const [workspaces, setWorkspaces] = useState(DEFAULT_WORKSPACES);
  const [workspaceTypes, setWorkspaceTypes] = useState(DEFAULT_TYPES);
  const [clients, setClients] = useState(DEFAULT_CLIENTS);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [boards, setBoards] = useState(DEFAULT_BOARDS);

  // Form States
  const [wsForm, setWsForm] = useState({ workspace_name: '', workspace_code: '', container_type: 'Internal Department' });
  const [editingWsId, setEditingWsId] = useState(null);
  const [typeForm, setTypeForm] = useState({ type_name: '', type_code: '', description: '' });
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [clientForm, setClientForm] = useState({ client_code: '', client_name: '', workspace: '', email: '', phone: '', status: 'Active' });
  const [editingClientId, setEditingClientId] = useState(null);
  const [projectForm, setProjectForm] = useState({ project_code: '', project_name: '', workspace: '', status: 'In Progress' });
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [boardForm, setBoardForm] = useState({ board_code: '', board_name: '', project: '', board_type: 'Agile Board' });
  const [editingBoardId, setEditingBoardId] = useState(null);

  // Company Profile State
  const [companyProfile, setCompanyProfile] = useState({
    company_name: 'Apex Dev Technologies Pvt. Ltd.',
    address: '42, Tower B, Tech Park, Pune, Maharashtra, India',
    phone: '+91 20 1234 5678',
    email: 'admin@apexdev.io',
    website: 'https://apexdev.io',
    gst_id: '27AABCA1234F1ZP',
    industry: 'Software & IT Services'
  });

  // Branches State
  const [branches, setBranches] = useState([
    { id: 1, branch_name: 'Headquarters — Pune', location: 'Pune, Maharashtra', manager: 'Sai Ursal', employees: 42 },
    { id: 2, branch_name: 'Remote Engineering', location: 'Distributed', manager: 'Elena Rostova', employees: 18 }
  ]);
  const [branchForm, setBranchForm] = useState({ branch_name: '', location: '', manager: '', employees: '' });
  const [editingBranchId, setEditingBranchId] = useState(null);

  // Policies State
  const [policies, setPolicies] = useState([
    { id: 1, policy_name: 'Standard Working Hours', category: 'Working Hours', description: 'Monday to Friday, 9:00 AM - 6:00 PM IST' },
    { id: 2, policy_name: 'Remote Work Policy', category: 'Working Hours', description: 'Up to 3 days per week with manager approval' },
    { id: 3, policy_name: 'Data Security Policy', category: 'Security', description: 'All client data encrypted at rest and in transit' }
  ]);
  const [policyForm, setPolicyForm] = useState({ policy_name: '', category: 'Working Hours', description: '' });
  const [editingPolicyId, setEditingPolicyId] = useState(null);

  // Branding States
  const [brandSettings, setBrandSettings] = useState({ primary_color: '#2563eb', accent_color: '#8b5cf6', font_family: 'Inter', logo_text: 'Apex CRM', dark_mode_default: false });
  const [emailTemplates, setEmailTemplates] = useState([
    { id: 1, template_name: 'Welcome Email', subject: 'Welcome to {{company_name}}!', body: 'Hi {{name}}, welcome aboard!', status: 'Active' },
    { id: 2, template_name: 'Invoice Notification', subject: 'Invoice #{{invoice_no}}', body: 'Dear {{client_name}}, please find attached.', status: 'Active' },
    { id: 3, template_name: 'Deal Won', subject: 'Deal "{{deal_name}}" Closed!', body: 'Deal worth {{value}} marked as won.', status: 'Active' }
  ]);
  const [emailForm, setEmailForm] = useState({ template_name: '', subject: '', body: '', status: 'Active' });
  const [editingEmailId, setEditingEmailId] = useState(null);
  const [docBranding, setDocBranding] = useState({ header_text: 'Apex Dev Technologies Pvt. Ltd.', footer_text: '© 2026 Apex Dev. All rights reserved.', show_watermark: true, watermark_text: 'CONFIDENTIAL', show_logo_on_docs: true });

  // Security States
  const [securitySettings, setSecuritySettings] = useState({ two_factor_enabled: true, password_min_length: 8, password_require_uppercase: true, password_require_numbers: true, password_require_special: true, session_timeout_minutes: 30, max_login_attempts: 5, ip_whitelist_enabled: false, ip_whitelist: '' });
  const [aiSettings, setAiSettings] = useState({ ai_model: 'Gemini 2.5 Pro', auto_lead_scoring: true, auto_tagging: true, smart_task_assignment: false, sentiment_analysis: true, ai_response_suggestions: true });
  const [integrations] = useState([
    { id: 1, name: 'Stripe', category: 'Payments', status: 'Connected', icon: '💳' },
    { id: 2, name: 'WhatsApp Business', category: 'Messaging', status: 'Connected', icon: '💬' },
    { id: 3, name: 'Google Calendar', category: 'Scheduling', status: 'Connected', icon: '📅' },
    { id: 4, name: 'Slack', category: 'Communication', status: 'Disconnected', icon: '🔔' },
    { id: 5, name: 'Razorpay', category: 'Payments', status: 'Disconnected', icon: '💰' },
    { id: 6, name: 'Twilio SMS', category: 'Messaging', status: 'Disconnected', icon: '📱' },
    { id: 7, name: 'Mailgun', category: 'Email', status: 'Connected', icon: '✉️' },
    { id: 8, name: 'GitHub', category: 'Development', status: 'Connected', icon: '🐙' }
  ]);
  const [auditLogs] = useState([
    { id: 1, timestamp: '2026-08-31 17:45:12', user: 'Sai Admin', action: 'CREATE', entity: 'Deal', details: 'Created deal "Enterprise License v3.0"' },
    { id: 2, timestamp: '2026-08-31 17:30:05', user: 'Elena Rostova', action: 'UPDATE', entity: 'Lead', details: 'Changed status to "Qualified"' },
    { id: 3, timestamp: '2026-08-31 16:58:41', user: 'Sarah Jenkins', action: 'DELETE', entity: 'Task', details: 'Soft-deleted old follow-up reminder' },
    { id: 4, timestamp: '2026-08-31 15:12:00', user: 'Sai Admin', action: 'LOGIN', entity: 'Auth', details: 'Login from 192.168.1.105' },
    { id: 5, timestamp: '2026-08-31 14:20:33', user: 'Claire Redfield', action: 'CREATE', entity: 'Invoice', details: 'Generated INV-2026-0089' },
    { id: 6, timestamp: '2026-08-31 12:05:18', user: 'Michael Vance', action: 'UPDATE', entity: 'Sprint Task', details: 'Moved NUC-338 to "In Review"' }
  ]);

  // User Directory State
  const [users, setUsers] = useState([
    { id: 1, name: 'Sai Ursal', email: 'sai@apexdev.io', role: 'Admin', department: 'Engineering', status: 'Active' },
    { id: 2, name: 'Elena Rostova', email: 'elena@apexdev.io', role: 'Sales Lead', department: 'Sales', status: 'Active' },
    { id: 3, name: 'Sarah Jenkins', email: 'sarah@apexdev.io', role: 'Account Executive', department: 'Sales', status: 'Active' },
    { id: 4, name: 'Claire Redfield', email: 'claire@apexdev.io', role: 'Support Lead', department: 'Support', status: 'Active' },
    { id: 5, name: 'Michael Vance', email: 'michael@apexdev.io', role: 'Tech Lead', department: 'Engineering', status: 'Active' }
  ]);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Employee', department: 'Engineering', status: 'Active' });
  const [editingUserId, setEditingUserId] = useState(null);

  // RBAC Roles State
  const [roles, setRoles] = useState([
    { id: 1, role_name: 'Admin', permissions: ['create', 'read', 'update', 'delete', 'manage_users', 'manage_settings', 'view_reports', 'export_data'], description: 'Full system access' },
    { id: 2, role_name: 'Sales Lead', permissions: ['create', 'read', 'update', 'view_reports'], description: 'Manage leads, deals, reports' },
    { id: 3, role_name: 'Account Executive', permissions: ['create', 'read', 'update'], description: 'Manage own records' },
    { id: 4, role_name: 'Support Lead', permissions: ['read', 'update', 'create'], description: 'Manage tickets' },
    { id: 5, role_name: 'Viewer', permissions: ['read', 'view_reports'], description: 'Read-only access' }
  ]);
  const [roleForm, setRoleForm] = useState({ role_name: '', description: '', permissions: [] });
  const [editingRoleId, setEditingRoleId] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3500); };

  const handleMainModuleSwitch = (moduleKey) => {
    setActiveMainModule(moduleKey);
    const subNavs = MODULE_SUBNAV_MAP[moduleKey];
    if (subNavs && subNavs.length > 0) setActiveSubNav(subNavs[0].key);
  };

  const apiConfig = () => ({ headers: token ? { Authorization: `Bearer ${token}` } : {} });

  // Fetch all data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = apiConfig();
        const [wsRes, wtRes, clRes, pjRes, brRes] = await Promise.allSettled([
          axios.get('http://localhost:5001/api/workspaces', config),
          axios.get('http://localhost:5001/api/workspace-types', config),
          axios.get('http://localhost:5001/api/clients', config),
          axios.get('http://localhost:5001/api/projects', config),
          axios.get('http://localhost:5001/api/boards', config)
        ]);
        if (wsRes.status === 'fulfilled' && Array.isArray(wsRes.value.data) && wsRes.value.data.length > 0) setWorkspaces(wsRes.value.data);
        if (wtRes.status === 'fulfilled' && Array.isArray(wtRes.value.data) && wtRes.value.data.length > 0) setWorkspaceTypes(wtRes.value.data);
        if (clRes.status === 'fulfilled' && Array.isArray(clRes.value.data) && clRes.value.data.length > 0) setClients(clRes.value.data);
        if (pjRes.status === 'fulfilled' && Array.isArray(pjRes.value.data) && pjRes.value.data.length > 0) setProjects(pjRes.value.data);
        if (brRes.status === 'fulfilled' && Array.isArray(brRes.value.data) && brRes.value.data.length > 0) setBoards(brRes.value.data);
      } catch (err) {}
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── GENERIC CRUD HELPER ──
  const makeCrudHandlers = (items, setItems, endpoint, formState, setFormState, editingId, setEditingId, defaultForm, codeField, nameField) => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formState[nameField]?.trim() || !formState[codeField]?.trim()) { showToast('⚠️ Please fill required fields.'); return; }
      const payload = {};
      Object.keys(formState).forEach(k => { payload[k] = typeof formState[k] === 'string' ? formState[k].trim() : formState[k]; });
      if (codeField && payload[codeField]) payload[codeField] = payload[codeField].toUpperCase();
      const config = apiConfig();
      if (editingId) {
        setItems(items.map((it) => (it.id === editingId ? { ...it, ...payload } : it)));
        showToast(`✅ '${payload[nameField]}' updated.`);
        try { await axios.put(`http://localhost:5001/api/${endpoint}/${editingId}`, payload, config); } catch (err) {}
        setEditingId(null);
      } else {
        const newItem = { id: Date.now(), ...payload };
        setItems([...items, newItem]);
        showToast(`🎉 '${payload[nameField]}' created!`);
        try { const res = await axios.post(`http://localhost:5001/api/${endpoint}`, payload, config); if (res.data?.id) setItems((prev) => prev.map((it) => (it.id === newItem.id ? { ...it, id: res.data.id } : it))); } catch (err) {}
      }
      setFormState(defaultForm);
    };
    const handleEdit = (item) => { setEditingId(item.id); const f = {}; Object.keys(defaultForm).forEach(k => { f[k] = item[k] || defaultForm[k]; }); setFormState(f); };
    const handleDelete = async (id) => {
      if (!window.confirm('Are you sure?')) return;
      setItems(items.filter((it) => it.id !== id));
      showToast('🗑️ Removed.');
      try { await axios.delete(`http://localhost:5001/api/${endpoint}/${id}`, apiConfig()); } catch (err) {}
    };
    return { handleSubmit, handleEdit, handleDelete };
  };

  const wsCrud = makeCrudHandlers(workspaces, setWorkspaces, 'workspaces', wsForm, setWsForm, editingWsId, setEditingWsId, { workspace_name: '', workspace_code: '', container_type: 'Internal Department' }, 'workspace_code', 'workspace_name');
  const typeCrud = makeCrudHandlers(workspaceTypes, setWorkspaceTypes, 'workspace-types', typeForm, setTypeForm, editingTypeId, setEditingTypeId, { type_name: '', type_code: '', description: '' }, 'type_code', 'type_name');
  const clientCrud = makeCrudHandlers(clients, setClients, 'clients', clientForm, setClientForm, editingClientId, setEditingClientId, { client_code: '', client_name: '', workspace: '', email: '', phone: '', status: 'Active' }, 'client_code', 'client_name');
  const projectCrud = makeCrudHandlers(projects, setProjects, 'projects', projectForm, setProjectForm, editingProjectId, setEditingProjectId, { project_code: '', project_name: '', workspace: '', status: 'In Progress' }, 'project_code', 'project_name');
  const boardCrud = makeCrudHandlers(boards, setBoards, 'boards', boardForm, setBoardForm, editingBoardId, setEditingBoardId, { board_code: '', board_name: '', project: '', board_type: 'Agile Board' }, 'board_code', 'board_name');

  // Local-only CRUD handlers
  const handleBranchSubmit = (e) => { e.preventDefault(); if (!branchForm.branch_name.trim()) { showToast('⚠️ Branch name required.'); return; }
    const p = { ...branchForm, employees: Number(branchForm.employees) || 0 };
    if (editingBranchId) { setBranches(branches.map(b => b.id === editingBranchId ? { ...b, ...p } : b)); showToast('✅ Branch updated.'); setEditingBranchId(null); }
    else { setBranches([...branches, { id: Date.now(), ...p }]); showToast('🎉 Branch added!'); }
    setBranchForm({ branch_name: '', location: '', manager: '', employees: '' });
  };
  const handlePolicySubmit = (e) => { e.preventDefault(); if (!policyForm.policy_name.trim()) { showToast('⚠️ Policy name required.'); return; }
    if (editingPolicyId) { setPolicies(policies.map(p => p.id === editingPolicyId ? { ...p, ...policyForm } : p)); showToast('✅ Policy updated.'); setEditingPolicyId(null); }
    else { setPolicies([...policies, { id: Date.now(), ...policyForm }]); showToast('🎉 Policy added!'); }
    setPolicyForm({ policy_name: '', category: 'Working Hours', description: '' });
  };
  const handleEmailSubmit = (e) => { e.preventDefault(); if (!emailForm.template_name.trim()) { showToast('⚠️ Template name required.'); return; }
    if (editingEmailId) { setEmailTemplates(emailTemplates.map(t => t.id === editingEmailId ? { ...t, ...emailForm } : t)); showToast('✅ Template updated.'); setEditingEmailId(null); }
    else { setEmailTemplates([...emailTemplates, { id: Date.now(), ...emailForm }]); showToast('🎉 Template created!'); }
    setEmailForm({ template_name: '', subject: '', body: '', status: 'Active' });
  };
  const handleUserSubmit = (e) => { e.preventDefault(); if (!userForm.name.trim() || !userForm.email.trim()) { showToast('⚠️ Name & email required.'); return; }
    if (editingUserId) { setUsers(users.map(u => u.id === editingUserId ? { ...u, ...userForm } : u)); showToast('✅ User updated.'); setEditingUserId(null); }
    else { setUsers([...users, { id: Date.now(), ...userForm }]); showToast('🎉 User added!'); }
    setUserForm({ name: '', email: '', role: 'Employee', department: 'Engineering', status: 'Active' });
  };
  const handleRoleSubmit = (e) => { e.preventDefault(); if (!roleForm.role_name.trim()) { showToast('⚠️ Role name required.'); return; }
    if (editingRoleId) { setRoles(roles.map(r => r.id === editingRoleId ? { ...r, ...roleForm } : r)); showToast('✅ Role updated.'); setEditingRoleId(null); }
    else { setRoles([...roles, { id: Date.now(), ...roleForm }]); showToast('🎉 Role created!'); }
    setRoleForm({ role_name: '', description: '', permissions: [] });
  };
  const togglePermission = (perm) => setRoleForm(prev => ({ ...prev, permissions: prev.permissions.includes(perm) ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm] }));

  // ── RENDER SUB-NAV CONTENT ──
  const renderSubNavContent = () => {
    // COMPANY MODULE
    if (activeMainModule === 'company') {
      if (activeSubNav === 'profile') return (
        <div className="enterprise-section-box"><div className="section-box-header"><h2><span>🏢</span> Company Profile</h2><p>Manage your organization's core identity and contact information.</p></div>
        <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>✏️ Edit Company Details</span></div>
            <div className="form-field-group"><label>Company Name</label><input type="text" className="form-field-input" value={companyProfile.company_name} onChange={e => setCompanyProfile({...companyProfile, company_name: e.target.value})} /></div>
            <div className="form-field-group"><label>Industry</label><select className="form-field-select" value={companyProfile.industry} onChange={e => setCompanyProfile({...companyProfile, industry: e.target.value})}><option>Software & IT Services</option><option>Healthcare</option><option>Finance & Banking</option><option>Manufacturing</option><option>Retail & E-commerce</option><option>Education</option></select></div>
            <div className="form-field-group"><label>Address</label><input type="text" className="form-field-input" value={companyProfile.address} onChange={e => setCompanyProfile({...companyProfile, address: e.target.value})} /></div>
            <div className="form-field-group"><label>Phone</label><input type="text" className="form-field-input" value={companyProfile.phone} onChange={e => setCompanyProfile({...companyProfile, phone: e.target.value})} /></div>
            <div className="form-field-group"><label>Email</label><input type="email" className="form-field-input" value={companyProfile.email} onChange={e => setCompanyProfile({...companyProfile, email: e.target.value})} /></div>
            <div className="form-field-group"><label>Website</label><input type="url" className="form-field-input" value={companyProfile.website} onChange={e => setCompanyProfile({...companyProfile, website: e.target.value})} /></div>
            <div className="form-field-group"><label>GST / Tax ID</label><input type="text" className="form-field-input" value={companyProfile.gst_id} onChange={e => setCompanyProfile({...companyProfile, gst_id: e.target.value})} /></div>
            <button type="button" className="btn-submit-workspace" onClick={() => showToast('✅ Company profile saved!')}><span>💾 Save Profile</span></button>
          </div>
          <div className="workspace-table-card"><div className="table-card-header"><h3>Company Summary</h3></div>
            <table className="enterprise-styled-table"><tbody>
              {Object.entries(companyProfile).map(([k,v]) => <tr key={k}><td style={{fontWeight:700,textTransform:'capitalize',color:'#475569'}}>{k.replace(/_/g,' ')}</td><td style={{fontWeight:600,color:'#0f172a'}}>{v}</td></tr>)}
            </tbody></table>
          </div>
        </div></div>
      );
      if (activeSubNav === 'branches') return (
        <div className="enterprise-section-box"><div className="section-box-header"><h2><span>🏗️</span> Branches & Departments</h2><p>Manage office locations and department structure.</p></div>
        <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>{editingBranchId ? '✏️ Edit Branch' : '⊕ Add Branch'}</span></div>
            <form onSubmit={handleBranchSubmit}>
              <div className="form-field-group"><label>Branch Name *</label><input type="text" className="form-field-input" placeholder="e.g. Mumbai Office" value={branchForm.branch_name} onChange={e => setBranchForm({...branchForm, branch_name: e.target.value})} required /></div>
              <div className="form-field-group"><label>Location</label><input type="text" className="form-field-input" placeholder="City, State" value={branchForm.location} onChange={e => setBranchForm({...branchForm, location: e.target.value})} /></div>
              <div className="form-field-group"><label>Manager</label><input type="text" className="form-field-input" value={branchForm.manager} onChange={e => setBranchForm({...branchForm, manager: e.target.value})} /></div>
              <div className="form-field-group"><label>Employees</label><input type="number" className="form-field-input" value={branchForm.employees} onChange={e => setBranchForm({...branchForm, employees: e.target.value})} /></div>
              <button type="submit" className="btn-submit-workspace"><span>{editingBranchId ? '✓ Save' : '+ Add Branch'}</span></button>
              {editingBranchId && <button type="button" className="btn-cancel-form" onClick={() => { setEditingBranchId(null); setBranchForm({branch_name:'',location:'',manager:'',employees:''}); }}>Cancel</button>}
            </form></div>
          <div className="workspace-table-card"><div className="table-card-header"><h3>All Branches ({branches.length})</h3></div>
            <table className="enterprise-styled-table"><thead><tr><th>BRANCH</th><th>LOCATION</th><th>MANAGER</th><th>STAFF</th><th style={{textAlign:'right'}}>ACTIONS</th></tr></thead><tbody>
              {branches.map(b => <tr key={`br-${b.id}`}><td style={{fontWeight:700,color:'#0f172a'}}>{b.branch_name}</td><td>{b.location}</td><td>{b.manager}</td><td><span className="code-badge-tag">{b.employees}</span></td><td><div className="action-buttons-cell" style={{justifyContent:'flex-end'}}><button type="button" className="btn-action-icon" onClick={() => { setEditingBranchId(b.id); setBranchForm(b); }}>✏️</button><button type="button" className="btn-action-icon delete" onClick={() => { if(window.confirm('Delete?')) { setBranches(branches.filter(x=>x.id!==b.id)); showToast('🗑️ Removed.'); } }}>🗑️</button></div></td></tr>)}
            </tbody></table></div>
        </div></div>
      );
      if (activeSubNav === 'policies') return (
        <div className="enterprise-section-box"><div className="section-box-header"><h2><span>📋</span> Working Hours & Policies</h2><p>Define organizational policies and compliance guidelines.</p></div>
        <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>{editingPolicyId ? '✏️ Edit Policy' : '⊕ Add Policy'}</span></div>
            <form onSubmit={handlePolicySubmit}>
              <div className="form-field-group"><label>Policy Name *</label><input type="text" className="form-field-input" placeholder="e.g. Leave Policy" value={policyForm.policy_name} onChange={e => setPolicyForm({...policyForm, policy_name: e.target.value})} required /></div>
              <div className="form-field-group"><label>Category</label><select className="form-field-select" value={policyForm.category} onChange={e => setPolicyForm({...policyForm, category: e.target.value})}><option>Working Hours</option><option>Leave</option><option>Security</option><option>Compliance</option><option>HR</option></select></div>
              <div className="form-field-group"><label>Description</label><input type="text" className="form-field-input" placeholder="Describe the policy" value={policyForm.description} onChange={e => setPolicyForm({...policyForm, description: e.target.value})} /></div>
              <button type="submit" className="btn-submit-workspace"><span>{editingPolicyId ? '✓ Save' : '+ Add Policy'}</span></button>
              {editingPolicyId && <button type="button" className="btn-cancel-form" onClick={() => { setEditingPolicyId(null); setPolicyForm({policy_name:'',category:'Working Hours',description:''}); }}>Cancel</button>}
            </form></div>
          <div className="workspace-table-card"><div className="table-card-header"><h3>Policies ({policies.length})</h3></div>
            <table className="enterprise-styled-table"><thead><tr><th>POLICY</th><th>CATEGORY</th><th>DESCRIPTION</th><th style={{textAlign:'right'}}>ACTIONS</th></tr></thead><tbody>
              {policies.map(p => <tr key={`pol-${p.id}`}><td style={{fontWeight:700,color:'#0f172a'}}>{p.policy_name}</td><td><span className="container-type-badge">{p.category}</span></td><td style={{color:'#64748b',fontSize:'0.85rem'}}>{p.description}</td><td><div className="action-buttons-cell" style={{justifyContent:'flex-end'}}><button type="button" className="btn-action-icon" onClick={() => { setEditingPolicyId(p.id); setPolicyForm(p); }}>✏️</button><button type="button" className="btn-action-icon delete" onClick={() => { if(window.confirm('Delete?')) { setPolicies(policies.filter(x=>x.id!==p.id)); showToast('🗑️ Removed.'); } }}>🗑️</button></div></td></tr>)}
            </tbody></table></div>
        </div></div>
      );
    }

    // BRANDING MODULE
    if (activeMainModule === 'branding') {
      if (activeSubNav === 'logo-colors') return (
        <div className="enterprise-section-box"><div className="section-box-header"><h2><span>🎨</span> Logo & Brand Colors</h2><p>Customize your brand identity across the CRM.</p></div>
        <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>🎨 Brand Settings</span></div>
            <div className="form-field-group"><label>Primary Color</label><div style={{display:'flex',gap:10,alignItems:'center'}}><input type="color" value={brandSettings.primary_color} onChange={e => setBrandSettings({...brandSettings, primary_color: e.target.value})} style={{width:50,height:38,border:'none',cursor:'pointer',borderRadius:6}} /><input type="text" className="form-field-input" value={brandSettings.primary_color} onChange={e => setBrandSettings({...brandSettings, primary_color: e.target.value})} style={{flex:1}} /></div></div>
            <div className="form-field-group"><label>Accent Color</label><div style={{display:'flex',gap:10,alignItems:'center'}}><input type="color" value={brandSettings.accent_color} onChange={e => setBrandSettings({...brandSettings, accent_color: e.target.value})} style={{width:50,height:38,border:'none',cursor:'pointer',borderRadius:6}} /><input type="text" className="form-field-input" value={brandSettings.accent_color} onChange={e => setBrandSettings({...brandSettings, accent_color: e.target.value})} style={{flex:1}} /></div></div>
            <div className="form-field-group"><label>Font Family</label><select className="form-field-select" value={brandSettings.font_family} onChange={e => setBrandSettings({...brandSettings, font_family: e.target.value})}><option>Inter</option><option>Roboto</option><option>Poppins</option><option>Open Sans</option><option>Nunito</option></select></div>
            <div className="form-field-group"><label>Logo Text</label><input type="text" className="form-field-input" value={brandSettings.logo_text} onChange={e => setBrandSettings({...brandSettings, logo_text: e.target.value})} /></div>
            <div className="form-field-group" style={{display:'flex',alignItems:'center',gap:10}}><input type="checkbox" checked={brandSettings.dark_mode_default} onChange={e => setBrandSettings({...brandSettings, dark_mode_default: e.target.checked})} style={{width:18,height:18}} /><label style={{margin:0}}>Default Dark Mode</label></div>
            <button type="button" className="btn-submit-workspace" onClick={() => showToast('✅ Brand settings saved!')}><span>💾 Save</span></button>
          </div>
          <div className="workspace-table-card"><div className="table-card-header"><h3>Brand Preview</h3></div>
            <div style={{padding:20}}>
              <div style={{display:'flex',gap:16,marginBottom:20}}>
                <div style={{width:80,height:80,borderRadius:12,background:brandSettings.primary_color,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:'0.8rem'}}>Primary</div>
                <div style={{width:80,height:80,borderRadius:12,background:brandSettings.accent_color,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:'0.8rem'}}>Accent</div>
                <div style={{width:80,height:80,borderRadius:12,background:`linear-gradient(135deg, ${brandSettings.primary_color}, ${brandSettings.accent_color})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:'0.8rem'}}>Gradient</div>
              </div>
              <div style={{fontFamily:brandSettings.font_family,padding:16,border:'2px solid #e2e8f0',borderRadius:10}}>
                <h3 style={{color:brandSettings.primary_color,marginBottom:8}}>{brandSettings.logo_text}</h3>
                <p style={{color:'#64748b',fontSize:'0.88rem'}}>Font: <strong>{brandSettings.font_family}</strong></p>
                <button style={{background:brandSettings.primary_color,color:'#fff',border:'none',padding:'8px 20px',borderRadius:8,fontWeight:700,marginTop:8,cursor:'pointer'}}>Sample Button</button>
              </div>
            </div></div>
        </div></div>
      );
      if (activeSubNav === 'email-templates') return (
        <div className="enterprise-section-box"><div className="section-box-header"><h2><span>📧</span> Email Templates</h2><p>Create reusable email templates for notifications and outreach.</p></div>
        <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>{editingEmailId ? '✏️ Edit Template' : '⊕ Create Template'}</span></div>
            <form onSubmit={handleEmailSubmit}>
              <div className="form-field-group"><label>Template Name *</label><input type="text" className="form-field-input" placeholder="e.g. Follow-up" value={emailForm.template_name} onChange={e => setEmailForm({...emailForm, template_name: e.target.value})} required /></div>
              <div className="form-field-group"><label>Subject</label><input type="text" className="form-field-input" value={emailForm.subject} onChange={e => setEmailForm({...emailForm, subject: e.target.value})} /></div>
              <div className="form-field-group"><label>Body</label><textarea className="form-field-input" rows="3" value={emailForm.body} onChange={e => setEmailForm({...emailForm, body: e.target.value})} style={{resize:'vertical',minHeight:80}} /></div>
              <div className="form-field-group"><label>Status</label><select className="form-field-select" value={emailForm.status} onChange={e => setEmailForm({...emailForm, status: e.target.value})}><option>Active</option><option>Draft</option><option>Archived</option></select></div>
              <button type="submit" className="btn-submit-workspace"><span>{editingEmailId ? '✓ Save' : '+ Create'}</span></button>
              {editingEmailId && <button type="button" className="btn-cancel-form" onClick={() => { setEditingEmailId(null); setEmailForm({template_name:'',subject:'',body:'',status:'Active'}); }}>Cancel</button>}
            </form></div>
          <div className="workspace-table-card"><div className="table-card-header"><h3>Templates ({emailTemplates.length})</h3></div>
            <table className="enterprise-styled-table"><thead><tr><th>TEMPLATE</th><th>SUBJECT</th><th>STATUS</th><th style={{textAlign:'right'}}>ACTIONS</th></tr></thead><tbody>
              {emailTemplates.map(t => <tr key={`em-${t.id}`}><td style={{fontWeight:700,color:'#0f172a'}}>{t.template_name}</td><td style={{color:'#64748b',fontSize:'0.85rem'}}>{t.subject}</td><td><span style={{color:t.status==='Active'?'#16a34a':'#94a3b8',fontWeight:700}}>● {t.status}</span></td><td><div className="action-buttons-cell" style={{justifyContent:'flex-end'}}><button type="button" className="btn-action-icon" onClick={() => { setEditingEmailId(t.id); setEmailForm(t); }}>✏️</button><button type="button" className="btn-action-icon delete" onClick={() => { if(window.confirm('Delete?')) { setEmailTemplates(emailTemplates.filter(x=>x.id!==t.id)); showToast('🗑️ Removed.'); } }}>🗑️</button></div></td></tr>)}
            </tbody></table></div>
        </div></div>
      );
      if (activeSubNav === 'doc-branding') return (
        <div className="enterprise-section-box"><div className="section-box-header"><h2><span>📄</span> Document Branding</h2><p>Configure headers, footers, and watermarks for PDF exports.</p></div>
        <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>📄 Document Settings</span></div>
            <div className="form-field-group"><label>Header Text</label><input type="text" className="form-field-input" value={docBranding.header_text} onChange={e => setDocBranding({...docBranding, header_text: e.target.value})} /></div>
            <div className="form-field-group"><label>Footer Text</label><input type="text" className="form-field-input" value={docBranding.footer_text} onChange={e => setDocBranding({...docBranding, footer_text: e.target.value})} /></div>
            <div className="form-field-group" style={{display:'flex',alignItems:'center',gap:10}}><input type="checkbox" checked={docBranding.show_logo_on_docs} onChange={e => setDocBranding({...docBranding, show_logo_on_docs: e.target.checked})} style={{width:18,height:18}} /><label style={{margin:0}}>Show Logo</label></div>
            <div className="form-field-group" style={{display:'flex',alignItems:'center',gap:10}}><input type="checkbox" checked={docBranding.show_watermark} onChange={e => setDocBranding({...docBranding, show_watermark: e.target.checked})} style={{width:18,height:18}} /><label style={{margin:0}}>Show Watermark</label></div>
            {docBranding.show_watermark && <div className="form-field-group"><label>Watermark Text</label><input type="text" className="form-field-input" value={docBranding.watermark_text} onChange={e => setDocBranding({...docBranding, watermark_text: e.target.value})} /></div>}
            <button type="button" className="btn-submit-workspace" onClick={() => showToast('✅ Doc branding saved!')}><span>💾 Save</span></button>
          </div>
          <div className="workspace-table-card"><div className="table-card-header"><h3>Preview</h3></div>
            <div style={{padding:20,border:'2px solid #e2e8f0',borderRadius:10,margin:12,position:'relative',minHeight:200}}>
              {docBranding.show_watermark && <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%) rotate(-30deg)',fontSize:'2.5rem',fontWeight:900,color:'rgba(0,0,0,0.06)',pointerEvents:'none'}}>{docBranding.watermark_text}</div>}
              <div style={{borderBottom:'2px solid #e2e8f0',paddingBottom:10,marginBottom:14}}><strong style={{fontSize:'1rem',color:'#0f172a'}}>{docBranding.header_text}</strong></div>
              <div style={{color:'#64748b',fontSize:'0.85rem',minHeight:80}}><p>Invoice / Quotation content area...</p></div>
              <div style={{borderTop:'2px solid #e2e8f0',paddingTop:10,marginTop:14,fontSize:'0.75rem',color:'#94a3b8'}}>{docBranding.footer_text}</div>
            </div></div>
        </div></div>
      );
    }

    // SECURITY MODULE
    if (activeMainModule === 'security') {
      if (activeSubNav === 'security-settings') return (
        <div className="enterprise-section-box"><div className="section-box-header"><h2><span>🔒</span> Security Settings</h2><p>Configure authentication and session management.</p></div>
        <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>🔒 Authentication & Password</span></div>
            <div className="form-field-group" style={{display:'flex',alignItems:'center',gap:10}}><input type="checkbox" checked={securitySettings.two_factor_enabled} onChange={e => setSecuritySettings({...securitySettings, two_factor_enabled: e.target.checked})} style={{width:18,height:18}} /><label style={{margin:0}}>Enable 2FA</label></div>
            <div className="form-field-group"><label>Min Password Length</label><input type="number" className="form-field-input" min="6" max="30" value={securitySettings.password_min_length} onChange={e => setSecuritySettings({...securitySettings, password_min_length: Number(e.target.value)})} /></div>
            <div className="form-field-group" style={{display:'flex',alignItems:'center',gap:10}}><input type="checkbox" checked={securitySettings.password_require_uppercase} onChange={e => setSecuritySettings({...securitySettings, password_require_uppercase: e.target.checked})} style={{width:18,height:18}} /><label style={{margin:0}}>Require Uppercase</label></div>
            <div className="form-field-group" style={{display:'flex',alignItems:'center',gap:10}}><input type="checkbox" checked={securitySettings.password_require_numbers} onChange={e => setSecuritySettings({...securitySettings, password_require_numbers: e.target.checked})} style={{width:18,height:18}} /><label style={{margin:0}}>Require Numbers</label></div>
            <div className="form-field-group" style={{display:'flex',alignItems:'center',gap:10}}><input type="checkbox" checked={securitySettings.password_require_special} onChange={e => setSecuritySettings({...securitySettings, password_require_special: e.target.checked})} style={{width:18,height:18}} /><label style={{margin:0}}>Require Special Chars</label></div>
            <button type="button" className="btn-submit-workspace" onClick={() => showToast('✅ Security saved!')}><span>💾 Save</span></button>
          </div>
          <div className="workspace-form-card"><div className="form-card-title"><span>⏱️ Session Control</span></div>
            <div className="form-field-group"><label>Session Timeout (min)</label><input type="number" className="form-field-input" min="5" max="480" value={securitySettings.session_timeout_minutes} onChange={e => setSecuritySettings({...securitySettings, session_timeout_minutes: Number(e.target.value)})} /></div>
            <div className="form-field-group"><label>Max Login Attempts</label><input type="number" className="form-field-input" min="3" max="20" value={securitySettings.max_login_attempts} onChange={e => setSecuritySettings({...securitySettings, max_login_attempts: Number(e.target.value)})} /></div>
            <div className="form-field-group" style={{display:'flex',alignItems:'center',gap:10}}><input type="checkbox" checked={securitySettings.ip_whitelist_enabled} onChange={e => setSecuritySettings({...securitySettings, ip_whitelist_enabled: e.target.checked})} style={{width:18,height:18}} /><label style={{margin:0}}>IP Whitelist</label></div>
            {securitySettings.ip_whitelist_enabled && <div className="form-field-group"><label>IPs (comma separated)</label><input type="text" className="form-field-input" value={securitySettings.ip_whitelist} onChange={e => setSecuritySettings({...securitySettings, ip_whitelist: e.target.value})} /></div>}
            <button type="button" className="btn-submit-workspace" onClick={() => showToast('✅ Session settings saved!')}><span>💾 Save</span></button>
          </div>
        </div></div>
      );
      if (activeSubNav === 'ai-engine') return (
        <div className="enterprise-section-box"><div className="section-box-header"><h2><span>🤖</span> AI Engine</h2><p>Configure AI-powered features.</p></div>
        <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>🤖 AI Features</span></div>
            <div className="form-field-group"><label>AI Model</label><select className="form-field-select" value={aiSettings.ai_model} onChange={e => setAiSettings({...aiSettings, ai_model: e.target.value})}><option>Gemini 2.5 Pro</option><option>Gemini 2.5 Flash</option><option>GPT-4o</option><option>Claude Sonnet 4</option></select></div>
            {['auto_lead_scoring','auto_tagging','smart_task_assignment','sentiment_analysis','ai_response_suggestions'].map(key => (
              <div key={key} className="form-field-group" style={{display:'flex',alignItems:'center',gap:10}}><input type="checkbox" checked={aiSettings[key]} onChange={e => setAiSettings({...aiSettings, [key]: e.target.checked})} style={{width:18,height:18}} /><label style={{margin:0}}>{key.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</label></div>
            ))}
            <button type="button" className="btn-submit-workspace" onClick={() => showToast('✅ AI settings saved!')}><span>💾 Save</span></button>
          </div>
          <div className="workspace-table-card"><div className="table-card-header"><h3>AI Status</h3></div>
            <table className="enterprise-styled-table"><tbody>
              <tr><td style={{fontWeight:700}}>Model</td><td><span className="code-badge-tag">{aiSettings.ai_model}</span></td></tr>
              {['auto_lead_scoring','auto_tagging','smart_task_assignment','sentiment_analysis','ai_response_suggestions'].map(key => (
                <tr key={key}><td style={{fontWeight:700}}>{key.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</td><td><span style={{color:aiSettings[key]?'#16a34a':'#ef4444',fontWeight:700}}>{aiSettings[key]?'● Enabled':'○ Disabled'}</span></td></tr>
              ))}
            </tbody></table></div>
        </div></div>
      );
      if (activeSubNav === 'integrations') return (
        <div className="enterprise-section-box"><div className="section-box-header"><h2><span>🔗</span> Integrations</h2><p>Manage third-party connections.</p></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:14,padding:'6px 0'}}>
          {integrations.map(intg => (
            <div key={`intg-${intg.id}`} style={{background:'#fff',border:`2px solid ${intg.status==='Connected'?'#86efac':'#e2e8f0'}`,borderRadius:12,padding:18,display:'flex',alignItems:'center',gap:14}}>
              <div style={{fontSize:'2rem',width:48,textAlign:'center'}}>{intg.icon}</div>
              <div style={{flex:1}}><div style={{fontWeight:800,fontSize:'0.95rem',color:'#0f172a'}}>{intg.name}</div><div style={{fontSize:'0.78rem',color:'#94a3b8',fontWeight:600}}>{intg.category}</div></div>
              <button type="button" className="btn-submit-workspace" style={{padding:'6px 14px',fontSize:'0.75rem',background:intg.status==='Connected'?'#dcfce7':'#2563eb',color:intg.status==='Connected'?'#16a34a':'#fff',border:intg.status==='Connected'?'1px solid #86efac':'none'}} onClick={() => showToast(intg.status==='Connected'?`🔌 ${intg.name} disconnected.`:`✅ ${intg.name} connected!`)}><span>{intg.status==='Connected'?'✓ Connected':'Connect'}</span></button>
            </div>
          ))}
        </div></div>
      );
      if (activeSubNav === 'audit-logs') return (
        <div className="enterprise-section-box"><div className="section-box-header"><h2><span>📊</span> Audit Logs</h2><p>System activity trail.</p></div>
        <div className="workspace-table-card" style={{maxWidth:'100%'}}><div className="table-card-header"><h3>Recent Activity ({auditLogs.length})</h3></div>
          <table className="enterprise-styled-table"><thead><tr><th>TIMESTAMP</th><th>USER</th><th>ACTION</th><th>ENTITY</th><th>DETAILS</th></tr></thead><tbody>
            {auditLogs.map(log => (
              <tr key={`au-${log.id}`}>
                <td style={{fontFamily:'monospace',fontSize:'0.8rem',color:'#64748b'}}>{log.timestamp}</td>
                <td style={{fontWeight:700,color:'#0f172a'}}>{log.user}</td>
                <td><span className="code-badge-tag" style={{background:log.action==='CREATE'?'#dcfce7':log.action==='UPDATE'?'#dbeafe':log.action==='DELETE'?'#fee2e2':'#f1f5f9',color:log.action==='CREATE'?'#16a34a':log.action==='UPDATE'?'#2563eb':log.action==='DELETE'?'#ef4444':'#475569'}}>{log.action}</span></td>
                <td><span className="container-type-badge">{log.entity}</span></td>
                <td style={{color:'#64748b',fontSize:'0.83rem'}}>{log.details}</td>
              </tr>))}
          </tbody></table></div></div>
      );
    }

    // USERS & RBAC MODULE
    if (activeMainModule === 'users-rbac') {
      if (activeSubNav === 'directory') return (
        <div className="enterprise-section-box"><div className="section-box-header"><h2><span>👤</span> User Directory</h2><p>Manage user accounts, roles, and departments.</p></div>
        <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>{editingUserId ? '✏️ Edit User' : '⊕ Add User'}</span></div>
            <form onSubmit={handleUserSubmit}>
              <div className="form-field-group"><label>Name *</label><input type="text" className="form-field-input" placeholder="John Doe" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} required /></div>
              <div className="form-field-group"><label>Email *</label><input type="email" className="form-field-input" placeholder="john@company.com" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required /></div>
              <div className="form-field-group"><label>Role</label><select className="form-field-select" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}><option>Admin</option><option>Sales Lead</option><option>Account Executive</option><option>Support Lead</option><option>Tech Lead</option><option>Employee</option><option>Viewer</option></select></div>
              <div className="form-field-group"><label>Department</label><select className="form-field-select" value={userForm.department} onChange={e => setUserForm({...userForm, department: e.target.value})}><option>Engineering</option><option>Sales</option><option>Support</option><option>Operations</option><option>Marketing</option><option>HR</option><option>Finance</option></select></div>
              <div className="form-field-group"><label>Status</label><select className="form-field-select" value={userForm.status} onChange={e => setUserForm({...userForm, status: e.target.value})}><option>Active</option><option>Inactive</option><option>Suspended</option></select></div>
              <button type="submit" className="btn-submit-workspace"><span>{editingUserId ? '✓ Save' : '+ Add User'}</span></button>
              {editingUserId && <button type="button" className="btn-cancel-form" onClick={() => { setEditingUserId(null); setUserForm({name:'',email:'',role:'Employee',department:'Engineering',status:'Active'}); }}>Cancel</button>}
            </form></div>
          <div className="workspace-table-card"><div className="table-card-header"><h3>Users ({users.length})</h3></div>
            <table className="enterprise-styled-table"><thead><tr><th>NAME</th><th>EMAIL</th><th>ROLE</th><th>DEPT</th><th>STATUS</th><th style={{textAlign:'right'}}>ACTIONS</th></tr></thead><tbody>
              {users.map(u => <tr key={`usr-${u.id}`}><td style={{fontWeight:700,color:'#0f172a'}}>{u.name}</td><td style={{color:'#64748b',fontSize:'0.85rem'}}>{u.email}</td><td><span className="container-type-badge">{u.role}</span></td><td>{u.department}</td><td><span style={{color:u.status==='Active'?'#16a34a':u.status==='Suspended'?'#ef4444':'#94a3b8',fontWeight:700}}>● {u.status}</span></td><td><div className="action-buttons-cell" style={{justifyContent:'flex-end'}}><button type="button" className="btn-action-icon" onClick={() => { setEditingUserId(u.id); setUserForm(u); }}>✏️</button><button type="button" className="btn-action-icon delete" onClick={() => { if(window.confirm('Delete?')) { setUsers(users.filter(x=>x.id!==u.id)); showToast('🗑️ Removed.'); } }}>🗑️</button></div></td></tr>)}
            </tbody></table></div>
        </div></div>
      );
      if (activeSubNav === 'rbac') return (
        <div className="enterprise-section-box"><div className="section-box-header"><h2><span>🛡️</span> RBAC Access Control</h2><p>Define roles with granular permissions.</p></div>
        <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>{editingRoleId ? '✏️ Edit Role' : '⊕ Create Role'}</span></div>
            <form onSubmit={handleRoleSubmit}>
              <div className="form-field-group"><label>Role Name *</label><input type="text" className="form-field-input" placeholder="e.g. Content Manager" value={roleForm.role_name} onChange={e => setRoleForm({...roleForm, role_name: e.target.value})} required /></div>
              <div className="form-field-group"><label>Description</label><input type="text" className="form-field-input" value={roleForm.description} onChange={e => setRoleForm({...roleForm, description: e.target.value})} /></div>
              <div className="form-field-group"><label>Permissions</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:6}}>
                  {ALL_PERMISSIONS.map(perm => (
                    <label key={perm} style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.82rem',fontWeight:600,cursor:'pointer',padding:'4px 10px',borderRadius:6,background:roleForm.permissions.includes(perm)?'#dbeafe':'#f1f5f9',color:roleForm.permissions.includes(perm)?'#2563eb':'#64748b',border:`1px solid ${roleForm.permissions.includes(perm)?'#93c5fd':'#e2e8f0'}`,transition:'all 0.2s'}}>
                      <input type="checkbox" checked={roleForm.permissions.includes(perm)} onChange={() => togglePermission(perm)} style={{display:'none'}} />
                      {roleForm.permissions.includes(perm)?'✓':'○'} {perm.replace(/_/g,' ')}
                    </label>
                  ))}
                </div></div>
              <button type="submit" className="btn-submit-workspace"><span>{editingRoleId ? '✓ Save' : '+ Create Role'}</span></button>
              {editingRoleId && <button type="button" className="btn-cancel-form" onClick={() => { setEditingRoleId(null); setRoleForm({role_name:'',description:'',permissions:[]}); }}>Cancel</button>}
            </form></div>
          <div className="workspace-table-card"><div className="table-card-header"><h3>Roles ({roles.length})</h3></div>
            <table className="enterprise-styled-table"><thead><tr><th>ROLE</th><th>PERMISSIONS</th><th>DESCRIPTION</th><th style={{textAlign:'right'}}>ACTIONS</th></tr></thead><tbody>
              {roles.map(r => <tr key={`role-${r.id}`}><td style={{fontWeight:700,color:'#0f172a'}}>{r.role_name}</td><td><div style={{display:'flex',flexWrap:'wrap',gap:4}}>{r.permissions.map(p => <span key={`rp-${r.id}-${p}`} className="code-badge-tag" style={{fontSize:'0.7rem'}}>{p.replace(/_/g,' ')}</span>)}</div></td><td style={{color:'#64748b',fontSize:'0.83rem'}}>{r.description}</td><td><div className="action-buttons-cell" style={{justifyContent:'flex-end'}}><button type="button" className="btn-action-icon" onClick={() => { setEditingRoleId(r.id); setRoleForm({role_name:r.role_name,description:r.description||'',permissions:[...r.permissions]}); }}>✏️</button><button type="button" className="btn-action-icon delete" onClick={() => { if(window.confirm('Delete?')) { setRoles(roles.filter(x=>x.id!==r.id)); showToast('🗑️ Removed.'); } }}>🗑️</button></div></td></tr>)}
            </tbody></table></div>
        </div></div>
      );
      if (activeSubNav === 'workspaces') return (
        <div className="enterprise-section-box"><div className="section-box-header"><h2><span>🌐</span> Organizational Structure & Work Hierarchy</h2><p>Manage Workspaces, Container Types, Clients, Projects & Kanban Boards.</p></div>
        <div className="hierarchy-counts-row">
          {[{k:'workspaces',l:'📂 Workspaces',c:workspaces.length},{k:'types',l:'🏷️ Types',c:workspaceTypes.length},{k:'clients',l:'🏢 Clients',c:clients.length},{k:'projects',l:'💼 Projects',c:projects.length},{k:'boards',l:'📋 Boards',c:boards.length}].map(t => (
            <button key={t.k} type="button" className={`entity-count-pill ${activeEntityTab===t.k?'active':''}`} onClick={() => setActiveEntityTab(t.k)}><span>{t.l}</span><span className="count-badge-inline">{t.c}</span></button>
          ))}
        </div>

        {/* WORKSPACES */}
        {activeEntityTab === 'workspaces' && <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>{editingWsId ? '✏️ Edit Workspace' : '⊕ Create Workspace'}</span></div>
            <form onSubmit={wsCrud.handleSubmit}>
              <div className="form-field-group"><label>Name *</label><input type="text" className="form-field-input" placeholder="e.g. Sales Hub" value={wsForm.workspace_name} onChange={e => setWsForm({...wsForm, workspace_name: e.target.value})} required /></div>
              <div className="form-field-group"><label>Code *</label><input type="text" className="form-field-input" placeholder="e.g. WS-SALES" value={wsForm.workspace_code} onChange={e => setWsForm({...wsForm, workspace_code: e.target.value})} required /></div>
              <div className="form-field-group"><label>Container Type</label><select className="form-field-select" value={wsForm.container_type} onChange={e => setWsForm({...wsForm, container_type: e.target.value})}>{workspaceTypes.map(t => <option key={`wt-${t.id}`} value={t.type_name}>🏢 {t.type_name}</option>)}</select></div>
              <button type="submit" className="btn-submit-workspace"><span>{editingWsId ? '✓ Save' : '+ Create'}</span></button>
              {editingWsId && <button type="button" className="btn-cancel-form" onClick={() => { setEditingWsId(null); setWsForm({workspace_name:'',workspace_code:'',container_type:'Internal Department'}); }}>Cancel</button>}
            </form></div>
          <div className="workspace-table-card"><div className="table-card-header"><h3>Workspaces ({workspaces.length})</h3></div>
            <table className="enterprise-styled-table"><thead><tr><th>CODE</th><th>NAME</th><th>TYPE</th><th style={{textAlign:'right'}}>ACTIONS</th></tr></thead><tbody>
              {workspaces.map(ws => <tr key={`ws-${ws.id}`}><td><span className="code-badge-tag">{ws.workspace_code}</span></td><td style={{fontWeight:700,color:'#0f172a'}}>{ws.workspace_name}</td><td><span className="container-type-badge">{ws.container_type}</span></td><td><div className="action-buttons-cell" style={{justifyContent:'flex-end'}}><button type="button" className="btn-action-icon" onClick={() => wsCrud.handleEdit(ws)}>✏️</button><button type="button" className="btn-action-icon delete" onClick={() => wsCrud.handleDelete(ws.id)}>🗑️</button></div></td></tr>)}
            </tbody></table></div>
        </div>}

        {/* WORKSPACE TYPES */}
        {activeEntityTab === 'types' && <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>{editingTypeId ? '✏️ Edit Type' : '⊕ Create Type'}</span></div>
            <form onSubmit={typeCrud.handleSubmit}>
              <div className="form-field-group"><label>Name *</label><input type="text" className="form-field-input" placeholder="e.g. Regional" value={typeForm.type_name} onChange={e => setTypeForm({...typeForm, type_name: e.target.value})} required /></div>
              <div className="form-field-group"><label>Code *</label><input type="text" className="form-field-input" placeholder="e.g. REGION" value={typeForm.type_code} onChange={e => setTypeForm({...typeForm, type_code: e.target.value})} required /></div>
              <div className="form-field-group"><label>Description</label><input type="text" className="form-field-input" value={typeForm.description} onChange={e => setTypeForm({...typeForm, description: e.target.value})} /></div>
              <button type="submit" className="btn-submit-workspace"><span>{editingTypeId ? '✓ Save' : '+ Create'}</span></button>
            </form></div>
          <div className="workspace-table-card"><div className="table-card-header"><h3>Container Types ({workspaceTypes.length})</h3></div>
            <table className="enterprise-styled-table"><thead><tr><th>CODE</th><th>NAME</th><th>DESCRIPTION</th><th style={{textAlign:'right'}}>ACTIONS</th></tr></thead><tbody>
              {workspaceTypes.map(t => <tr key={`tp-${t.id}`}><td><span className="code-badge-tag">{t.type_code}</span></td><td style={{fontWeight:700,color:'#0f172a'}}>{t.type_name}</td><td style={{color:'#64748b'}}>{t.description || 'N/A'}</td><td><div className="action-buttons-cell" style={{justifyContent:'flex-end'}}><button type="button" className="btn-action-icon delete" onClick={() => typeCrud.handleDelete(t.id)}>🗑️</button></div></td></tr>)}
            </tbody></table></div>
        </div>}

        {/* CLIENTS */}
        {activeEntityTab === 'clients' && <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>{editingClientId ? '✏️ Edit Client' : '⊕ Add Client'}</span></div>
            <form onSubmit={clientCrud.handleSubmit}>
              <div className="form-field-group"><label>Client Name *</label><input type="text" className="form-field-input" placeholder="e.g. XYZ Corp" value={clientForm.client_name} onChange={e => setClientForm({...clientForm, client_name: e.target.value})} required /></div>
              <div className="form-field-group"><label>Code *</label><input type="text" className="form-field-input" placeholder="e.g. CL-XYZ" value={clientForm.client_code} onChange={e => setClientForm({...clientForm, client_code: e.target.value})} required /></div>
              <div className="form-field-group"><label>Workspace</label><select className="form-field-select" value={clientForm.workspace} onChange={e => setClientForm({...clientForm, workspace: e.target.value})}><option value="">— Select —</option>{workspaces.map(w => <option key={`cw-${w.id}`} value={w.workspace_name}>{w.workspace_name}</option>)}</select></div>
              <div className="form-field-group"><label>Email</label><input type="email" className="form-field-input" value={clientForm.email} onChange={e => setClientForm({...clientForm, email: e.target.value})} /></div>
              <div className="form-field-group"><label>Phone</label><input type="text" className="form-field-input" value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} /></div>
              <div className="form-field-group"><label>Status</label><select className="form-field-select" value={clientForm.status} onChange={e => setClientForm({...clientForm, status: e.target.value})}><option>Active</option><option>Inactive</option><option>On Hold</option></select></div>
              <button type="submit" className="btn-submit-workspace"><span>{editingClientId ? '✓ Save' : '+ Add Client'}</span></button>
              {editingClientId && <button type="button" className="btn-cancel-form" onClick={() => { setEditingClientId(null); setClientForm({client_code:'',client_name:'',workspace:'',email:'',phone:'',status:'Active'}); }}>Cancel</button>}
            </form></div>
          <div className="workspace-table-card"><div className="table-card-header"><h3>Clients ({clients.length})</h3></div>
            <table className="enterprise-styled-table"><thead><tr><th>CODE</th><th>CLIENT</th><th>WORKSPACE</th><th>EMAIL</th><th>STATUS</th><th style={{textAlign:'right'}}>ACTIONS</th></tr></thead><tbody>
              {clients.map(c => <tr key={`cl-${c.id}`}><td><span className="code-badge-tag">{c.client_code}</span></td><td style={{fontWeight:700,color:'#0f172a'}}>{c.client_name}</td><td><span className="container-type-badge">{c.workspace||'—'}</span></td><td style={{color:'#64748b',fontSize:'0.85rem'}}>{c.email||'—'}</td><td><span style={{color:c.status==='Active'?'#16a34a':'#94a3b8',fontWeight:700}}>● {c.status}</span></td><td><div className="action-buttons-cell" style={{justifyContent:'flex-end'}}><button type="button" className="btn-action-icon" onClick={() => clientCrud.handleEdit(c)}>✏️</button><button type="button" className="btn-action-icon delete" onClick={() => clientCrud.handleDelete(c.id)}>🗑️</button></div></td></tr>)}
            </tbody></table></div>
        </div>}

        {/* PROJECTS */}
        {activeEntityTab === 'projects' && <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>{editingProjectId ? '✏️ Edit Project' : '⊕ Add Project'}</span></div>
            <form onSubmit={projectCrud.handleSubmit}>
              <div className="form-field-group"><label>Project Name *</label><input type="text" className="form-field-input" placeholder="e.g. Mobile v3" value={projectForm.project_name} onChange={e => setProjectForm({...projectForm, project_name: e.target.value})} required /></div>
              <div className="form-field-group"><label>Code *</label><input type="text" className="form-field-input" placeholder="e.g. PRJ-MOB" value={projectForm.project_code} onChange={e => setProjectForm({...projectForm, project_code: e.target.value})} required /></div>
              <div className="form-field-group"><label>Workspace</label><select className="form-field-select" value={projectForm.workspace} onChange={e => setProjectForm({...projectForm, workspace: e.target.value})}><option value="">— Select —</option>{workspaces.map(w => <option key={`pw-${w.id}`} value={w.workspace_name}>{w.workspace_name}</option>)}</select></div>
              <div className="form-field-group"><label>Status</label><select className="form-field-select" value={projectForm.status} onChange={e => setProjectForm({...projectForm, status: e.target.value})}><option>Planning</option><option>In Progress</option><option>On Hold</option><option>Completed</option><option>Cancelled</option></select></div>
              <button type="submit" className="btn-submit-workspace"><span>{editingProjectId ? '✓ Save' : '+ Add Project'}</span></button>
              {editingProjectId && <button type="button" className="btn-cancel-form" onClick={() => { setEditingProjectId(null); setProjectForm({project_code:'',project_name:'',workspace:'',status:'In Progress'}); }}>Cancel</button>}
            </form></div>
          <div className="workspace-table-card"><div className="table-card-header"><h3>Projects ({projects.length})</h3></div>
            <table className="enterprise-styled-table"><thead><tr><th>CODE</th><th>PROJECT</th><th>WORKSPACE</th><th>STATUS</th><th style={{textAlign:'right'}}>ACTIONS</th></tr></thead><tbody>
              {projects.map(p => <tr key={`pj-${p.id}`}><td><span className="code-badge-tag">{p.project_code}</span></td><td style={{fontWeight:700,color:'#0f172a'}}>{p.project_name}</td><td><span className="container-type-badge">{p.workspace||'—'}</span></td><td><span style={{color:p.status==='In Progress'?'#2563eb':p.status==='Completed'?'#16a34a':p.status==='On Hold'?'#f59e0b':'#64748b',fontWeight:700}}>● {p.status}</span></td><td><div className="action-buttons-cell" style={{justifyContent:'flex-end'}}><button type="button" className="btn-action-icon" onClick={() => projectCrud.handleEdit(p)}>✏️</button><button type="button" className="btn-action-icon delete" onClick={() => projectCrud.handleDelete(p.id)}>🗑️</button></div></td></tr>)}
            </tbody></table></div>
        </div>}

        {/* BOARDS */}
        {activeEntityTab === 'boards' && <div className="workspaces-grid-container">
          <div className="workspace-form-card"><div className="form-card-title"><span>{editingBoardId ? '✏️ Edit Board' : '⊕ Add Board'}</span></div>
            <form onSubmit={boardCrud.handleSubmit}>
              <div className="form-field-group"><label>Board Name *</label><input type="text" className="form-field-input" placeholder="e.g. QA Board" value={boardForm.board_name} onChange={e => setBoardForm({...boardForm, board_name: e.target.value})} required /></div>
              <div className="form-field-group"><label>Code *</label><input type="text" className="form-field-input" placeholder="e.g. BRD-QA" value={boardForm.board_code} onChange={e => setBoardForm({...boardForm, board_code: e.target.value})} required /></div>
              <div className="form-field-group"><label>Project</label><select className="form-field-select" value={boardForm.project} onChange={e => setBoardForm({...boardForm, project: e.target.value})}><option value="">— Select —</option>{projects.map(p => <option key={`bp-${p.id}`} value={p.project_name}>{p.project_name}</option>)}</select></div>
              <div className="form-field-group"><label>Board Type</label><select className="form-field-select" value={boardForm.board_type} onChange={e => setBoardForm({...boardForm, board_type: e.target.value})}><option>Agile Board</option><option>Scrum Board</option><option>Kanban Board</option><option>Bug Tracker</option><option>Support Queue</option></select></div>
              <button type="submit" className="btn-submit-workspace"><span>{editingBoardId ? '✓ Save' : '+ Add Board'}</span></button>
              {editingBoardId && <button type="button" className="btn-cancel-form" onClick={() => { setEditingBoardId(null); setBoardForm({board_code:'',board_name:'',project:'',board_type:'Agile Board'}); }}>Cancel</button>}
            </form></div>
          <div className="workspace-table-card"><div className="table-card-header"><h3>Boards ({boards.length})</h3></div>
            <table className="enterprise-styled-table"><thead><tr><th>CODE</th><th>BOARD</th><th>PROJECT</th><th>TYPE</th><th style={{textAlign:'right'}}>ACTIONS</th></tr></thead><tbody>
              {boards.map(b => <tr key={`bd-${b.id}`}><td><span className="code-badge-tag">{b.board_code}</span></td><td style={{fontWeight:700,color:'#0f172a'}}>{b.board_name}</td><td><span className="container-type-badge">{b.project||'—'}</span></td><td style={{color:'#475569',fontWeight:700}}>{b.board_type}</td><td><div className="action-buttons-cell" style={{justifyContent:'flex-end'}}><button type="button" className="btn-action-icon" onClick={() => boardCrud.handleEdit(b)}>✏️</button><button type="button" className="btn-action-icon delete" onClick={() => boardCrud.handleDelete(b.id)}>🗑️</button></div></td></tr>)}
            </tbody></table></div>
        </div>}
        </div>
      );
    }
    return null;
  };

  // ── MAIN RENDER ──
  const currentSubNavs = MODULE_SUBNAV_MAP[activeMainModule] || [];

  return (
    <div className="enterprise-engine-wrapper">
      {toastMessage && <div className="settings-toast-banner" style={{background:'#0f172a',color:'#fff',borderRadius:8,padding:'10px 16px',marginBottom:16}}><span>{toastMessage}</span></div>}

      {/* TOP STATUS BAR */}
      <div className="enterprise-top-bar">
        <div className="enterprise-title-group">
          <h1>Enterprise Administration &amp; System Management Engine</h1>
          <p>Centralized Administration Platform • Company Branding • Organization Policies • Security • Audit Trail</p>
        </div>
      </div>

      {/* MAIN MODULE TABS */}
      <div className="enterprise-modules-grid">
        {[{k:'company',i:'🏢',n:'1. Company',d:'Profile, Branches, Depts, Working Hours, Policies'},{k:'branding',i:'🎨',n:'2. Branding & Themes',d:'Logos, Themes, Email & PDF Document Branding'},{k:'security',i:'🛡️',n:'3. System & Security',d:'Security, AI Engine, Integrations, Audit Logs'},{k:'users-rbac',i:'👥',n:'4. Users & RBAC',d:'User Directory, Role Permissions & Access Control'}].map(mod => (
          <div key={mod.k} className={`module-tab-card ${activeMainModule===mod.k?'active':''}`} onClick={() => handleMainModuleSwitch(mod.k)}>
            <div className="module-card-title"><span>{mod.i} {mod.n}</span></div>
            <div className="module-card-sub">{mod.d}</div>
          </div>
        ))}
      </div>

      {/* DYNAMIC SUB-NAV */}
      <div className="enterprise-subnav-row">
        {currentSubNavs.map(sub => (
          <button key={sub.key} type="button" className={`subnav-pill-btn ${activeSubNav===sub.key?'active':''}`} onClick={() => setActiveSubNav(sub.key)}><span>{sub.label}</span></button>
        ))}
      </div>

      {/* CONTENT */}
      {renderSubNavContent()}
    </div>
  );
};

export default EnterpriseAdminEngine;
