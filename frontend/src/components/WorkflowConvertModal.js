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
import { useTheme } from '../context/ThemeContext';

const WorkflowConvertModal = ({
  isOpen,
  onClose,
  type = 'convert_lead',
  record,
  onSuccess
}) => {
  const { isDark } = useTheme();
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
        return { path: '/tasks', label: 'Tasks' };
      case 'complete_delivery':
        return { path: '/tasks', label: 'Tasks' };
      default:
        return { path: '/dashboard', label: 'Dashboard' };
    }
  }, [type]);

  const handleDoneAndView = useCallback(() => {
    const next = getNextRoute();
    onClose();
    navigate(next.path);
  }, [getNextRoute, onClose, navigate]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSuccessResult(null);
      animateModalEnter(modalRef.current, overlayRef.current);

      // Pre-fill form data based on workflow type
      if (type === 'convert_lead' && record) {
        setFormData({
          lead_id: record.id,
          contact_name: record.name || '',
          contact_email: record.email || '',
          contact_phone: record.phone || '',
          company_name: record.company || `${record.name || 'Lead'} Enterprise`,
          deal_name: `${record.company || record.name || 'Opportunity'} - Core Service`,
          deal_value: record.budget || record.value || 500000,
          create_task: true,
          assignee_id: record.assigned_to || 1
        });
      } else if (type === 'deal_to_quote' && record) {
        setFormData({
          deal_id: record.id,
          title: `Quotation for ${record.name || record.title || 'Deal'}`,
          client_id: record.client_id || record.account_id || 1,
          total_amount: record.value || record.amount || 250000,
          tax_amount: (Number(record.value || record.amount || 250000) * 0.18),
          grand_total: (Number(record.value || record.amount || 250000) * 1.18),
          valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          terms: 'Standard net 30 days. Delivery starts upon initial PO sign-off.'
        });
      } else if (type === 'deal_to_invoice' && record) {
        setFormData({
          deal_id: record.id,
          title: `Tax Invoice for ${record.name || record.title || 'Deal'}`,
          client_id: record.client_id || record.account_id || 1,
          total_amount: record.value || record.amount || 250000,
          tax_amount: (Number(record.value || record.amount || 250000) * 0.18),
          grand_total: (Number(record.value || record.amount || 250000) * 1.18),
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          notes: 'Invoice generated directly from closed pipeline deal.'
        });
      } else if (type === 'quote_to_invoice' && record) {
        setFormData({
          quotation_id: record.id,
          title: `Invoice #${record.quotation_number || record.id} - ${record.title || 'Approved Quote'}`,
          client_id: record.client_id || 1,
          total_amount: record.total_amount || 250000,
          tax_amount: record.tax_amount || (Number(record.total_amount || 250000) * 0.18),
          grand_total: record.grand_total || (Number(record.total_amount || 250000) * 1.18),
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          notes: 'Automated invoice generated from approved quotation.'
        });
      } else if (type === 'invoice_to_project' && record) {
        setFormData({
          invoice_id: record.id,
          name: `Project: ${record.title || record.invoice_number || 'New Engagement'}`,
          client_id: record.client_id || 1,
          budget: record.total_amount || record.grand_total || 250000,
          start_date: new Date().toISOString().slice(0, 10),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          status: 'Active',
          description: `Kickoff generated automatically from paid invoice #${record.invoice_number || record.id}.`
        });
      } else if (type === 'complete_delivery' && record) {
        setFormData({
          project_id: record.id,
          resolution_notes: `Delivery milestone successfully verified and handed over for ${record.name || 'Project'}.`,
          create_support_ticket: true,
          satisfaction_score: 5
        });
      } else if (type === 'bulk_convert_leads') {
        setFormData({
          default_deal_value: 350000,
          auto_create_tasks: true
        });
      }
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, type, record]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
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
          submitLabel: 'Convert Lead to Deal & Account'
        };
      case 'deal_to_quote':
        return {
          title: '📄 Generate Official Quotation',
          badge: 'STAGE 2 ➔ STAGE 3',
          badgeColor: '#8b5cf6',
          description: 'Create a GST-compliant commercial quotation directly from this active deal.',
          submitLabel: 'Generate & Lock Quotation'
        };
      case 'deal_to_invoice':
        return {
          title: '💳 Generate Direct Tax Invoice',
          badge: 'DEAL ➔ INVOICE',
          badgeColor: '#10b981',
          description: 'Issue an immediate billing invoice from this closed/won opportunity.',
          submitLabel: 'Generate Tax Invoice'
        };
      case 'quote_to_invoice':
        return {
          title: '💳 Approve Quote & Issue Invoice',
          badge: 'STAGE 3 ➔ STAGE 4',
          badgeColor: '#10b981',
          description: 'Mark this quotation as Approved and generate a numbered tax invoice automatically.',
          submitLabel: 'Approve & Issue Invoice'
        };
      case 'invoice_to_project':
        return {
          title: '🚀 Launch Execution Project',
          badge: 'STAGE 4 ➔ STAGE 5',
          badgeColor: '#f59e0b',
          description: 'Kick off delivery operations and populate team tasks for this paid invoice.',
          submitLabel: 'Kick Off Delivery Project'
        };
      case 'complete_delivery':
        return {
          title: '🏆 Mark Delivery & Handover Complete',
          badge: 'STAGE 5 ➔ STAGE 6',
          badgeColor: '#ec4899',
          description: 'Complete project delivery, archive sprint tasks, and open a post-delivery support SLA ticket.',
          submitLabel: 'Complete Project Delivery'
        };
      case 'bulk_convert_leads':
        return {
          title: '⚡ Bulk Convert All Unconverted Leads',
          badge: 'MASS AUTOMATION',
          badgeColor: '#3b82f6',
          description: 'Process all qualified leads in your pipeline into Contacts, Accounts, and Deals simultaneously.',
          submitLabel: 'Execute Mass Conversion'
        };
      default:
        return {
          title: '⚡ Workflow Automation',
          badge: 'WORKFLOW',
          badgeColor: '#2563eb',
          description: 'Execute the next stage in this business pipeline.',
          submitLabel: 'Execute Stage'
        };
    }
  };

  const meta = getModalMeta();

  // Dynamic Theme Tokens
  const containerBg = isDark ? '#0f172a' : '#ffffff';
  const headerBg = isDark ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.99))' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
  const bodyBg = isDark ? '#0f172a' : '#ffffff';
  const inputBg = isDark ? 'rgba(30, 41, 59, 0.7)' : '#f8fafc';
  const inputBorder = isDark ? 'rgba(148, 163, 184, 0.25)' : '#cbd5e1';
  const inputColor = isDark ? '#f8fafc' : '#0f172a';
  const labelColor = isDark ? '#cbd5e1' : '#334155';
  const titleColor = isDark ? '#f8fafc' : '#0f172a';
  const subtextColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? 'rgba(148, 163, 184, 0.2)' : '#e2e8f0';

  // Unified input field styles for consistent look on all devices
  const inputStyle = {
    width: '100%',
    background: inputBg,
    border: `1px solid ${inputBorder}`,
    borderRadius: '8px',
    color: inputColor,
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
    color: labelColor,
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
        backgroundColor: isDark ? 'rgba(10, 15, 29, 0.82)' : 'rgba(255, 255, 255, 0.6)',
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
          backgroundColor: containerBg,
          color: titleColor,
          borderRadius: '16px',
          border: `1px solid ${borderColor}`,
          boxShadow: isDark ? '0 25px 60px -15px rgba(0, 0, 0, 0.7)' : '0 20px 45px rgba(0, 0, 0, 0.12)',
          overflow: 'hidden',
          margin: 'auto'
        }}
      >
        {/* Sticky Header Bar */}
        <div style={{
          background: headerBg,
          padding: '20px 24px',
          borderBottom: `1px solid ${borderColor}`,
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: titleColor, letterSpacing: '-0.02em' }}>
              {meta.title}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: subtextColor, lineHeight: 1.4 }}>
              {meta.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              border: 'none',
              borderRadius: '8px',
              color: subtextColor,
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
          background: bodyBg
        }}>
          {successResult ? (
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.12)',
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
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: titleColor, marginBottom: 8 }}>
                Workflow Completed Successfully!
              </h3>
              <p style={{ fontSize: '0.88rem', color: subtextColor, maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
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
                    <div style={{ background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)', border: isDark ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 10, padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#3b82f6', fontWeight: 700, display: 'block' }}>1. CONTACT</span>
                      <strong style={{ fontSize: '0.82rem', color: titleColor, display: 'block', marginTop: 2, wordBreak: 'break-word' }}>{formData.contact_name}</strong>
                      <span style={{ fontSize: '0.7rem', color: subtextColor }}>Client Contact</span>
                    </div>

                    <div style={{ background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)', border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 10, padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, display: 'block' }}>2. COMPANY</span>
                      <strong style={{ fontSize: '0.82rem', color: titleColor, display: 'block', marginTop: 2, wordBreak: 'break-word' }}>{formData.company_name}</strong>
                      <span style={{ fontSize: '0.7rem', color: subtextColor }}>Account Profile</span>
                    </div>

                    <div style={{ background: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)', border: isDark ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 10, padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#8b5cf6', fontWeight: 700, display: 'block' }}>3. PIPELINE DEAL</span>
                      <strong style={{ fontSize: '0.82rem', color: titleColor, display: 'block', marginTop: 2 }}>₹{Number(formData.deal_value || 0).toLocaleString('en-IN')}</strong>
                      <span style={{ fontSize: '0.7rem', color: subtextColor }}>Stage: Qualified</span>
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

                  <div style={{ background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc', padding: '12px 14px', borderRadius: 8, marginTop: 6, border: `1px solid ${borderColor}` }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: titleColor, cursor: 'pointer', margin: 0 }}>
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
                    <div style={{ background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)', border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 10, padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, display: 'block' }}>STAGE UPDATE</span>
                      <strong style={{ fontSize: '0.82rem', color: titleColor, display: 'block', marginTop: 2 }}>Closed Won (100%)</strong>
                      <span style={{ fontSize: '0.7rem', color: subtextColor }}>Pipeline Won</span>
                    </div>
                    <div style={{ background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)', border: isDark ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 10, padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#3b82f6', fontWeight: 700, display: 'block' }}>INVOICE TOTAL</span>
                      <strong style={{ fontSize: '0.82rem', color: titleColor, display: 'block', marginTop: 2 }}>₹{Number(formData.invoice_amount || 0).toLocaleString('en-IN')}</strong>
                      <span style={{ fontSize: '0.7rem', color: subtextColor }}>Tax Invoice</span>
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
                  <div style={{ background: isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)', border: isDark ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <h4 style={{ margin: '0 0 6px', color: '#6366f1', fontSize: '0.95rem' }}>⚡ 1-Click Mass Lead Conversion</h4>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: subtextColor, lineHeight: 1.5 }}>
                      This automation will instantly process all un-converted leads in your pipeline, auto-create verified <strong>Contacts</strong>, company <strong>Accounts</strong>, active <strong>Pipeline Deals</strong> (₹3,50,000 in Qualified stage), and schedule immediate <strong>Discovery Call Tasks</strong>!
                    </p>
                  </div>
                </div>
              )}

              {/* Type: Quotation to Invoice */}
              {type === 'quote_to_invoice' && (
                <div>
                  <div style={{ background: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)', border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>Quotation Reference:</span>
                      <strong style={{ color: titleColor, fontSize: '0.88rem' }}>#{record.quotation_number || record.id}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.8rem', color: subtextColor }}>Client:</span>
                      <strong style={{ color: titleColor, fontSize: '0.88rem' }}>{record.client_name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: subtextColor }}>Total Amount:</span>
                      <strong style={{ color: '#10b981', fontSize: '1rem' }}>₹{Number(record.total_amount || 0).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: subtextColor, margin: 0, lineHeight: 1.45 }}>
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
                  <p style={{ fontSize: '0.82rem', color: subtextColor, marginBottom: 10, lineHeight: 1.45 }}>
                    This will provision <strong>5 Agile Sprint Deliverables</strong> (Kickoff, Core Dev, Integrations, QA, Go-Live) on your Sprint Board.
                  </p>
                </div>
              )}

              {/* Type: Complete Delivery */}
              {type === 'complete_delivery' && (
                <div>
                  <div style={{ background: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.08)', border: isDark ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid rgba(236, 72, 153, 0.2)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                    <h4 style={{ margin: '0 0 6px', color: '#ec4899', fontSize: '0.92rem' }}>Ready to deliver {formData.project_name}?</h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: subtextColor, lineHeight: 1.45 }}>
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
                borderTop: `1px solid ${borderColor}`
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 600
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
                      <span>{meta.btnText || meta.submitLabel || 'Execute'}</span>
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
