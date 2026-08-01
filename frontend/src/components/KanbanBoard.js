import React, { useState } from 'react';
import Icon from './Icon';

const KanbanBoard = ({ config, records, onStatusChange, onEdit, onDelete, onWhatsApp, onPrintInvoice }) => {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Determine status field and available columns
  const statusField = config.statusField || 'status';
  const fieldObj = config.fields.find((f) => f.name === statusField);

  // Column stage options
  let columns = [];
  if (fieldObj && fieldObj.options) {
    columns = fieldObj.options;
  } else {
    // Fallback: unique status values present in records
    const uniqueStatuses = Array.from(new Set(records.map((r) => r[statusField]).filter(Boolean)));
    columns = uniqueStatuses.length > 0 ? uniqueStatuses : ['Default'];
  }

  // Handle Drag & Drop
  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnStatus) {
      setDragOverColumn(columnStatus);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, columnStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const idStr = e.dataTransfer.getData('text/plain') || draggedId;
    if (idStr) {
      const recordId = Number(idStr) || idStr;
      onStatusChange(recordId, columnStatus);
    }
    setDraggedId(null);
  };

  // Format monetary amounts
  const formatAmount = (num) => {
    if (num === undefined || num === null || isNaN(num)) return null;
    return `₹${Number(num).toLocaleString('en-IN')}`;
  };

  return (
    <div className="kanban-wrapper">
      <div className="kanban-board">
        {columns.map((colStatus) => {
          // Filter records belonging to this status column
          const colRecords = records.filter(
            (r) => String(r[statusField] || '').toLowerCase() === String(colStatus).toLowerCase()
          );

          // Compute column metric total if valueField exists
          const valueField = config.valueField;
          const totalValue = valueField
            ? colRecords.reduce((sum, r) => sum + (Number(r[valueField]) || 0), 0)
            : 0;

          const isOver = dragOverColumn === colStatus;

          return (
            <div
              key={colStatus}
              className={`kanban-column ${isOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, colStatus)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, colStatus)}
            >
              <div className="kanban-column-header">
                <div className="column-header-title">
                  <span className="status-dot"></span>
                  <h3>{colStatus}</h3>
                  <span className="column-count-badge">{colRecords.length}</span>
                </div>
                {valueField && totalValue > 0 && (
                  <div className="column-total-amount">{formatAmount(totalValue)}</div>
                )}
              </div>

              <div className="kanban-column-body">
                {colRecords.map((r) => {
                  const titleVal = r[config.titleField] || r.name || r.title || `Item #${r.id}`;
                  const subtitleVal = r[config.subtitleField] || r.email || r.company_name;
                  const valAmount = valueField ? r[valueField] : null;

                  return (
                    <div
                      key={r.id}
                      className={`kanban-card ${draggedId === r.id ? 'is-dragging' : ''}`}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, r.id)}
                    >
                      <div className="kanban-card-header">
                        <h4 className="kanban-card-title">{titleVal}</h4>
                        {subtitleVal && (
                          <p className="kanban-card-subtitle">{subtitleVal}</p>
                        )}
                      </div>

                      <div className="kanban-card-body">
                        {valAmount !== null && valAmount !== undefined && (
                          <div className="kanban-card-value">
                            {formatAmount(valAmount)}
                          </div>
                        )}

                        {r.phone && (
                          <div className="kanban-meta-item">
                            <Icon name="phone" size={12} />
                            <span>{r.phone}</span>
                          </div>
                        )}

                        {r.email && !subtitleVal?.includes(r.email) && (
                          <div className="kanban-meta-item">
                            <Icon name="mail" size={12} />
                            <span>{r.email}</span>
                          </div>
                        )}

                        {r.assigned_to && (
                          <div className="kanban-meta-item">
                            <Icon name="user" size={12} />
                            <span>{r.assigned_to}</span>
                          </div>
                        )}

                        {r.priority && (
                          <span className={`priority-tag priority-${String(r.priority).toLowerCase()}`}>
                            {r.priority} Priority
                          </span>
                        )}
                      </div>

                      <div className="kanban-card-footer">
                        {/* Quick stage selector dropdown */}
                        <select
                          className="kanban-stage-select"
                          value={r[statusField] || colStatus}
                          onChange={(e) => onStatusChange(r.id, e.target.value)}
                        >
                          {columns.map((opt) => (
                            <option key={opt} value={opt}>
                              → Move to {opt}
                            </option>
                          ))}
                        </select>

                        <div className="kanban-card-actions">
                          {r.phone && (
                            <button
                              type="button"
                              className="kanban-action-btn whatsapp-btn"
                              onClick={() => onWhatsApp(r)}
                              title="WhatsApp Message"
                            >
                              <Icon name="whatsapp" size={13} />
                            </button>
                          )}
                          {onPrintInvoice && (r.invoice_number || config.id === 'invoices') && (
                            <button
                              type="button"
                              className="kanban-action-btn invoice-btn"
                              onClick={() => onPrintInvoice(r)}
                              title="Print GST Invoice"
                            >
                              <Icon name="invoice" size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="kanban-action-btn edit-btn"
                            onClick={() => onEdit(r)}
                            title="Edit Record"
                          >
                            <Icon name="edit" size={13} />
                          </button>
                          <button
                            type="button"
                            className="kanban-action-btn delete-btn"
                            onClick={() => onDelete(r.id)}
                            title="Delete Record"
                          >
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colRecords.length === 0 && (
                  <div className="kanban-empty-column">
                    <p>No items in {colStatus}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
