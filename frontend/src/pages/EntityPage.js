import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import KanbanBoard from '../components/KanbanBoard';
import EntityGraphView from '../components/EntityGraphView';
import WhatsAppModal from '../components/WhatsAppModal';
import InvoicePrintModal from '../components/InvoicePrintModal';
import entityConfig from '../config/entityConfig';
import { getAll, createRecord, updateRecord, deleteRecord } from '../api/api';

const emptyFormFor = (fields) => {
  const obj = {};
  fields.forEach((f) => (obj[f.name] = ''));
  return obj;
};

const EntityPage = () => {
  const { entity } = useParams();
  const config = entityConfig[entity];

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(config ? emptyFormFor(config.fields) : {});
  const [search, setSearch] = useState('');
  const [whatsappRecipient, setWhatsappRecipient] = useState(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('crm_view_mode') || 'kanban';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('crm_view_mode', mode);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, search]);

  useEffect(() => {
    setForm(config ? emptyFormFor(config.fields) : {});
    setEditingId(null);
    setShowForm(false);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300); // debounce search
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateRecord(entity, editingId, form);
      } else {
        await createRecord(entity, form);
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
    const targetRecord = records.find((r) => r.id === recordId);
    if (!targetRecord) return;
    const statusField = config.statusField || 'status';
    if (targetRecord[statusField] === newStatus) return;

    // Optimistic UI update
    const updatedRecords = records.map((r) =>
      r.id === recordId ? { ...r, [statusField]: newStatus } : r
    );
    setRecords(updatedRecords);

    try {
      await updateRecord(entity, recordId, {
        ...targetRecord,
        [statusField]: newStatus
      });
    } catch (err) {
      console.error('Error updating status:', err);
      fetchData(); // Rollback on failure
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
    setForm(emptyFormFor(config.fields));
    setEditingId(null);
    setShowForm(true);
  };

  const columnLabel = (colName) => {
    const f = config.fields.find((x) => x.name === colName);
    return f ? f.label : colName;
  };

  const formatCell = (val, colName) => {
    if (val === null || val === undefined || val === '') return '-';
    const field = config.fields.find((f) => f.name === colName);
    if (field?.type === 'date') return new Date(val).toLocaleDateString();
    if (field?.name === 'value' || field?.name === 'amount' || field?.name === 'price' || field?.name === 'budget') {
      return `₹${Number(val).toLocaleString()}`;
    }
    return val;
  };

  return (
    <Layout showAdd onAddClick={openAddForm} searchValue={search} onSearchChange={setSearch}>
      <div className="dashboard-toolbar">
        <div className="toolbar-left-info">
          <p>{records.length} record(s) found</p>
        </div>

        {/* View Switcher: Kanban Board vs Table View */}
        <div className="toolbar-right-actions">
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
              title="Table Grid View"
            >
              <Icon name="menu" size={15} />
              <span>Table View</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'graph' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('graph')}
              title="Graph Analytics View"
            >
              <Icon name="chart" size={15} />
              <span>Graph View</span>
            </button>
          </div>

          <button type="button" className="btn btn-primary" onClick={openAddForm}>
            + Add New
          </button>
        </div>
      </div>

      {showForm && (
        <form className="employee-form" onSubmit={handleSubmit}>
          <div className="form-row">
            {config.fields.map((f) => (
              <div className="form-group" key={f.name} style={f.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
                <label>{f.label}{f.required && ' *'}</label>
                {f.type === 'select' ? (
                  <select name={f.name} value={form[f.name]} onChange={handleChange} required={f.required}>
                    <option value="">Select {f.label}</option>
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea name={f.name} rows="3" value={form[f.name]} onChange={handleChange} />
                ) : (
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    required={f.required}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Save'}</button>
            <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
          </div>
        </form>
      )}

      {error && <p className="form-status error">{error}</p>}

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : viewMode === 'graph' ? (
        /* GRAPH ANALYTICS VIEW */
        <EntityGraphView config={config} entity={entity} records={records} />
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
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
        /* TABLE VIEW */
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                {config.columns.map((c) => <th key={c}>{columnLabel(c)}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  {config.columns.map((c) => <td key={c}>{formatCell(r[c], c)}</td>)}
                  <td className="table-actions">
                    {r.phone && (
                      <button className="btn-icon whatsapp" onClick={() => setWhatsappRecipient(r)} title="Send WhatsApp Message">
                        <Icon name="whatsapp" size={14} /> WhatsApp
                      </button>
                    )}
                    {(r.invoice_number || entity === 'invoices') && (
                      <button className="btn-icon invoice-btn" onClick={() => setSelectedInvoiceForPrint(r)} title="Print GST Invoice">
                        <Icon name="invoice" size={14} /> Invoice
                      </button>
                    )}
                    <button className="btn-icon edit" onClick={() => handleEdit(r)}><Icon name="edit" size={14} /> Edit</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(r.id)}><Icon name="trash" size={14} /> Delete</button>
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
    </Layout>
  );
};

export default EntityPage;

