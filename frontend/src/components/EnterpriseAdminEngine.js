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
  { id: 1, client_code: 'CL-ABC', client_name: 'ABC Corporation', workspace: 'Development' }
];

const DEFAULT_PROJECTS = [
  { id: 1, project_code: 'PRJ-GRAVITY', project_name: 'Beyond Gravity', workspace: 'Development' }
];

const DEFAULT_BOARDS = [
  { id: 1, board_code: 'BRD-SPRINT', board_name: 'Main Agile Sprint Board', project: 'Beyond Gravity' },
  { id: 2, board_code: 'BRD-BUGFIX', board_name: 'Triage & Bug Tracker Board', project: 'Beyond Gravity' }
];

const EnterpriseAdminEngine = () => {
  const { token, user } = useAuth();
  
  // Navigation States
  const [activeMainModule, setActiveMainModule] = useState('users-rbac');
  const [activeSubNav, setActiveSubNav] = useState('workspaces');
  const [activeEntityTab, setActiveEntityTab] = useState('workspaces');

  // Data States
  const [workspaces, setWorkspaces] = useState(DEFAULT_WORKSPACES);
  const [workspaceTypes, setWorkspaceTypes] = useState(DEFAULT_TYPES);
  const [clients] = useState(DEFAULT_CLIENTS);
  const [projects] = useState(DEFAULT_PROJECTS);
  const [boards] = useState(DEFAULT_BOARDS);

  // Form State for Workspace
  const [wsForm, setWsForm] = useState({
    workspace_name: '',
    workspace_code: '',
    container_type: 'Internal Department'
  });
  const [editingWsId, setEditingWsId] = useState(null);

  // Form State for Workspace Type
  const [typeForm, setTypeForm] = useState({
    type_name: '',
    type_code: '',
    description: ''
  });
  const [editingTypeId, setEditingTypeId] = useState(null);

  // Active Timer Widget State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Show Feedback Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!timerActive && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // Fetch Workspaces and Workspace Types from Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: token ? { Authorization: `Bearer ${token}` } : {} };
        
        const [wsRes, wtRes] = await Promise.allSettled([
          axios.get('http://localhost:5001/api/workspaces', config),
          axios.get('http://localhost:5001/api/workspace-types', config)
        ]);

        if (wsRes.status === 'fulfilled' && Array.isArray(wsRes.value.data) && wsRes.value.data.length > 0) {
          setWorkspaces(wsRes.value.data);
        }
        if (wtRes.status === 'fulfilled' && Array.isArray(wtRes.value.data) && wtRes.value.data.length > 0) {
          setWorkspaceTypes(wtRes.value.data);
        }
      } catch (err) {
        console.warn('API sync fallback to default local state:', err.message);
      }
    };
    fetchData();
  }, [token]);

  // Handle Workspace Form Submission (Create or Update)
  const handleWorkspaceSubmit = async (e) => {
    e.preventDefault();
    if (!wsForm.workspace_name.trim() || !wsForm.workspace_code.trim()) {
      showToast('⚠️ Please enter both Workspace Name and Code.');
      return;
    }

    const payload = {
      workspace_name: wsForm.workspace_name.trim(),
      workspace_code: wsForm.workspace_code.trim().toUpperCase(),
      container_type: wsForm.container_type
    };

    const config = { headers: token ? { Authorization: `Bearer ${token}` } : {} };

    if (editingWsId) {
      // Edit mode
      setWorkspaces(workspaces.map((w) => (w.id === editingWsId ? { ...w, ...payload } : w)));
      showToast(`✅ Workspace '${payload.workspace_name}' updated successfully.`);
      try {
        await axios.put(`http://localhost:5001/api/workspaces/${editingWsId}`, payload, config);
      } catch (err) {}
      setEditingWsId(null);
    } else {
      // Create mode
      const newWs = { id: Date.now(), ...payload };
      setWorkspaces([...workspaces, newWs]);
      showToast(`🎉 Workspace '${payload.workspace_name}' created successfully!`);
      try {
        const res = await axios.post('http://localhost:5001/api/workspaces', payload, config);
        if (res.data?.id) {
          setWorkspaces((prev) => prev.map((w) => (w.id === newWs.id ? { ...w, id: res.data.id } : w)));
        }
      } catch (err) {}
    }

    setWsForm({ workspace_name: '', workspace_code: '', container_type: 'Internal Department' });
  };

  const handleEditWorkspace = (ws) => {
    setEditingWsId(ws.id);
    setWsForm({
      workspace_name: ws.workspace_name || '',
      workspace_code: ws.workspace_code || '',
      container_type: ws.container_type || 'Internal Department'
    });
  };

  const handleDeleteWorkspace = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workspace?')) return;
    setWorkspaces(workspaces.filter((w) => w.id !== id));
    showToast('🗑️ Workspace removed.');
    try {
      const config = { headers: token ? { Authorization: `Bearer ${token}` } : {} };
      await axios.delete(`http://localhost:5001/api/workspaces/${id}`, config);
    } catch (err) {}
  };

  // Handle Workspace Type Submission
  const handleTypeSubmit = async (e) => {
    e.preventDefault();
    if (!typeForm.type_name.trim() || !typeForm.type_code.trim()) {
      showToast('⚠️ Please enter Type Name and Code.');
      return;
    }

    const payload = {
      type_name: typeForm.type_name.trim(),
      type_code: typeForm.type_code.trim(),
      description: typeForm.description.trim()
    };

    const config = { headers: token ? { Authorization: `Bearer ${token}` } : {} };

    if (editingTypeId) {
      setWorkspaceTypes(workspaceTypes.map((t) => (t.id === editingTypeId ? { ...t, ...payload } : t)));
      showToast(`✅ Container Type '${payload.type_name}' updated.`);
      try {
        await axios.put(`http://localhost:5001/api/workspace-types/${editingTypeId}`, payload, config);
      } catch (err) {}
      setEditingTypeId(null);
    } else {
      const newType = { id: Date.now(), ...payload };
      setWorkspaceTypes([...workspaceTypes, newType]);
      showToast(`🎉 Container Type '${payload.type_name}' created!`);
      try {
        const res = await axios.post('http://localhost:5001/api/workspace-types', payload, config);
        if (res.data?.id) {
          setWorkspaceTypes((prev) => prev.map((t) => (t.id === newType.id ? { ...t, id: res.data.id } : t)));
        }
      } catch (err) {}
    }

    setTypeForm({ type_name: '', type_code: '', description: '' });
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm('Delete this container type?')) return;
    setWorkspaceTypes(workspaceTypes.filter((t) => t.id !== id));
    showToast('🗑️ Container type removed.');
    try {
      const config = { headers: token ? { Authorization: `Bearer ${token}` } : {} };
      await axios.delete(`http://localhost:5001/api/workspace-types/${id}`, config);
    } catch (err) {}
  };

  return (
    <div className="enterprise-engine-wrapper">
      {toastMessage && (
        <div className="settings-toast-banner" style={{ background: '#0f172a', color: '#ffffff', borderRadius: 8, padding: '10px 16px', marginBottom: 16 }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP STATUS BAR */}
      <div className="enterprise-top-bar">
        <div className="enterprise-title-group">
          <h1>Enterprise Administration &amp; System Management Engine</h1>
          <p>Centralized Administration Platform • Company Branding • Organization Policies • Security • Audit Trail</p>
        </div>

        <div className="enterprise-widgets-group">
          <button type="button" className="enterprise-widget-btn">
            <span>🏢 Office</span>
            <span style={{ fontSize: '0.65rem' }}>▼</span>
          </button>

          <button
            type="button"
            className="enterprise-widget-btn clock-in"
            onClick={() => {
              setTimerActive(!timerActive);
              showToast(timerActive ? '⏸️ Task timer paused.' : '▶️ Task timer started.');
            }}
          >
            <span>➔] Clock In</span>
          </button>

          <div className="timer-pill-badge">
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>ACTIVE TASK TIMER</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{formatTimer(timerSeconds)}</span>
            <button
              type="button"
              className="play-icon-btn"
              onClick={() => setTimerActive(!timerActive)}
              title={timerActive ? 'Pause Timer' : 'Start Timer'}
            >
              {timerActive ? '❚❚' : '▶'}
            </button>
          </div>

          <button type="button" className="btn-action-icon" style={{ borderRadius: '50%' }} title="Notifications">
            🔔
          </button>

          <div className="user-status-pill">
            <div className="avatar-badge-circle">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'SA'}
            </div>
            <div className="user-status-info">
              <span className="user-name">{user?.name || 'Shruti Administrator'}</span>
              <span className="user-role">{user?.role || 'EMPLOYEE'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP ENGINE 4 MAIN NAV TABS */}
      <div className="enterprise-modules-grid">
        <div
          className={`module-tab-card ${activeMainModule === 'company' ? 'active' : ''}`}
          onClick={() => setActiveMainModule('company')}
        >
          <div className="module-card-title">
            <span>🏢 1. Company</span>
          </div>
          <div className="module-card-sub">Profile, Branches, Depts, Working Hours, Policies</div>
        </div>

        <div
          className={`module-tab-card ${activeMainModule === 'branding' ? 'active' : ''}`}
          onClick={() => setActiveMainModule('branding')}
        >
          <div className="module-card-title">
            <span>🎨 2. Branding &amp; Themes</span>
          </div>
          <div className="module-card-sub">Logos, Themes, Email &amp; PDF Document Branding</div>
        </div>

        <div
          className={`module-tab-card ${activeMainModule === 'security' ? 'active' : ''}`}
          onClick={() => setActiveMainModule('security')}
        >
          <div className="module-card-title">
            <span>🛡️ 3. System &amp; Security</span>
          </div>
          <div className="module-card-sub">Security, AI Engine, Integrations, Audit Logs</div>
        </div>

        <div
          className={`module-tab-card ${activeMainModule === 'users-rbac' ? 'active' : ''}`}
          onClick={() => setActiveMainModule('users-rbac')}
        >
          <div className="module-card-title">
            <span>👥 4. Users &amp; RBAC</span>
          </div>
          <div className="module-card-sub">User Directory, Role Permissions &amp; Access Control</div>
        </div>
      </div>

      {/* SUB-NAVIGATION PILLS BAR */}
      <div className="enterprise-subnav-row">
        <button
          type="button"
          className={`subnav-pill-btn ${activeSubNav === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveSubNav('directory')}
        >
          <span>👤 User Directory &amp; Accounts</span>
        </button>

        <button
          type="button"
          className={`subnav-pill-btn ${activeSubNav === 'rbac' ? 'active' : ''}`}
          onClick={() => setActiveSubNav('rbac')}
        >
          <span>🛡️ Role &amp; RBAC Access Control</span>
        </button>

        <button
          type="button"
          className={`subnav-pill-btn ${activeSubNav === 'workspaces' ? 'active' : ''}`}
          onClick={() => setActiveSubNav('workspaces')}
        >
          <span>⚡ Workspaces &amp; Structure</span>
        </button>
      </div>

      {/* MAIN SECTION BOX */}
      {activeSubNav === 'workspaces' && (
        <div className="enterprise-section-box">
          <div className="section-box-header">
            <h2>
              <span>🌐</span> Organizational Structure &amp; Work Hierarchy
            </h2>
            <p>Manage Workspaces, Container Types, Clients, Projects &amp; Kanban Boards. All entities immediately sync across System Dashboards &amp; Filters.</p>
          </div>

          {/* HIERARCHY PILLS BAR WITH COUNTS */}
          <div className="hierarchy-counts-row">
            <button
              type="button"
              className={`entity-count-pill ${activeEntityTab === 'workspaces' ? 'active' : ''}`}
              onClick={() => setActiveEntityTab('workspaces')}
            >
              <span>📂 Workspaces</span>
              <span className="count-badge-inline">{workspaces.length}</span>
            </button>

            <button
              type="button"
              className={`entity-count-pill ${activeEntityTab === 'types' ? 'active' : ''}`}
              onClick={() => setActiveEntityTab('types')}
            >
              <span>🏷️ Workspace Types</span>
              <span className="count-badge-inline">{workspaceTypes.length}</span>
            </button>

            <button
              type="button"
              className={`entity-count-pill ${activeEntityTab === 'clients' ? 'active' : ''}`}
              onClick={() => setActiveEntityTab('clients')}
            >
              <span>🏢 Clients</span>
              <span className="count-badge-inline">{clients.length}</span>
            </button>

            <button
              type="button"
              className={`entity-count-pill ${activeEntityTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveEntityTab('projects')}
            >
              <span>💼 Projects</span>
              <span className="count-badge-inline">{projects.length}</span>
            </button>

            <button
              type="button"
              className={`entity-count-pill ${activeEntityTab === 'boards' ? 'active' : ''}`}
              onClick={() => setActiveEntityTab('boards')}
            >
              <span>📋 Boards</span>
              <span className="count-badge-inline">{boards.length}</span>
            </button>
          </div>

          {/* ENTITY TAB 1: WORKSPACES */}
          {activeEntityTab === 'workspaces' && (
            <div className="workspaces-grid-container">
              {/* LEFT FORM CARD */}
              <div className="workspace-form-card">
                <div className="form-card-title">
                  <span>{editingWsId ? '✏️ Edit Workspace' : '⊕ Create New Workspace'}</span>
                </div>
                <form onSubmit={handleWorkspaceSubmit}>
                  <div className="form-field-group">
                    <label>Workspace Name *</label>
                    <input
                      type="text"
                      className="form-field-input"
                      placeholder="e.g. Sales & Marketing Hub"
                      value={wsForm.workspace_name}
                      onChange={(e) => setWsForm({ ...wsForm, workspace_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Workspace Code *</label>
                    <input
                      type="text"
                      className="form-field-input"
                      placeholder="e.g. WS-SALES"
                      value={wsForm.workspace_code}
                      onChange={(e) => setWsForm({ ...wsForm, workspace_code: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Workspace Container Type</label>
                    <select
                      className="form-field-select"
                      value={wsForm.container_type}
                      onChange={(e) => setWsForm({ ...wsForm, container_type: e.target.value })}
                    >
                      {workspaceTypes.map((t) => (
                        <option key={`opt-type-${t.id}`} value={t.type_name || t.type_code}>
                          🏢 {t.type_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn-submit-workspace">
                    <span>{editingWsId ? '✓ Save Changes' : '+ Create Workspace'}</span>
                  </button>

                  {editingWsId && (
                    <button
                      type="button"
                      className="btn-cancel-form"
                      onClick={() => {
                        setEditingWsId(null);
                        setWsForm({ workspace_name: '', workspace_code: '', container_type: 'Internal Department' });
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </form>
              </div>

              {/* RIGHT TABLE CARD */}
              <div className="workspace-table-card">
                <div className="table-card-header">
                  <h3>Existing Workspaces &amp; Type Management</h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    Total: {workspaces.length} Record{workspaces.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {workspaces.length === 0 ? (
                  <div className="table-empty-state">
                    <p>No workspaces created yet. Use the form on the left to create your first workspace.</p>
                  </div>
                ) : (
                  <table className="enterprise-styled-table">
                    <thead>
                      <tr>
                        <th>CODE</th>
                        <th>WORKSPACE NAME</th>
                        <th>CONTAINER TYPE</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workspaces.map((ws) => (
                        <tr key={`ws-row-${ws.id}`}>
                          <td>
                            <span className="code-badge-tag">{ws.workspace_code}</span>
                          </td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{ws.workspace_name}</td>
                          <td>
                            <span className="container-type-badge">{ws.container_type}</span>
                          </td>
                          <td>
                            <div className="action-buttons-cell" style={{ justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="btn-action-icon"
                                onClick={() => handleEditWorkspace(ws)}
                                title="Edit Workspace"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                className="btn-action-icon delete"
                                onClick={() => handleDeleteWorkspace(ws.id)}
                                title="Delete Workspace"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ENTITY TAB 2: WORKSPACE TYPES */}
          {activeEntityTab === 'types' && (
            <div className="workspaces-grid-container">
              <div className="workspace-form-card">
                <div className="form-card-title">
                  <span>{editingTypeId ? '✏️ Edit Container Type' : '⊕ Create Workspace Type'}</span>
                </div>
                <form onSubmit={handleTypeSubmit}>
                  <div className="form-field-group">
                    <label>Type Name *</label>
                    <input
                      type="text"
                      className="form-field-input"
                      placeholder="e.g. Regional Division"
                      value={typeForm.type_name}
                      onChange={(e) => setTypeForm({ ...typeForm, type_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Type Code *</label>
                    <input
                      type="text"
                      className="form-field-input"
                      placeholder="e.g. REGION"
                      value={typeForm.type_code}
                      onChange={(e) => setTypeForm({ ...typeForm, type_code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Description</label>
                    <input
                      type="text"
                      className="form-field-input"
                      placeholder="Brief description of this container type"
                      value={typeForm.description}
                      onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn-submit-workspace">
                    <span>{editingTypeId ? '✓ Save Changes' : '+ Create Container Type'}</span>
                  </button>
                </form>
              </div>

              <div className="workspace-table-card">
                <div className="table-card-header">
                  <h3>Workspace Container Types</h3>
                </div>
                <table className="enterprise-styled-table">
                  <thead>
                    <tr>
                      <th>CODE</th>
                      <th>TYPE NAME</th>
                      <th>DESCRIPTION</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workspaceTypes.map((t) => (
                      <tr key={`type-row-${t.id}`}>
                        <td><span className="code-badge-tag">{t.type_code}</span></td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{t.type_name}</td>
                        <td style={{ color: '#64748b' }}>{t.description || 'N/A'}</td>
                        <td>
                          <div className="action-buttons-cell" style={{ justifyContent: 'flex-end' }}>
                            <button type="button" className="btn-action-icon delete" onClick={() => handleDeleteType(t.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ENTITY TAB 3: CLIENTS */}
          {activeEntityTab === 'clients' && (
            <div className="workspace-table-card">
              <div className="table-card-header">
                <h3>Client Organizations linked to Workspaces</h3>
              </div>
              <table className="enterprise-styled-table">
                <thead>
                  <tr>
                    <th>CLIENT CODE</th>
                    <th>CLIENT NAME</th>
                    <th>LINKED WORKSPACE</th>
                    <th style={{ textAlign: 'right' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={`client-row-${c.id}`}>
                      <td><span className="code-badge-tag">{c.client_code}</span></td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{c.client_name}</td>
                      <td><span className="container-type-badge">{c.workspace}</span></td>
                      <td style={{ textAlign: 'right' }}><span style={{ color: '#16a34a', fontWeight: 700 }}>● Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ENTITY TAB 4: PROJECTS */}
          {activeEntityTab === 'projects' && (
            <div className="workspace-table-card">
              <div className="table-card-header">
                <h3>Active Enterprise Projects</h3>
              </div>
              <table className="enterprise-styled-table">
                <thead>
                  <tr>
                    <th>PROJECT CODE</th>
                    <th>PROJECT NAME</th>
                    <th>WORKSPACE</th>
                    <th style={{ textAlign: 'right' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={`prj-row-${p.id}`}>
                      <td><span className="code-badge-tag">{p.project_code}</span></td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{p.project_name}</td>
                      <td><span className="container-type-badge">{p.workspace}</span></td>
                      <td style={{ textAlign: 'right' }}><span style={{ color: '#2563eb', fontWeight: 700 }}>● In Progress</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ENTITY TAB 5: BOARDS */}
          {activeEntityTab === 'boards' && (
            <div className="workspace-table-card">
              <div className="table-card-header">
                <h3>Kanban &amp; Agile Sprint Boards</h3>
              </div>
              <table className="enterprise-styled-table">
                <thead>
                  <tr>
                    <th>BOARD CODE</th>
                    <th>BOARD NAME</th>
                    <th>LINKED PROJECT</th>
                    <th style={{ textAlign: 'right' }}>TYPE</th>
                  </tr>
                </thead>
                <tbody>
                  {boards.map((b) => (
                    <tr key={`brd-row-${b.id}`}>
                      <td><span className="code-badge-tag">{b.board_code}</span></td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{b.board_name}</td>
                      <td><span className="container-type-badge">{b.project}</span></td>
                      <td style={{ textAlign: 'right' }}><span style={{ color: '#475569', fontWeight: 700 }}>Agile Board</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FALLBACK INFO WHEN OTHER SUB-TABS SELECTED */}
      {activeSubNav !== 'workspaces' && (
        <div className="enterprise-section-box" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
            {activeSubNav === 'directory' ? '👤 User Directory & Accounts' : '🛡️ Role & RBAC Access Control'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: 500, margin: '8px auto 16px' }}>
            User management, permission matrices, and security access policies. Switch to <strong>Workspaces &amp; Structure</strong> to manage organizational hierarchies.
          </p>
          <button
            type="button"
            className="subnav-pill-btn active"
            onClick={() => setActiveSubNav('workspaces')}
          >
            <span>⚡ Open Workspaces &amp; Structure</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EnterpriseAdminEngine;
