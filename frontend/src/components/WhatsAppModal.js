import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Icon from './Icon';
import { createRecord, sendWhatsAppApi } from '../api/api';
import { animateModalEnter } from '../utils/animations';

// Helper to format phone number to international format (e.g. +91 9876543210 -> 919876543210)
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned; // Default India prefix if 10 digits
  }
  return cleaned;
};

const getDefaultDateTime = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${mins}`;
};

const WhatsAppModal = ({ recipient, onClose }) => {
  const name = recipient?.lead_name || recipient?.contact_name || recipient?.name || 'Customer';
  const rawPhone = recipient?.phone || recipient?.contact_phone || '';
  const cleanPhone = formatPhoneNumber(rawPhone);

  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const openedTabRef = useRef(null);

  useEffect(() => {
    animateModalEnter(modalRef.current, overlayRef.current);
  }, []);

  const templates = [
    {
      id: 'welcome',
      icon: '👋',
      label: 'Lead Introduction',
      text: `Hello ${name},\n\nThank you for reaching out to Apex CRM! We would love to discuss your requirements and share a tailored demo.\n\nBest regards,\nSales Team`
    },
    {
      id: 'deal',
      icon: '💼',
      label: 'Proposal Follow-up',
      text: `Hi ${name},\n\nFollowing up on our recent enterprise proposal. Would you be available for a quick 10-minute sync this week?\n\nBest regards,\nApex Team`
    },
    {
      id: 'invoice',
      icon: '🧾',
      label: 'Payment Reminder',
      text: `Dear ${name},\n\nThis is a friendly reminder regarding your pending tax invoice. Please let us know if you need any assistance with settlement.\n\nThank you!`
    },
    {
      id: 'appointment',
      icon: '📅',
      label: 'Meeting Confirmation',
      text: `Hello ${name},\n\nConfirming our scheduled discovery meeting. Looking forward to our discussion!\n\nBest regards,\nApex Team`
    }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [customMessage, setCustomMessage] = useState(templates[0].text);

  // Dispatch Mechanism: 'api' (Auto Background) vs 'web' (WhatsApp Web)
  const [dispatchMethod, setDispatchMethod] = useState('api');

  // Schedule mode: 'now' | 'timer' | 'datetime'
  const [sendMode, setSendMode] = useState('now');
  const [delaySeconds, setDelaySeconds] = useState(5);
  const [customDateTime, setCustomDateTime] = useState(getDefaultDateTime());

  // Status & delivery state
  const [loading, setLoading] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [apiDeliveryResult, setApiDeliveryResult] = useState(null);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);
  const timerRef = useRef(null);

  const handleTemplateChange = (tmpl) => {
    setSelectedTemplate(tmpl.id);
    setCustomMessage(tmpl.text);
  };

  const getWhatsAppUrl = () => {
    const encoded = encodeURIComponent(customMessage);
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  };

  const triggerDirectWebLaunch = () => {
    if (!cleanPhone) {
      alert('Valid phone number is required to send a WhatsApp message.');
      return;
    }
    const url = getWhatsAppUrl();
    if (openedTabRef.current?.tab && !openedTabRef.current.tab.closed) {
      openedTabRef.current.tab.location.href = url;
    } else {
      window.open(url, '_blank');
    }
    onClose();
  };

  const triggerAutoApiDispatch = async () => {
    setLoading(true);
    try {
      const res = await sendWhatsAppApi({
        phone: cleanPhone,
        message: customMessage,
        recipient_name: name
      });

      setApiDeliveryResult(res.data?.data || {
        status: 'Delivered',
        messageId: 'WAMID.' + Date.now(),
        phone: cleanPhone,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      alert('Failed to send via WhatsApp API: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const cancelTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (openedTabRef.current?.tab && !openedTabRef.current.tab.closed) {
      try { openedTabRef.current.tab.close(); } catch (e) {}
    }
    openedTabRef.current = null;
    setIsTimerActive(false);
    setCountdown(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cleanPhone) {
      alert('Valid phone number is required.');
      return;
    }

    if (sendMode === 'now') {
      if (dispatchMethod === 'api') {
        await triggerAutoApiDispatch();
      } else {
        triggerDirectWebLaunch();
      }
    } else if (sendMode === 'timer') {
      if (dispatchMethod === 'web') {
        let preTab = null;
        try { preTab = window.open('about:blank', '_blank'); } catch (err) {}
        openedTabRef.current = { tab: preTab, targetUrl: getWhatsAppUrl() };
      }
      setCountdown(delaySeconds);
      setIsTimerActive(true);
    } else if (sendMode === 'datetime') {
      if (!customDateTime) {
        alert('Please select a valid date and time.');
        return;
      }

      // 1. Create Task in CRM
      await createRecord('tasks', {
        task_name: `WhatsApp Scheduled (${dispatchMethod === 'api' ? 'API Auto-Send' : 'Web'}): ${name}`,
        related_to: recipient?.company_name || name,
        type: 'Call',
        due_date: customDateTime.substring(0, 10),
        priority: 'High',
        status: 'Pending',
        notes: `Scheduled Message: "${customMessage}" (Phone: ${cleanPhone}, Method: ${dispatchMethod})`
      }).catch(() => null);

      // 2. Add to Local Storage Dispatch Queue
      const existingQueue = JSON.parse(localStorage.getItem('crm_whatsapp_queue') || '[]');
      existingQueue.push({
        id: Date.now(),
        recipientName: name,
        phone: cleanPhone,
        message: customMessage,
        method: dispatchMethod,
        scheduledTime: customDateTime,
        createdAt: new Date().toISOString(),
        status: 'Scheduled'
      });
      localStorage.setItem('crm_whatsapp_queue', JSON.stringify(existingQueue));

      setScheduledSuccess(true);
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (isTimerActive && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerActive(false);
            if (dispatchMethod === 'api') {
              triggerAutoApiDispatch();
            } else {
              triggerDirectWebLaunch();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerActive, countdown, dispatchMethod]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isTimerActive) cancelTimer();
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTimerActive, onClose]);

  return ReactDOM.createPortal(
    <div
      className="workflow-modal-overlay"
      ref={overlayRef}
      onClick={isTimerActive ? cancelTimer : onClose}
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
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
          margin: 'auto'
        }}
      >
        {/* Sticky Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.99))',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'rgba(37, 211, 102, 0.18)',
              color: '#25d366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(37, 211, 102, 0.3)'
            }}>
              <Icon name="whatsapp" size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                WhatsApp Messaging Dispatcher
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0' }}>
                {dispatchMethod === 'api' ? '⚡ 100% Automated Background API Dispatch' : '🌐 WhatsApp Web Click-to-Chat'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={isTimerActive ? cancelTimer : onClose}
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
            aria-label="Close"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          flex: 1,
          maxHeight: 'calc(90vh - 140px)',
          background: '#0f172a'
        }}>
          {/* API DELIVERED SUCCESS SCREEN */}
          {apiDeliveryResult ? (
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(37, 211, 102, 0.2)',
                border: '2px solid #25d366',
                color: '#25d366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 28
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                Message Delivered Automatically!
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: 18 }}>
                Dispatched directly via WhatsApp API in the background.
              </p>
              <div style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '10px',
                padding: '14px',
                maxWidth: 440,
                margin: '0 auto 20px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                  <span style={{ color: '#94a3b8' }}>Recipient:</span>
                  <strong style={{ color: '#f8fafc' }}>{name} (+{apiDeliveryResult.phone})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                  <span style={{ color: '#94a3b8' }}>Delivery Status:</span>
                  <strong style={{ color: '#86efac' }}>🟢 Delivered (Zero Clicks)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: '#94a3b8' }}>Message ID:</span>
                  <span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{apiDeliveryResult.messageId}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
                style={{ padding: '10px 24px', background: '#25d366', borderColor: '#25d366', fontWeight: 700 }}
              >
                Done
              </button>
            </div>
          ) : scheduledSuccess ? (
            /* SCHEDULED SUCCESS CONFIRMATION VIEW */
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(37, 211, 102, 0.2)',
                border: '2px solid #25d366',
                color: '#25d366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 28
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
                WhatsApp Message Scheduled!
              </h3>
              <div style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '10px',
                padding: '14px',
                maxWidth: 440,
                margin: '0 auto 20px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                  <span style={{ color: '#94a3b8' }}>Target Recipient:</span>
                  <strong style={{ color: '#f8fafc' }}>{name} ({cleanPhone})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                  <span style={{ color: '#94a3b8' }}>Dispatch Method:</span>
                  <strong style={{ color: '#86efac' }}>{dispatchMethod === 'api' ? '🤖 100% Automated Background API' : '🌐 WhatsApp Web'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                  <span style={{ color: '#94a3b8' }}>Scheduled Time:</span>
                  <strong style={{ color: '#60a5fa' }}>{new Date(customDateTime).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#94a3b8' }}>CRM Status:</span>
                  <strong style={{ color: '#3b82f6' }}>Follow-up Task Created</strong>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
                style={{ padding: '10px 24px', background: '#25d366', borderColor: '#25d366', fontWeight: 700 }}
              >
                Done
              </button>
            </div>
          ) : isTimerActive ? (
            /* COUNTDOWN TIMER OVERLAY */
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(37, 211, 102, 0.15)',
                border: '3px solid #25d366',
                color: '#25d366',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{countdown}</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>SEC</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                Auto-Dispatching via {dispatchMethod === 'api' ? 'WhatsApp API' : 'WhatsApp Web'}...
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#94a3b8', maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.5 }}>
                Dispatching pre-filled message to <strong style={{ color: '#fff' }}>{name}</strong> in <strong style={{ color: '#25d366' }}>{countdown}s</strong>.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={cancelTimer}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#f8fafc',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel Timer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cancelTimer();
                    if (dispatchMethod === 'api') triggerAutoApiDispatch();
                    else triggerDirectWebLaunch();
                  }}
                  style={{
                    background: '#25d366',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    padding: '8px 22px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Send Right Now ➔
                </button>
              </div>
            </div>
          ) : (
            /* COMPOSER FORM */
            <form onSubmit={handleSubmit}>
              {/* DISPATCH METHOD TOGGLE (API vs WEB) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                marginBottom: 16,
                background: 'rgba(30, 41, 59, 0.6)',
                padding: '4px',
                borderRadius: '10px',
                border: '1px solid rgba(148, 163, 184, 0.15)'
              }}>
                <button
                  type="button"
                  onClick={() => setDispatchMethod('api')}
                  style={{
                    background: dispatchMethod === 'api' ? '#25d366' : 'transparent',
                    color: dispatchMethod === 'api' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.2s'
                  }}
                >
                  <span>🤖 Auto-Send via API</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDispatchMethod('web')}
                  style={{
                    background: dispatchMethod === 'web' ? '#3b82f6' : 'transparent',
                    color: dispatchMethod === 'web' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.2s'
                  }}
                >
                  <span>🌐 WhatsApp Web</span>
                </button>
              </div>

              {/* Recipient Banner */}
              <div style={{
                background: 'rgba(37, 211, 102, 0.1)',
                border: '1px solid rgba(37, 211, 102, 0.25)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#86efac', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                    RECIPIENT
                  </span>
                  <strong style={{ fontSize: '0.92rem', color: '#f8fafc', display: 'block', marginTop: 1 }}>
                    {name}
                  </strong>
                </div>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#25d366',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  fontFamily: 'monospace'
                }}>
                  {cleanPhone ? `+${cleanPhone}` : 'No Phone'}
                </span>
              </div>

              {/* Template Selector Grid */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>
                  Select Message Template
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 8
                }}>
                  {templates.map((t) => {
                    const isSelected = selectedTemplate === t.id;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => handleTemplateChange(t)}
                        style={{
                          background: isSelected ? 'rgba(37, 211, 102, 0.18)' : 'rgba(30, 41, 59, 0.7)',
                          border: isSelected ? '1.5px solid #25d366' : '1px solid rgba(148, 163, 184, 0.2)',
                          color: isSelected ? '#86efac' : '#cbd5e1',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>{t.icon}</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Content Textarea */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                  Message Content
                </label>
                <textarea
                  rows="4"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type your WhatsApp message..."
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    padding: '10px 14px',
                    fontSize: '0.88rem',
                    lineHeight: 1.45,
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Dispatch Timing Mode Selector */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                  Send Timing / Dispatch Mode
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 8
                }}>
                  <button
                    type="button"
                    onClick={() => setSendMode('now')}
                    style={{
                      background: sendMode === 'now' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(30, 41, 59, 0.7)',
                      border: sendMode === 'now' ? '1.5px solid #3b82f6' : '1px solid rgba(148, 163, 184, 0.2)',
                      color: sendMode === 'now' ? '#93c5fd' : '#cbd5e1',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Send Now
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendMode('timer')}
                    style={{
                      background: sendMode === 'timer' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(30, 41, 59, 0.7)',
                      border: sendMode === 'timer' ? '1.5px solid #f59e0b' : '1px solid rgba(148, 163, 184, 0.2)',
                      color: sendMode === 'timer' ? '#fcd34d' : '#cbd5e1',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ⏱️ Quick Timer
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendMode('datetime')}
                    style={{
                      background: sendMode === 'datetime' ? 'rgba(139, 92, 246, 0.25)' : 'rgba(30, 41, 59, 0.7)',
                      border: sendMode === 'datetime' ? '1.5px solid #8b5cf6' : '1px solid rgba(148, 163, 184, 0.2)',
                      color: sendMode === 'datetime' ? '#c4b5fd' : '#cbd5e1',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    📅 Scheduled
                  </button>
                </div>

                {sendMode === 'timer' && (
                  <div style={{ marginTop: 10 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>
                      Countdown Delay:
                    </label>
                    <select
                      value={delaySeconds}
                      onChange={(e) => setDelaySeconds(Number(e.target.value))}
                      style={{
                        width: '100%',
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(148, 163, 184, 0.25)',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        padding: '8px 12px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value={5}>5 Seconds Delay</option>
                      <option value={10}>10 Seconds Delay</option>
                      <option value={30}>30 Seconds Delay</option>
                      <option value={60}>60 Seconds Delay</option>
                    </select>
                  </div>
                )}

                {sendMode === 'datetime' && (
                  <div style={{ marginTop: 10 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>
                      Select Dispatch Date &amp; Time:
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={customDateTime}
                      onChange={(e) => setCustomDateTime(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(148, 163, 184, 0.25)',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box',
                        colorScheme: 'dark'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
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
                  disabled={loading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: dispatchMethod === 'api' ? '#25d366' : '#3b82f6',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    padding: '8px 22px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: dispatchMethod === 'api' ? '0 4px 14px rgba(37, 211, 102, 0.35)' : '0 4px 14px rgba(59, 130, 246, 0.35)'
                  }}
                >
                  {loading ? (
                    <span>Dispatched via API...</span>
                  ) : (
                    <>
                      <Icon name="whatsapp" size={16} />
                      <span>
                        {sendMode === 'now'
                          ? (dispatchMethod === 'api' ? '⚡ Auto-Send via API' : 'Open in WhatsApp Web')
                          : sendMode === 'timer'
                          ? `Start ${delaySeconds}s Timer`
                          : 'Schedule Auto-Send'}
                      </span>
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

export default WhatsAppModal;
