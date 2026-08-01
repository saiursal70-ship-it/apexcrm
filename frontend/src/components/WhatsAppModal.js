import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';

// Helper to format phone number to international format (e.g. +91 9876543210 -> 919876543210)
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned; // Default India prefix if 10 digits
  }
  return cleaned;
};

const WhatsAppModal = ({ recipient, onClose }) => {
  const name = recipient?.lead_name || recipient?.contact_name || recipient?.name || 'Customer';
  const rawPhone = recipient?.phone || '';
  const cleanPhone = formatPhoneNumber(rawPhone);

  const templates = [
    {
      id: 'welcome',
      label: '👋 Lead Greeting & Introduction',
      text: `Hello ${name},\n\nThank you for reaching out to us! We'd love to learn more about your requirements and see how we can assist you.\n\nBest regards,\nCRM Sales Team`,
    },
    {
      id: 'deal',
      label: '💼 Deal Proposal Follow-up',
      text: `Hi ${name},\n\nFollowing up on our recent proposal for your project. Please let us know if you have any questions or would like to schedule a quick call.\n\nBest regards,\nCRM Team`,
    },
    {
      id: 'invoice',
      label: '🧾 Invoice / Payment Follow-up',
      text: `Dear ${name},\n\nThis is a friendly reminder regarding your pending invoice with us. Please let us know if you need the invoice details resent.\n\nThank you!`,
    },
    {
      id: 'appointment',
      label: '📅 Appointment Confirmation',
      text: `Hello ${name},\n\nConfirming our scheduled meeting. Looking forward to speaking with you!\n\nBest regards,\nCRM Team`,
    },
  ];

  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [customMessage, setCustomMessage] = useState(templates[0].text);
  
  // Schedule mode: 'now' | 'timer' | 'datetime'
  const [sendMode, setSendMode] = useState('now');
  const [delaySeconds, setDelaySeconds] = useState(5);
  const [customDateTime, setCustomDateTime] = useState('');

  // Countdown timer state
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  const handleTemplateChange = (tmpl) => {
    setSelectedTemplate(tmpl.id);
    setCustomMessage(tmpl.text);
  };

  const triggerWhatsAppLaunch = () => {
    if (!cleanPhone) {
      alert('Valid phone number is required to send a WhatsApp message.');
      return;
    }
    const encoded = encodeURIComponent(customMessage);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cleanPhone) {
      alert('Valid phone number is required.');
      return;
    }

    if (sendMode === 'now') {
      triggerWhatsAppLaunch();
    } else if (sendMode === 'timer') {
      setCountdown(delaySeconds);
      setIsTimerActive(true);
    } else if (sendMode === 'datetime') {
      if (!customDateTime) {
        alert('Please select a valid date and time.');
        return;
      }
      const targetTime = new Date(customDateTime).getTime();
      const now = new Date().getTime();
      const diffInSeconds = Math.max(1, Math.round((targetTime - now) / 1000));

      if (diffInSeconds <= 0) {
        triggerWhatsAppLaunch();
      } else {
        setCountdown(diffInSeconds);
        setIsTimerActive(true);
      }
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (isTimerActive && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            triggerWhatsAppLaunch();
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
  }, [isTimerActive, countdown]);

  const cancelTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerActive(false);
    setCountdown(0);
  };

  return (
    <div className="quick-modal-overlay" onClick={isTimerActive ? cancelTimer : onClose}>
      <div className="quick-modal whatsapp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="quick-modal-header">
          <div className="whatsapp-header-title">
            <Icon name="whatsapp" size={24} className="whatsapp-green-icon" />
            <h3>Send WhatsApp Message</h3>
          </div>
          <button className="icon-btn" onClick={isTimerActive ? cancelTimer : onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* ACTIVE COUNTDOWN OVERLAY VIEW */}
        {isTimerActive ? (
          <div className="whatsapp-countdown-view">
            <div className="countdown-circle">
              <span className="countdown-number">{countdown}</span>
              <span className="countdown-unit">sec</span>
            </div>
            <h4>Auto-Sending Message...</h4>
            <p className="countdown-subtitle">
              Opening WhatsApp Web with pre-filled message for <b>{name}</b> in <b>{countdown}</b> seconds.
            </p>

            <div className="form-actions" style={{ marginTop: 24, justifyContent: 'center' }}>
              <button type="button" className="btn btn-outline" onClick={cancelTimer}>
                ⛔ Cancel Timer
              </button>
              <button type="button" className="btn btn-whatsapp" onClick={triggerWhatsAppLaunch}>
                🚀 Send Right Now
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="whatsapp-recipient-info">
              <p>Recipient: <b>{name}</b> ({rawPhone || 'No phone number'})</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Message Template</label>
                <div className="whatsapp-template-list">
                  {templates.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      className={`whatsapp-template-btn ${selectedTemplate === t.id ? 'active' : ''}`}
                      onClick={() => handleTemplateChange(t)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Message Content</label>
                <textarea
                  rows="3"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type your WhatsApp message..."
                  required
                />
              </div>

              {/* SCHEDULE / TIMER OPTIONS */}
              <div className="form-group">
                <label>Send Time / Schedule</label>
                <div className="whatsapp-timer-options">
                  <button
                    type="button"
                    className={`timer-option-btn ${sendMode === 'now' ? 'active' : ''}`}
                    onClick={() => setSendMode('now')}
                  >
                    ⚡ Send Now (Normal)
                  </button>
                  <button
                    type="button"
                    className={`timer-option-btn ${sendMode === 'timer' ? 'active' : ''}`}
                    onClick={() => setSendMode('timer')}
                  >
                    ⏱️ Quick Timer (5s)
                  </button>
                  <button
                    type="button"
                    className={`timer-option-btn ${sendMode === 'datetime' ? 'active' : ''}`}
                    onClick={() => setSendMode('datetime')}
                  >
                    📅 Custom Date & Time
                  </button>
                </div>
              </div>

              {/* CUSTOM DATE & TIME PICKER */}
              {sendMode === 'datetime' && (
                <div className="form-group" style={{ marginTop: 10 }}>
                  <label>Select Auto-Send Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={customDateTime}
                    onChange={(e) => setCustomDateTime(e.target.value)}
                  />
                </div>
              )}

              {/* QUICK TIMER DELAY ADJUSTMENT */}
              {sendMode === 'timer' && (
                <div className="form-group" style={{ marginTop: 10 }}>
                  <label>Timer Delay (Seconds)</label>
                  <select value={delaySeconds} onChange={(e) => setDelaySeconds(Number(e.target.value))}>
                    <option value={5}>5 Seconds</option>
                    <option value={10}>10 Seconds</option>
                    <option value={30}>30 Seconds</option>
                    <option value={60}>60 Seconds</option>
                  </select>
                </div>
              )}

              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="submit" className="btn btn-whatsapp">
                  <Icon name="whatsapp" size={18} />
                  {sendMode === 'now'
                    ? ' Send on WhatsApp'
                    : sendMode === 'timer'
                    ? ` Start ${delaySeconds}s Timer`
                    : ' Schedule Auto-Send'}
                </button>
                <button type="button" className="btn btn-outline" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default WhatsAppModal;
