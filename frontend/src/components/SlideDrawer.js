import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Icon from './Icon';
import { updateRecord } from '../api/api';
import { animateDrawerSpatialOpen, animateDrawerSpatialClose, animateStagger } from '../utils/animations';

/**
 * SlideDrawer Component
 * Premium Apple / Stripe-grade slide-over inspector for deep record inspection, inline editing & instant workflow conversions.
 */
const SlideDrawer = ({
  isOpen,
  onClose,
  title = 'Record Details',
  subtitle,
  record,
  fields = [],
  entity,
  initialEditMode = false,
  onSave,
  onRefresh,
  onDelete,
  onWhatsApp,
  onEmail,
  onPrintInvoice,
  onPrintQuotation,
  onWorkflowAction
}) => {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [activeRecord, setActiveRecord] = useState(record || {});
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen && record) {
      animateDrawerSpatialOpen(drawerRef.current, overlayRef.current);
      setActiveRecord(record);
      setInternalNotes(record.notes || '');
      setSavedNotes(record.notes ? [record.notes] : []);
      setIsEditing(initialEditMode);

      // Populate edit form with sanitized dates
      const initForm = {};
      fields.forEach((f) => {
        let val = record[f.name] ?? '';
        if (f.type === 'date' && val) val = String(val).substring(0, 10);
        initForm[f.name] = val;
      });
      setEditFormData(initForm);
    }
  }, [isOpen, record, initialEditMode, fields]);

  const handleClose = useCallback(() => {
    animateDrawerSpatialClose(drawerRef.current, overlayRef.current, null, onClose);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) {
      animateStagger('.drawer-field-card, .timeline-item, .drawer-notes-section, .form-group', {
        translateY: [12, 0],
        opacity: [0, 1],
        duration: 320
      });
    }
  }, [activeSubTab, isEditing, isOpen]);

  if (!isOpen || !record) return null;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleInlineSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(activeRecord.id, editFormData);
      } else if (entity) {
        await updateRecord(entity, activeRecord.id, editFormData);
      }
      setActiveRecord((prev) => ({ ...prev, ...editFormData }));
      showToast('✅ Record updated successfully in database!');
      setIsEditing(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error updating record: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const getLifecycleStage = () => {
    switch (entity) {
      case 'leads': return { stage: 'Stage 1', name: 'Lead Qualification', color: '#3b82f6' };
      case 'contacts':
      case 'accounts': return { stage: 'Stage 1 ➔ 2', name: 'Client Directory', color: '#10b981' };
      case 'deals': return { stage: 'Stage 2', name: 'Sales Pipeline', color: '#8b5cf6' };
      case 'quotations': return { stage: 'Stage 2', name: 'Quotation', color: '#f59e0b' };
      case 'invoices': return { stage: 'Stage 2', name: 'Billing & Settlement', color: '#06b6d4' };
      case 'tasks':
      case 'appointments': return { stage: 'Operations', name: 'Follow-ups & Meetings', color: '#6366f1' };
      case 'tickets': return { stage: 'Stage 4', name: 'Support Helpdesk', color: '#ec4899' };
      case 'campaigns': return { stage: 'Stage 1 & 4', name: 'Campaigns & ROI', color: '#f97316' };
      default: return { stage: 'CRM Lifecycle', name: 'Workspace', color: '#64748b' };
    }
  };

  const lifecycle = getLifecycleStage();
  const statusVal = activeRecord.status || activeRecord.lead_status || activeRecord.stage || activeRecord.payment_status;

  const handleSaveNote = () => {
    if (!internalNotes.trim()) return;
    setSavedNotes((prev) => [internalNotes, ...prev]);
    showToast('Note added to timeline!');
  };

  return ReactDOM.createPortal(
    <div
      className="drawer-overlay"
      ref={overlayRef}
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 99990,
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'opacity 0.25s ease'
      }}
    >
      <div
        ref={drawerRef}
        className="drawer-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '580px',
          height: '100vh',
          maxHeight: '100dvh',
          background: 'var(--color-surface, #ffffff)',
          borderLeft: '1px solid var(--color-border, #e2e8f0)',
          boxShadow: '-15px 0 50px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Toast Notification inside Drawer */}
        {toastMsg && (
          <div style={{
            position: 'absolute',
            top: 16,
            left: 24,
            right: 24,
            zIndex: 100,
            background: '#10b981',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {toastMsg}
          </div>
        )}

        {/* Sticky Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border, #e2e8f0)',
          background: 'var(--color-surface-glass, rgba(255, 255, 255, 0.95))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          flexShrink: 0
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                color: 'var(--color-primary, #2563eb)',
                background: 'rgba(37, 99, 235, 0.1)',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                {entity?.toUpperCase() || 'DETAILS'}
              </span>

              <span style={{
                background: `${lifecycle.color}15`,
                color: lifecycle.color,
                border: `1px solid ${lifecycle.color}35`,
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 10px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: lifecycle.color, display: 'inline-block' }} />
                {lifecycle.stage}: {lifecycle.name}
              </span>
            </div>

            <h2 style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              margin: 0,
              color: 'var(--color-text, #0f172a)',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {title}
            </h2>

            {subtitle && (
              <p style={{
                fontSize: '0.84rem',
                color: 'var(--color-text-secondary, #64748b)',
                margin: '3px 0 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {subtitle}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              className={`btn btn-sm ${isEditing ? 'btn-outline' : 'btn-secondary'}`}
              onClick={() => setIsEditing(!isEditing)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: '0.82rem', fontWeight: 600 }}
              title={isEditing ? 'Cancel Edit' : 'Edit in Drawer'}
            >
              <Icon name={isEditing ? 'close' : 'edit'} size={14} />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Fields'}</span>
            </button>

            <button
              type="button"
              className="drawer-close-btn"
              onClick={handleClose}
              aria-label="Close drawer"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(148, 163, 184, 0.15)',
                color: 'var(--color-text-secondary, #64748b)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>

        {/* Sub-Tabs (Visible when not editing) */}
        {!isEditing && (
          <div style={{
            display: 'flex',
            gap: 6,
            padding: '0 24px',
            borderBottom: '1px solid var(--color-border, #e2e8f0)',
            background: 'rgba(148, 163, 184, 0.03)',
            flexShrink: 0
          }}>
            <button
              type="button"
              className={`drawer-tab-btn ${activeSubTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('overview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '12px 14px',
                fontSize: '0.84rem',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                borderBottom: activeSubTab === 'overview' ? '2px solid var(--color-primary, #2563eb)' : '2px solid transparent',
                color: activeSubTab === 'overview' ? 'var(--color-primary, #2563eb)' : 'var(--color-text-secondary, #64748b)',
                cursor: 'pointer'
              }}
            >
              <Icon name="info" size={14} />
              <span>Overview</span>
            </button>

            <button
              type="button"
              className={`drawer-tab-btn ${activeSubTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('activity')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '12px 14px',
                fontSize: '0.84rem',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                borderBottom: activeSubTab === 'activity' ? '2px solid var(--color-primary, #2563eb)' : '2px solid transparent',
                color: activeSubTab === 'activity' ? 'var(--color-primary, #2563eb)' : 'var(--color-text-secondary, #64748b)',
                cursor: 'pointer'
              }}
            >
              <Icon name="clock" size={14} />
              <span>Activity History</span>
            </button>

            <button
              type="button"
              className={`drawer-tab-btn ${activeSubTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('notes')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '12px 14px',
                fontSize: '0.84rem',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                borderBottom: activeSubTab === 'notes' ? '2px solid var(--color-primary, #2563eb)' : '2px solid transparent',
                color: activeSubTab === 'notes' ? 'var(--color-primary, #2563eb)' : 'var(--color-text-secondary, #64748b)',
                cursor: 'pointer'
              }}
            >
              <Icon name="document" size={14} />
              <span>Notes &amp; Internal Logs ({savedNotes.length})</span>
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          background: 'var(--color-surface, #ffffff)'
        }}>
          {isEditing ? (
            /* ================= INLINE EDIT MODE ================= */
            <form onSubmit={handleInlineSave}>
              <div style={{
                background: 'rgba(37, 99, 235, 0.06)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="edit" size={16} style={{ color: '#2563eb' }} />
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-text, #0f172a)' }}>
                    Editing Record in Side Drawer
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  ID: #{record.id}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                {fields.map((field) => {
                  const val = editFormData[field.name] ?? '';

                  return (
                    <div key={field.name} className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4, color: 'var(--color-text, #0f172a)' }}>
                        {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          value={val}
                          required={field.required}
                          onChange={(e) => setEditFormData({ ...editFormData, [field.name]: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border, #cbd5e1)',
                            background: 'var(--color-surface, #ffffff)',
                            color: 'var(--color-text, #0f172a)',
                            fontSize: '0.88rem'
                          }}
                        >
                          <option value="">Select {field.label}...</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          rows="3"
                          value={val}
                          required={field.required}
                          onChange={(e) => setEditFormData({ ...editFormData, [field.name]: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border, #cbd5e1)',
                            background: 'var(--color-surface, #ffffff)',
                            color: 'var(--color-text, #0f172a)',
                            fontSize: '0.88rem',
                            resize: 'vertical',
                            boxSizing: 'border-box'
                          }}
                        />
                      ) : (
                        <input
                          type={field.type || 'text'}
                          value={field.type === 'date' && val ? String(val).substring(0, 10) : val}
                          required={field.required}
                          onChange={(e) => setEditFormData({ ...editFormData, [field.name]: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border, #cbd5e1)',
                            background: 'var(--color-surface, #ffffff)',
                            color: 'var(--color-text, #0f172a)',
                            fontSize: '0.88rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Sticky Action Footer inside Drawer */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 24,
                paddingTop: 16,
                borderTop: '1px solid var(--color-border, #e2e8f0)',
                position: 'sticky',
                bottom: 0,
                background: 'var(--color-surface, #ffffff)'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={isSaving}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  <Icon name="check" size={16} />
                  <span>{isSaving ? 'Saving...' : '💾 Save Updates'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* ================= VIEW MODE ================= */
            <>
              {/* Quick Action Hero Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(99, 102, 241, 0.08))',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                    CURRENT STATUS
                  </span>
                  <strong style={{ fontSize: '1rem', color: 'var(--color-text, #0f172a)', textTransform: 'capitalize', display: 'block', marginTop: 2 }}>
                    {statusVal || 'Active'}
                  </strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {onPrintInvoice && (entity === 'invoices' || activeRecord.invoice_number) && (
                    <button
                      type="button"
                      className="emoji-action-btn btn-print-action"
                      onClick={() => onPrintInvoice(activeRecord)}
                      aria-label="Print Tax Invoice"
                    >
                      <Icon name="printer" size={16} />
                      <span className="emoji-hover-tooltip">🖨️ Print Invoice</span>
                    </button>
                  )}

                  {onPrintQuotation && (entity === 'quotations' || activeRecord.quotation_number) && (
                    <button
                      type="button"
                      className="emoji-action-btn btn-print-action"
                      onClick={() => onPrintQuotation(activeRecord)}
                      aria-label="Print Commercial Quotation"
                    >
                      <Icon name="printer" size={16} />
                      <span className="emoji-hover-tooltip">🖨️ Print Quotation</span>
                    </button>
                  )}

                  {onWorkflowAction && entity === 'leads' && (
                    <button
                      type="button"
                      className="emoji-action-btn btn-bolt"
                      onClick={() => onWorkflowAction('convert_lead', activeRecord)}
                      aria-label="Convert Lead"
                    >
                      <Icon name="bolt" size={16} />
                      <span className="emoji-hover-tooltip">⚡ Convert Lead</span>
                    </button>
                  )}

                  {onWorkflowAction && entity === 'deals' && (
                    <button
                      type="button"
                      className="emoji-action-btn btn-quote-action"
                      onClick={() => onWorkflowAction('deal_to_quote', activeRecord)}
                      aria-label="Create Quotation"
                    >
                      <Icon name="document" size={16} />
                      <span className="emoji-hover-tooltip">📄 Create Quote</span>
                    </button>
                  )}

                  {onWorkflowAction && entity === 'quotations' && (
                    <button
                      type="button"
                      className="emoji-action-btn btn-invoice-action"
                      onClick={() => onWorkflowAction('quote_to_invoice', activeRecord)}
                      aria-label="Issue Tax Invoice"
                    >
                      <Icon name="invoice" size={16} />
                      <span className="emoji-hover-tooltip">🧾 Issue Invoice</span>
                    </button>
                  )}

                  {onWorkflowAction && entity === 'invoices' && (
                    <button
                      type="button"
                      className="emoji-action-btn btn-project-action"
                      onClick={() => onWorkflowAction('invoice_to_project', activeRecord)}
                      aria-label="Launch Project"
                    >
                      <Icon name="grid" size={16} />
                      <span className="emoji-hover-tooltip">🚀 Launch Project</span>
                    </button>
                  )}

                  {onWhatsApp && (
                    <button
                      type="button"
                      className="emoji-action-btn btn-whatsapp-action"
                      onClick={() => onWhatsApp(activeRecord)}
                      aria-label="WhatsApp Follow-up"
                    >
                      <Icon name="whatsapp" size={16} />
                      <span className="emoji-hover-tooltip">💬 WhatsApp</span>
                    </button>
                  )}

                  {onEmail && (
                    <button
                      type="button"
                      className="emoji-action-btn btn-email-action"
                      onClick={() => onEmail(activeRecord)}
                      aria-label="Gmail / Email Follow-up"
                    >
                      <Icon name="email" size={16} />
                      <span className="emoji-hover-tooltip">✉️ Gmail / Email</span>
                    </button>
                  )}
                </div>
              </div>

              {/* TAB: OVERVIEW */}
              {activeSubTab === 'overview' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: 14
                }}>
                  {fields.map((field) => {
                    const val = activeRecord[field.name];
                    const isDateField = field.type === 'date' || field.name.includes('date') || field.name.includes('until');
                    const isCurrencyField = field.name.includes('amount') || field.name.includes('value') || field.name.includes('total') || field.name.includes('price') || field.name.includes('budget');
                    const isStatusField = field.type === 'select' && (field.name === 'status' || field.name === 'lead_status' || field.name === 'payment_status' || field.name === 'stage');

                    let displayVal = val;
                    if (val !== undefined && val !== null && val !== '') {
                      if (isDateField) {
                        displayVal = String(val).substring(0, 10);
                      }
                    }

                    return (
                      <div
                        key={field.name}
                        className="drawer-field-card"
                        style={{
                          background: 'rgba(148, 163, 184, 0.05)',
                          border: '1px solid var(--color-border, #e2e8f0)',
                          borderRadius: '10px',
                          padding: '12px 14px'
                        }}
                      >
                        <label style={{
                          display: 'block',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--color-text-secondary, #64748b)',
                          letterSpacing: '0.04em',
                          marginBottom: '4px'
                        }}>
                          {field.label}
                        </label>
                        <div style={{
                          fontSize: '0.92rem',
                          fontWeight: 600,
                          color: 'var(--color-text, #0f172a)',
                          wordBreak: 'break-word'
                        }}>
                          {val !== undefined && val !== null && val !== '' ? (
                            isStatusField ? (
                              <span className={`badge-pill status-${String(val).toLowerCase().replace(/\s+/g, '-')}`} style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '3px 10px',
                                borderRadius: '12px',
                                background: 'rgba(59, 130, 246, 0.12)',
                                color: '#2563eb',
                                display: 'inline-block'
                              }}>
                                {String(val)}
                              </span>
                            ) : isCurrencyField ? (
                              <strong style={{ color: '#059669', fontSize: '1.05rem' }}>
                                ₹{Number(val || 0).toLocaleString('en-IN')}
                              </strong>
                            ) : (
                              displayVal
                            )
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.84rem' }}>
                              Not specified
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB: ACTIVITY */}
              {activeSubTab === 'activity' && (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderLeft: '2px solid var(--color-border, #e2e8f0)', paddingLeft: 18, marginLeft: 6 }}>
                    <div className="timeline-item">
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>TODAY</span>
                      <h4 style={{ margin: '2px 0', fontSize: '0.92rem', color: 'var(--color-text, #0f172a)' }}>Record Inspected in CRM Drawer</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Admin viewed details and activity log.</p>
                    </div>

                    <div className="timeline-item">
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>CREATION</span>
                      <h4 style={{ margin: '2px 0', fontSize: '0.92rem', color: 'var(--color-text, #0f172a)' }}>Initial Ingestion &amp; Registration</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Created at {record.created_at ? new Date(record.created_at).toLocaleString() : 'System Inception'}.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: NOTES */}
              {activeSubTab === 'notes' && (
                <div className="drawer-notes-section">
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text, #0f172a)', marginBottom: 6 }}>
                      Add Confidential Sales / Executive Note:
                    </label>
                    <textarea
                      rows="3"
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Write internal team notes, requirements, or next steps..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border, #cbd5e1)',
                        background: 'var(--color-surface, #ffffff)',
                        color: 'var(--color-text, #0f172a)',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleSaveNote}
                      >
                        Save Note
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {savedNotes.map((n, idx) => (
                      <div key={idx} style={{
                        background: 'rgba(148, 163, 184, 0.08)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '0.85rem',
                        color: 'var(--color-text, #0f172a)'
                      }}>
                        "{n}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sticky Drawer Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--color-border, #e2e8f0)',
          background: 'var(--color-surface-glass, rgba(255, 255, 255, 0.95))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            {onDelete && (
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)', fontWeight: 600 }}
                onClick={() => onDelete(record.id)}
              >
                <Icon name="trash" size={14} />
                <span>Delete</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleClose}
            >
              Close
            </button>
            {!isEditing && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsEditing(true)}
                style={{ fontWeight: 700 }}
              >
                <Icon name="edit" size={14} />
                <span>Edit Details</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SlideDrawer;
