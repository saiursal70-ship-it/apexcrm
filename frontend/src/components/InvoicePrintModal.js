import React, { useEffect, useRef } from 'react';
import Icon from './Icon';
import ApexDevLogo from './ApexDevLogo';
import { animateModalEnter } from '../utils/animations';

// Helper to convert number to words (Indian Rupees)
const numberToWords = (num) => {
  if (!num || isNaN(num)) return 'Zero Rupees Only';
  const val = Math.round(Number(num));

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if ((n = n.toString()).length > 9) return 'overflow';
    let n_arr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n_arr) return '';
    let str = '';
    str += (n_arr[1] !== '00') ? (a[Number(n_arr[1])] || b[n_arr[1][0]] + ' ' + a[n_arr[1][1]]) + 'Crore ' : '';
    str += (n_arr[2] !== '00') ? (a[Number(n_arr[2])] || b[n_arr[2][0]] + ' ' + a[n_arr[2][1]]) + 'Lakh ' : '';
    str += (n_arr[3] !== '00') ? (a[Number(n_arr[3])] || b[n_arr[3][0]] + ' ' + a[n_arr[3][1]]) + 'Thousand ' : '';
    str += (n_arr[4] !== '0') ? (a[Number(n_arr[4])] || b[n_arr[4][0]] + ' ' + a[n_arr[4][1]]) + 'Hundred ' : '';
    str += (n_arr[5] !== '00') ? ((str !== '') ? 'and ' : '') + (a[Number(n_arr[5])] || b[n_arr[5][0]] + ' ' + a[n_arr[5][1]]) : '';
    return str;
  };

  const words = inWords(val);
  return (words ? words.trim() : 'Zero') + ' Rupees Only';
};

const formatDateSafe = (val, fallback = '—') => {
  if (!val) return fallback;
  try {
    const s = String(val).substring(0, 10);
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return String(val).substring(0, 10) || fallback;
  }
};

