import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Icon from './Icon';
import { ingestLeadWebhook } from '../api/api';
import { animateModalEnter } from '../utils/animations';

const LeadWebhookModal = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'code'
  const [copiedType, setCopiedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  const [formData, setFormData] = useState({
    name: 'Kavita Rao',
    company: 'Nova Dynamics Technologies',
    email: 'kavita.rao@novadynamics.io',
    phone: '9876511223',
    service: 'Enterprise CRM Suite & Automation',
    budget: '750000',
    source: 'Website Contact Form',
    message: 'Looking for a custom multi-stage sales pipeline, automated GST invoicing, and WhatsApp workflow integrations for a team of 45 reps.'
  });

  const webhookUrl = 'http://localhost:5001/api/workflow/lead-webhook';

  const presets = [
    {
      label: '🌟 Enterprise Tech Client',
      name: 'Kavita Rao',
      company: 'Nova Dynamics Technologies',
      email: 'kavita.rao@novadynamics.io',
      phone: '9876511223',
      service: 'Enterprise Cloud CRM Platform',
      budget: '750000',
      source: 'Google Organic Search',
      message: 'Need full sales lifecycle automation and multi-department team management.'
    },
    {
      label: '🚀 Logistics High-Growth',
      name: 'Vikram Sengupta',
      company: 'Apex Global Logistics',
      email: 'vikram@apexlogistics.com',
      phone: '9820033445',
      service: 'Automated Sales Pipeline & Invoicing',
      budget: '450000',
      source: 'LinkedIn Campaign',
      message: 'Require fast quotation-to-invoice billing and task tracking for regional managers.'
    },
    {
      label: '🏥 Healthcare Group',
      name: 'Dr. Ananya Sharma',
      company: 'OmniHealth Hospital Network',
      email: 'ananya@omnihealth.in',
      phone: '9988776655',
      service: 'Customer Care & Support Helpdesk Suite',
      budget: '1200000',
      source: 'Website Inbound Form',
      message: 'Need 24/7 patient inquiries management, ticket routing, and SLA tracking.'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      animateModalEnter(modalRef.current, overlayRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handlePresetSelect = (preset) => {
    setFormData({
      name: preset.name,
      company: preset.company,
      email: preset.email,
      phone: preset.phone,
      service: preset.service,
      budget: preset.budget,
      source: preset.source,
      message: preset.message
    });
  };

  const handleSubmitSimulation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await ingestLeadWebhook(formData);
      setResult(res.data);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      alert('Failed to trigger webhook: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const curlCode = `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "${formData.name}",
    "company": "${formData.company}",
    "email": "${formData.email}",
    "phone": "${formData.phone}",
    "service": "${formData.service}",
    "budget": ${formData.budget || 500000},
    "source": "Website Contact Form",
    "message": "${formData.message.replace(/"/g, '\\"')}"
  }'`;

  const jsFetchCode = `fetch('${webhookUrl}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '${formData.name}',
    company: '${formData.company}',
    email: '${formData.email}',
    phone: '${formData.phone}',
    service: '${formData.service}',
    budget: ${formData.budget || 500000},
    source: 'Website Landing Page'
  })
})
.then(res => res.json())
.then(data => console.log('Lead Ingested:', data));`;

  return ReactDOM.createPortal(
    <div
      className="lead-webhook-modal-overlay"
      ref={overlayRef}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 15, 29, 0.84)',
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
        className="lead-webhook-modal-container"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          borderRadius: '18px',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
          margin: 'auto'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.99))',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                background: '#10b981',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: '20px'
              }}>
                PUBLIC API &amp; WEBHOOK
              </span>
              <span style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '20px',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                ZERO-CONFIG INGESTION
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              📥 Inbound Lead Webhook &amp; Simulator
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              Connect external contact forms, landing pages, and marketing funnels directly into your CRM.
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
              justifyContent: 'center'
            }}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '0 24px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            style={{
              padding: '12px 18px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: activeTab === 'simulator' ? '#60a5fa' : '#94a3b8',
              borderBottom: activeTab === 'simulator' ? '2px solid #3b82f6' : '2px solid transparent',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>⚡ Interactive Simulator</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            style={{
              padding: '12px 18px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: activeTab === 'code' ? '#60a5fa' : '#94a3b8',
              borderBottom: activeTab === 'code' ? '2px solid #3b82f6' : '2px solid transparent',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>💻 API Docs &amp; Snippets</span>
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          flex: 1,
          maxHeight: 'calc(92vh - 160px)',
          background: '#0f172a'
        }}>
          {/* Webhook Endpoint Banner */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{ background: '#22c55e', color: '#000', fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                POST
              </span>
              <code style={{ fontSize: '0.82rem', color: '#e2e8f0', wordBreak: 'break-all' }}>
                {webhookUrl}
              </code>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleCopy(webhookUrl, 'url')}
              style={{ flexShrink: 0, padding: '4px 10px', fontSize: '0.75rem' }}
            >
              {copiedType === 'url' ? '✓ Copied' : 'Copy URL'}
            </button>
          </div>

          {activeTab === 'simulator' && (
            <div>
              {/* Presets */}
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                  Quick Test Presets:
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePresetSelect(p)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#f8fafc',
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitSimulation}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', color: '#fff', border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: 8, padding: '8px 12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>Company / Organization</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', color: '#fff', border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: 8, padding: '8px 12px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', color: '#fff', border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: 8, padding: '8px 12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', color: '#fff', border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: 8, padding: '8px 12px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>Service of Interest</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', color: '#fff', border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: 8, padding: '8px 12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>Estimated Budget (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', color: '#fff', border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: 8, padding: '8px 12px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>Inquiry Message / Scope</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', color: '#fff', border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: 8, padding: '8px 12px', resize: 'vertical' }}
                  />
                </div>

                {/* Result notification */}
                {result && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#10b981', fontWeight: 800 }}>✓ Live Ingestion Success:</span>
                        <strong style={{ color: '#f8fafc', fontSize: '0.85rem' }}>Lead #{result.data?.leadId} Captured</strong>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                        Lead Quality Score: <strong style={{ color: '#38bdf8' }}>{result.data?.qualityScore}/100</strong> • Urgent follow-up task #{result.data?.taskId} created.
                      </p>
                    </div>
                    <span style={{ background: '#10b981', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: 20 }}>
                      Live in Queue
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      borderColor: '#10b981',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    {loading ? 'Ingesting Lead...' : '⚡ Fire Live Webhook (1-Click Test)'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'code' && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>cURL Command</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopy(curlCode, 'curl')}
                    style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                  >
                    {copiedType === 'curl' ? '✓ Copied' : 'Copy cURL'}
                  </button>
                </div>
                <pre style={{
                  background: '#020617',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: '0.75rem',
                  color: '#38bdf8',
                  overflowX: 'auto',
                  fontFamily: 'monospace'
                }}>
                  {curlCode}
                </pre>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>JavaScript / Frontend Fetch (WordPress / Webflow / Next.js)</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopy(jsFetchCode, 'js')}
                    style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                  >
                    {copiedType === 'js' ? '✓ Copied' : 'Copy JS'}
                  </button>
                </div>
                <pre style={{
                  background: '#020617',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: '0.75rem',
                  color: '#a78bfa',
                  overflowX: 'auto',
                  fontFamily: 'monospace'
                }}>
                  {jsFetchCode}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LeadWebhookModal;
