import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import {
  convertLeadWorkflow,
  dealToQuotationWorkflow,
  approveQuotationWorkflow,
  invoiceToProjectWorkflow,
  completeDeliveryWorkflow,
  dealToInvoiceWorkflow,
  bulkConvertLeadsWorkflow
} from '../api/api';
import { animateModalEnter } from '../utils/animations';

const WorkflowConvertModal = ({
  isOpen,
  onClose,
  type = 'convert_lead',
  record,
  onSuccess
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [successResult, setSuccessResult] = useState(null);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  const getNextRoute = useCallback(() => {
    switch (type) {
      case 'convert_lead':
      case 'bulk_convert_leads':
        return { path: '/deals', label: 'Deals Pipeline' };
      case 'deal_to_quote':
        return { path: '/quotations', label: 'Commercial Quotations' };
      case 'deal_to_invoice':
      case 'quote_to_invoice':
        return { path: '/invoices', label: 'Invoices & Payments' };
      case 'invoice_to_project':
        return { path: '/settings', label: 'Admin Workspace' };
      case 'complete_delivery':
        return { path: '/tickets', label: 'Support & Helpdesk' };
      default:
        return { path: '/dashboard', label: 'Dashboard' };
    }
  }, [type]);

  const handleDoneAndView = useCallback(() => {
    const next = getNextRoute();
    onClose();
    if (next?.path) {
      navigate(next.path);
    }
  }, [getNextRoute, onClose, navigate]);

  useEffect(() => {
    if (isOpen && record) {
      setSuccessResult(null);
      animateModalEnter(modalRef.current, overlayRef.current);

      if (type === 'convert_lead') {
        setFormData({
          lead_id: record.id,
          contact_name: record.lead_name || '',
          company_name: record.company_name || `${record.lead_name || 'Client'}'s Company`,
          email: record.email || '',
          phone: record.phone || '',
          designation: 'Decision Maker / Owner',
          industry: 'Technology & Services',
          deal_name: `${record.company_name || record.lead_name || 'Client'} - ${record.interested_in || 'Enterprise CRM'}`,
          deal_value: 350000,
          create_deal: true,
          create_task: true
        });
      } else if (type === 'deal_to_quote') {
        setFormData({
          deal_id: record.id,
          client_name: record.account_name || 'Valued Client',
          project_title: record.deal_name || 'Enterprise Project Solution',
          total_amount: Number(record.value || 250000),
          terms: '50% Advance on project kickoff, 50% upon final milestone delivery and UAT sign-off. GST 18% extra.'
        });
      } else if (type === 'quote_to_invoice') {
        setFormData({
          quotation_id: record.id,
          client_name: record.client_name || 'Client Name',
          total_amount: Number(record.total_amount || 250000)
        });
      } else if (type === 'invoice_to_project') {
        setFormData({
          invoice_id: record.id,
          client_name: record.client_account || 'Client Project',
          project_name: `${record.client_account || 'Enterprise'} Implementation`
        });
      } else if (type === 'complete_delivery') {
        setFormData({
          project_name: record.project_name || 'Beyond Gravity',
          client_name: record.client_name || record.project_name || 'Valued Client'
        });
      } else if (type === 'deal_to_invoice') {
        setFormData({
          deal_id: record.id,
          client_name: record.account_name || 'Valued Client',
          invoice_amount: Number(record.value || 250000),
          payment_mode: 'Bank Transfer',
          due_days: 15
        });
      } else if (type === 'bulk_convert_leads') {
        setFormData({
          lead_ids: Array.isArray(record) ? record.map((r) => r.id) : []
        });
      }
    }
  }, [isOpen, record, type]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || (!record && type !== 'bulk_convert_leads')) return null;

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleExecuteWorkflow = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (type === 'convert_lead') {
        res = await convertLeadWorkflow(formData);
      } else if (type === 'deal_to_quote') {
        res = await dealToQuotationWorkflow(formData);
      } else if (type === 'deal_to_invoice') {
        res = await dealToInvoiceWorkflow(formData);
      } else if (type === 'quote_to_invoice') {
        res = await approveQuotationWorkflow(formData);
      } else if (type === 'invoice_to_project') {
        res = await invoiceToProjectWorkflow(formData);
      } else if (type === 'complete_delivery') {
        res = await completeDeliveryWorkflow(formData);
      } else if (type === 'bulk_convert_leads') {
        res = await bulkConvertLeadsWorkflow(formData);
      }

      setSuccessResult(res.data);
      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      alert('Workflow action failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getModalMeta = () => {
    switch (type) {
      case 'convert_lead':
        return {
          title: '⚡ 1-Click Lead Conversion',
          badge: 'STAGE 1 ➔ STAGE 2',
          badgeColor: '#3b82f6',
          description: 'Convert this lead into a permanent Contact, Account, and Qualified Pipeline Deal in one shot.',
          btnText: 'Convert Lead Now'
        };
      case 'bulk_convert_leads':
        return {
          title: '⚡ Mass Lead ➔ Contacts & Deals Conversion',
          badge: 'BULK AUTOMATION',
          badgeColor: '#6366f1',
          description: 'Instantly convert un-converted leads into verified Contacts, Accounts, Active Deals & Follow-up Tasks in one click.',
          btnText: 'Convert All Leads Now'
        };
      case 'deal_to_quote':
        return {
          title: '📄 Generate Commercial Quotation',
          badge: 'STAGE 2: SALES',
          badgeColor: '#10b981',
          description: 'Create an official Commercial Quotation with GST tax calculations and proposal terms.',
          btnText: 'Generate Quotation'
        };
      case 'deal_to_invoice':
        return {
          title: '🧾 Won Deal ➔ Generate Tax Invoice',
          badge: 'STAGE 2: SALES ➔ FINANCE',
          badgeColor: '#10b981',
          description: 'Mark this deal as Closed Won (100% Probability) and issue an official Tax Invoice immediately.',
          btnText: 'Generate Tax Invoice'
        };
      case 'quote_to_invoice':
        return {
          title: '🧾 Approve & Generate Tax Invoice',
          badge: 'STAGE 2: FINANCE',
          badgeColor: '#f59e0b',
          description: 'Approve this quotation, mark linked Deal as Closed Won, and issue a formal Tax Invoice.',
          btnText: 'Approve & Issue Invoice'
        };
      case 'invoice_to_project':
        return {
          title: '🚀 Launch Project Workspace',
          badge: 'STAGE 3: OPERATIONS',
          badgeColor: '#8b5cf6',
          description: 'Provision Sprint Tasks on the Agile Kanban Board and set payment to Paid.',
          btnText: 'Launch Project Workspace'
        };
      case 'complete_delivery':
        return {
          title: '🎉 Complete Delivery & Setup Support/AMC',
          badge: 'STAGE 4: CLIENT SUCCESS',
          badgeColor: '#ec4899',
          description: 'Mark project deliverables as DONE, open a warranty Support Ticket, and schedule 1-Year AMC Renewal.',
          btnText: 'Complete Delivery & Setup AMC'
        };
      default:
        return {
          title: 'Workflow Action',
          badge: 'WORKFLOW',
          badgeColor: '#6366f1',
          description: 'Execute automated workflow transition.',
          btnText: 'Execute'
        };
    }
  };

  const meta = getModalMeta();

  // Unified input field styles for consistent look on all devices
  const inputStyle = {
    width: '100%',
    background: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    borderRadius: '8px',
    color: '#f8fafc',
    padding: '10px 14px',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#cbd5e1',
    marginBottom: '6px',
    letterSpacing: '0.01em'
  };

  return ReactDOM.createPortal(
    <div
      className="workflow-modal-overlay"
      ref={overlayRef}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 15, 29, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
    >
      <div
        className="workflow-modal-container"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          margin: 'auto'
        }}
      >
        {/* Sticky Header Bar */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.99))',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          flexShrink: 0
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{
                background: meta.badgeColor,
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: '20px'
              }}>
                {meta.badge}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              {meta.title}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>
              {meta.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.2s, color 0.2s'
            }}
            aria-label="Close dialog"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          flex: 1,
          maxHeight: 'calc(90vh - 150px)',
          background: '#0f172a'
        }}>
          {successResult ? (
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid rgba(16, 185, 129, 0.5)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 30,
                fontWeight: 700,
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
                Workflow Completed Successfully!
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
                {successResult.message}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  Stay on Current Page
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDoneAndView}
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    background: meta.badgeColor || '#2563eb',
                    borderColor: meta.badgeColor || '#2563eb',
                    boxShadow: `0 4px 16px ${meta.badgeColor}50`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer'
                  }}
                >
                  <span>Go to {getNextRoute().label}</span>
                  <Icon name="arrowRight" size={15} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleExecuteWorkflow}>
              {/* Type: Convert Lead */}
              {type === 'convert_lead' && (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 10,
                    marginBottom: 18
                  }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 10, padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: 700, display: 'block' }}>1. CONTACT</span>
                      <strong style={{ fontSize: '0.82rem', color: '#f8fafc', display: 'block', marginTop: 2, wordBreak: 'break-word' }}>{formData.contact_name}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Client Contact</span>
                    </div>

                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 10, padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 700, display: 'block' }}>2. COMPANY</span>
                      <strong style={{ fontSize: '0.82rem', color: '#f8fafc', display: 'block', marginTop: 2, wordBreak: 'break-word' }}>{formData.company_name}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Account Profile</span>
                    </div>

                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: 10, padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#a78bfa', fontWeight: 700, display: 'block' }}>3. PIPELINE DEAL</span>
                      <strong style={{ fontSize: '0.82rem', color: '#f8fafc', display: 'block', marginTop: 2 }}>₹{Number(formData.deal_value || 0).toLocaleString('en-IN')}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Stage: Qualified</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Deal / Opportunity Title</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={formData.deal_name || ''}
                      onChange={(e) => handleInputChange('deal_name', e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Estimated Deal Value (₹)</label>
                      <input
                        type="number"
                        style={inputStyle}
                        value={formData.deal_value || ''}
                        onChange={(e) => handleInputChange('deal_value', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Contact Designation</label>
                      <input
                        type="text"
                        style={inputStyle}
                        value={formData.designation || ''}
                        onChange={(e) => handleInputChange('designation', e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px 14px', borderRadius: 8, marginTop: 6, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: '#e2e8f0', cursor: 'pointer', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={formData.create_task ?? true}
                        onChange={(e) => handleInputChange('create_task', e.target.checked)}
                        style={{ accentColor: '#3b82f6', width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <span>Automatically schedule a <strong>Discovery Call Follow-up Task</strong> in 2 days</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Type: Deal to Quotation */}
              {type === 'deal_to_quote' && (
                <div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Client / Company Name</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={formData.client_name || ''}
                      onChange={(e) => handleInputChange('client_name', e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Project Scope / Proposal Title</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={formData.project_title || ''}
                      onChange={(e) => handleInputChange('project_title', e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Quotation Total (₹)</label>
                    <input
                      type="number"
                      style={inputStyle}
                      value={formData.total_amount || ''}
                      onChange={(e) => handleInputChange('total_amount', e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Type: Deal to Invoice */}
              {type === 'deal_to_invoice' && (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 10,
                    marginBottom: 16
                  }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 10, padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 700, display: 'block' }}>STAGE UPDATE</span>
                      <strong style={{ fontSize: '0.82rem', color: '#f8fafc', display: 'block', marginTop: 2 }}>Closed Won (100%)</strong>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Pipeline Won</span>
                    </div>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 10, padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: 700, display: 'block' }}>INVOICE TOTAL</span>
                      <strong style={{ fontSize: '0.82rem', color: '#f8fafc', display: 'block', marginTop: 2 }}>₹{Number(formData.invoice_amount || 0).toLocaleString('en-IN')}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tax Invoice</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Client / Company Account</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={formData.client_name || ''}
                      onChange={(e) => handleInputChange('client_name', e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Invoice Amount (₹)</label>
                      <input
                        type="number"
                        style={inputStyle}
                        value={formData.invoice_amount || ''}
                        onChange={(e) => handleInputChange('invoice_amount', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Payment Method</label>
                      <select
                        style={inputStyle}
                        value={formData.payment_mode || 'Bank Transfer'}
                        onChange={(e) => handleInputChange('payment_mode', e.target.value)}
                      >
                        <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                        <option value="UPI">UPI / Instant Pay</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Credit Card">Credit / Debit Card</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Type: Bulk Convert Leads */}
              {type === 'bulk_convert_leads' && (
                <div>
                  <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <h4 style={{ margin: '0 0 6px', color: '#818cf8', fontSize: '0.95rem' }}>⚡ 1-Click Mass Lead Conversion</h4>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      This automation will instantly process all un-converted leads in your pipeline, auto-create verified <strong>Contacts</strong>, company <strong>Accounts</strong>, active <strong>Pipeline Deals</strong> (₹3,50,000 in Qualified stage), and schedule immediate <strong>Discovery Call Tasks</strong>!
                    </p>
                  </div>
                </div>
              )}

              {/* Type: Quotation to Invoice */}
              {type === 'quote_to_invoice' && (
                <div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>Quotation Reference:</span>
                      <strong style={{ color: '#fff', fontSize: '0.88rem' }}>#{record.quotation_number || record.id}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Client:</span>
                      <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{record.client_name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Amount:</span>
                      <strong style={{ color: '#10b981', fontSize: '1rem' }}>₹{Number(record.total_amount || 0).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
                    Clicking below will set Quotation status to <strong>Accepted</strong>, update the Deal to <strong>Closed Won (100%)</strong>, and generate a printable <strong>Tax Invoice</strong>.
                  </p>
                </div>
              )}

              {/* Type: Invoice to Project */}
              {type === 'invoice_to_project' && (
                <div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Project Workspace Name</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={formData.project_name || ''}
                      onChange={(e) => handleInputChange('project_name', e.target.value)}
                      required
                    />
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 10, lineHeight: 1.45 }}>
                    This will provision <strong>5 Agile Sprint Deliverables</strong> (Kickoff, Core Dev, Integrations, QA, Go-Live) on your Sprint Board.
                  </p>
                </div>
              )}

              {/* Type: Complete Delivery */}
              {type === 'complete_delivery' && (
                <div>
                  <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                    <h4 style={{ margin: '0 0 6px', color: '#f472b6', fontSize: '0.92rem' }}>Ready to deliver {formData.project_name}?</h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                      All active sprint tasks will be marked <strong>DONE</strong>, a 30-day onboarding <strong>Support Ticket</strong> will be assigned, and an <strong>Annual Maintenance Contract (AMC) Deal</strong> will be scheduled 1 year out.
                    </p>
                  </div>
                </div>
              )}

              {/* Sticky Modal Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 20,
                paddingTop: 14,
                borderTop: '1px solid rgba(148, 163, 184, 0.15)'
              }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: meta.badgeColor,
                    borderColor: meta.badgeColor,
                    padding: '8px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>{meta.btnText}</span>
                      <Icon name="arrowRight" size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WorkflowConvertModal;
