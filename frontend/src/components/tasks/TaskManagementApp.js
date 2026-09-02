import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Icon from '../Icon';
import { useAuth } from '../../context/AuthContext';
import TaskCreateModal from './TaskCreateModal';
import TaskDetailDrawer from './TaskDetailDrawer';
import '../../styles/TaskManagement.css';

const DEFAULT_COLUMNS = [
  { id: 'col-todo', key: 'To Do', title: 'To Do', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' },
  { id: 'col-inprogress', key: 'In Progress', title: 'In Progress', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
  { id: 'col-inreview', key: 'In Review', title: 'In Review', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.08)' },
  { id: 'col-done', key: 'Done', title: 'Done', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
  { id: 'col-blocked', key: 'Blocked', title: 'Blocked', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' }
];

const AUTOMATION_RULES_INFO = [
  { id: 1, name: 'Task Assignment Alerts', trigger: 'Task assigned to team member', action: 'Generates in-app notification & notification bell badge increment', status: 'Active', icon: '👤' },
  { id: 2, name: '24-Hour Due Date Reminder', trigger: 'Task due within next 24 hours & not Done', action: 'Dispatches "Due Soon" reminder to all assigned users', status: 'Active', icon: '⏰' },
  { id: 3, name: 'Overdue Task Warning', trigger: 'Task passes due date and is not completed', action: 'Marks as Overdue, notifies assignee & team manager', status: 'Active', icon: '⚠️' },
  { id: 4, name: '48h Overdue Auto-Escalation', trigger: 'Task overdue by 48+ hours', action: 'Bumps priority one level (e.g. Medium → High), tags "Escalated", alerts Admin', status: 'Active', icon: '🚨' },
  { id: 5, name: 'Checklist Auto-Transition', trigger: '100% of checklist items checked', action: 'Automatically moves task status to "In Review" with audit log', status: 'Active', icon: '✅' },
  { id: 6, name: 'Completion & Recurrence Dispatch', trigger: 'Task marked as "Done"', action: 'Logs completion time, notifies creator, spawns next recurrence instance', status: 'Active', icon: '🎉' },
  { id: 7, name: 'Dependency Auto-Unblocker', trigger: 'Prerequisite task (dependsOn) completed', action: 'Transitions dependent task from Blocked to To Do & notifies assignee', status: 'Active', icon: '🔓' },
  { id: 8, name: 'New User Onboarding Routine', trigger: 'New team member added to User Directory', action: 'Auto-generates standard CRM onboarding checklist task', status: 'Active', icon: '👋' },
  { id: 9, name: 'Inactive User Task Rebalancing', trigger: 'Team member marked Inactive', action: 'Auto-reassigns open tasks to department lead with admin notification', status: 'Active', icon: '🔄' },
  { id: 10, name: 'Workload Capacity Threshold', trigger: 'Assignee has >10 active tasks', action: 'Flags overloaded capacity in Team Workload view and blocks auto-assign', status: 'Active', icon: '📊' },
  { id: 11, name: 'Comment @Mention Direct Alert', trigger: '@Name mentioned in task comments', action: 'Sends direct in-app notification with comment snippet', status: 'Active', icon: '💬' },
  { id: 12, name: 'Daily 9 AM Digest', trigger: 'Daily scheduled morning sweep', action: 'Sends personalized digest of today\'s tasks & overdue counts', status: 'Active', icon: '☀️' },
  { id: 13, name: 'Weekly Monday Admin Rollup', trigger: 'Weekly Monday 9 AM sweep', action: 'Delivers team-wide completion rates and top overdue blockers to Admin', status: 'Active', icon: '📈' }
];

const TaskManagementApp = () => {
  const { user: currentUser, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active View Tab: kanban, my-tasks, workload, list, calendar, automations
  const [activeView, setActiveView] = useState(() => {
    return searchParams.get('view') || localStorage.getItem('crm_task_view') || 'kanban';
  });

  useEffect(() => {
    const urlView = searchParams.get('view');
    if (urlView && urlView !== activeView) {
      setActiveView(urlView);
    }
  }, [searchParams, activeView]);

  const handleViewChange = (viewKey) => {
    setActiveView(viewKey);
    setSearchParams({ view: viewKey }, { replace: true });
    try { localStorage.setItem('crm_task_view', viewKey); } catch (e) {}
  };

  // Data States
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [workloadData, setWorkloadData] = useState([]);
  const [analytics, setAnalytics] = useState({ total: 0, todo: 0, inProgress: 0, inReview: 0, done: 0, blocked: 0, overdue: 0, escalated: 0, completionRate: 0 });
  const [automationLogs, setAutomationLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [filterProject] = useState('All');

  // Modal & Drawer States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Drag and Drop States
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColKey, setDragOverColKey] = useState(null);

  // Calendar navigation month/year
  const [calendarDate, setCalendarDate] = useState(new Date());

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const apiConfig = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  // Fetch all live data
  const fetchData = async () => {
    try {
      setLoading(true);
      const config = apiConfig();

      const [tasksRes, usersRes, workloadRes, analyticsRes, logsRes] = await Promise.allSettled([
        axios.get('http://localhost:5001/api/tasks', config),
        axios.get('http://localhost:5001/api/users', config),
        axios.get('http://localhost:5001/api/tasks/workload', config),
        axios.get('http://localhost:5001/api/tasks/analytics', config),
        axios.get('http://localhost:5001/api/tasks/automation-logs', config)
      ]);

      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.data);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
      if (workloadRes.status === 'fulfilled') setWorkloadData(workloadRes.value.data);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
      if (logsRes.status === 'fulfilled') setAutomationLogs(logsRes.value.data);
    } catch (err) {
      console.error('Error loading tasks workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Create Task Handler
  const handleCreateTask = async (taskPayload) => {
    try {
      await axios.post('http://localhost:5001/api/tasks', taskPayload, apiConfig());
      showToast('🎉 Task created and assigned successfully! Notification dispatched.');
      fetchData();
    } catch (err) {
      showToast('❌ Failed to create task: ' + (err.response?.data?.error || err.message));
    }
  };

  // Update Task Handler
  const handleUpdateTask = async (taskId, updatePayload) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatePayload } : t));
      
      const res = await axios.put(`http://localhost:5001/api/tasks/${taskId}`, updatePayload, apiConfig());
      if (res.data) {
        setTasks(prev => prev.map(t => t.id === taskId ? res.data : t));
        if (selectedTaskForDrawer?.id === taskId) {
          setSelectedTaskForDrawer(res.data);
        }
      }
      showToast('✅ Task updated.');
      fetchData();
    } catch (err) {
      showToast('❌ Failed to update task');
      fetchData();
    }
  };

  // Delete Task Handler
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5001/api/tasks/${taskId}`, apiConfig());
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showToast('🗑️ Task removed.');
      fetchData();
    } catch (err) {
      showToast('❌ Failed to delete: ' + (err.response?.data?.error || err.message));
    }
  };

  // Run Manual Automations Sweep
  const handleRunAutomations = async () => {
    try {
      showToast('⚡ Executing automated rules sweeps...');
      const res = await axios.post('http://localhost:5001/api/tasks/run-automations', {}, apiConfig());
      showToast(`🤖 ${res.data?.message || 'Automations executed successfully!'}`);
      fetchData();
    } catch (err) {
      showToast('❌ Automation run error: ' + err.message);
    }
  };

  // HTML5 Drag & Drop
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', String(taskId));
  };

  const handleDragOver = (e, colKey) => {
    e.preventDefault();
    if (dragOverColKey !== colKey) setDragOverColKey(colKey);
  };

  const handleDrop = async (e, colKey) => {
    e.preventDefault();
    setDragOverColKey(null);
    if (!draggedTaskId) return;

    handleUpdateTask(draggedTaskId, { status: colKey });
    setDraggedTaskId(null);
  };

  // Trigger Auto-Assign All Unassigned Tasks
  const handleAutoAssignAll = async () => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5001/api/tasks/auto-assign-all', {}, apiConfig());
      showToast(`🤖 Smart Auto-Assignment Complete: Assigned ${res.data?.count || 0} task(s) based on capacity and skills.`);
      fetchData();
    } catch (err) {
      showToast('❌ Auto-assign failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Trigger Auto-Rebalance Workload
  const handleAutoRebalance = async () => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5001/api/tasks/auto-rebalance', {}, apiConfig());
      showToast(`⚖️ Workload Rebalanced: Shifted ${res.data?.rebalancedCount || 0} tasks to optimize team capacity.`);
      fetchData();
    } catch (err) {
      showToast('❌ Rebalancing failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Trigger Automated Sprint Deliverables Generation
  const handleGenerateSprint = async () => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5001/api/tasks/generate-sprint-tasks', {
        project_name: filterProject !== 'All' ? filterProject : 'Beyond Gravity'
      }, apiConfig());
      showToast(`🚀 Generated & Auto-Assigned ${res.data?.count || 6} Sprint Deliverables across Professional Team Leads!`);
      fetchData();
    } catch (err) {
      showToast('❌ Sprint generation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filtered Tasks Computation
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = !searchQuery || 
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.task_key?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.assignees?.some(a => a.name?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept = filterDepartment === 'All' || t.department === filterDepartment;
      const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
      const matchesProject = filterProject === 'All' || t.project === filterProject;
      const matchesAssignee = filterAssignee === 'All' || t.assignees?.some(a => a.name === filterAssignee || String(a.id) === String(filterAssignee));

      return matchesSearch && matchesDept && matchesPriority && matchesProject && matchesAssignee;
    });
  }, [tasks, searchQuery, filterDepartment, filterPriority, filterProject, filterAssignee]);

  // "My Tasks" personalized list
  const myTasks = useMemo(() => {
    if (!currentUser) return tasks;
    return tasks.filter(t => 
      t.assignees?.some(a => String(a.id) === String(currentUser.id) || a.email === currentUser.email || a.name === currentUser.name)
    );
  }, [tasks, currentUser]);

  return (
    <div className="task-management-root">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="task-toast-alert">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HERO HEADER */}
      <div className="task-management-hero">
        <div className="task-hero-left">
          <div className="task-hero-badge-row">
            <span className="task-live-status-pill">
              <span className="task-pulse-dot"></span> LIVE AUTOMATIONS ACTIVE
            </span>
            <span className="task-rbac-badge">
              🛡️ {currentUser?.role || 'Admin'} Scope • {currentUser?.department || 'Engineering'}
            </span>
          </div>
          <h1 className="task-hero-title">Task Management &amp; Automated Dispatch</h1>
          <p className="task-hero-sub">
            Assign tasks to live User Directory members with AI workload balancing, track progress across Kanban &amp; Workload matrices, and let automated triggers handle deadlines &amp; escalations.
          </p>
        </div>

        <div className="task-hero-actions">
          {loading && (
            <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              ⏳ Syncing data...
            </span>
          )}

          <button 
            type="button" 
            className="task-btn-secondary"
            onClick={handleGenerateSprint}
            title="Auto-generate 6 core sprint deliverables distributed across professional lead roles"
          >
            <span>🚀 Auto-Generate Sprint</span>
          </button>

          <button 
            type="button" 
            className="task-btn-secondary"
            onClick={handleAutoAssignAll}
            title="Automatically assign all pending/unassigned tasks to the least-loaded department members"
          >
            <span>✨ Smart Auto-Assign</span>
          </button>

          <button 
            type="button" 
            className="task-btn-secondary"
            onClick={handleAutoRebalance}
            title="Rebalance workloads from overloaded members (>5 tasks) to peers"
          >
            <span>⚖️ Rebalance Workloads</span>
          </button>

          <button 
            type="button" 
            className="task-btn-secondary"
            onClick={handleRunAutomations}
            title="Execute Overdue, Due Soon & Escalation Sweeps Now"
          >
            <span>⚡ Sweep Triggers</span>
          </button>

          <button 
            type="button" 
            className="task-btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Icon name="plus" size={16} />
            <span>+ New Task</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS ROW */}
      <div className="task-metrics-strip">
        <div className="task-metric-card">
          <div className="task-metric-info">
            <span className="task-metric-label">Total Tasks</span>
            <span className="task-metric-val">{analytics.total}</span>
          </div>
          <div className="task-metric-icon total">📋</div>
        </div>

        <div className="task-metric-card">
          <div className="task-metric-info">
            <span className="task-metric-label">In Progress</span>
            <span className="task-metric-val" style={{ color: '#f59e0b' }}>{analytics.inProgress}</span>
          </div>
          <div className="task-metric-icon in-progress">⏳</div>
        </div>

        <div className="task-metric-card">
          <div className="task-metric-info">
            <span className="task-metric-label">In Review</span>
            <span className="task-metric-val" style={{ color: '#a855f7' }}>{analytics.inReview}</span>
          </div>
          <div className="task-metric-icon in-review">🔍</div>
        </div>

        <div className="task-metric-card">
          <div className="task-metric-info">
            <span className="task-metric-label">Overdue</span>
            <span className="task-metric-val" style={{ color: '#ef4444' }}>{analytics.overdue}</span>
          </div>
          <div className="task-metric-icon overdue">⚠️</div>
        </div>

        <div className="task-metric-card">
          <div className="task-metric-info">
            <span className="task-metric-label">Escalated</span>
            <span className="task-metric-val" style={{ color: '#dc2626' }}>{analytics.escalated}</span>
          </div>
          <div className="task-metric-icon escalated">🚨</div>
        </div>

        <div className="task-metric-card">
          <div className="task-metric-info">
            <span className="task-metric-label">Completion Rate</span>
            <span className="task-metric-val" style={{ color: '#10b981' }}>{analytics.completionRate}%</span>
          </div>
          <div className="task-metric-icon completed">🎉</div>
        </div>
      </div>

      {/* VIEW SWITCHER & FILTER CONTROLS TOOLBAR */}
      <div className="task-controls-toolbar">
        {/* Navigation Tabs */}
        <div className="task-view-tabs">
          <button 
            type="button" 
            className={`task-view-tab-btn ${activeView === 'kanban' ? 'active' : ''}`}
            onClick={() => handleViewChange('kanban')}
          >
            <Icon name="grid" size={15} />
            <span>Kanban Board</span>
          </button>

          <button 
            type="button" 
            className={`task-view-tab-btn ${activeView === 'my-tasks' ? 'active' : ''}`}
            onClick={() => handleViewChange('my-tasks')}
          >
            <Icon name="user" size={15} />
            <span>My Tasks ({myTasks.length})</span>
          </button>

          <button 
            type="button" 
            className={`task-view-tab-btn ${activeView === 'workload' ? 'active' : ''}`}
            onClick={() => handleViewChange('workload')}
          >
            <Icon name="users" size={15} />
            <span>Team Workload</span>
          </button>

          <button 
            type="button" 
            className={`task-view-tab-btn ${activeView === 'list' ? 'active' : ''}`}
            onClick={() => handleViewChange('list')}
          >
            <Icon name="list" size={15} />
            <span>List View</span>
          </button>

          <button 
            type="button" 
            className={`task-view-tab-btn ${activeView === 'calendar' ? 'active' : ''}`}
            onClick={() => handleViewChange('calendar')}
          >
            <Icon name="clock" size={15} />
            <span>Calendar</span>
          </button>

          <button 
            type="button" 
            className={`task-view-tab-btn ${activeView === 'automations' ? 'active' : ''}`}
            onClick={() => handleViewChange('automations')}
          >
            <span>🤖 Automations Hub</span>
          </button>
        </div>

        {/* Global Filters */}
        <div className="task-filters-wrap">
          {/* Search Box */}
          <div className="task-search-input-wrap">
            <Icon name="search" size={14} />
            <input 
              type="text" 
              placeholder="Filter tasks, tags, keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>

          {/* Department Filter */}
          <select 
            className="task-select-filter"
            value={filterDepartment} 
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="All">Dept: All</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Support">Support</option>
            <option value="Operations">Operations</option>
          </select>

          {/* Priority Filter */}
          <select 
            className="task-select-filter"
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">Priority: All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          {/* Assignee Filter */}
          <select 
            className="task-select-filter"
            value={filterAssignee} 
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="All">Assignee: All</option>
            {users.map(u => (
              <option key={`flt-u-${u.id}`} value={u.name}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          VIEW 1: KANBAN SPRINT BOARD
          ═══════════════════════════════════════════════ */}
      {activeView === 'kanban' && (
        <div className="task-kanban-board-container">
          <div className="task-kanban-columns-track">
            {DEFAULT_COLUMNS.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.key);
              const isOver = dragOverColKey === col.key;

              return (
                <div 
                  key={col.id} 
                  className={`task-kanban-col ${isOver ? 'is-drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, col.key)}
                  onDrop={(e) => handleDrop(e, col.key)}
                >
                  {/* Column Header */}
                  <div className="task-kanban-col-head" style={{ borderTopColor: col.color }}>
                    <div className="task-kanban-col-title-group">
                      <span className="task-col-dot" style={{ background: col.color }}></span>
                      <h3>{col.title}</h3>
                      <span className="task-col-count-pill">{colTasks.length}</span>
                    </div>
                    <button 
                      type="button" 
                      className="task-col-add-btn"
                      onClick={() => setIsCreateModalOpen(true)}
                      title={`Add task to ${col.title}`}
                    >
                      +
                    </button>
                  </div>

                  {/* Column Cards Drop Area */}
                  <div className="task-kanban-cards-area">
                    {colTasks.length === 0 ? (
                      <div className="task-kanban-empty-col">
                        <span>Drop tasks here</span>
                      </div>
                    ) : (
                      colTasks.map(task => {
                        const totalChk = task.checklist?.length || 0;
                        const doneChk = task.checklist?.filter(c => c.done).length || 0;
                        const isTaskOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done';

                        return (
                          <div 
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            className={`task-kanban-card priority-border-${task.priority?.toLowerCase()}`}
                            onClick={() => setSelectedTaskForDrawer(task)}
                          >
                            {/* Card Top: Key & Priority */}
                            <div className="task-card-top-row">
                              <span className="task-card-key">{task.task_key}</span>
                              <div className="task-card-top-badges">
                                {task.is_escalated && (
                                  <span className="task-card-escalated-pill">🚨 Escalated</span>
                                )}
                                <span className={`task-priority-pill priority-${task.priority?.toLowerCase()}`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>

                            {/* Card Title */}
                            <h4 className="task-card-title">{task.title}</h4>

                            {/* Tags Row */}
                            {task.tags && task.tags.length > 0 && (
                              <div className="task-card-tags">
                                {task.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="task-card-tag">#{tag}</span>
                                ))}
                              </div>
                            )}

                            {/* Card Footer: Assignees, Due Date, Subtasks */}
                            <div className="task-card-footer">
                              <div className="task-card-meta-left">
                                {task.due_date && (
                                  <span className={`task-card-due ${isTaskOverdue ? 'overdue' : ''}`}>
                                    <Icon name="clock" size={12} />
                                    {new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                                {totalChk > 0 && (
                                  <span className="task-card-checklist-count">
                                    <Icon name="check" size={12} /> {doneChk}/{totalChk}
                                  </span>
                                )}
                                {task.comments?.length > 0 && (
                                  <span className="task-card-comment-count">
                                    💬 {task.comments.length}
                                  </span>
                                )}
                              </div>

                              {/* Assignee Avatars Group */}
                              <div className="task-card-avatars">
                                {task.assignees?.slice(0, 3).map((a, i) => (
                                  <img 
                                    key={i} 
                                    src={a.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=2563eb&color=fff`} 
                                    alt={a.name} 
                                    title={a.name}
                                    className="task-card-avatar"
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          VIEW 2: MY TASKS (PERSONALIZED USER VIEW)
          ═══════════════════════════════════════════════ */}
      {activeView === 'my-tasks' && (
        <div className="task-my-tasks-view">
          <div className="task-view-section-head">
            <div>
              <h2>👤 My Assigned Tasks</h2>
              <p>Personalized task dashboard for <strong>{currentUser?.name || 'You'}</strong>. Update status, check off items, and manage deadlines.</p>
            </div>
            <span className="task-count-indicator">{myTasks.length} Assigned Tasks</span>
          </div>

          <div className="task-my-tasks-list">
            {myTasks.length === 0 ? (
              <div className="task-empty-state-box">
                <Icon name="check" size={32} />
                <h3>All Caught Up! 🎉</h3>
                <p>No active tasks assigned to you right now.</p>
              </div>
            ) : (
              myTasks.map(task => {
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done';
                return (
                  <div key={task.id} className="task-my-task-row" onClick={() => setSelectedTaskForDrawer(task)}>
                    <div className="task-my-task-status-toggle">
                      <input 
                        type="checkbox" 
                        checked={task.status === 'Done'}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleUpdateTask(task.id, { status: task.status === 'Done' ? 'In Progress' : 'Done' });
                        }} 
                      />
                    </div>

                    <div className="task-my-task-body">
                      <div className="task-my-task-top">
                        <span className="task-card-key">{task.task_key}</span>
                        <h4 className={task.status === 'Done' ? 'done-text' : ''}>{task.title}</h4>
                      </div>
                      <div className="task-my-task-meta">
                        <span className="task-project-pill">📁 {task.project}</span>
                        <span className={`task-priority-pill priority-${task.priority?.toLowerCase()}`}>{task.priority}</span>
                        <span className={`task-card-due ${isOverdue ? 'overdue' : ''}`}>
                          Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                        </span>
                        {task.is_escalated && <span className="task-card-escalated-pill">🚨 Escalated</span>}
                      </div>
                    </div>

                    <div className="task-my-task-action-col">
                      <span className={`task-select-pill status-${task.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          VIEW 3: TEAM WORKLOAD & CAPACITY MATRIX
          ═══════════════════════════════════════════════ */}
      {activeView === 'workload' && (
        <div className="task-workload-view">
          <div className="task-view-section-head">
            <div>
              <h2>📊 Team Workload &amp; Capacity Balancing Matrix</h2>
              <p>Live capacity visibility across all User Directory team members. Workload limit flagged at &gt; 10 active tasks.</p>
            </div>
            <span className="task-count-indicator">{workloadData.length} Team Members</span>
          </div>

          <div className="task-workload-table-card">
            <table className="task-workload-styled-table">
              <thead>
                <tr>
                  <th>TEAM MEMBER</th>
                  <th>ROLE &amp; DEPT</th>
                  <th>STATUS</th>
                  <th>OPEN TASKS</th>
                  <th>OVERDUE</th>
                  <th>WORKLOAD CAPACITY (MAX 10)</th>
                  <th>CAPACITY STATE</th>
                </tr>
              </thead>
              <tbody>
                {workloadData.map(item => (
                  <tr key={item.user.id} className={item.isOverloaded ? 'row-overloaded' : ''}>
                    <td>
                      <div className="task-workload-user-cell">
                        <img 
                          src={item.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user.name)}&background=2563eb&color=fff`} 
                          alt={item.user.name} 
                          className="task-workload-avatar"
                        />
                        <div>
                          <strong>{item.user.name}</strong>
                          <span>{item.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="task-workload-role-cell">
                        <strong>{item.user.role}</strong>
                        <span>{item.user.department}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`task-status-dot-badge ${item.user.status === 'Active' ? 'active' : 'inactive'}`}>
                        ● {item.user.status}
                      </span>
                    </td>
                    <td>
                      <span className="task-workload-number">{item.openTasksCount}</span>
                    </td>
                    <td>
                      <span className={`task-workload-overdue-pill ${item.overdueTasksCount > 0 ? 'has-overdue' : ''}`}>
                        {item.overdueTasksCount}
                      </span>
                    </td>
                    <td style={{ minWidth: 180 }}>
                      <div className="task-workload-bar-wrap">
                        <div className="task-workload-bar-track">
                          <div 
                            className={`task-workload-bar-fill ${item.isOverloaded ? 'overloaded' : item.openTasksCount > 6 ? 'warning' : 'healthy'}`}
                            style={{ width: `${Math.min(item.capacityPercentage, 100)}%` }}
                          />
                        </div>
                        <span className="task-workload-percent">{item.capacityPercentage}%</span>
                      </div>
                    </td>
                    <td>
                      {item.isOverloaded ? (
                        <span className="task-capacity-badge overloaded">🚨 Overloaded (&gt;10)</span>
                      ) : item.openTasksCount > 6 ? (
                        <span className="task-capacity-badge high">⚠️ High Load</span>
                      ) : (
                        <span className="task-capacity-badge healthy">✓ Optimal Capacity</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          VIEW 4: LIST / TABLE VIEW WITH ADVANCED FILTERING
          ═══════════════════════════════════════════════ */}
      {activeView === 'list' && (
        <div className="task-list-view-container">
          <div className="task-view-section-head">
            <div>
              <h2>📑 Enterprise Task Data Grid</h2>
              <p>Filterable table showing all tasks, deadlines, assignees, and progress.</p>
            </div>
            <span className="task-count-indicator">Showing {filteredTasks.length} Tasks</span>
          </div>

          <div className="task-table-card">
            <table className="task-styled-table">
              <thead>
                <tr>
                  <th>KEY</th>
                  <th>TASK TITLE</th>
                  <th>PROJECT</th>
                  <th>DEPARTMENT</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th>ASSIGNEES</th>
                  <th>DUE DATE</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id} onClick={() => setSelectedTaskForDrawer(task)} style={{ cursor: 'pointer' }}>
                    <td><span className="task-card-key">{task.task_key}</span></td>
                    <td>
                      <div className="task-table-title-cell">
                        <strong>{task.title}</strong>
                        {task.is_escalated && <span className="task-table-mini-badge">🚨 Escalated</span>}
                      </div>
                    </td>
                    <td><span className="task-project-pill">{task.project}</span></td>
                    <td><span className="task-dept-badge">{task.department}</span></td>
                    <td><span className={`task-priority-pill priority-${task.priority?.toLowerCase()}`}>{task.priority}</span></td>
                    <td><span className={`task-select-pill status-${task.status?.toLowerCase().replace(/\s+/g, '-')}`}>{task.status}</span></td>
                    <td>
                      <div className="task-table-assignees">
                        {task.assignees?.map((a, idx) => (
                          <img 
                            key={idx} 
                            src={a.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=2563eb&color=fff`} 
                            alt={a.name} 
                            title={a.name}
                            className="task-table-avatar" 
                          />
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="task-table-due">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        type="button" 
                        className="task-btn-link"
                        onClick={(e) => { e.stopPropagation(); setSelectedTaskForDrawer(task); }}
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          VIEW 5: CALENDAR VIEW
          ═══════════════════════════════════════════════ */}
      {activeView === 'calendar' && (
        <div className="task-calendar-view-container">
          <div className="task-view-section-head">
            <div>
              <h2>📅 Task Calendar &amp; Deadline Timeline</h2>
              <p>Visual schedule of deliverables plotted by due dates.</p>
            </div>
            <div className="task-calendar-nav">
              <button 
                type="button" 
                className="task-btn-secondary btn-sm"
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
              >
                ← Prev Month
              </button>
              <strong>{calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>
              <button 
                type="button" 
                className="task-btn-secondary btn-sm"
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
              >
                Next Month →
              </button>
            </div>
          </div>

          <div className="task-calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="task-calendar-day-head">{d}</div>
            ))}

            {Array.from({ length: 35 }).map((_, idx) => {
              const dayNumber = (idx % 31) + 1;
              const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
              const dayTasks = tasks.filter(t => t.due_date && t.due_date.startsWith(dateStr));

              return (
                <div key={`cal-day-${idx}`} className="task-calendar-cell">
                  <div className="task-calendar-cell-num">{dayNumber}</div>
                  <div className="task-calendar-cell-tasks">
                    {dayTasks.map(t => (
                      <div 
                        key={t.id} 
                        className={`task-cal-pill priority-${t.priority?.toLowerCase()}`}
                        onClick={() => setSelectedTaskForDrawer(t)}
                        title={t.title}
                      >
                        <span>{t.task_key}</span> {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          VIEW 6: AUTOMATIONS HUB & AUDIT LOGS
          ═══════════════════════════════════════════════ */}
      {activeView === 'automations' && (
        <div className="task-automations-hub-container">
          <div className="task-view-section-head">
            <div>
              <h2>🤖 Task Automations &amp; Trigger Engine Hub</h2>
              <p>Active server-side rule triggers running on task mutations and background schedule sweeps.</p>
            </div>
            <button 
              type="button" 
              className="task-btn-primary"
              onClick={handleRunAutomations}
            >
              <span>⚡ Execute Sweeps Now</span>
            </button>
          </div>

          {/* 13 Rules Grid */}
          <div className="task-rules-cards-grid">
            {AUTOMATION_RULES_INFO.map(rule => (
              <div key={rule.id} className="task-rule-card">
                <div className="task-rule-head">
                  <div className="task-rule-icon">{rule.icon}</div>
                  <div className="task-rule-title-group">
                    <h4>{rule.name}</h4>
                    <span className="task-rule-active-badge">● Active Trigger</span>
                  </div>
                </div>
                <div className="task-rule-details">
                  <div className="task-rule-item">
                    <label>TRIGGER:</label>
                    <p>{rule.trigger}</p>
                  </div>
                  <div className="task-rule-item">
                    <label>AUTOMATIC ACTION:</label>
                    <p>{rule.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Automation Execution Logs */}
          <div className="task-automation-logs-card">
            <div className="task-logs-head">
              <h3>📊 Recent Automation Execution Audit Logs</h3>
              <span>Showing last {automationLogs.length} events</span>
            </div>
            <table className="task-styled-table">
              <thead>
                <tr>
                  <th>EXECUTED AT</th>
                  <th>RULE / ENGINE</th>
                  <th>TRIGGER EVENT</th>
                  <th>TASK KEY</th>
                  <th>AUDIT DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {automationLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                      No automation logs yet. Click "Execute Sweeps Now" to trigger automated evaluation.
                    </td>
                  </tr>
                ) : (
                  automationLogs.map((log, i) => (
                    <tr key={log.id || i}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8' }}>
                        {new Date(log.executed_at).toLocaleString()}
                      </td>
                      <td><strong>{log.rule_name}</strong></td>
                      <td><span className="task-dept-badge">{log.trigger_event}</span></td>
                      <td><span className="task-card-key">{log.task_key || 'SYSTEM'}</span></td>
                      <td style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      <TaskCreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        users={users}
        existingTasks={tasks}
        currentUser={currentUser}
      />

      {/* TASK DETAIL DRAWER */}
      <TaskDetailDrawer 
        task={selectedTaskForDrawer}
        isOpen={Boolean(selectedTaskForDrawer)}
        onClose={() => setSelectedTaskForDrawer(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        users={users}
        currentUser={currentUser}
      />
    </div>
  );
};

export default TaskManagementApp;
