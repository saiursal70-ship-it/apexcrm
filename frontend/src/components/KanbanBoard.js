import React, { useState, useRef } from 'react';
import Icon from './Icon';

// Global reference for bulletproof drag-and-drop state transfer
let activeKanbanDraggedId = null;

const KanbanBoard = ({ config, records, onStatusChange, onEdit, onDelete, onWhatsApp, onPrintInvoice }) => {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const draggedIdRef = useRef(null);

  // Determine status field and available columns
  const statusField = config.statusField || 'status';
  const fieldObj = config.fields ? config.fields.find((f) => f.name === statusField) : null;

  // Column stage options
  let columns = [];
  if (fieldObj && fieldObj.options) {
    columns = fieldObj.options;
  } else {
    const uniqueStatuses = Array.from(new Set(records.map((r) => r[statusField]).filter(Boolean)));
    columns = uniqueStatuses.length > 0 ? uniqueStatuses : ['Default'];
  }

  // ---- 100% Reliable HTML5 Drag & Drop Event Handlers ----
  const handleDragStart = (e, id) => {
    activeKanbanDraggedId = id;
    setDraggedId(id);
    draggedIdRef.current = id;
    try {
      e.dataTransfer.setData('text/plain', String(id));
      e.dataTransfer.setData('text', String(id));
    } catch (err) {}
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault(); // MANDATORY in HTML5 to allow dropping!
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    if (dragOverColumn !== columnStatus) {
      setDragOverColumn(columnStatus);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, columnStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    let id = activeKanbanDraggedId;
    if (id === null || id === undefined) {
      id = draggedIdRef.current || draggedId;
      if (id === null || id === undefined) {
        try {
          id = e.dataTransfer.getData('text/plain');
        } catch (err) {}
      }
    }

    if (id !== null && id !== undefined && id !== '') {
      const recordId = isNaN(Number(id)) ? id : Number(id);
      onStatusChange(recordId, columnStatus);
    }

    activeKanbanDraggedId = null;
    setDraggedId(null);
    draggedIdRef.current = null;
  };

  const handleDragEnd = () => {
    activeKanbanDraggedId = null;
    setDraggedId(null);
    setDragOverColumn(null);
    draggedIdRef.current = null;
  };

  // Format monetary amounts
  const formatAmount = (num) => {
    if (num === undefined || num === null || isNaN(num)) return null;
    return `₹${Number(num).toLocaleString('en-IN')}`;
  };

  return (
    <div className="kanban-wrapper">
      <div className="kanban-board">
        {columns.map((colStatus, colIdx) => {
          // Filter records belonging to this column stage
          const colRecords = records.filter(
            (r) => String(r[statusField] || '').trim().toLowerCase() === String(colStatus || '').trim().toLowerCase()
          );

          const valueField = config.valueField;
          const totalValue = valueField
            ? colRecords.reduce((sum, r) => sum + (Number(r[valueField]) || 0), 0)
            : 0;

          const isOver = dragOverColumn === colStatus;

          return (
            <div
              key={`kanban-col-${colStatus}-${colIdx}`}
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

              <div
                className="kanban-column-body"
                onDragOver={(e) => handleDragOver(e, colStatus)}
                onDrop={(e) => handleDrop(e, colStatus)}
              >
                {colRecords.map((r, rIdx) => {
                  const titleVal = r[config.titleField] || r.name || r.title || `Item #${r.id}`;
                  const subtitleVal = r[config.subtitleField] || r.email || r.company_name;
                  const valAmount = valueField ? r[valueField] : null;
                  const cardKey = r.id ? `kanban-card-${r.id}` : `kanban-card-${rIdx}`;

                  return (
                    <div
                      key={cardKey}
                      className={`kanban-card ${draggedId === r.id ? 'is-dragging' : ''}`}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, r.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, colStatus)}
                      onDrop={(e) => handleDrop(e, colStatus)}
                      style={{ cursor: 'grab', userSelect: 'none' }}
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
                        <div className="kanban-card-actions">
                          {r.phone && (
                            <button
                              type="button"
                              className="kanban-action-btn whatsapp-btn action-tooltip-btn"
                              onClick={() => onWhatsApp(r)}
                            >
                              <Icon name="whatsapp" size={13} />
                              <span className="action-hover-tag">WhatsApp</span>
                            </button>
                          )}
                          {onPrintInvoice && (r.invoice_number || config.id === 'invoices') && (
                            <button
                              type="button"
                              className="kanban-action-btn invoice-btn action-tooltip-btn"
                              onClick={() => onPrintInvoice(r)}
                            >
                              <Icon name="invoice" size={13} />
                              <span className="action-hover-tag">Invoice</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="kanban-action-btn edit-btn action-tooltip-btn"
                            onClick={() => onEdit(r)}
                          >
                            <Icon name="edit" size={13} />
                            <span className="action-hover-tag">Edit</span>
                          </button>
                          <button
                            type="button"
                            className="kanban-action-btn delete-btn action-tooltip-btn"
                            onClick={() => onDelete(r.id)}
                          >
                            <Icon name="trash" size={13} />
                            <span className="action-hover-tag">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isOver && (
                  <div className="drag-drop-placeholder" style={{
                    padding: '12px',
                    border: '2px dashed #2563eb',
                    borderRadius: '8px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    textAlign: 'center'
                  }}>
                    + Drop here to move to {colStatus}
                  </div>
                )}

                {colRecords.length === 0 && !isOver && (
                  <div className="kanban-empty-column">
                    <p>Drag items here</p>
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
