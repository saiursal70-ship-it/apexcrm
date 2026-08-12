import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { animateModalEnter } from '../utils/animations';

/**
 * Standardized Create & Edit Modal Component
 * Covers: Create Workspace, Create Client, Create Board, Create Project, Create Task
 * Enforces text trimming, min-length validation (>= 3 chars), inline error alerts, and uniform field labeling.
 */
const CreateModal = ({
  isOpen,
  onClose,
  modalType = 'board', // 'workspace' | 'client' | 'project' | 'board' | 'task'
  onSubmit,
  initialData = {}
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      animateModalEnter(modalRef.current, overlayRef.current);
      setFormData({
        title: initialData.title || initialData.board_name || initialData.company_name || initialData.workspace_name || '',
        code: initialData.code || initialData.board_code || '',
        target_workspace: initialData.target_workspace || 'Default Workspace',
        parent_project: initialData.parent_project || 'Beyond Gravity',
        assignee: initialData.assignee || 'Alex Dev',
        description: initialData.description || ''
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const getModalTitle = () => {
    switch (modalType) {
      case 'workspace': return 'Create Workspace Container';
      case 'client': return 'Create New Client';
      case 'project': return 'Create Parent Project';
      case 'board': return 'Create New Kanban Board';
      case 'task': return 'Create & Assign Kanban Task';
      default: return 'Create Record';
    }
  };

  const getPrimaryLabel = () => {
    switch (modalType) {
      case 'workspace': return 'Workspace Name *';
      case 'client': return 'Client Company Name *';
      case 'project': return 'Parent Project Name *';
      case 'board': return 'Board Name *';
      case 'task': return 'Task Title / Summary *';
      default: return 'Name *';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const titleVal = String(formData.title || '').trim();

    if (!titleVal) {
      newErrors.title = 'This field is required.';
    } else if (titleVal.length < 3) {
      newErrors.title = 'Name must be at least 3 characters long.';
    }

    if (modalType === 'board' || modalType === 'workspace') {
      const codeVal = String(formData.code || '').trim();
      if (codeVal && codeVal.length < 2) {
        newErrors.code = 'Code must be at least 2 characters long.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const cleanedData = {
      ...formData,
      title: String(formData.title).trim(),
      code: String(formData.code || '').trim()
    };

    onSubmit(cleanedData);
    onClose();
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={onClose}>
      <div className="modal-content glass-card" ref={modalRef} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div className="wizard-header-title">
            <span className="drawer-entity-badge">{modalType.toUpperCase()} MODAL</span>
            <h2>{getModalTitle()}</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose} type="button">
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.88rem' }}>
              {getPrimaryLabel()}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              placeholder={`Enter ${getPrimaryLabel().replace(' *', '').toLowerCase()}`}
              className={`input-field ${errors.title ? 'has-error' : ''}`}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: errors.title ? '1px solid #ef4444' : '1px solid #cbd5e1',
                outline: 'none'
              }}
            />
            {errors.title && (
              <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                ⚠️ {errors.title}
              </span>
            )}
          </div>

          {(modalType === 'board' || modalType === 'workspace') && (
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.88rem' }}>
                Board / Container Code
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ''}
                onChange={handleChange}
                placeholder="e.g. KB-MAIN"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.code ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  outline: 'none'
                }}
              />
              {errors.code && (
                <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                  ⚠️ {errors.code}
                </span>
              )}
            </div>
          )}

          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem' }}>
                Target Workspace Container
              </label>
              <select
                name="target_workspace"
                value={formData.target_workspace || ''}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="Default Workspace">Default Workspace</option>
                <option value="Sales & CRM Operations">Sales & CRM Operations</option>
                <option value="Engineering & Sprint Board">Engineering & Sprint Board</option>
                <option value="Billing & Invoicing Workspace">Billing & Invoicing Workspace</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem' }}>
                Parent Project
              </label>
              <select
                name="parent_project"
                value={formData.parent_project || ''}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="Beyond Gravity">Beyond Gravity</option>
                <option value="Apex CRM Core">Apex CRM Core</option>
                <option value="Mobile App v2">Mobile App v2</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem' }}>
              Assignees / Owner
            </label>
            <select
              name="assignee"
              value={formData.assignee || ''}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              <option value="Alex Dev">Alex Dev</option>
              <option value="Sarah Jenkins">Sarah Jenkins</option>
              <option value="Elena Rostova">Elena Rostova</option>
              <option value="Michael Vance">Michael Vance</option>
              <option value="Claire Redfield">Claire Redfield</option>
            </select>
          </div>

          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '8px 20px', borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Save &amp; Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModal;
