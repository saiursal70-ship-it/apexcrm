import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import KanbanBoard from '../components/KanbanBoard';
import EntityGraphView from '../components/EntityGraphView';
import WhatsAppModal from '../components/WhatsAppModal';
import InvoicePrintModal from '../components/InvoicePrintModal';
import QuotationPrintModal from '../components/QuotationPrintModal';
import SkeletonLoader from '../components/SkeletonLoader';
import SlideDrawer from '../components/SlideDrawer';
import FormWizardModal from '../components/FormWizardModal';
import entityConfig from '../config/entityConfig';
import { getAll, createRecord, updateRecord, deleteRecord } from '../api/api';

const emptyFormFor = (fields) => {
  const obj = {};
  fields.forEach((f) => (obj[f.name] = ''));
  return obj;
};

// Modules supporting multi-view layouts
const dualViewModules = ['deals', 'tasks', 'appointments'];

const EntityPage = () => {
  const { entity } = useParams();
  const config = entityConfig[entity];

  const isDualViewModule = dualViewModules.includes(entity);
  const isDeals = entity === 'deals';

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(config ? emptyFormFor(config.fields) : {});
  const [search, setSearch] = useState('');
  const [whatsappRecipient, setWhatsappRecipient] = useState(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);
  const [selectedQuotationForPrint, setSelectedQuotationForPrint] = useState(null);
  const [drawerRecord, setDrawerRecord] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem(`crm_view_mode_${entity}`) || 'kanban';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem(`crm_view_mode_${entity}`, mode);
  };

  const fetchData = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const res = await getAll(entity, search);
      setRecords(res.data);
      setError(null);
    } catch (err) {
      setError('Could not load data. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  }, [entity, search, config]);

  useEffect(() => {
    setForm(config ? emptyFormFor(config.fields) : {});
    setEditingId(null);
    setShowForm(false);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  if (!config) {
    return (
      <Layout showAdd={false}>
        <p className="empty-row">Unknown module.</p>
      </Layout>
    );
  }

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
    const populated = {};
    config.fields.forEach((f) => {
      let val = record[f.name] ?? '';
      if (f.type === 'date' && val) val = String(val).substring(0, 10);
      populated[f.name] = val;
    });
    setForm(populated);
    setEditingId(record.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteRecord(entity, id);
      fetchData();
    } catch (err) {
      alert('Error deleting record');
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

    if (colName === 'due_amount') {
      const total = Number(record.amount || 0);
      const paid = Number(record.paid_amount || 0);
      const due = Math.max(0, total - paid);
      return (
        <span style={{ fontWeight: 800, color: due > 0 ? '#ef4444' : '#10b981' }}>
          ₹{due.toLocaleString('en-IN')}
        </span>
      );
    }

    if (val === null || val === undefined || val === '') return '-';

    // TYPE BADGE PILL
    if (colName === 'type' || colName === 'task_type') {
      const v = String(val).toLowerCase();
      let badgeStyle = { bg: 'rgba(99, 102, 241, 0.15)', text: '#6366f1', border: 'rgba(99, 102, 241, 0.3)', icon: '📋' };
      if (v.includes('call')) badgeStyle = { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.35)', icon: '📞' };
      if (v.includes('email')) badgeStyle = { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.35)', icon: '✉️' };
      if (v.includes('meet') || v.includes('appoint')) badgeStyle = { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.35)', icon: '📅' };
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
    if (colName === 'status' || colName === 'stage') {
      const v = String(val).toLowerCase();
      let badgeStyle = { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      if (v.includes('completed') || v.includes('won') || v.includes('paid') || v.includes('active') || v.includes('closed won')) {
        badgeStyle = { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.35)' };
      } else if (v.includes('pending') || v.includes('progress') || v.includes('open') || v.includes('contacted') || v.includes('proposal')) {
        badgeStyle = { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)' };
      } else if (v.includes('lost') || v.includes('cancel') || v.includes('overdue') || v.includes('unpaid')) {
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

    const field = config.fields.find((f) => f.name === colName);
    if (field?.type === 'date') return new Date(val).toLocaleDateString();
    if (field?.name === 'value' || field?.name === 'amount' || field?.name === 'paid_amount' || field?.name === 'total_amount' || field?.name === 'price' || field?.name === 'budget') {
      return `₹${Number(val).toLocaleString('en-IN')}`;
    }
    return val;
  };

  const handleExportCSV = () => {
    if (!records || records.length === 0) return alert('No data to export.');
    const headers = ['ID', ...config.columns];
    const rows = records.map(r => [
      r.id,
      ...config.columns.map(c => `"${String(r[c] || '').replace(/"/g, '""')}"`)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
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
                onClick={() => handleViewModeChange('kanban')}
                title="Kanban Board View"
              >
                <Icon name="grid" size={15} />
                <span>Kanban Board</span>
              </button>

              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('table')}
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
                  onClick={() => handleViewModeChange('graph')}
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
        <EntityGraphView config={config} entity={entity} records={records} />
      ) : (isDualViewModule && viewMode === 'kanban') ? (
        /* KANBAN BOARD VIEW */
        <KanbanBoard
          config={config}
          records={records}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onWhatsApp={setWhatsappRecipient}
          onPrintInvoice={(invoiceRec) => setSelectedInvoiceForPrint(invoiceRec)}
        />
      ) : (
        /* TABLE VIEW FORMAT */
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                {config.columns.map((c, cIdx) => <th key={`th-${c}-${cIdx}`}>{columnLabel(c)}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, rIdx) => (
                <tr
                  key={`row-${r.id || rIdx}-${rIdx}`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    // Prevent opening drawer if user clicks action button
                    if (e.target.closest('.table-actions')) return;
                    setDrawerRecord(r);
                  }}
                >
                  <td>{r.id}</td>
                  {config.columns.map((c, cIdx) => <td key={`td-${r.id || rIdx}-${c}-${cIdx}`}>{formatCell(r, c)}</td>)}
                  <td className="table-actions" onClick={(e) => e.stopPropagation()}>
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
                    <button className="btn-icon edit action-tooltip-btn" onClick={() => handleEdit(r)}>
                      <Icon name="edit" size={15} />
                      <span className="action-hover-tag">Edit</span>
                    </button>
                    <button className="btn-icon delete action-tooltip-btn" onClick={() => handleDelete(r.id)}>
                      <Icon name="trash" size={15} />
                      <span className="action-hover-tag">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={config.columns.length + 2} className="empty-row">No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-over Detail Drawer */}
      <SlideDrawer
        isOpen={Boolean(drawerRecord)}
        onClose={() => setDrawerRecord(null)}
        title={drawerRecord?.name || drawerRecord?.title || drawerRecord?.subject || `Record #${drawerRecord?.id}`}
        subtitle={drawerRecord?.email || drawerRecord?.company_name || drawerRecord?.status}
        record={drawerRecord}
        fields={config.fields}
        entity={entity}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onWhatsApp={setWhatsappRecipient}
        onPrintInvoice={setSelectedInvoiceForPrint}
        onPrintQuotation={setSelectedQuotationForPrint}
      />

      {whatsappRecipient && (
        <WhatsAppModal
          recipient={whatsappRecipient}
          onClose={() => setWhatsappRecipient(null)}
        />
      )}

      {selectedInvoiceForPrint && (
        <InvoicePrintModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}

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
