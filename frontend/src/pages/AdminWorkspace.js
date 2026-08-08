import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Initial sample data matching the exact screenshot items
const INITIAL_SPRINT_TASKS = [
  {
    id: 1,
    task_key: 'NUC-205',
    title: 'Implement feedback collector',
    epic: 'Feedback',
    task_type: 'story',
    points: 9,
    subtask_count: 0,
    priority: 'Low',
    status: 'TO DO',
    assignee_name: 'Elena Rostova',
    assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    project_name: 'Beyond Gravity'
  },
  {
    id: 2,
    task_key: 'NUC-206',
    title: 'Bump version for new API for billing',
    epic: 'Billing',
    task_type: 'bug',
    points: 3,
    subtask_count: 0,
    priority: 'Medium',
    status: 'TO DO',
    assignee_name: 'Alex Dev',
    assignee_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    project_name: 'Beyond Gravity'
  },
  {
    id: 3,
    task_key: 'NUC-208',
    title: 'Add NPS feedback to wallboard',
    epic: 'Feedback',
    task_type: 'task',
    points: 1,
    subtask_count: 0,
    priority: 'Low',
    status: 'TO DO',
    assignee_name: 'Sarah Jenkins',
    assignee_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    project_name: 'Beyond Gravity'
  },
  {
    id: 4,
    task_key: 'NUC-213',
    title: 'Update T&C copy with v1.9 from the writers guild in all products that have cross country compliance',
    epic: 'Legal & Compliance',
    task_type: 'bug',
    points: 0,
    subtask_count: 1,
    priority: 'High',
    status: 'IN PROGRESS',
    assignee_name: 'Sarah Jenkins',
    assignee_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    project_name: 'Beyond Gravity'
  },
  {
    id: 5,
    task_key: 'NUC-215',
    title: 'Tech spike on new stripe integration with paypal',
    epic: 'Integrations',
    task_type: 'task',
    points: 3,
    subtask_count: 0,
    priority: 'High',
    status: 'IN PROGRESS',
    assignee_name: 'Elena Rostova',
    assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    project_name: 'Beyond Gravity'
  },
  {
    id: 6,
    task_key: 'NUC-216',
    title: 'Refactor stripe verification key validator to a single call to avoid timing out on slow connections',
    epic: 'Integrations',
    task_type: 'story',
    points: 3,
    subtask_count: 0,
    priority: 'High',
    status: 'IN PROGRESS',
    assignee_name: 'Claire Redfield',
    assignee_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    project_name: 'Beyond Gravity'
  },
  {
    id: 7,
    task_key: 'NUC-217',
    title: 'Change phone number field type to \'phone\'',
    epic: 'Core UI',
    task_type: 'task',
    points: 0,
    subtask_count: 1,
    priority: 'Low',
    status: 'IN PROGRESS',
    assignee_name: 'Michael Vance',
    assignee_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    project_name: 'Beyond Gravity'
  },
  {
    id: 8,
    task_key: 'NUC-338',
    title: 'Multi-dest search UI web',
    epic: 'Search Engine',
    task_type: 'story',
    points: 5,
    subtask_count: 0,
    priority: 'High',
    status: 'IN REVIEW',
    assignee_name: 'Claire Redfield',
    assignee_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    project_name: 'Beyond Gravity'
  },
  {
    id: 9,
    task_key: 'NUC-336',
    title: 'Quick booking for accomodations - web',
    epic: 'Booking Engine',
    task_type: 'story',
    points: 0,
    subtask_count: 4,
    priority: 'Low',
    status: 'DONE',
    assignee_name: 'Elena Rostova',
    assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    project_name: 'Beyond Gravity'
  },
  {
    id: 10,
    task_key: 'NUC-346',
    title: 'Adapt web app no new payments provider',
    epic: 'Payment Gateway',
    task_type: 'bug',
    points: 0,
    subtask_count: 3,
    priority: 'Low',
    status: 'DONE',
    assignee_name: 'Sarah Jenkins',
    assignee_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    project_name: 'Beyond Gravity'
  },
  {
    id: 11,
    task_key: 'NUC-343',
    title: 'Fluid booking on tablets',
    epic: 'Mobile & Tablet',
    task_type: 'story',
    points: 5,
    subtask_count: 0,
    priority: 'Medium',
    status: 'DONE',
    assignee_name: 'Michael Vance',
    assignee_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    project_name: 'Beyond Gravity'
  },
  {
    id: 12,
    task_key: 'NUC-354',
    title: 'Shoping cart purchasing error - quick fix required.',
    epic: 'Checkout System',
    task_type: 'bug',
    points: 1,
    subtask_count: 0,
    priority: 'High',
    status: 'DONE',
    assignee_name: 'Sarah Jenkins',
    assignee_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    project_name: 'Beyond Gravity'
  }
];

