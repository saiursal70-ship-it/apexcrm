import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Icon from './Icon';
import { sendWhatsAppApi, sendEmailApi } from '../api/api';
import { animateModalEnter } from '../utils/animations';

// Helper to format phone number to international format
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned; // Default India prefix
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

/**
 * OmnichannelMessageModal Component
 * Seamless in-app WhatsApp & Gmail / Email message forwarder for taking information,
 * sending payment reminders, quotations, deal progress, and contact follow-ups without leaving the page.
 */
const OmnichannelMessageModal = ({
  isOpen,
  onClose,
  record,
  entity = 'contacts',
  defaultChannel = 'whatsapp' // 'whatsapp' | 'email'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel || 'whatsapp');
  const [sendMode, setSendMode] = useState('web'); // 'web' (WhatsApp Web / Gmail Compose) | 'api' (Direct In-App Dispatch) | 'schedule'
  const [loading, setLoading] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Scheduled Dispatch State
  const [customDateTime, setCustomDateTime] = useState(getDefaultDateTime());

  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setActiveChannel(defaultChannel || 'whatsapp');
      setDeliveryResult(null);
      setCopied(false);
      animateModalEnter(modalRef.current, overlayRef.current);
    }
  }, [isOpen, defaultChannel, record]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Extract recipient details safely
  const recipientName =
    record?.contact_name ||
    record?.lead_name ||
    record?.client_name ||
    record?.client_account ||
    record?.name ||
    'Valued Customer';

  const recipientEmail =
    record?.email ||
    record?.client_email ||
    record?.contact_email ||
    '';

  const recipientPhone =
    record?.phone ||
    record?.contact_phone ||
    record?.client_phone ||
    '';

  const [targetPhone, setTargetPhone] = useState(recipientPhone);
  const [targetEmail, setTargetEmail] = useState(recipientEmail);

  useEffect(() => {
    setTargetPhone(recipientPhone);
    setTargetEmail(recipientEmail);
  }, [recipientPhone, recipientEmail]);

  // Extract context values
  const invoiceNum = record?.invoice_number || `INV-${record?.id || '101'}`;
  const quoteNum = record?.quotation_number || `QT-${record?.id || '201'}`;
  const dealName = record?.deal_name || record?.company_name || 'Commercial Opportunity';
  const amountVal = Number(record?.amount || record?.total_amount || record?.value || 0).toLocaleString('en-IN');
  const dueDateVal = record?.due_date ? String(record?.due_date).substring(0, 10) : 'within 15 days';
  const companyName = record?.company_name || record?.client_account || `${recipientName}'s Organization`;

  // Build context-aware template presets
  const templates = useMemo(() => {
    switch (entity) {
      case 'invoices':
        return [
          {
            id: 'inv_reminder',
            icon: '💰',
            label: 'Payment Reminder',
            subject: `Payment Reminder: Tax Invoice #${invoiceNum} for ₹${amountVal}`,
            body: `Dear ${recipientName},\n\nThis is a friendly reminder regarding Tax Invoice #${invoiceNum} for ₹${amountVal}, due on ${dueDateVal}.\n\nBank Payment Details:\n• Account: APEX DEV TECHNOLOGIES PVT LTD\n• Bank: HDFC Bank Ltd (A/C: 50200012345678)\n• IFSC: HDFC0001234\n• UPI: apexdev@hdfcbank\n\nPlease let us know once the transfer is processed. Thank you!\n\nBest regards,\nAccounts & Billing Team\nAPEX DEV Technologies`
          },
          {
            id: 'inv_share',
            icon: '🧾',
            label: 'Tax Invoice Share',
            subject: `Official Tax Invoice #${invoiceNum} from APEX DEV Technologies`,
            body: `Hello ${recipientName},\n\nPlease find your official Tax Invoice #${invoiceNum} for ₹${amountVal} attached for your records regarding software services rendered for ${companyName}.\n\nPayment Mode: ${record?.payment_mode || 'Bank Transfer / NEFT'}\nDue Date: ${dueDateVal}\n\nPlease reach out if you need any adjustments or GST details.\n\nWarm regards,\nAPEX DEV Billing Team`
          },
          {
            id: 'inv_paid',
            icon: '✅',
            label: 'Payment Received',
            subject: `Payment Acknowledged: Tax Invoice #${invoiceNum}`,
            body: `Dear ${recipientName},\n\nWe have successfully received and verified your payment of ₹${amountVal} for Tax Invoice #${invoiceNum}.\n\nYour account is now fully settled and in good standing. We look forward to continuing our partnership with ${companyName}!\n\nBest regards,\nAPEX DEV Finance`
          },
          {
            id: 'inv_info_intake',
            icon: '📋',
            label: 'Request Billing Info / GSTIN',
            subject: `Information Required for Billing & Invoicing: ${companyName}`,
            body: `Dear ${recipientName},\n\nTo issue your official Tax Invoice and ensure compliance with Indian GST laws, could you kindly confirm the following details for ${companyName}:\n\n1. Legal Company Name & Billing Address:\n2. GSTIN / Tax ID Number:\n3. State & Place of Supply:\n4. Primary Accounts Email for Invoicing:\n\nThank you for your prompt assistance!\n\nBest regards,\nAPEX DEV Accounts Team`
          }
        ];

      case 'quotations':
        return [
          {
            id: 'qt_share',
            icon: '📄',
            label: 'Quotation & Scope',
            subject: `Commercial Quotation #${quoteNum} from APEX DEV Technologies`,
            body: `Hello ${recipientName},\n\nWe are pleased to present Commercial Quotation #${quoteNum} for ₹${amountVal} regarding '${record?.project_title || 'Enterprise Software Solutions'}'.\n\nScope Summary:\n• Complete design, customization, deployment, and 12-month SLA maintenance package.\n• Validity: 15 days from issue date.\n• Standard 50% advance upon acceptance.\n\nPlease review the proposal and let us know if you would like to proceed!\n\nBest regards,\nSales & Solutions Team\nAPEX DEV Technologies`
          },
          {
            id: 'qt_followup',
            icon: '⏰',
            label: 'Proposal Follow-up',
            subject: `Follow-up: Commercial Quotation #${quoteNum} for ${companyName}`,
            body: `Hi ${recipientName},\n\nFollowing up on our recent Commercial Quotation #${quoteNum} (₹${amountVal}).\n\nWould you be available for a brief 10-minute sync this week to answer any technical questions or fine-tune scope requirements?\n\nLooking forward to hearing from you!\n\nBest regards,\nAPEX DEV Sales Team`
          },
          {
            id: 'qt_kickoff',
            icon: '🤝',
            label: 'Acceptance & Kickoff',
            subject: `Project Kickoff & Approval: Quotation #${quoteNum}`,
            body: `Dear ${recipientName},\n\nWe are excited to partner with ${companyName}! To formally initiate project onboarding for '${record?.project_title || 'Software Solutions'}', please reply with your confirmation or sign-off on Quotation #${quoteNum}.\n\nOur engineering team is ready to begin sprint planning immediately upon receipt.\n\nWarm regards,\nAPEX DEV Project Office`
          },
          {
            id: 'qt_info_intake',
            icon: '❓',
            label: 'Scope Clarification Request',
            subject: `Technical Information Request for Proposal: ${companyName}`,
            body: `Hello ${recipientName},\n\nTo structure the most accurate timeline and commercial proposal for ${companyName}, could you please share a few details regarding your requirements:\n\n1. Target go-live date / milestone deadlines:\n2. Estimated user licenses / active seats:\n3. Existing systems requiring third-party API integration:\n4. Key stakeholders for sign-off:\n\nThank you for your collaboration!\n\nBest regards,\nAPEX DEV Solutions Architecture`
          }
        ];

      case 'deals':
        return [
          {
            id: 'deal_progress',
            icon: '🚀',
            label: 'Deal Progress & Next Steps',
            subject: `Next Steps: ${dealName} with APEX DEV`,
            body: `Hi ${recipientName},\n\nHope you're having a great week! Following up on our discussions regarding '${dealName}'.\n\nWe are ready to move forward to the next stage. Would you prefer a quick phone sync or a short video call tomorrow to align on final deliverables?\n\nBest regards,\nAlex Dev | APEX DEV Technologies`
          },
          {
            id: 'deal_demo',
            icon: '💻',
            label: 'Solution Demo Invite',
            subject: `Custom Solution Walkthrough: ${companyName}`,
            body: `Hello ${recipientName},\n\nThank you for considering APEX DEV for your enterprise workflow requirements. We would love to host a personalized 15-minute product walkthrough tailored to ${companyName}'s needs.\n\nPlease let us know what time suits your schedule best this week.\n\nWarm regards,\nAPEX DEV Team`
          },
          {
            id: 'deal_closing',
            icon: '✍️',
            label: 'Contract Finalization',
            subject: `Final Agreement & Closing: ${dealName}`,
            body: `Dear ${recipientName},\n\nWe have finalized the proposal terms for '${dealName}' (Value: ₹${amountVal}).\n\nEverything is aligned for executive sign-off. Please let us know if you need any additional documentation prior to kickoff.\n\nBest regards,\nAPEX DEV Executive Team`
          },
          {
            id: 'deal_intake',
            icon: '📑',
            label: 'Discovery Questionnaire',
            subject: `Discovery Information Intake: ${companyName}`,
            body: `Hi ${recipientName},\n\nTo prepare a tailored enterprise solution for ${companyName}, could you briefly answer 3 quick questions:\n\n1. What is your primary pain point with your current setup?\n2. What is your approximate team size and deployment timeline?\n3. Who should be included in the technical evaluation call?\n\nThank you!\n\nBest regards,\nAPEX DEV Consulting`
          }
        ];

      default: // contacts, leads, accounts, tasks
        return [
          {
            id: 'general_welcome',
            icon: '👋',
            label: 'Client Welcome',
            subject: `Welcome to APEX DEV Technologies, ${recipientName}!`,
            body: `Hello ${recipientName},\n\nWelcome to APEX DEV! We are delighted to connect with ${companyName}.\n\nYour dedicated account manager is Alex Dev. Feel free to reply directly to this message or call us anytime for questions, product support, or consultations.\n\nWarm regards,\nAPEX DEV Team`
          },
          {
            id: 'general_followup',
            icon: '📅',
            label: 'Status Check-in',
            subject: `Checking In: ${companyName} & APEX DEV`,
            body: `Hi ${recipientName},\n\nHope all is well with you! Just checking in to see how everything is progressing at ${companyName} and if there are any new projects or technical support we can assist with.\n\nLet's catch up soon!\n\nBest regards,\nAPEX DEV Team`
          },
          {
            id: 'general_intake',
            icon: '📋',
            label: 'Information Update Request',
            subject: `Account Information Verification for ${companyName}`,
            body: `Dear ${recipientName},\n\nWe are conducting our periodic account directory verification. Please confirm if the following contact details for ${companyName} are up to date:\n\n• Primary Contact: ${recipientName}\n• Email: ${targetEmail || 'Not on file'}\n• Phone: ${targetPhone || 'Not on file'}\n• Company / Organization: ${companyName}\n\nIf any information has changed, please reply with updated details.\n\nThank you!\n\nBest regards,\nAPEX DEV CRM Operations`
          }
        ];
    }
  }, [entity, recipientName, companyName, invoiceNum, quoteNum, dealName, amountVal, dueDateVal, record, targetEmail, targetPhone]);

  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [subject, setSubject] = useState(templates[0]?.subject || '');
  const [messageBody, setMessageBody] = useState(templates[0]?.body || '');

  // Update form when entity/templates change
  useEffect(() => {
    if (templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
      setSubject(templates[0].subject);
      setMessageBody(templates[0].body);
    }
  }, [templates]);

  const handleSelectTemplate = (tmpl) => {
    setSelectedTemplateId(tmpl.id);
    setSubject(tmpl.subject);
    setMessageBody(tmpl.body);
  };

  const handleInsertTag = (tag) => {
    setMessageBody((prev) => `${prev} ${tag}`);
  };

  const handleCopyMessage = () => {
    const fullText = activeChannel === 'email' ? `Subject: ${subject}\n\n${messageBody}` : messageBody;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // --- ACTIONS ---

  // 1. WhatsApp Web Launch
  const handleLaunchWhatsAppWeb = () => {
    const cleanPhone = formatPhoneNumber(targetPhone);
    if (!cleanPhone) {
      alert('Please enter a valid phone number with country code.');
      return;
    }
    const encoded = encodeURIComponent(messageBody);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
    setDeliveryResult({
      success: true,
      message: `Launched WhatsApp Web for ${recipientName} (+${cleanPhone})!`
    });
  };

  // 2. WhatsApp Direct In-App API Send
  const handleSendWhatsAppApi = async () => {
    const cleanPhone = formatPhoneNumber(targetPhone);
    if (!cleanPhone) {
      alert('Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    try {
      const res = await sendWhatsAppApi({
        phone: cleanPhone,
        message: messageBody,
        recipient_name: recipientName,
        record_id: record?.id,
        entity
      });
      setDeliveryResult({
        success: true,
        message: res.data?.message || `WhatsApp message dispatched to +${cleanPhone}!`
      });
    } catch (err) {
      alert('Error sending WhatsApp message: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 3. Gmail Web Compose Launch
  const handleLaunchGmailWeb = () => {
    if (!targetEmail) {
      alert('Please enter a valid recipient email address.');
      return;
    }
    const encodedTo = encodeURIComponent(targetEmail);
    const encodedSub = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(messageBody);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSub}&body=${encodedBody}`;
    window.open(gmailUrl, '_blank');
    setDeliveryResult({
      success: true,
      message: `Opened Gmail compose window for ${targetEmail}!`
    });
  };

  // 4. Default Mail Client (mailto:)
  const handleLaunchMailto = () => {
    if (!targetEmail) {
      alert('Please enter a valid recipient email address.');
      return;
    }
    const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageBody)}`;
    window.location.href = mailtoUrl;
    setDeliveryResult({
      success: true,
      message: `Launched default email client for ${targetEmail}!`
    });
  };

  // 5. In-App Direct Email Send
  const handleSendEmailApi = async () => {
    if (!targetEmail) {
      alert('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await sendEmailApi({
        to: targetEmail,
        subject,
        body: messageBody,
        recipient_name: recipientName,
        record_id: record?.id,
        entity
      });
      setDeliveryResult({
        success: true,
        message: res.data?.message || `Email dispatched to ${targetEmail} via Gmail gateway!`
      });
    } catch (err) {
      alert('Error sending email: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 6. Schedule Dispatch
  const handleStartScheduleTimer = () => {
    try {
      const queueItem = {
        id: 'SCHED_' + Date.now(),
        channel: activeChannel,
        phone: formatPhoneNumber(targetPhone),
        email: targetEmail,
        subject,
        message: messageBody,
        recipientName,
        scheduledTime: customDateTime,
        status: 'Scheduled',
        createdAt: new Date().toISOString()
      };
      const existing = JSON.parse(localStorage.getItem('crm_whatsapp_queue') || '[]');
      existing.push(queueItem);
      localStorage.setItem('crm_whatsapp_queue', JSON.stringify(existing));
      setDeliveryResult({
        success: true,
        message: `⏰ Scheduled follow-up for ${new Date(customDateTime).toLocaleString('en-IN')}!`
      });
    } catch (e) {
      alert('Could not save schedule: ' + e.message);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99995,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="modal-card"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '18px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(37, 99, 235, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Top Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(30, 41, 59, 0.7)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: activeChannel === 'whatsapp' ? 'rgba(37, 211, 102, 0.18)' : 'rgba(239, 68, 68, 0.18)',
              color: activeChannel === 'whatsapp' ? '#25d366' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: activeChannel === 'whatsapp' ? '1px solid rgba(37, 211, 102, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)'
            }}>
              <Icon name={activeChannel === 'whatsapp' ? 'whatsapp' : 'email'} size={22} />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Follow-up &amp; Forward Message
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                To: <strong style={{ color: '#f8fafc' }}>{recipientName}</strong> • {companyName}
              </p>
            </div>
          </div>

          {/* Close X */}
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Channel Selector Tab Bar (WhatsApp vs Gmail) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(15, 23, 42, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            type="button"
            onClick={() => setActiveChannel('whatsapp')}
            style={{
              padding: '12px',
              border: 'none',
              background: activeChannel === 'whatsapp' ? 'rgba(37, 211, 102, 0.12)' : 'transparent',
              borderBottom: activeChannel === 'whatsapp' ? '2.5px solid #25d366' : '2.5px solid transparent',
              color: activeChannel === 'whatsapp' ? '#25d366' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Icon name="whatsapp" size={18} />
            <span>WhatsApp Messenger</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChannel('email')}
            style={{
              padding: '12px',
              border: 'none',
              background: activeChannel === 'email' ? 'rgba(239, 68, 68, 0.12)' : 'transparent',
              borderBottom: activeChannel === 'email' ? '2.5px solid #ef4444' : '2.5px solid transparent',
              color: activeChannel === 'email' ? '#f87171' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Icon name="email" size={18} />
            <span>Gmail / Corporate Email</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          flex: 1,
          maxHeight: 'calc(90vh - 200px)'
        }}>
          {/* Success Banner */}
          {deliveryResult && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: 16,
              color: '#34d399',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>{deliveryResult.message}</span>
              <button
                type="button"
                onClick={() => setDeliveryResult(null)}
                style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick Smart Template Selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8, letterSpacing: '0.04em' }}>
              🎯 Select Follow-Up &amp; Intake Template ({entity.toUpperCase()}):
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 8
            }}>
              {templates.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    style={{
                      background: isSelected ? 'rgba(37, 99, 235, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                      border: isSelected ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      color: isSelected ? '#93c5fd' : '#cbd5e1',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>{tmpl.icon}</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tmpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient Target Inputs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: activeChannel === 'whatsapp' ? '1fr 1fr' : '1fr 1fr',
            gap: 12,
            marginBottom: 16
          }}>
            {activeChannel === 'whatsapp' ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>
                    WhatsApp Phone (with Country Code):
                  </label>
                  <input
                    type="text"
                    value={targetPhone}
                    onChange={(e) => setTargetPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>
                    Recipient Name:
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    disabled
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#94a3b8',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>
                    To (Recipient Email Address):
                  </label>
                  <input
                    type="email"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="client@company.com"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>
                    Subject Line:
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email Subject..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Message Content Area */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.04em' }}>
                {activeChannel === 'whatsapp' ? 'WhatsApp Message Body:' : 'Email Body:'}
              </label>

              <button
                type="button"
                onClick={handleCopyMessage}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copied ? '#34d399' : '#60a5fa',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Icon name="copy" size={13} />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(30, 41, 59, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                color: '#f8fafc',
                fontSize: '0.86rem',
                lineHeight: 1.5,
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Quick Variable Insertion Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Insert Tags:</span>
            {[`{name}`, `{company}`, `{amount}`, `{invoice_number}`, `{quotation_number}`, `{due_date}`].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleInsertTag(tag)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                + {tag}
              </button>
            ))}
          </div>

          {/* Dispatch Mode Selector */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: 16
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: 8 }}>
              Dispatch Channel Mode:
            </span>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="dispatchMode"
                  checked={sendMode === 'web'}
                  onChange={() => setSendMode('web')}
                />
                <span>1-Click {activeChannel === 'whatsapp' ? 'WhatsApp Web' : 'Gmail Web Compose'}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="dispatchMode"
                  checked={sendMode === 'api'}
                  onChange={() => setSendMode('api')}
                />
                <span>🤖 In-App Automated Gateway Send</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="dispatchMode"
                  checked={sendMode === 'schedule'}
                  onChange={() => setSendMode('schedule')}
                />
                <span>⏰ Schedule Follow-Up</span>
              </label>
            </div>

            {sendMode === 'schedule' && (
              <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: '#0f172a',
                    color: '#f8fafc',
                    fontSize: '0.82rem'
                  }}
                />
                <button
                  type="button"
                  onClick={handleStartScheduleTimer}
                  style={{
                    background: '#3b82f6',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Schedule
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(30, 41, 59, 0.8)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#cbd5e1',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel / Close
          </button>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {activeChannel === 'whatsapp' ? (
              <>
                {sendMode === 'api' ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSendWhatsAppApi}
                    style={{
                      background: '#25d366',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)'
                    }}
                  >
                    <Icon name="whatsapp" size={16} />
                    <span>{loading ? 'Dispatching...' : '⚡ Send via WhatsApp API'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLaunchWhatsAppWeb}
                    style={{
                      background: '#25d366',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)'
                    }}
                  >
                    <Icon name="whatsapp" size={16} />
                    <span>Launch WhatsApp Web</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleLaunchMailto}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#f8fafc',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Icon name="email" size={15} />
                  <span>Default Mail App</span>
                </button>

                {sendMode === 'api' ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSendEmailApi}
                    style={{
                      background: '#ef4444',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    <Icon name="email" size={16} />
                    <span>{loading ? 'Dispatching...' : '⚡ Send via Gmail Gateway'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLaunchGmailWeb}
                    style={{
                      background: '#ea4335',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(234, 67, 53, 0.4)'
                    }}
                  >
                    <Icon name="email" size={16} />
                    <span>Open in Gmail Compose</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OmnichannelMessageModal;
