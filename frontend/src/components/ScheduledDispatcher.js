import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Icon from './Icon';
import { sendWhatsAppApi, sendEmailApi } from '../api/api';

/**
 * ScheduledDispatcher Component
 * Global background watcher that monitors scheduled WhatsApp & Gmail dispatches and triggers automated API send or prompt on exact scheduled time.
 */
const ScheduledDispatcher = () => {
  const [activePrompt, setActivePrompt] = useState(null);
  const [apiToast, setApiToast] = useState(null);

  useEffect(() => {
    const checkSchedule = async () => {
      try {
        const rawQueue = localStorage.getItem('crm_whatsapp_queue');
        if (!rawQueue) return;
        const queue = JSON.parse(rawQueue);
        if (!Array.isArray(queue) || queue.length === 0) return;

        const now = Date.now();
        let queueUpdated = false;

        for (let i = 0; i < queue.length; i++) {
          const item = queue[i];
          if (item.status === 'Scheduled') {
            const targetTime = new Date(item.scheduledTime).getTime();
            if (now >= targetTime) {
              // Time has arrived!
              item.status = 'Dispatched';
              item.dispatchedAt = new Date().toISOString();
              queueUpdated = true;

              if (item.method === 'api' || !item.method) {
                // Automated Background API Dispatch
                try {
                  if (item.channel === 'email') {
                    await sendEmailApi({
                      to: item.email,
                      subject: item.subject,
                      body: item.message,
                      recipient_name: item.recipientName
                    });
                    setApiToast(`✉️ Auto-Sent via Gmail Gateway to ${item.recipientName} (${item.email})!`);
                  } else {
                    await sendWhatsAppApi({
                      phone: item.phone,
                      message: item.message,
                      recipient_name: item.recipientName
                    });
                    setApiToast(`🤖 Auto-Sent via WhatsApp API to ${item.recipientName} (+${item.phone})!`);
                  }
                  setTimeout(() => setApiToast(null), 5000);
                } catch (e) {
                  setActivePrompt(item);
                }
              } else {
                // Web mode prompt
                setActivePrompt(item);
              }
              break;
            }
          }
        }

        if (queueUpdated) {
          localStorage.setItem('crm_whatsapp_queue', JSON.stringify(queue));
        }
      } catch (err) {
        console.error('ScheduledDispatcher check error:', err);
      }
    };

    // Check every 4 seconds
    const interval = setInterval(checkSchedule, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchNow = () => {
    if (!activePrompt) return;
    if (activePrompt.channel === 'email') {
      const encodedTo = encodeURIComponent(activePrompt.email || '');
      const encodedSub = encodeURIComponent(activePrompt.subject || '');
      const encodedBody = encodeURIComponent(activePrompt.message || '');
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSub}&body=${encodedBody}`;
      window.open(gmailUrl, '_blank');
    } else {
      const encoded = encodeURIComponent(activePrompt.message || '');
      const url = `https://wa.me/${activePrompt.phone}?text=${encoded}`;
      window.open(url, '_blank');
    }
    setActivePrompt(null);
  };

  const isEmail = activePrompt?.channel === 'email';

  return ReactDOM.createPortal(
    <>
      {/* Automated API Background Success Toast */}
      {apiToast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 100002,
          backgroundColor: '#0f172a',
          border: '1.5px solid #25d366',
          borderRadius: '12px',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(37, 211, 102, 0.3)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#f8fafc',
          fontSize: '0.88rem',
          fontWeight: 600,
          animation: 'slideInUp 0.3s ease-out'
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#25d366',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem'
          }}>
            ✓
          </div>
          <span>{apiToast}</span>
        </div>
      )}

      {/* Manual Web Prompt Alert */}
      {activePrompt && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 100001,
            backgroundColor: '#0f172a',
            border: isEmail ? '1.5px solid #ef4444' : '1.5px solid #25d366',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(37, 99, 235, 0.3)',
            padding: '20px 24px',
            maxWidth: 380,
            width: '90vw',
            animation: 'slideInUp 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: isEmail ? 'rgba(239, 68, 68, 0.18)' : 'rgba(37, 211, 102, 0.18)',
                color: isEmail ? '#ef4444' : '#25d366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon name={isEmail ? 'email' : 'whatsapp'} size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  Scheduled {isEmail ? 'Email' : 'WhatsApp'} Alert
                </h4>
                <span style={{ fontSize: '0.75rem', color: isEmail ? '#fca5a5' : '#86efac', fontWeight: 600 }}>
                  Dispatch Time Arrived! ⏰
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivePrompt(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4
              }}
            >
              <Icon name="close" size={16} />
            </button>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '0.82rem',
            color: '#cbd5e1',
            marginBottom: 16
          }}>
            <div style={{ marginBottom: 4 }}>
              <strong>To:</strong> {activePrompt.recipientName} ({isEmail ? activePrompt.email : activePrompt.phone})
            </div>
            {isEmail && activePrompt.subject && (
              <div style={{ marginBottom: 4 }}>
                <strong>Subject:</strong> {activePrompt.subject}
              </div>
            )}
            <div style={{
              color: '#94a3b8',
              fontSize: '0.78rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              "{activePrompt.message}"
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setActivePrompt(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#cbd5e1',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>

            <button
              type="button"
              onClick={handleLaunchNow}
              style={{
                background: isEmail ? '#ea4335' : '#25d366',
                border: 'none',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Icon name={isEmail ? 'email' : 'whatsapp'} size={14} />
              <span>{isEmail ? 'Open in Gmail Compose' : 'Send on WhatsApp'}</span>
            </button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default ScheduledDispatcher;
