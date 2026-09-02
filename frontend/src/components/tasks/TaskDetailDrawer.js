import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Icon from '../Icon';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];
const STATUS_OPTIONS = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked'];

const TaskDetailDrawer = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  users = [],
  currentUser
}) => {
  const [currentTask, setCurrentTask] = useState(task);
  const [commentText, setCommentText] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, checklist, comments, history

  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

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

  if (!isOpen || !currentTask) return null;

  const assignees = currentTask.assignees || [];
  const checklist = currentTask.checklist || [];
  const comments = currentTask.comments || [];
  const history = currentTask.history || [];
  const tags = currentTask.tags || [];
  const dependsOn = currentTask.depends_on || [];

  // Calculate checklist progress %
  const totalChecklist = checklist.length;
  const completedChecklist = checklist.filter(c => c.done).length;
  const checklistPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  // Toggle checklist item
  const handleToggleChecklist = (idx) => {
    const updated = checklist.map((item, i) => i === idx ? { ...item, done: !item.done } : item);
    const updatedTask = { ...currentTask, checklist: updated };
    setCurrentTask(updatedTask);
    onUpdateTask(currentTask.id, { checklist: updated });
  };

  // Change Status
  const handleStatusChange = (newStatus) => {
    const updatedTask = { ...currentTask, status: newStatus };
    setCurrentTask(updatedTask);
    onUpdateTask(currentTask.id, { status: newStatus });
  };

  // Change Priority
  const handlePriorityChange = (newPriority) => {
    const updatedTask = { ...currentTask, priority: newPriority };
    setCurrentTask(updatedTask);
    onUpdateTask(currentTask.id, { priority: newPriority });
  };

  // Add Comment with @Mentions
  const handleAddComment = (e) => {
    e?.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      userId: currentUser?.id || '1',
      userName: currentUser?.name || 'User',
      userAvatar: currentUser?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'U')}&background=2563eb&color=fff`,
      text: commentText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedComments = [...comments, newComment];
    const updatedTask = { ...currentTask, comments: updatedComments };
    setCurrentTask(updatedTask);
    onUpdateTask(currentTask.id, { comments: updatedComments, commentText: commentText.trim() });
    setCommentText('');
    setShowMentionMenu(false);
  };

  // Handle Mention Key typing
  const handleCommentChange = (e) => {
    const text = e.target.value;
    setCommentText(text);

    const lastWord = text.split(/\s+/).pop();
    if (lastWord && lastWord.startsWith('@')) {
      setMentionQuery(lastWord.slice(1).toLowerCase());
      setShowMentionMenu(true);
    } else {
      setShowMentionMenu(false);
    }
  };

  const insertMention = (userName) => {
    const words = commentText.split(/\s+/);
    words.pop();
    words.push(`@${userName} `);
    setCommentText(words.join(' '));
    setShowMentionMenu(false);
  };

  const matchingMentionUsers = users.filter(u => 
    u.name && u.name.toLowerCase().includes(mentionQuery)
  );

  const isOverdue = currentTask.due_date && new Date(currentTask.due_date) < new Date() && currentTask.status !== 'Done';

  return ReactDOM.createPortal(
    <div className="task-drawer-overlay" onClick={onClose}>
      <div className="task-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="task-drawer-header">
          <div className="task-drawer-header-left">
            <span className="task-key-badge">{currentTask.task_key}</span>
            <span className="task-project-pill">📁 {currentTask.project || 'Project'}</span>
            {currentTask.is_escalated && (
              <span className="task-escalated-pill">🚨 ESCALATED</span>
            )}
            {isOverdue && (
              <span className="task-overdue-pill">⚠️ OVERDUE</span>
            )}
          </div>
          <button type="button" className="task-drawer-close-btn" onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Drawer Subheader / Quick Actions Toolbar */}
        <div className="task-drawer-quick-bar">
          <div className="task-quick-controls">
            {/* Status Dropdown */}
            <div className="task-quick-item">
              <label>Status:</label>
              <select 
                className={`task-select-pill status-${currentTask.status?.toLowerCase().replace(/\s+/g, '-')}`}
                value={currentTask.status} 
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Priority Dropdown */}
            <div className="task-quick-item">
              <label>Priority:</label>
              <select 
                className={`task-select-pill priority-${currentTask.priority?.toLowerCase()}`}
                value={currentTask.priority} 
                onChange={(e) => handlePriorityChange(e.target.value)}
              >
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="task-quick-actions">
            {currentTask.status !== 'Done' ? (
              <button 
                type="button" 
                className="task-action-btn complete-btn"
                onClick={() => handleStatusChange('Done')}
                title="Mark as Completed"
              >
                <Icon name="check" size={14} />
                <span>Mark Done</span>
              </button>
            ) : (
              <button 
                type="button" 
                className="task-action-btn reopen-btn"
                onClick={() => handleStatusChange('In Progress')}
                title="Reopen Task"
              >
                <span>↺ Reopen</span>
              </button>
            )}

            {(currentUser?.role === 'Admin' || currentUser?.role?.includes('Lead')) && (
              <button 
                type="button" 
                className="task-action-btn delete-btn"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${currentTask.task_key}?`)) {
                    onDeleteTask(currentTask.id);
                    onClose();
                  }
                }}
                title="Delete Task"
              >
                <Icon name="trash" size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Task Title & Description */}
        <div className="task-drawer-hero">
          <h1 className="task-drawer-title">{currentTask.title}</h1>
          <p className="task-drawer-desc">
            {currentTask.description || 'No detailed description provided.'}
          </p>
        </div>

        {/* Tags Row */}
        {tags.length > 0 && (
          <div className="task-drawer-tags-row">
            {tags.map(t => (
              <span key={t} className="task-tag-pill">#{t}</span>
            ))}
          </div>
        )}

        {/* Tabs Bar */}
        <div className="task-drawer-tabs">
          <button 
            type="button" 
            className={`task-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span>Overview &amp; Assignees</span>
          </button>
          <button 
            type="button" 
            className={`task-tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            <span>Checklist ({completedChecklist}/{totalChecklist})</span>
          </button>
          <button 
            type="button" 
            className={`task-tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            <span>Comments ({comments.length})</span>
          </button>
          <button 
            type="button" 
            className={`task-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span>Audit History</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="task-drawer-tab-content">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="task-overview-grid">
              {/* Assignees Card */}
              <div className="task-detail-card">
                <div className="task-card-head">
                  <h3>👥 Assigned Team Members ({assignees.length})</h3>
                </div>
                <div className="task-assignees-list">
                  {assignees.length === 0 ? (
                    <p className="task-empty-text">No assignees yet.</p>
                  ) : (
                    assignees.map(a => (
                      <div key={a.id || a.email} className="task-assignee-row">
                        <img 
                          src={a.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=2563eb&color=fff`} 
                          alt={a.name} 
                          className="task-user-avatar"
                        />
                        <div className="task-user-details">
                          <strong>{a.name}</strong>
                          <span>{a.role} • {a.department || 'Engineering'}</span>
                        </div>
                        <span className="task-assignee-status-badge">Assigned</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Task Metadata Card */}
              <div className="task-detail-card">
                <div className="task-card-head">
                  <h3>📌 Task Specifications</h3>
                </div>
                <table className="task-specs-table">
                  <tbody>
                    <tr>
                      <td>Department</td>
                      <td><strong>{currentTask.department}</strong></td>
                    </tr>
                    <tr>
                      <td>Due Date</td>
                      <td><strong>{currentTask.due_date ? new Date(currentTask.due_date).toLocaleString() : 'Not scheduled'}</strong></td>
                    </tr>
                    <tr>
                      <td>Start Date</td>
                      <td><strong>{currentTask.start_date ? new Date(currentTask.start_date).toLocaleDateString() : 'Not scheduled'}</strong></td>
                    </tr>
                    <tr>
                      <td>Estimated Hours</td>
                      <td><strong>{currentTask.estimated_hours || 4} hrs</strong></td>
                    </tr>
                    <tr>
                      <td>Recurrence</td>
                      <td><strong>{currentTask.recurrence || 'None'}</strong></td>
                    </tr>
                    <tr>
                      <td>Created By</td>
                      <td><strong>{currentTask.created_by || 'Admin'}</strong></td>
                    </tr>
                    {currentTask.completion_time && (
                      <tr>
                        <td>Completed At</td>
                        <td style={{ color: '#10b981' }}><strong>{new Date(currentTask.completion_time).toLocaleString()}</strong></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Dependencies Card */}
              {dependsOn.length > 0 && (
                <div className="task-detail-card">
                  <div className="task-card-head">
                    <h3>🔒 Blocking Dependencies (dependsOn)</h3>
                  </div>
                  <div className="task-dep-list">
                    {dependsOn.map(dep => (
                      <div key={dep} className="task-dep-item">
                        <span>🔒 Prerequisite Task: <strong>{dep}</strong></span>
                        <span className="task-dep-status">Checked automatically on completion</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="task-checklist-tab-panel">
              <div className="task-progress-box">
                <div className="task-progress-label">
                  <span>Checklist Completion Progress</span>
                  <strong>{checklistPercent}% ({completedChecklist}/{totalChecklist})</strong>
                </div>
                <div className="task-progress-bar-track">
                  <div 
                    className="task-progress-bar-fill" 
                    style={{ width: `${checklistPercent}%`, background: checklistPercent === 100 ? '#10b981' : '#2563eb' }}
                  />
                </div>
                {checklistPercent === 100 && currentTask.status !== 'In Review' && currentTask.status !== 'Done' && (
                  <div className="task-checklist-complete-callout">
                    🎉 <strong>All items checked!</strong> The automation engine will suggest or transition this task to <em>In Review</em>.
                  </div>
                )}
              </div>

              <div className="task-checklist-items-list">
                {checklist.length === 0 ? (
                  <p className="task-empty-text">No checklist items in this task.</p>
                ) : (
                  checklist.map((item, idx) => (
                    <label key={`chkl-${idx}`} className={`task-check-row ${item.done ? 'is-done' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={item.done} 
                        onChange={() => handleToggleChecklist(idx)} 
                      />
                      <span className="task-check-text">{item.text}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COMMENTS & @MENTIONS */}
          {activeTab === 'comments' && (
            <div className="task-comments-tab-panel">
              <div className="task-comments-list">
                {comments.length === 0 ? (
                  <div className="task-empty-comments">
                    <Icon name="message" size={24} />
                    <p>No comments yet. Mention team members with <strong>@Name</strong> to notify them instantly.</p>
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="task-comment-item">
                      <img 
                        src={c.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.userName)}&background=2563eb&color=fff`} 
                        alt={c.userName} 
                        className="task-comment-avatar" 
                      />
                      <div className="task-comment-body">
                        <div className="task-comment-author-row">
                          <strong>{c.userName}</strong>
                          <span className="task-comment-time">
                            {new Date(c.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="task-comment-text">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Mention Suggestion Popup Menu */}
              {showMentionMenu && matchingMentionUsers.length > 0 && (
                <div className="task-mention-popup-menu">
                  <div className="task-mention-header">Mention Team Member:</div>
                  {matchingMentionUsers.map(u => (
                    <div 
                      key={`mention-${u.id}`} 
                      className="task-mention-item"
                      onClick={() => insertMention(u.name)}
                    >
                      <img src={u.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2563eb&color=fff`} alt={u.name} />
                      <div>
                        <strong>{u.name}</strong>
                        <span>{u.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Input Box */}
              <form onSubmit={handleAddComment} className="task-comment-form">
                <textarea
                  className="task-comment-input"
                  placeholder="Add a comment... (Type @ to mention team members)"
                  rows="2"
                  value={commentText}
                  onChange={handleCommentChange}
                />
                <div className="task-comment-actions">
                  <span className="task-mention-hint">💡 Tip: Mention someone with <strong>@Elena</strong> to notify them</span>
                  <button type="submit" className="task-btn-primary btn-sm">
                    <span>Post Comment</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: AUDIT HISTORY TIMELINE */}
          {activeTab === 'history' && (
            <div className="task-history-tab-panel">
              <div className="task-history-timeline">
                {history.length === 0 ? (
                  <p className="task-empty-text">No audit logs recorded yet.</p>
                ) : (
                  history.map((h, idx) => (
                    <div key={`hist-${idx}`} className="task-timeline-item">
                      <div className="task-timeline-dot"></div>
                      <div className="task-timeline-content">
                        <div className="task-timeline-head">
                          <span className="task-action-tag">{h.action}</span>
                          <span className="task-timeline-user">by {h.userName || 'System'}</span>
                          <span className="task-timeline-date">
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="task-timeline-details">{h.details}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TaskDetailDrawer;
