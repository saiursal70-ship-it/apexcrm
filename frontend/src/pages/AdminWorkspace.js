import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import WorkflowConvertModal from '../components/WorkflowConvertModal';
import EnterpriseAdminEngine from '../components/EnterpriseAdminEngine';
import { animateStagger } from '../utils/animations';

// Initial sample sprint tasks
const INITIAL_SPRINT_TASKS = [
  {
    id: 1,
    task_key: 'NUC-205',
    title: 'Implement feedback collector and telemetry logger',
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
    title: 'Bump version for new API for billing & automated invoices',
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
    title: 'Add NPS feedback chart to analytics dashboard',
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
    title: 'Tech spike on new stripe integration with paypal and UPI gateways',
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
    title: 'Change phone number field type to international formatted input',
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
    title: 'Multi-destination search filter and faceted view web',
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
    title: 'Quick booking workflow for enterprise accommodations - web',
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
    title: 'Adapt web app to new GST & invoicing compliance regulations',
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
    title: 'Fluid responsive layout and touch gesture optimization for tablets',
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
    title: 'Shopping cart checkout validation fix - quick patch deployment',
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

const DEFAULT_COLUMNS = [
  { id: 'col-todo', key: 'TO DO', title: 'TO DO', order: 1, wipLimit: null },
  { id: 'col-inprogress', key: 'IN PROGRESS', title: 'IN PROGRESS', order: 2, wipLimit: 4 },
  { id: 'col-inreview', key: 'IN REVIEW', title: 'IN REVIEW', order: 3, wipLimit: 3 },
  { id: 'col-done', key: 'DONE', title: 'DONE', order: 4, wipLimit: null }
];

let globalDraggedId = null;

/**
 * AdminWorkspace Component
 * Advanced Agile Sprint Board with Dynamic Column Management, Drag-and-Drop,
 * WIP Limits, and Multi-Stage Project Handover automations.
 */
const AdminWorkspace = ({ embedded = false }) => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState(INITIAL_SPRINT_TASKS);
  const [selectedProject, setSelectedProject] = useState('Beyond Gravity');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEpic, setSelectedEpic] = useState('All');
  const [selectedAssignee, setSelectedAssignee] = useState('All');
  const [groupBy, setGroupBy] = useState('Choices');
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dynamic Column State (persisted in localStorage)
  const [columns, setColumns] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_sprint_columns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_COLUMNS;
  });

  // Inline column addition state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [newColWipLimit, setNewColWipLimit] = useState('');

  // Column header editing & context menu states
  const [editingColId, setEditingColId] = useState(null);
  const [editingColTitle, setEditingColTitle] = useState('');
  const [openMenuColId, setOpenMenuColId] = useState(null);

  // WIP Limit Modal State
  const [wipModalCol, setWipModalCol] = useState(null);
  const [wipLimitInput, setWipLimitInput] = useState('');

  // Modal states
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

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
  const workspaceRef = useRef(null);

  // Persist columns to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('crm_sprint_columns', JSON.stringify(columns));
    } catch (e) {}
  }, [columns]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuColId(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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
      } catch (err) {}
    };
    fetchTasks();
  }, [token]);

  useEffect(() => {
    animateStagger('.jira-kanban-column', { translateY: [18, 0], scale: [0.98, 1], duration: 450 });
    animateStagger('.jira-card', { translateY: [10, 0], opacity: [0, 1], duration: 350 });
  }, [tasks.length, selectedEpic, selectedAssignee, columns.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsNewTaskModalOpen(false);
        setIsSprintModalOpen(false);
        setIsAddingColumn(false);
        setEditingColId(null);
        setOpenMenuColId(null);
        setWipModalCol(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // --- Dynamic Column Actions ---

  const handleAddColumnSubmit = (e) => {
    e?.preventDefault();
    if (!newColTitle.trim()) return;

    const formattedKey = newColTitle.trim().toUpperCase();
    const newCol = {
      id: `col-${Date.now()}`,
      key: formattedKey,
      title: newColTitle.trim(),
      order: columns.length + 1,
      wipLimit: newColWipLimit ? parseInt(newColWipLimit, 10) : null
    };

    setColumns([...columns, newCol]);
    setNewColTitle('');
    setNewColWipLimit('');
    setIsAddingColumn(false);
    showToast(`✅ Added column "${newCol.title}"`);
  };

  const handleStartRename = (col, e) => {
    e?.stopPropagation();
    setEditingColId(col.id);
    setEditingColTitle(col.title);
    setOpenMenuColId(null);
  };

  const handleSaveRename = (colId) => {
    if (!editingColTitle.trim()) {
      setEditingColId(null);
      return;
    }

    const targetCol = columns.find((c) => c.id === colId);
    if (!targetCol) return;

    const oldKey = targetCol.key;
    const newKey = editingColTitle.trim().toUpperCase();
    const newTitle = editingColTitle.trim();

    setColumns((prevCols) =>
      prevCols.map((c) =>
        c.id === colId ? { ...c, title: newTitle, key: newKey } : c
      )
    );

    // Update tasks that belonged to the old column key
    if (oldKey !== newKey) {
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.status?.toUpperCase() === oldKey ? { ...t, status: newKey } : t))
      );
    }

    setEditingColId(null);
    showToast(`✏️ Renamed column to "${newTitle}"`);
  };

  const handleOpenWipModal = (col, e) => {
    e?.stopPropagation();
    setWipModalCol(col);
    setWipLimitInput(col.wipLimit ? String(col.wipLimit) : '');
    setOpenMenuColId(null);
  };

  const handleSaveWipLimit = (e) => {
    e?.preventDefault();
    if (!wipModalCol) return;

    const numericVal = parseInt(wipLimitInput, 10);
    const finalLimit = isNaN(numericVal) || numericVal <= 0 ? null : numericVal;

    setColumns((prevCols) =>
      prevCols.map((c) =>
        c.id === wipModalCol.id ? { ...c, wipLimit: finalLimit } : c
      )
    );

    showToast(finalLimit ? `🎯 Set WIP limit of ${finalLimit} for "${wipModalCol.title}"` : `Cleared WIP limit for "${wipModalCol.title}"`);
    setWipModalCol(null);
  };

  const handleClearTasks = (colKey, e) => {
    e?.stopPropagation();
    setOpenMenuColId(null);
    const defaultColKey = columns[0]?.key || 'TO DO';

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.status?.toUpperCase() === colKey.toUpperCase() ? { ...t, status: defaultColKey } : t
      )
    );

    showToast(`🧹 Cleared all tasks from "${colKey}" to "${defaultColKey}"`);
  };

  const handleDeleteColumn = (colId, colKey, e) => {
    e?.stopPropagation();
    setOpenMenuColId(null);

    if (columns.length <= 1) {
      alert('The board must have at least one column.');
      return;
    }

    const defaultColKey = columns.find((c) => c.id !== colId)?.key || 'TO DO';

    // Move orphaned tasks to default column
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.status?.toUpperCase() === colKey.toUpperCase() ? { ...t, status: defaultColKey } : t
      )
    );

    // Remove column
    setColumns((prevCols) => prevCols.filter((c) => c.id !== colId));
    showToast(`🗑️ Deleted column "${colKey}". Tasks moved to "${defaultColKey}".`);
  };

  // --- HTML5 Drag & Drop handlers ---

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

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? { ...t, status: colStatus } : t))
      );

      showToast(`Task moved to "${colStatus}"`);

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

  // Create new task
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
      status: newTaskForm.status || columns[0]?.key || 'TO DO',
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
      status: columns[0]?.key || 'TO DO',
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

  const workspaceJSX = (
    <div
      ref={workspaceRef}
      className={`jira-workspace-container ${embedded ? 'jira-workspace-embedded' : ''} ${isFullscreen ? 'jira-workspace-fullscreen' : ''}`}
    >
      {toastMessage && (
        <div className="settings-toast-banner">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ENTERPRISE ADMINISTRATION ENGINE SECTION */}
      <EnterpriseAdminEngine />

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
            <span className="separator">/</span>
            <span className="admin-access-badge">
              <span>⚡</span> ADMIN ACCESS GRANTED
            </span>
          </div>
          <h1 className="jira-page-title">Admin Workspace &amp; Sprint Board</h1>
          <p className="jira-board-subtitle" style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
            Agile project workspace for administrative users only. Manage active sprints, drag-and-drop task cards, Epics, and team assignments.
          </p>
        </div>

        <div className="jira-header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={toggleFullscreen}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.82rem', fontWeight: 700 }}
            title="Toggle Fullscreen Board View"
          >
            <Icon name="grid" size={14} />
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}</span>
          </button>

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
            className="btn-jira-primary"
            style={{ background: 'linear-gradient(135deg, #ec4899, #d946ef)', borderColor: '#ec4899' }}
            onClick={() => setIsHandoverModalOpen(true)}
            title="Deliver Project, Create Warranty Support Ticket & Schedule AMC Renewal"
          >
            🎉 Handover &amp; AMC
          </button>

          <button
            type="button"
            className="btn btn-primary"
            style={{ background: '#2563eb', padding: '8px 16px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => setIsNewTaskModalOpen(true)}
          >
            <Icon name="plus" size={16} />
            <span>Create Issue</span>
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

      {/* DYNAMIC KANBAN BOARD WITH PERSISTENT COLUMN MANAGEMENT */}
      <div className="jira-kanban-board">
        {columns.map((col, colIdx) => {
          const colTasks = filteredTasks.filter(
            (t) => t.status?.toUpperCase() === col.key.toUpperCase()
          );
          const isOver = dragOverCol === col.key;
          const isWipExceeded = Boolean(col.wipLimit && colTasks.length > col.wipLimit);
          const isEditingThisTitle = editingColId === col.id;
          const isMenuOpen = openMenuColId === col.id;

          return (
            <div
              key={`admin-col-${col.id || col.key}-${colIdx}`}
              className={`jira-kanban-column ${isOver ? 'is-drag-over' : ''} ${isWipExceeded ? 'wip-exceeded' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              {/* Column Header */}
              <div className="jira-column-header">
                <div className="jira-column-title">
                  {isEditingThisTitle ? (
                    <input
                      type="text"
                      className="add-column-input"
                      style={{ padding: '3px 6px', fontSize: '0.78rem', fontWeight: 800 }}
                      value={editingColTitle}
                      autoFocus
                      onChange={(e) => setEditingColTitle(e.target.value)}
                      onBlur={() => handleSaveRename(col.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(col.id);
                        if (e.key === 'Escape') setEditingColId(null);
                      }}
                    />
                  ) : (
                    <span
                      className="column-label-text"
                      title="Double-click to rename column"
                      onDoubleClick={(e) => handleStartRename(col, e)}
                    >
                      {col.title}
                    </span>
                  )}

                  {/* Task Counter Badge (with WIP Limit warning if set) */}
                  <span className={`column-count-chip ${isWipExceeded ? 'chip-warning' : ''}`} title={col.wipLimit ? `WIP Limit: ${col.wipLimit}` : 'Task count'}>
                    {col.wipLimit ? `${colTasks.length}/${col.wipLimit}` : colTasks.length}
                    {isWipExceeded && ' ⚠️'}
                  </span>
                </div>

                {/* Column Action Dropdown (Three Dots ⋮) */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="column-menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuColId(isMenuOpen ? null : col.id);
                    }}
                    title="Column Actions"
                  >
                    <Icon name="dots" size={16} />
                  </button>

                  {isMenuOpen && (
                    <div className="column-context-menu" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="column-context-item"
                        onClick={(e) => handleStartRename(col, e)}
                      >
                        <Icon name="edit" size={14} />
                        <span>Rename Column</span>
                      </button>

                      <button
                        type="button"
                        className="column-context-item"
                        onClick={(e) => handleOpenWipModal(col, e)}
                      >
                        <Icon name="activity" size={14} />
                        <span>Set WIP Limit</span>
                      </button>

                      <button
                        type="button"
                        className="column-context-item"
                        onClick={(e) => handleClearTasks(col.key, e)}
                      >
                        <Icon name="archive" size={14} />
                        <span>Clear Tasks</span>
                      </button>

                      <button
                        type="button"
                        className="column-context-item danger-item"
                        onClick={(e) => handleDeleteColumn(col.id, col.key, e)}
                      >
                        <Icon name="trash" size={14} />
                        <span>Delete Column</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks Container */}
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
                    {task.epic && (
                      <span className="jira-card-epic-pill">{task.epic}</span>
                    )}

                    <h4 className="jira-card-title">{task.title}</h4>

                    <div className="jira-card-bottom-row">
                      <div className="jira-card-left-tags">
                        {/* Task Type Badge */}
                        <span className={`jira-type-icon type-${task.task_type}`} title={`Type: ${task.task_type}`}>
                          {task.task_type === 'story' && '🔖'}
                          {task.task_type === 'bug' && '🔴'}
                          {task.task_type === 'task' && '🟦'}
                        </span>

                        <span className="jira-task-key">{task.task_key}</span>

                        {/* Done checkmark */}
                        {(task.status === 'DONE' || col.key === 'DONE') && (
                          <span className="jira-done-checkmark" title="Completed">✓</span>
                        )}

                        {/* Subtask branch count */}
                        {task.subtask_count > 0 && (
                          <span className="jira-subtask-badge" title={`${task.subtask_count} subtasks`}>
                            <span className="branch-icon">🌿</span> {task.subtask_count}
                          </span>
                        )}

                        {/* Priority Arrow Badge */}
                        <span className={`jira-priority-icon priority-${task.priority?.toLowerCase()}`} title={`Priority: ${task.priority}`}>
                          {task.priority === 'High' && '▲'}
                          {task.priority === 'Medium' && '='}
                          {task.priority === 'Low' && '▼'}
                        </span>

                        {/* Story Points Badge */}
                        {task.points > 0 && (
                          <span className="jira-points-badge" title={`${task.points} story points`}>
                            {task.points}
                          </span>
                        )}
                      </div>

                      {/* Right Circular Avatar */}
                      <div className="jira-card-assignee" title={`Assigned to ${task.assignee_name || 'Team member'}`}>
                        {task.assignee_avatar ? (
                          <img
                            src={task.assignee_avatar}
                            alt={task.assignee_name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span
                          className="jira-avatar-fallback-initials"
                          style={{ display: task.assignee_avatar ? 'none' : 'flex' }}
                        >
                          {(task.assignee_name || 'AD').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="empty-column-placeholder">
                    <span>No tasks yet. Drop items here.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* PERSISTENT '+ ADD COLUMN' CARD AT RIGHTMOST END OF BOARD */}
        <div className="add-column-card">
          {isAddingColumn ? (
            <form className="add-column-form" onSubmit={handleAddColumnSubmit}>
              <input
                type="text"
                className="add-column-input"
                placeholder="Column title (e.g. QA / Testing)..."
                value={newColTitle}
                autoFocus
                onChange={(e) => setNewColTitle(e.target.value)}
              />

              <input
                type="number"
                min="1"
                max="50"
                className="add-column-input"
                placeholder="WIP Limit (optional)..."
                value={newColWipLimit}
                onChange={(e) => setNewColWipLimit(e.target.value)}
              />

              <div className="add-column-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ background: '#2563eb', flex: 1, padding: '7px', fontWeight: 700 }}
                >
                  Add Column
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '7px 12px' }}
                  onClick={() => {
                    setIsAddingColumn(false);
                    setNewColTitle('');
                    setNewColWipLimit('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="btn-trigger-add-column"
              onClick={() => setIsAddingColumn(true)}
            >
              <Icon name="plus" size={18} />
              <span>+ Add Column</span>
            </button>
          )}
        </div>
      </div>

      {/* SET WORK IN PROGRESS (WIP) LIMIT MODAL */}
      {wipModalCol && (
        <div className="jira-modal-overlay" onClick={() => setWipModalCol(null)}>
          <div className="jira-modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="jira-modal-header">
              <h3>Set WIP Limit: {wipModalCol.title}</h3>
              <button type="button" className="close-btn" onClick={() => setWipModalCol(null)} aria-label="Close">
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWipLimit}>
              <div className="jira-modal-body">
                <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 14px 0' }}>
                  Set the maximum number of active task cards allowed in <strong>{wipModalCol.title}</strong> to prevent workflow bottlenecks.
                </p>

                <div className="form-group">
                  <label>Maximum Task Cards (WIP Limit)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    placeholder="e.g. 3 (leave blank for unlimited)"
                    value={wipLimitInput}
                    autoFocus
                    onChange={(e) => setWipLimitInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="jira-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setWipLimitInput('');
                    setColumns((prevCols) =>
                      prevCols.map((c) => (c.id === wipModalCol.id ? { ...c, wipLimit: null } : c))
                    );
                    setWipModalCol(null);
                    showToast(`Cleared WIP limit for "${wipModalCol.title}"`);
                  }}
                >
                  Clear Limit
                </button>
                <button type="submit" className="btn btn-primary">
                  Save WIP Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW TASK MODAL */}
      {isNewTaskModalOpen && (
        <div className="jira-modal-overlay" onClick={() => setIsNewTaskModalOpen(false)}>
          <div className="jira-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="jira-modal-header">
              <h3>Create Issue</h3>
              <button type="button" className="close-btn" onClick={() => setIsNewTaskModalOpen(false)} aria-label="Close">
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="jira-modal-body">
                <div className="form-group">
                  <label>Summary / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implement payment gateway webhook receiver"
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
                      {columns.map((col) => (
                        <option key={`opt-col-${col.key}`} value={col.key}>
                          {col.title}
                        </option>
                      ))}
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
          <div className="jira-modal-content sprint-complete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="jira-modal-header">
              <div className="modal-title-with-badge">
                <div className="modal-header-icon-box">
                  <Icon name="check" size={20} />
                </div>
                <div>
                  <h3>Complete Sprint</h3>
                  <span className="sprint-name-chip">{selectedProject} Sprint 14</span>
                </div>
              </div>
              <button type="button" className="close-btn" onClick={() => setIsSprintModalOpen(false)} aria-label="Close">
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="jira-modal-body">
              {/* Sprint Metrics Cards */}
              <div className="sprint-metrics-grid">
                <div className="sprint-metric-card completed-metric">
                  <div className="metric-icon-wrap">
                    <Icon name="check" size={22} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-num">{tasks.filter((t) => t.status === 'DONE').length}</span>
                    <span className="metric-label">Completed Issues</span>
                    <span className="metric-sub">Ready to archive</span>
                  </div>
                </div>

                <div className="sprint-metric-card open-metric">
                  <div className="metric-icon-wrap">
                    <Icon name="clock" size={22} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-num">{tasks.filter((t) => t.status !== 'DONE').length}</span>
                    <span className="metric-label">Open Issues</span>
                    <span className="metric-sub">Will be transferred</span>
                  </div>
                </div>
              </div>

              {/* Transfer Destination Section */}
              <div className="sprint-destination-section">
                <label className="sprint-dest-label">
                  <Icon name="arrowRight" size={15} />
                  <span>Select destination for open issues:</span>
                </label>
                <div className="sprint-select-wrapper">
                  <select className="sprint-destination-select">
                    <option>{selectedProject} Sprint 15 (Next Sprint)</option>
                    <option>Backlog</option>
                  </select>
                </div>
              </div>

              {/* Helpful Information Notice */}
              <div className="sprint-info-notice">
                <Icon name="info" size={16} />
                <span>Remaining issues will be automatically assigned to the destination without losing activity or comments.</span>
              </div>
            </div>

            <div className="jira-modal-actions" style={{ marginTop: 22 }}>
              <button type="button" className="btn btn-secondary sprint-cancel-btn" onClick={() => setIsSprintModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary sprint-submit-btn"
                onClick={() => {
                  setIsSprintModalOpen(false);
                  showToast(`🚀 Sprint 14 completed! ${tasks.filter((t) => t.status !== 'DONE').length} open issues transferred to Sprint 15.`);
                }}
              >
                <Icon name="check" size={16} />
                <span>Complete Sprint</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-CLICK PROJECT HANDOVER & AMC SETUP MODAL */}
      <WorkflowConvertModal
        isOpen={isHandoverModalOpen}
        type="complete_delivery"
        record={{ project_name: selectedProject, client_name: selectedProject }}
        onClose={() => setIsHandoverModalOpen(false)}
        onSuccess={() => {
          setTasks((prev) => prev.map((t) => ({ ...t, status: 'DONE' })));
          showToast('🎉 Project delivery completed! Support Ticket & AMC Deal created.');
        }}
      />
    </div>
  );

  return embedded ? workspaceJSX : <Layout showAdd={false}>{workspaceJSX}</Layout>;
};

export default AdminWorkspace;
