import React, { useState } from 'react';
import Icon from './Icon';

/**
 * SlideDrawer Component
 * Provides a sleek slide-over drawer panel for record inspection, editing & quick actions.
 */
const SlideDrawer = ({
  isOpen,
  onClose,
  title = 'Record Details',
  subtitle,
  record,
  fields = [],
  entity,
  onEdit,
  onDelete,
  onWhatsApp,
  onPrintInvoice,
  onPrintQuotation
}) => {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  if (!isOpen || !record) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div
        className="drawer-container slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <span className="drawer-entity-badge">{entity?.toUpperCase() || 'DETAILS'}</span>
            <h2 className="drawer-title">{title}</h2>
            {subtitle && <p className="drawer-subtitle">{subtitle}</p>}
          </div>

          <div className="drawer-header-actions">
            {onEdit && (
              <button
                className="btn btn-secondary btn-sm action-tooltip-btn"
                onClick={() => {
                  onEdit(record);
                  onClose();
                }}
                title="Edit Record"
              >
                <Icon name="edit" size={15} />
                <span>Edit</span>
              </button>
            )}
            <button className="drawer-close-btn" onClick={onClose} aria-label="Close drawer">
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Sub-Tabs */}
        <div className="drawer-subtabs">
          <button
            className={`drawer-tab-btn ${activeSubTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('overview')}
          >
            <Icon name="info" size={14} />
            <span>Overview</span>
          </button>
          <button
            className={`drawer-tab-btn ${activeSubTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('activity')}
          >
            <Icon name="clock" size={14} />
            <span>Activity History</span>
          </button>
          <button
            className={`drawer-tab-btn ${activeSubTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('notes')}
          >
            <Icon name="document" size={14} />
            <span>Notes</span>
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="drawer-body">
          {activeSubTab === 'overview' && (
            <div className="drawer-overview-grid">
              {fields.map((field) => {
                const val = record[field.name];
                return (
                  <div className="drawer-field-item" key={field.name}>
                    <label className="drawer-field-label">{field.label}</label>
                    <div className="drawer-field-value">
                      {val !== undefined && val !== null && val !== '' ? (
                        field.type === 'select' && field.name === 'status' ? (
                          <span className={`status-pill status-${String(val).toLowerCase().replace(/\s+/g, '-')}`}>
                            {val}
                          </span>
                        ) : (
                          String(val)
                        )
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeSubTab === 'activity' && (
            <div className="drawer-timeline">
              <div className="timeline-item">
                <div className="timeline-dot dot-primary" />
                <div className="timeline-content">
                  <span className="timeline-time">Just now</span>
                  <p className="timeline-text">Record loaded in detail view</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot dot-success" />
                <div className="timeline-content">
                  <span className="timeline-time">{record.created_at ? new Date(record.created_at).toLocaleString() : 'Recently'}</span>
                  <p className="timeline-text">Record created in database</p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'notes' && (
            <div className="drawer-notes-section">
              <textarea
                className="form-control"
                rows={4}
                placeholder="Add internal notes about this record..."
              />
              <button className="btn btn-primary btn-sm mt-2">Save Note</button>
            </div>
          )}
        </div>

        {/* Drawer Footer Quick Actions */}
        <div className="drawer-footer">
          <div className="drawer-quick-actions">
            {onWhatsApp && (record.phone || record.contact_phone) && (
              <button
                className="btn btn-whatsapp btn-sm"
                onClick={() => onWhatsApp(record)}
              >
                <Icon name="message" size={15} />
                <span>WhatsApp</span>
              </button>
            )}

            {onPrintInvoice && entity === 'invoices' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onPrintInvoice(record)}
              >
                <Icon name="printer" size={15} />
                <span>Print Invoice</span>
              </button>
            )}

            {onPrintQuotation && (entity === 'deals' || entity === 'quotations') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onPrintQuotation(record)}
              >
                <Icon name="printer" size={15} />
                <span>View / Convert Quotation</span>
              </button>
            )}
          </div>

          {onDelete && (
            <button
              className="btn btn-danger-outline btn-sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this record?')) {
                  onDelete(record.id);
                  onClose();
                }
              }}
            >
              <Icon name="trash" size={15} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlideDrawer;
