import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Icon from '../Icon';

const DEPARTMENT_OPTIONS = ['Engineering', 'Sales', 'Support', 'Operations', 'Marketing', 'Admin'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];
const STATUS_OPTIONS = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked'];
const RECURRENCE_OPTIONS = ['None', 'Daily', 'Weekly', 'Monthly'];
const PROJECT_OPTIONS = ['Beyond Gravity', 'Apex CRM Core', 'Mobile App v2', 'Enterprise Cloud Migration'];

const TaskCreateModal = ({
  isOpen,
  onClose,
  onSubmit,
  users = [],
  existingTasks = [],
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('Beyond Gravity');
  const [department, setDepartment] = useState('Engineering');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('To Do');
  const getTodayDateStr = () => new Date().toISOString().slice(0, 10);
  const getDefaultDueDateStr = (startStr) => {
    const base = startStr ? new Date(startStr) : new Date();
    base.setDate(base.getDate() + 7);
    return base.toISOString().slice(0, 10);
  };

  const [dueDate, setDueDate] = useState(() => getDefaultDueDateStr());
  const [startDate, setStartDate] = useState(() => getTodayDateStr());
  const [estimatedHours, setEstimatedHours] = useState('4');
  const [recurrence, setRecurrence] = useState('None');

  // Selected Assignees (Array of User objects)
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);

  // Bulk Assign Mode
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUserIds, setBulkUserIds] = useState([]);

  // Tag Input State
  const [tags, setTags] = useState(['Feature']);
  const [tagInput, setTagInput] = useState('');

  // Checklist Items Builder
  const [checklist, setChecklist] = useState([
    { text: 'Review acceptance criteria', done: false },
    { text: 'Implement code & automated tests', done: false }
  ]);
  const [checklistInput, setChecklistInput] = useState('');

  // Dependencies picker
  const [dependsOn, setDependsOn] = useState([]);

  // Auto-set department based on current user or selection
  useEffect(() => {
    if (currentUser?.department) {
      setDepartment(currentUser.department);
    }
  }, [currentUser]);

  // Set default start date to today (project confirmed/registered date) and due date to +7 days
  useEffect(() => {
    if (!startDate) {
      setStartDate(getTodayDateStr());
    }
    if (!dueDate) {
      setDueDate(getDefaultDueDateStr(startDate || getTodayDateStr()));
    }
  }, [startDate, dueDate]);

  const handleStartDateChange = (newStart) => {
    setStartDate(newStart);
    if (!dueDate || new Date(dueDate) <= new Date(newStart)) {
      setDueDate(getDefaultDueDateStr(newStart));
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(assigneeSearch.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(assigneeSearch.toLowerCase())) ||
    (u.department && u.department.toLowerCase().includes(assigneeSearch.toLowerCase()))
  );

  const toggleAssignee = (user) => {
    if (selectedAssignees.some(a => a.id === user.id || a.email === user.email)) {
      setSelectedAssignees(selectedAssignees.filter(a => a.id !== user.id && a.email !== user.email));
    } else {
      setSelectedAssignees([...selectedAssignees, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || 'Engineering',
        avatar: user.profile_image || ''
      }]);
    }
  };

  const toggleBulkUser = (userId) => {
    if (bulkUserIds.includes(userId)) {
      setBulkUserIds(bulkUserIds.filter(id => id !== userId));
    } else {
      setBulkUserIds([...bulkUserIds, userId]);
    }
  };

  const selectAllBulkUsers = () => {
    if (bulkUserIds.length === users.length) {
      setBulkUserIds([]);
    } else {
      setBulkUserIds(users.map(u => u.id));
    }
  };

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(',', '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const removeTag = (t) => {
    setTags(tags.filter(tag => tag !== t));
  };

  const addChecklistItem = (e) => {
    e?.preventDefault();
    if (checklistInput.trim()) {
      setChecklist([...checklist, { text: checklistInput.trim(), done: false }]);
      setChecklistInput('');
    }
  };

  const removeChecklistItem = (idx) => {
    setChecklist(checklist.filter((_, i) => i !== idx));
  };

  const toggleDependency = (taskKey) => {
    if (dependsOn.includes(taskKey)) {
      setDependsOn(dependsOn.filter(k => k !== taskKey));
    } else {
      setDependsOn([...dependsOn, taskKey]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      project,
      department,
      priority,
      status,
      due_date: dueDate ? `${dueDate} 18:00:00` : null,
      start_date: startDate ? `${startDate} 09:00:00` : null,
      estimated_hours: parseFloat(estimatedHours) || 4,
      tags,
      checklist,
      recurrence,
      depends_on: dependsOn
    };

    if (bulkMode) {
      if (bulkUserIds.length === 0) {
        alert('Please select at least one user for bulk assignment');
        return;
      }
      payload.bulk_assign_user_ids = bulkUserIds;
    } else {
      payload.assignees = selectedAssignees;
      if (selectedAssignees.length === 0) {
        payload.auto_assign = true;
      }
    }

    onSubmit(payload);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="task-modal-backdrop" onClick={onClose}>
      <div className="task-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="task-modal-header">
          <div className="task-modal-title-group">
            <div className="task-modal-icon-badge">
              <Icon name="plus" size={18} />
            </div>
            <div>
              <h2>Create &amp; Assign Task</h2>
              <p>Configure task details, assignees &amp; automated triggers</p>
            </div>
          </div>
          <button type="button" className="task-modal-close-btn" onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="task-modal-body">
          {/* Mode Switcher Banner: Single vs Bulk Assignment */}
          <div className="task-bulk-toggle-banner">
            <label className="task-toggle-switch-label">
              <input 
                type="checkbox" 
                checked={bulkMode} 
                onChange={(e) => setBulkMode(e.target.checked)} 
              />
              <span className="task-toggle-slider"></span>
              <span className="task-toggle-text">
                <strong>Bulk Multi-Assign</strong> (Generate individual copies for each member)
              </span>
            </label>
          </div>

          {/* Title */}
          <div className="task-form-group">
            <label className="task-form-label">
              Task Title <span className="req-star">*</span>
            </label>
            <input
              type="text"
              className="task-form-input"
              placeholder="e.g. Implement webhook signature verification"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="task-form-group">
            <label className="task-form-label">Description</label>
            <textarea
              className="task-form-textarea"
              rows="3"
              placeholder="Add details, acceptance criteria, or @mention members..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Grid Row: Project & Department */}
          <div className="task-form-grid-2">
            <div className="task-form-group">
              <label className="task-form-label">Project</label>
              <select className="task-form-select" value={project} onChange={(e) => setProject(e.target.value)}>
                {PROJECT_OPTIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="task-form-group">
              <label className="task-form-label">Department</label>
              <select className="task-form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                {DEPARTMENT_OPTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignees Section */}
          {!bulkMode ? (
            <div className="task-form-group">
              <div className="task-form-label-row">
                <label className="task-form-label">
                  Assignees ({selectedAssignees.length} selected)
                </label>
                <span className="task-form-hint">Live Directory</span>
              </div>

              {/* Selected Assignees Chips */}
              <div className="task-selected-assignees-row">
                {selectedAssignees.length === 0 ? (
                  <div className="task-assignee-chip" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px dashed #6366f1', color: '#4f46e5', padding: '4px 10px' }}>
                    <span style={{ fontSize: '0.85rem' }}>✨</span>
                    <span className="task-assignee-chip-name" style={{ color: '#4f46e5', fontWeight: 700 }}>
                      Auto-Assign Active:
                    </span>
                    <span className="task-assignee-chip-role" style={{ color: '#6366f1' }}>
                      Least-loaded in {department}
                    </span>
                  </div>
                ) : (
                  selectedAssignees.map(a => (
                    <div key={a.id || a.email} className="task-assignee-chip">
                      <img 
                        src={a.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=2563eb&color=fff`} 
                        alt={a.name} 
                        className="task-assignee-chip-avatar" 
                      />
                      <span className="task-assignee-chip-name">{a.name}</span>
                      <span className="task-assignee-chip-role">{a.role}</span>
                      <button type="button" className="task-chip-remove" onClick={() => toggleAssignee(a)}>×</button>
                    </div>
                  ))
                )}
              </div>

              {/* Searchable Multi-Select Trigger */}
              <div className="task-assignee-search-wrap">
                <Icon name="search" size={14} className="task-search-icon" />
                <input
                  type="text"
                  className="task-form-input search-input"
                  placeholder="Search team members..."
                  value={assigneeSearch}
                  onFocus={() => setIsAssigneeDropdownOpen(true)}
                  onChange={(e) => {
                    setAssigneeSearch(e.target.value);
                    setIsAssigneeDropdownOpen(true);
                  }}
                />
              </div>

              {/* Dropdown Options */}
              {isAssigneeDropdownOpen && (
                <div className="task-assignee-dropdown-menu">
                  <div className="task-dropdown-header">
                    <span>Team Members ({filteredUsers.length})</span>
                    <button type="button" className="task-btn-link" onClick={() => setIsAssigneeDropdownOpen(false)}>Done</button>
                  </div>
                  <div className="task-dropdown-list">
                    {filteredUsers.map(user => {
                      const isSelected = selectedAssignees.some(a => a.id === user.id || a.email === user.email);
                      return (
                        <div 
                          key={user.id} 
                          className={`task-dropdown-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleAssignee(user)}
                        >
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => {}} 
                            className="task-item-checkbox" 
                          />
                          <img 
                            src={user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`} 
                            alt={user.name} 
                            className="task-item-avatar" 
                          />
                          <div className="task-item-info">
                            <span className="task-item-name">{user.name}</span>
                            <span className="task-item-email">{user.email}</span>
                          </div>
                          <div className="task-item-badges">
                            <span className="task-dept-badge">{user.department || 'Engineering'}</span>
                            <span className="task-role-badge">{user.role}</span>
                            {user.activeTaskCount !== undefined && (
                              <span className={`task-load-pill ${user.activeTaskCount >= 10 ? 'overloaded' : ''}`}>
                                {user.activeTaskCount} active
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Bulk Assign User Selector */
            <div className="task-form-group task-bulk-selector-box">
              <div className="task-form-label-row">
                <label className="task-form-label">
                  Select Members ({bulkUserIds.length} of {users.length})
                </label>
                <button type="button" className="task-btn-link" onClick={selectAllBulkUsers}>
                  {bulkUserIds.length === users.length ? 'Deselect All' : 'Select All Users'}
                </button>
              </div>
              <div className="task-bulk-user-grid">
                {users.map(u => {
                  const isChecked = bulkUserIds.includes(u.id);
                  return (
                    <div 
                      key={`bulk-u-${u.id}`} 
                      className={`task-bulk-user-card ${isChecked ? 'active' : ''}`}
                      onClick={() => toggleBulkUser(u.id)}
                    >
                      <input type="checkbox" checked={isChecked} onChange={() => {}} />
                      <img src={u.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2563eb&color=fff`} alt={u.name} />
                      <div>
                        <strong>{u.name}</strong>
                        <span>{u.role} • {u.department || 'Engineering'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grid Row: Priority, Status, Recurrence */}
          <div className="task-form-grid-3">
            <div className="task-form-group">
              <label className="task-form-label">Priority</label>
              <select 
                className={`task-form-select priority-${priority.toLowerCase()}`} 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="task-form-group">
              <label className="task-form-label">Initial Status</label>
              <select className="task-form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="task-form-group">
              <label className="task-form-label">Recurrence</label>
              <select className="task-form-select" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
                {RECURRENCE_OPTIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid Row: Start Date, Due Date, Estimated Hours */}
          <div className="task-form-grid-3">
            <div className="task-form-group">
              <label className="task-form-label">Start Date</label>
              <input 
                type="date" 
                className="task-form-input" 
                value={startDate} 
                onChange={(e) => handleStartDateChange(e.target.value)} 
              />
            </div>

            <div className="task-form-group">
              <label className="task-form-label">Due Date</label>
              <input 
                type="date" 
                className="task-form-input" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
              />
            </div>

            <div className="task-form-group">
              <label className="task-form-label">Est. Hours</label>
              <input 
                type="number" 
                min="0.5" 
                step="0.5" 
                className="task-form-input" 
                value={estimatedHours} 
                onChange={(e) => setEstimatedHours(e.target.value)} 
              />
            </div>
          </div>

          {/* Tags Chip Builder */}
          <div className="task-form-group">
            <label className="task-form-label">Tags</label>
            <div className="task-tags-builder-box">
              {tags.map(t => (
                <span key={t} className="task-tag-pill">
                  #{t}
                  <button type="button" onClick={() => removeTag(t)}>×</button>
                </span>
              ))}
              <input
                type="text"
                className="task-tag-inline-input"
                placeholder="Add tag (press Enter)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
              />
            </div>
          </div>

          {/* Interactive Checklist Builder */}
          <div className="task-form-group">
            <div className="task-form-label-row">
              <label className="task-form-label">
                Checklist Items ({checklist.length})
              </label>
              <span className="task-form-hint">Auto-moves to 'In Review' when 100% checked</span>
            </div>
            
            <div className="task-checklist-builder">
              {checklist.map((item, idx) => (
                <div key={`chk-${idx}`} className="task-checklist-builder-item">
                  <span className="task-chk-bullet">●</span>
                  <span className="task-chk-text">{item.text}</span>
                  <button type="button" className="task-chk-del-btn" onClick={() => removeChecklistItem(idx)}>
                    <Icon name="x" size={13} />
                  </button>
                </div>
              ))}

              <div className="task-checklist-add-row">
                <input
                  type="text"
                  className="task-form-input"
                  placeholder="Add a checklist sub-item (e.g. Write integration test)..."
                  value={checklistInput}
                  onChange={(e) => setChecklistInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addChecklistItem(e)}
                />
                <button type="button" className="task-btn-secondary" onClick={addChecklistItem}>
                  + Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Dependencies Selector */}
          {existingTasks.length > 0 && (
            <div className="task-form-group">
              <label className="task-form-label">Prerequisite Blocking Dependencies (dependsOn)</label>
              <div className="task-dependencies-grid">
                {existingTasks.filter(t => t.status !== 'Done').slice(0, 8).map(t => {
                  const isBlockedBy = dependsOn.includes(t.task_key);
                  return (
                    <button
                      key={t.task_key}
                      type="button"
                      className={`task-dependency-chip ${isBlockedBy ? 'active' : ''}`}
                      onClick={() => toggleDependency(t.task_key)}
                    >
                      <span>{isBlockedBy ? '🔒' : '🔓'} {t.task_key}</span>
                      <span className="task-dep-title">{t.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="task-modal-footer">
            <button type="button" className="task-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="task-btn-primary">
              <Icon name="plus" size={16} />
              <span>{bulkMode ? `Bulk Create (${bulkUserIds.length} Tasks)` : 'Create & Dispatch Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default TaskCreateModal;
