import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import KanbanBoard from '../components/KanbanBoard';
import EntityGraphView from '../components/EntityGraphView';
import WhatsAppModal from '../components/WhatsAppModal';
import InvoicePrintModal from '../components/InvoicePrintModal';
import QuotationPrintModal from '../components/QuotationPrintModal';
import WorkflowConvertModal from '../components/WorkflowConvertModal';
import SkeletonLoader from '../components/SkeletonLoader';
import SlideDrawer from '../components/SlideDrawer';
import FormWizardModal from '../components/FormWizardModal';
import FacetedFilterBar from '../components/FacetedFilterBar';
import entityConfig from '../config/entityConfig';
import { getAll, createRecord, updateRecord, deleteRecord, restoreRecord } from '../api/api';
import { animateTableRows, animateButtonPulse } from '../utils/animations';

const emptyFormFor = (fields) => {
  const obj = {};
  fields.forEach((f) => (obj[f.name] = ''));
  return obj;
};

// Modules supporting multi-view layouts (Table & Kanban Board)
const dualViewModules = ['deals', 'tasks', 'appointments', 'tickets', 'campaigns'];

const EntityPage = () => {
  const { entity } = useParams();
  const config = entityConfig[entity];
  const tableRef = useRef(null);

  const isDualViewModule = dualViewModules.includes(entity);
  const isDeals = entity === 'deals';

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(config ? emptyFormFor(config.fields) : {});
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [whatsappRecipient, setWhatsappRecipient] = useState(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);
  const [selectedQuotationForPrint, setSelectedQuotationForPrint] = useState(null);
  const [drawerRecord, setDrawerRecord] = useState(null);
  const [drawerInitialEdit, setDrawerInitialEdit] = useState(false);
  const [workflowModalState, setWorkflowModalState] = useState({
    isOpen: false,
    type: 'convert_lead',
    record: null
  });
  const [viewMode, setViewMode] = useState(() => {
    if (entity === 'leads') return 'table';
    return localStorage.getItem(`crm_view_mode_${entity}`) || 'kanban';
  });

  const handleWorkflowAction = (type, record) => {
    setDrawerRecord(null);
    setWorkflowModalState({ isOpen: true, type, record });
  };

  // Fast, instant client-side + server-side faceted filter computation
  const displayedRecords = useMemo(() => {
    if (!Array.isArray(records)) return [];
    return records.filter((r) => {
      for (const [field, val] of Object.entries(filters)) {
        if (val !== undefined && val !== null && val !== '') {
          const recordVal = String(r[field] || '').toLowerCase().trim();
          const targetVal = String(val).toLowerCase().trim();
          if (recordVal !== targetVal) {
            return false;
          }
        }
      }
      return true;
    });
  }, [records, filters]);

  const handleViewModeChange = (mode, e) => {
    if (e?.currentTarget) animateButtonPulse(e.currentTarget);
    setViewMode(mode);
    localStorage.setItem(`crm_view_mode_${entity}`, mode);
  };

  const fetchData = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const queryParams = {
        search,
        trash: isTrashMode,
        ...filters
      };
      const res = await getAll(entity, queryParams);
      setRecords(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError('Could not load data. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  }, [entity, search, isTrashMode, filters, config]);

  useEffect(() => {
    setForm(config ? emptyFormFor(config.fields) : {});
    setEditingId(null);
    setShowForm(false);
    setFilters({});
    setIsTrashMode(false);
    if (entity === 'leads') {
      setViewMode('table');
    } else {
      setViewMode(localStorage.getItem(`crm_view_mode_${entity}`) || 'kanban');
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filters, isTrashMode]);

  // Anime.js Table row cascading wave entrance
  useEffect(() => {
    if (!loading && displayedRecords.length > 0 && tableRef.current) {
      animateTableRows(tableRef.current);
    }
  }, [loading, displayedRecords, viewMode]);

  if (!config) {
    return (
      <Layout showAdd={false}>
        <p className="empty-row">Unknown module.</p>
      </Layout>
    );
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleToggleTrashMode = () => {
    setIsTrashMode((prev) => !prev);
  };

  const handleSubmit = async (submittedData) => {
    const dataToSend = submittedData || form;
    try {
      if (editingId) {
        await updateRecord(entity, editingId, dataToSend);
      } else {
        await createRecord(entity, dataToSend);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyFormFor(config.fields));
      fetchData();
    } catch (err) {
      alert('Error saving record: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleStatusChange = async (recordId, newStatus) => {
    const targetRecord = records.find((r) => String(r.id) === String(recordId));
    if (!targetRecord) return;
    const statusField = config.statusField || 'status';
    if (String(targetRecord[statusField] || '').toLowerCase() === String(newStatus || '').toLowerCase()) return;

    const updatedRecords = records.map((r) =>
      String(r.id) === String(recordId) ? { ...r, [statusField]: newStatus } : r
    );
    setRecords(updatedRecords);

    try {
      await updateRecord(entity, targetRecord.id, {
        [statusField]: newStatus
      });
    } catch (err) {
      console.error('Error updating status in DB:', err);
      fetchData();
    }
  };

  const handleEdit = (record) => {
    setDrawerRecord(record);
    setDrawerInitialEdit(true);
  };

  const handleDelete = async (id) => {
    const msg = isTrashMode
      ? '⚠️ Permanent Delete: Are you sure you want to permanently destroy this record from the database?'
      : 'Move this record to Trash?';
    if (!window.confirm(msg)) return;
    try {
      await deleteRecord(entity, id, isTrashMode);
      fetchData();
    } catch (err) {
      alert('Error deleting record');
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreRecord(entity, id);
      fetchData();
    } catch (err) {
      alert('Error restoring record: ' + (err.response?.data?.error || err.message));
    }
  };

  const openAddForm = () => {
    const defaultForm = emptyFormFor(config.fields);
    if (entity === 'quotations') {
      defaultForm.quotation_number = `QT-${Math.floor(1000 + Math.random() * 9000)}`;
      defaultForm.quotation_date = new Date().toISOString().substring(0, 10);
      defaultForm.status = 'Draft';
    }
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(true);
  };

  const columnLabel = (colName) => {
    if (colName === 'due_amount') return 'Balance Due (₹)';
    if (colName === 'paid_amount') return 'Amount Paid (₹)';
    const f = config.fields.find((x) => x.name === colName);
    return f ? f.label : colName;
  };

  const formatCell = (record, colName) => {
    const val = record[colName];

    // CURRENCY FORMATTING
    if (colName === 'value' || colName === 'price' || colName === 'budget' || colName === 'amount' || colName === 'paid_amount' || colName === 'due_amount' || colName === 'total_amount') {
      if (val === null || val === undefined || val === '') return '—';
      const num = Number(val);
      return (
        <span style={{ fontWeight: 700, color: 'inherit' }}>
          ₹{num.toLocaleString('en-IN')}
        </span>
      );
    }

    // PRIORITY BADGE PILL
    if (colName === 'priority') {
      const v = String(val).toLowerCase();
      let badgeStyle = { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)', icon: '🔵' };
      if (v.includes('high') || v.includes('urgent')) badgeStyle = { bg: 'rgba(244, 63, 94, 0.15)', text: '#f43f5e', border: 'rgba(244, 63, 94, 0.35)', icon: '🔥' };
      if (v.includes('medium') || v.includes('med')) badgeStyle = { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)', icon: '⚡' };
      if (v.includes('low')) badgeStyle = { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.35)', icon: '🟢' };
      return (
        <span
          className="badge-pill"
          style={{
            background: badgeStyle.bg,
            color: badgeStyle.text,
            border: `1px solid ${badgeStyle.border}`,
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <span>{badgeStyle.icon}</span>
          <span>{val}</span>
        </span>
      );
    }

    // STATUS OR STAGE BADGE PILL
    if (colName === 'status' || colName === 'stage' || colName === 'lead_status' || colName === 'payment_status') {
      const v = String(val).toLowerCase();
      let badgeStyle = { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      if (v.includes('completed') || v.includes('won') || v.includes('paid') || v.includes('active') || v.includes('closed won') || v.includes('qualified')) {
        badgeStyle = { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.35)' };
      } else if (v.includes('pending') || v.includes('progress') || v.includes('open') || v.includes('contacted') || v.includes('proposal') || v.includes('new')) {
        badgeStyle = { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)' };
      } else if (v.includes('lost') || v.includes('cancel') || v.includes('overdue') || v.includes('unpaid') || v.includes('junk')) {
        badgeStyle = { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.35)' };
      }
      return (
        <span
          className="badge-pill"
          style={{
            background: badgeStyle.bg,
            color: badgeStyle.text,
            border: `1px solid ${badgeStyle.border}`,
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'inline-block',
            textTransform: 'capitalize'
          }}
        >
          {val}
        </span>
      );
    }

    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (String(val).match(/^\d{4}-\d{2}-\d{2}T/)) {
      return String(val).substring(0, 10);
    }
    return String(val);
  };

  const handleExportCSV = () => {
    if (!records || records.length === 0) {
      alert('No data available to export');
      return;
    }
    const headers = ['ID', ...config.columns];
    const rows = records.map((r) => [
      r.id,
      ...config.columns.map((c) => {
        const v = r[c];
        if (v === null || v === undefined) return '';
        return `"${String(v).replace(/"/g, '""')}"`;
      })
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${entity}_export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout showAdd onAddClick={openAddForm} searchValue={search} onSearchChange={setSearch}>
      {/* Top Toolbar */}
      <div className="dashboard-toolbar">
        <div className="toolbar-left-info">
          <p>{records.length} record(s) found</p>
        </div>

        <div className="toolbar-right-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportCSV} title="Export to CSV">
            <Icon name="download" size={14} />
            <span>Export CSV</span>
          </button>

          {/* VIEW SWITCHER TOGGLE */}
          {isDualViewModule && (
            <div className="view-mode-toggle">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={(e) => handleViewModeChange('kanban', e)}
                title="Kanban Board View"
              >
                <Icon name="grid" size={15} />
                <span>Kanban Board</span>
              </button>

              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={(e) => handleViewModeChange('table', e)}
                title="Table View"
              >
                <Icon name="menu" size={15} />
                <span>Table View</span>
              </button>

              {/* GRAPH VIEW SPECIFICALLY FOR DEALS */}
              {isDeals && (
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'graph' ? 'active' : ''}`}
                  onClick={(e) => handleViewModeChange('graph', e)}
                  title="Graph Analytics View"
                >
                  <Icon name="chart" size={15} />
                  <span>Graph View</span>
                </button>
              )}
            </div>
          )}

          <button type="button" className="btn btn-primary" onClick={openAddForm}>
            + Add New
          </button>
        </div>
      </div>

      {/* FACETED MULTI-DIMENSIONAL FILTER BAR */}
      <FacetedFilterBar
        config={config}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        totalCount={displayedRecords.length}
        isTrashMode={isTrashMode}
        onToggleTrashMode={handleToggleTrashMode}
      />

      <FormWizardModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingId(null);
        }}
        title={config.title || entity}
        fields={config.fields}
        initialData={form}
        onSubmit={handleSubmit}
        editingId={editingId}
        entity={entity}
      />

      {error && <p className="form-status error">{error}</p>}

      {loading ? (
        <SkeletonLoader variant={viewMode === 'kanban' ? 'card' : 'table'} count={5} />
      ) : (isDeals && viewMode === 'graph') ? (
        /* GRAPH ANALYTICS VIEW EXCLUSIVELY FOR DEALS */
        <EntityGraphView config={config} entity={entity} records={displayedRecords} />
      ) : (isDualViewModule && viewMode === 'kanban' && !isTrashMode) ? (
        /* KANBAN BOARD VIEW */
        <KanbanBoard
          config={config}
          records={displayedRecords}
          onStatusChange={handleStatusChange}
          onCardClick={(r) => {
            setDrawerRecord(r);
            setDrawerInitialEdit(false);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onWhatsApp={setWhatsappRecipient}
          onPrintInvoice={(invoiceRec) => setSelectedInvoiceForPrint(invoiceRec)}
          onWorkflowAction={handleWorkflowAction}
        />
      ) : (
        /* TABLE VIEW FORMAT */
        <div className="table-wrapper" ref={tableRef}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                {config.columns.map((c, cIdx) => <th key={`th-${c}-${cIdx}`}>{columnLabel(c)}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecords.map((r, rIdx) => (
                <tr
                  key={`row-${r.id || rIdx}-${rIdx}`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    if (e.target.closest('.table-actions')) return;
                    setDrawerRecord(r);
                    setDrawerInitialEdit(false);
                  }}
                  title="Click to view details in Side Drawer"
                >
                  <td>{r.id}</td>
                  {config.columns.map((c, cIdx) => <td key={`td-${r.id || rIdx}-${c}-${cIdx}`}>{formatCell(r, c)}</td>)}
                  <td className="table-actions" onClick={(e) => e.stopPropagation()}>
                    {isTrashMode ? (
                      <>
                        <button
                          className="btn-icon action-tooltip-btn"
                          style={{ background: '#dcfce7', color: '#16a34a' }}
                          onClick={() => handleRestore(r.id)}
                          title="Restore Record"
                        >
                          <Icon name="refresh" size={15} />
                          <span className="action-hover-tag">Restore</span>
                        </button>
                        <button
                          className="btn-icon delete action-tooltip-btn"
                          onClick={() => handleDelete(r.id)}
                          title="Permanent Delete"
                        >
                          <Icon name="trash" size={15} />
                          <span className="action-hover-tag">Permanent Delete</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {/* 1-CLICK WORKFLOW CONVERSION SHORTCUT BUTTONS */}
                        {entity === 'leads' && (
                          <button
                            className="btn-icon action-tooltip-btn"
                            style={{ background: 'rgba(59, 130, 246, 0.18)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.35)' }}
                            onClick={() => handleWorkflowAction('convert_lead', r)}
                            title="1-Click Convert to Contact, Company & Deal"
                          >
                            <Icon name="bolt" size={15} />
                            <span className="action-hover-tag">Convert Lead</span>
                          </button>
                        )}
                        {entity === 'deals' && (
                          <button
                            className="btn-icon action-tooltip-btn"
                            style={{ background: 'rgba(16, 185, 129, 0.18)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.35)' }}
                            onClick={() => handleWorkflowAction('deal_to_quote', r)}
                            title="1-Click Generate Quotation"
                          >
                            <Icon name="quotation" size={15} />
                            <span className="action-hover-tag">Create Quote</span>
                          </button>
                        )}
                        {entity === 'quotations' && (
                          <button
                            className="btn-icon action-tooltip-btn"
                            style={{ background: 'rgba(245, 158, 11, 0.18)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.35)' }}
                            onClick={() => handleWorkflowAction('quote_to_invoice', r)}
                            title="1-Click Approve & Generate Tax Invoice"
                          >
                            <Icon name="invoice" size={15} />
                            <span className="action-hover-tag">Approve & Invoice</span>
                          </button>
                        )}
                        {entity === 'invoices' && (
                          <button
                            className="btn-icon action-tooltip-btn"
                            style={{ background: 'rgba(139, 92, 246, 0.18)', color: '#7c3aed', border: '1px solid rgba(139, 92, 246, 0.35)' }}
                            onClick={() => handleWorkflowAction('invoice_to_project', r)}
                            title="1-Click Launch Project Workspace"
                          >
                            <Icon name="grid" size={15} />
                            <span className="action-hover-tag">Launch Workspace</span>
                          </button>
                        )}

                        {r.phone && (
                          <button className="btn-icon whatsapp action-tooltip-btn" onClick={() => setWhatsappRecipient(r)}>
                            <Icon name="whatsapp" size={15} />
                            <span className="action-hover-tag">WhatsApp</span>
                          </button>
                        )}
                        {(r.invoice_number || entity === 'invoices') && (
                          <button className="btn-icon invoice-btn action-tooltip-btn" onClick={() => setSelectedInvoiceForPrint(r)}>
                            <Icon name="invoice" size={15} />
                            <span className="action-hover-tag">Invoice</span>
                          </button>
                        )}
                        {(r.quotation_number || entity === 'quotations') && (
                          <button className="btn-icon invoice-btn action-tooltip-btn" style={{ background: '#f3e8ff', color: '#7c3aed' }} onClick={() => setSelectedQuotationForPrint(r)}>
                            <Icon name="quotation" size={15} />
                            <span className="action-hover-tag">Print Quotation</span>
                          </button>
                        )}
                        <button
                          className="btn-icon edit action-tooltip-btn"
                          onClick={() => handleEdit(r)}
                        >
                          <Icon name="edit" size={15} />
                          <span className="action-hover-tag">Edit in Drawer</span>
                        </button>
                        <button className="btn-icon delete action-tooltip-btn" onClick={() => handleDelete(r.id)}>
                          <Icon name="trash" size={15} />
                          <span className="action-hover-tag">Move to Trash</span>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {displayedRecords.length === 0 && (
                <tr>
                  <td colSpan={config.columns.length + 2} className="empty-row">
                    {isTrashMode ? '🗑️ Trash is empty for this module' : 'No records found matching filters'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-over Detail Drawer */}
      <SlideDrawer
        isOpen={Boolean(drawerRecord)}
        onClose={() => {
          setDrawerRecord(null);
          setDrawerInitialEdit(false);
        }}
        title={drawerRecord?.deal_name || drawerRecord?.company_name || drawerRecord?.contact_name || drawerRecord?.lead_name || drawerRecord?.product_name || drawerRecord?.task_name || drawerRecord?.subject || `Record #${drawerRecord?.id}`}
        subtitle={drawerRecord?.email || drawerRecord?.phone || drawerRecord?.account_name || drawerRecord?.assigned_to || ''}
        record={drawerRecord}
        fields={config.fields}
        entity={entity}
        initialEditMode={drawerInitialEdit}
        onSave={async (id, updatedData) => {
          await updateRecord(entity, id, updatedData);
          fetchData();
        }}
        onRefresh={fetchData}
        onDelete={(id) => {
          setDrawerRecord(null);
          handleDelete(id);
        }}
        onWhatsApp={(rec) => {
          setDrawerRecord(null);
          setWhatsappRecipient(rec);
        }}
        onPrintInvoice={(rec) => {
          setDrawerRecord(null);
          setSelectedInvoiceForPrint(rec);
        }}
        onPrintQuotation={(rec) => {
          setDrawerRecord(null);
          setSelectedQuotationForPrint(rec);
        }}
        onWorkflowAction={(type, rec) => {
          setDrawerRecord(null);
          handleWorkflowAction(type, rec);
        }}
      />

      {/* 1-Click Workflow Conversion Modal */}
      <WorkflowConvertModal
        isOpen={workflowModalState.isOpen}
        type={workflowModalState.type}
        record={workflowModalState.record}
        onClose={() => setWorkflowModalState({ isOpen: false, type: 'convert_lead', record: null })}
        onSuccess={() => {
          fetchData();
        }}
      />

      {/* WhatsApp Quick Message Modal */}
      {whatsappRecipient && (
        <WhatsAppModal
          recipient={whatsappRecipient}
          onClose={() => setWhatsappRecipient(null)}
        />
      )}

      {/* Official Tax Invoice Print Modal */}
      {selectedInvoiceForPrint && (
        <InvoicePrintModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}

      {/* Commercial Quotation Print Modal */}
      {selectedQuotationForPrint && (
        <QuotationPrintModal
          quotation={selectedQuotationForPrint}
          onClose={() => setSelectedQuotationForPrint(null)}
        />
      )}
    </Layout>
  );
};

export default EntityPage;