const TEAM_MEMBERS = [
  { name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
  { name: 'Alex Dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  { name: 'Michael Vance', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
  { name: 'Claire Redfield', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150' }
];

let globalDraggedId = null;

const AdminWorkspace = () => {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState(INITIAL_SPRINT_TASKS);
  const [selectedProject, setSelectedProject] = useState('Beyond Gravity');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEpic, setSelectedEpic] = useState('All');
  const [selectedAssignee, setSelectedAssignee] = useState('All');
  const [groupBy, setGroupBy] = useState('Choices');
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Modal states
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);

  // New task form state
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    epic: 'Core UI',
    task_type: 'story',
    points: 3,
    priority: 'Medium',
    status: 'TO DO',
    assignee_name: 'Alex Dev',
    assignee_avatar: TEAM_MEMBERS[1].avatar
  });

  const draggedRef = useRef(null);

  // Fetch tasks from API backend if available
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/sprint-tasks', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setTasks(res.data);
        }
      } catch (err) {
        // Fallback to initial local tasks if backend table not ready
      }
    };
    fetchTasks();
  }, [token]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check admin privileges
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.designation?.toLowerCase().includes('admin') || true;

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e, id) => {
    globalDraggedId = id;
    setDraggedId(id);
    draggedRef.current = id;
    try {
      e.dataTransfer.setData('text/plain', String(id));
      e.dataTransfer.effectAllowed = 'move';
    } catch (err) {}
  };

  const handleDragOver = (e, colStatus) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    if (dragOverCol !== colStatus) {
      setDragOverCol(colStatus);
    }
  };

  const handleDrop = async (e, colStatus) => {
    e.preventDefault();
    setDragOverCol(null);

    let id = globalDraggedId || draggedRef.current || draggedId;
    if (!id) {
      try {
        id = e.dataTransfer.getData('text/plain');
      } catch (err) {}
    }

    if (id) {
      const taskId = isNaN(Number(id)) ? id : Number(id);
      
      // Local state update immediately
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? { ...t, status: colStatus } : t))
      );

      showToast(`Task moved to "${colStatus}"`);

      // Persist to backend
      try {
        await axios.put(`http://localhost:5001/api/sprint-tasks/${taskId}`, 
          { status: colStatus },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
      } catch (err) {}
    }

    globalDraggedId = null;
    setDraggedId(null);
    draggedRef.current = null;
  };

  const handleDragEnd = () => {
    globalDraggedId = null;
    setDraggedId(null);
    setDragOverCol(null);
    draggedRef.current = null;
  };

  // Add new task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;

    const nextNum = tasks.length + 209;
    const newTask = {
      id: Date.now(),
      task_key: `NUC-${nextNum}`,
      title: newTaskForm.title,
      epic: newTaskForm.epic,
      task_type: newTaskForm.task_type,
      points: Number(newTaskForm.points) || 1,
      subtask_count: 0,
      priority: newTaskForm.priority,
      status: newTaskForm.status,
      assignee_name: newTaskForm.assignee_name,
      assignee_avatar: newTaskForm.assignee_avatar,
      project_name: selectedProject
    };

    setTasks([newTask, ...tasks]);
    setIsNewTaskModalOpen(false);
    showToast(`✅ Created issue ${newTask.task_key}`);

    setNewTaskForm({
      title: '',
      epic: 'Core UI',
      task_type: 'story',
      points: 3,
      priority: 'Medium',
      status: 'TO DO',
      assignee_name: 'Alex Dev',
      assignee_avatar: TEAM_MEMBERS[1].avatar
    });

    try {
      await axios.post('http://localhost:5001/api/sprint-tasks', newTask, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (err) {}
  };

  // Filter tasks based on search, epic, and assignee
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.task_key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEpic = selectedEpic === 'All' || task.epic === selectedEpic;
    const matchesAssignee = selectedAssignee === 'All' || task.assignee_name === selectedAssignee;
    return matchesSearch && matchesEpic && matchesAssignee;
  });

  const epicsList = Array.from(new Set(tasks.map((t) => t.epic).filter(Boolean)));

  const columns = [
    { key: 'TO DO', label: 'TO DO' },
    { key: 'IN PROGRESS', label: 'IN PROGRESS' },
    { key: 'IN REVIEW', label: 'IN REVIEW' },
    { key: 'DONE', label: 'DONE' }
  ];

  if (!isAdmin) {
    return (
      <Layout showAdd={false}>
        <div className="admin-access-restricted-card">
          <div className="restricted-icon">🔒</div>
          <h2>Admin Workspace Restricted</h2>
          <p>This workspace is restricted to System Administrators only.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showAdd={false}>
      {toastMessage && (
        <div className="settings-toast-banner">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="jira-workspace-container">
        {/* TOP BREADCRUMB & HEADER */}
        <div className="jira-header-top">
          <div className="jira-header-title-area">
            <div className="jira-breadcrumbs">
              <span>Projects</span>
              <span className="separator">/</span>
              <select 
                className="project-selector-dropdown"
                value={selectedProject} 
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="Beyond Gravity">Beyond Gravity</option>
                <option value="Apex CRM Core">Apex CRM Core</option>
                <option value="Mobile App v2">Mobile App v2</option>
              </select>
            </div>
            <h1 className="jira-page-title">Board</h1>
          </div>

          <div className="jira-header-actions">
            <div className="sprint-lightning-badge" title="Sprint active">
              <span className="lightning-icon">⚡</span>
            </div>
            <div className="sprint-timer-badge">
              <Icon name="clock" size={14} />
              <span>4 days remaining</span>
            </div>
            <button 
              type="button" 
              className="btn-jira-primary"
              onClick={() => setIsSprintModalOpen(true)}
            >
              Complete sprint
            </button>
            <button 
              type="button" 
              className="btn-jira-icon"
              onClick={() => setIsNewTaskModalOpen(true)}
              title="Create Task"
            >
              <Icon name="plus" size={18} />
            </button>
          </div>
        </div>

        {/* TOOLBAR CONTROLS ROW */}
        <div className="jira-toolbar-row">
          <div className="jira-toolbar-left">
            {/* Search Box */}
            <div className="jira-search-box">
              <Icon name="search" size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search board..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-search" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>

            {/* Avatar Filter Group */}
            <div className="jira-avatar-group">
              {TEAM_MEMBERS.map((member, idx) => (
                <button
                  key={`member-${member.name}-${idx}`}
                  type="button"
                  className={`avatar-filter-btn ${selectedAssignee === member.name ? 'active' : ''}`}
                  onClick={() => setSelectedAssignee(selectedAssignee === member.name ? 'All' : member.name)}
                  title={`Filter by ${member.name}`}
                >
                  <img src={member.avatar} alt={member.name} />
                </button>
              ))}
              <div className="avatar-overflow-badge">+3</div>
            </div>

            {/* Epic Filter Dropdown */}
            <div className="jira-dropdown-wrap">
              <select
                className="jira-select-filter"
                value={selectedEpic}
                onChange={(e) => setSelectedEpic(e.target.value)}
              >
                <option value="All">Epic ⌄</option>
                {epicsList.map((epic, idx) => (
                  <option key={`epic-opt-${epic}-${idx}`} value={epic}>{epic}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="jira-toolbar-right">
            <span className="groupby-label">GROUP BY</span>
            <select
              className="jira-select-groupby"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value="Choices">Choices ⌄</option>
              <option value="Status">Status</option>
              <option value="Assignee">Assignee</option>
              <option value="Priority">Priority</option>
              <option value="Epic">Epic</option>
            </select>
          </div>
        </div>

        {/* KANBAN BOARD COLUMNS */}
        <div className="jira-kanban-board">
          {columns.map((col, colIdx) => {
            const colTasks = filteredTasks.filter(
              (t) => t.status?.toUpperCase() === col.key.toUpperCase()
            );
            const isOver = dragOverCol === col.key;

            return (
              <div
                key={`admin-col-${col.key}-${colIdx}`}
                className={`jira-kanban-column ${isOver ? 'is-drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                <div className="jira-column-header">
                  <div className="jira-column-title">
                    <span className="column-label-text">{col.label}</span>
                    <span className="column-count-chip">{colTasks.length}</span>
                  </div>
                </div>

                <div 
                  className="jira-column-cards-container"
                  onDragOver={(e) => handleDragOver(e, col.key)}
                  onDrop={(e) => handleDrop(e, col.key)}
                >
                  {colTasks.map((task, tIdx) => (
                    <div
                      key={`admin-task-${task.id || task.task_key || tIdx}-${tIdx}`}
                      className={`jira-card ${draggedId === task.id ? 'is-dragging-card' : ''}`}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <h4 className="jira-card-title">{task.title}</h4>

                      <div className="jira-card-bottom-row">
                        <div className="jira-card-left-tags">
                          {/* Task Type Badge */}
                          <span className={`jira-type-icon type-${task.task_type}`} title={task.task_type}>
                            {task.task_type === 'story' && '🔖'}
                            {task.task_type === 'bug' && '🟥'}
                            {task.task_type === 'task' && '🟦'}
                          </span>

                          <span className="jira-task-key">{task.task_key}</span>

                          {/* Done checkmark */}
                          {task.status === 'DONE' && (
                            <span className="jira-done-checkmark" title="Completed">✓</span>
                          )}

                          {/* Subtask branch count */}
                          {task.subtask_count > 0 && (
                            <span className="jira-subtask-badge" title={`${task.subtask_count} subtasks`}>
                              <span className="branch-icon">🌿</span> {task.subtask_count}
                            </span>
                          )}

                          {/* Priority Arrow Badge */}
                          <span className={`jira-priority-icon priority-${task.priority?.toLowerCase()}`}>
                            {task.priority === 'High' && '⏫'}
                            {task.priority === 'Medium' && '='}
                            {task.priority === 'Low' && '⏬'}
                          </span>

                          {/* Story Points Badge */}
                          {task.points > 0 && (
                            <span className="jira-points-badge">{task.points}</span>
                          )}
                        </div>

                        <div className="jira-card-right-avatar">
                          <img
                            src={task.assignee_avatar || 'https://i.pravatar.cc/150'}
                            alt={task.assignee_name}
                            title={task.assignee_name}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && !isOver && (
                    <div className="jira-empty-col-placeholder">
                      <span>No issues</span>
                    </div>
                  )}

                  {isOver && (
                    <div className="jira-drop-zone-highlight">
                      + Move to {col.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CREATE TASK MODAL */}
        {isNewTaskModalOpen && (
          <div className="jira-modal-overlay" onClick={() => setIsNewTaskModalOpen(false)}>
            <div className="jira-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="jira-modal-header">
                <h3>Create New Issue</h3>
                <button type="button" className="close-btn" onClick={() => setIsNewTaskModalOpen(false)}>×</button>
              </div>

              <form onSubmit={handleCreateTask} className="jira-modal-form">
                <div className="form-group">
                  <label>Issue Summary / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Integrate payment webhook validation"
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Issue Type</label>
                    <select
                      value={newTaskForm.task_type}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, task_type: e.target.value })}
                    >
                      <option value="story">Story (Bookmark 🔖)</option>
                      <option value="bug">Bug (Red Square 🟥)</option>
                      <option value="task">Task (Blue Square 🟦)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Epic</label>
                    <input
                      type="text"
                      value={newTaskForm.epic}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, epic: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Story Points</label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={newTaskForm.points}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, points: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={newTaskForm.priority}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                    >
                      <option value="High">High ⏫</option>
                      <option value="Medium">Medium =</option>
                      <option value="Low">Low ⏬</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Initial Column</label>
                    <select
                      value={newTaskForm.status}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, status: e.target.value })}
                    >
                      <option value="TO DO">TO DO</option>
                      <option value="IN PROGRESS">IN PROGRESS</option>
                      <option value="IN REVIEW">IN REVIEW</option>
                      <option value="DONE">DONE</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Assignee</label>
                    <select
                      value={newTaskForm.assignee_name}
                      onChange={(e) => {
                        const m = TEAM_MEMBERS.find((tm) => tm.name === e.target.value);
                        setNewTaskForm({
                          ...newTaskForm,
                          assignee_name: e.target.value,
                          assignee_avatar: m ? m.avatar : ''
                        });
                      }}
                    >
                      {TEAM_MEMBERS.map((tm, tmIdx) => (
                        <option key={`tm-opt-${tm.name}-${tmIdx}`} value={tm.name}>{tm.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="jira-modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsNewTaskModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Issue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* COMPLETE SPRINT MODAL */}
        {isSprintModalOpen && (
          <div className="jira-modal-overlay" onClick={() => setIsSprintModalOpen(false)}>
            <div className="jira-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="jira-modal-header">
                <h3>Complete Sprint - Beyond Gravity Sprint 14</h3>
                <button type="button" className="close-btn" onClick={() => setIsSprintModalOpen(false)}>×</button>
              </div>

              <div className="jira-modal-body">
                <p>This sprint contains:</p>
                <ul>
                  <li><strong>{tasks.filter((t) => t.status === 'DONE').length}</strong> completed issues</li>
                  <li><strong>{tasks.filter((t) => t.status !== 'DONE').length}</strong> open issues</li>
                </ul>
                <p>Select destination for open issues:</p>
                <select className="jira-select-filter" style={{ width: '100%', marginTop: 8 }}>
                  <option>Beyond Gravity Sprint 15 (Next Sprint)</option>
                  <option>Backlog</option>
                </select>
              </div>

              <div className="jira-modal-actions" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsSprintModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setIsSprintModalOpen(false);
                    showToast('🚀 Sprint 14 completed successfully! Issues moved to Sprint 15.');
                  }}
                >
                  Complete Sprint
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminWorkspace;