const InvoicePrintModal = ({ invoice, onClose, onWhatsApp, onEmail }) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (invoice) {
      animateModalEnter(modalRef.current, overlayRef.current);
    }
  }, [invoice]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && invoice) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [invoice, onClose]);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalAmount = Number(invoice.amount) || 0;
  const isPaidStatus = String(invoice.payment_status || '').toLowerCase() === 'paid';
  const paidAmount = isPaidStatus
    ? (Number(invoice.paid_amount) > 0 ? Number(invoice.paid_amount) : totalAmount)
    : (Number(invoice.paid_amount) || 0);
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  // Compute subtotal and GST breakdown (assuming 18% GST included)
  const subtotal = Math.round(totalAmount / 1.18);
  const totalGst = totalAmount - subtotal;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  return (
    <div className="invoice-modal-overlay" ref={overlayRef}>
      <div className="invoice-modal-container" ref={modalRef}>
        {/* Top Control Action Bar (Hidden when printing) */}
        <div className="invoice-action-bar no-print">
          <div className="action-bar-title">
            <Icon name="invoice" size={18} />
            <span>Tax Invoice #{invoice.invoice_number}</span>
          </div>
          <div className="action-bar-buttons" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onWhatsApp && (
              <button
                type="button"
                className="emoji-action-btn btn-whatsapp-action"
                onClick={() => onWhatsApp(invoice)}
                aria-label="WhatsApp Reminder"
              >
                <Icon name="whatsapp" size={16} />
                <span className="emoji-hover-tooltip">💬 WhatsApp Reminder</span>
              </button>
            )}
            {onEmail && (
              <button
                type="button"
                className="emoji-action-btn btn-email-action"
                onClick={() => onEmail(invoice)}
                aria-label="Send via Gmail"
              >
                <Icon name="email" size={16} />
                <span className="emoji-hover-tooltip">✉️ Send via Gmail</span>
              </button>
            )}
            <button type="button" className="btn btn-primary print-trigger-btn" onClick={handlePrint}>
              <Icon name="printer" size={16} /> Print / Save PDF
            </button>
            <button type="button" className="btn btn-outline modal-close-btn" onClick={onClose}>
              <Icon name="close" size={16} /> Close
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Document */}
        <div className="printable-invoice" id="printable-invoice-area">
          {/* Company Letterhead Header */}
          <div className="invoice-letterhead">
            <div className="letterhead-brand">
              <div className="company-logo-badge" style={{ background: 'transparent', padding: 0 }}>
                <ApexDevLogo variant="horizontal" size={40} />
              </div>
              <h2 className="company-name" style={{ marginTop: '6px' }}>APEX DEV Technologies Pvt. Ltd.</h2>
              <p className="company-address">Suite 402, Business Bay, MG Road, Bangalore - 560001, India</p>
              <p className="company-contact">Phone: +91 80 4567 8900 | Email: billing@apexdev.com | Web: www.apexdev.com</p>
              <p className="company-gst">GSTIN: <strong>29AAACC1234H1Z5</strong> | PAN: <strong>AAACC1234H</strong></p>
            </div>
            <div className="invoice-header-meta">
              <h1 className="doc-title">TAX INVOICE</h1>
            </div>
          </div>

          <div className="invoice-divider"></div>

          {/* Bill To & Invoice Info Grid */}
          <div className="invoice-details-grid">
            <div className="bill-to-box">
              <span className="details-label">BILLED TO (CLIENT DETAILS):</span>
              <h3 className="client-company-name">{invoice.client_account || 'Client Account'}</h3>
              <p className="client-info-line">GSTIN: <strong>29GSTCLIENT99</strong></p>
              <p className="client-info-line">Payment Mode: <strong>{invoice.payment_mode || 'Bank Transfer / NEFT'}</strong></p>
              <p className="client-info-line">Place of Supply: <strong>Karnataka (29)</strong></p>
            </div>

            <div className="invoice-meta-box">
              <div className="meta-row">
                <span className="meta-label">Invoice Number:</span>
                <span className="meta-value highlight">{invoice.invoice_number}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Invoice Date:</span>
                <span className="meta-value">{formatDateSafe(invoice.invoice_date, 'Today')}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Due Date:</span>
                <span className="meta-value">{formatDateSafe(invoice.due_date, 'Net 15 Days')}</span>
              </div>
            </div>
          </div>

          {/* Particulars & Item Table */}
          <table className="invoice-items-table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>#</th>
                <th style={{ width: '42%' }}>Item / Service Description</th>
                <th style={{ width: '12%' }}>HSN/SAC</th>
                <th style={{ width: '10%' }}>Qty</th>
                <th style={{ width: '14%', textAlign: 'right' }}>Unit Price (₹)</th>
                <th style={{ width: '14%', textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <strong>Enterprise Software License &amp; Services</strong>
                  <br />
                  <span className="item-subtext">Software License &amp; Cloud Support Service for {invoice.client_account}</span>
                </td>
                <td>998313</td>
                <td>1</td>
                <td style={{ textAlign: 'right' }}>₹{subtotal.toLocaleString('en-IN')}</td>
                <td style={{ textAlign: 'right' }}>₹{subtotal.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          {/* Tax Calculation & Summary Table */}
          <div className="invoice-summary-section">
            <div className="bank-details-box">
              <h4>BANK PAYMENT DETAILS</h4>
              <p>Account Name: <strong>APEX DEV TECHNOLOGIES PVT LTD</strong></p>
              <p>Bank Name: <strong>HDFC Bank Ltd</strong></p>
              <p>Account Number: <strong>50200012345678</strong></p>
              <p>IFSC Code: <strong>HDFC0001234</strong> (Branch: MG Road, Bangalore)</p>
              <p>UPI ID: <strong>apexdev@hdfcbank</strong></p>
            </div>

            <div className="totals-calculation-box">
              <div className="calc-row">
                <span>Subtotal (Excl. Tax):</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="calc-row">
                <span>CGST (9%):</span>
                <span>₹{cgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="calc-row">
                <span>SGST (9%):</span>
                <span>₹{sgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="calc-row total-row">
                <span>Grand Total (Incl. GST):</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              {/* Payment Breakdown: Paid Amount vs Balance Due */}
              <div className="calc-row" style={{ background: 'rgba(16,185,129,0.1)', padding: '6px 12px', marginTop: '6px', borderRadius: '6px' }}>
                <span style={{ color: '#047857', fontWeight: 700 }}>Amount Paid by User:</span>
                <strong style={{ color: '#047857' }}>₹{paidAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div className="calc-row" style={{ background: dueAmount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', padding: '6px 12px', marginTop: '4px', borderRadius: '6px' }}>
                <span style={{ color: dueAmount > 0 ? '#b91c1c' : '#047857', fontWeight: 800 }}>Remaining Balance Due:</span>
                <strong style={{ color: dueAmount > 0 ? '#b91c1c' : '#047857', fontSize: '1rem' }}>₹{dueAmount.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="amount-in-words-box">
            <span>Total Amount (in words):</span>
            <strong>{numberToWords(totalAmount)}</strong>
          </div>

          {/* Signatures & Stamp */}
          <div className="invoice-signatures-section">
            <div className="terms-box">
              <h4>Terms &amp; Conditions</h4>
              <ol>
                <li>Goods/Services once supplied are non-refundable.</li>
                <li>Please quote Invoice Number during bank transfer payments.</li>
                <li>Overdue invoices carry 1.5% interest per month.</li>
              </ol>
            </div>

            <div className="signatory-box">
              <div className="stamp-badge">
                <span>APEX DEV</span>
                <small>OFFICIAL SEAL</small>
              </div>
              <p className="for-company">For APEX DEV Technologies Pvt. Ltd.</p>
              <div className="sig-space"></div>
              <p className="auth-signatory">Authorized Signatory</p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="invoice-document-footer">
            <p>This is a computer-generated tax invoice and does not require physical signature under IT Act 2000.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintModal;
