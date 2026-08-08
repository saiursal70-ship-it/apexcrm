import React, { useState } from 'react';
import Icon from './Icon';
import ApexDevLogo from './ApexDevLogo';
import { createRecord, updateRecord } from '../api/api';

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

const QuotationPrintModal = ({ quotation, onClose }) => {
  const [converting, setConverting] = useState(false);

  if (!quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleConvertToInvoice = async () => {
    setConverting(true);
    try {
      const invNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
      const amount = Number(quotation.total_amount || quotation.amount || 0);
      const invoiceData = {
        invoice_number: invNum,
        client_account: quotation.client_name || quotation.company_name || 'Client Account',
        amount: amount,
        paid_amount: 0,
        due_amount: amount,
        payment_status: 'Pending',
        payment_mode: 'Bank Transfer',
        due_date: quotation.valid_until || new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10)
      };

      await createRecord('invoices', invoiceData);
      try {
        await updateRecord('quotations', quotation.id, { status: 'Accepted & Invoiced' });
      } catch (e) {}

      alert(`✅ Success! Quotation #${quotation.quotation_number || quotation.id} converted into Tax Invoice #${invNum}!`);
      onClose();
    } catch (err) {
      alert('Error converting quotation to invoice: ' + (err.response?.data?.error || err.message));
    } finally {
      setConverting(false);
    }
  };

  const totalAmount = Number(quotation.total_amount || quotation.amount || 0);
  const subtotal = Math.round(totalAmount / 1.18);
  const totalGst = totalAmount - subtotal;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  const statusClass = String(quotation.status || 'draft').toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal-container">
        {/* Top Control Action Bar (Hidden when printing) */}
        <div className="invoice-action-bar no-print">
          <div className="action-bar-title">
            <Icon name="quotation" size={18} />
            <span>Commercial Quotation #{quotation.quotation_number || quotation.id}</span>
          </div>
          <div className="action-bar-buttons">
            <button
              type="button"
              className="btn btn-success print-trigger-btn"
              style={{ background: '#10b981', color: '#ffffff' }}
              onClick={handleConvertToInvoice}
              disabled={converting}
            >
              <Icon name="invoice" size={16} /> {converting ? 'Converting...' : '⚡ Convert to Tax Invoice'}
            </button>
            <button type="button" className="btn btn-primary print-trigger-btn" onClick={handlePrint}>
              <Icon name="printer" size={16} /> Print / Save PDF
            </button>
            <button type="button" className="btn btn-outline modal-close-btn" onClick={onClose}>
              <Icon name="close" size={16} /> Close
            </button>
          </div>
        </div>

        {/* Printable Official Quotation Document */}
        <div className="printable-invoice" id="printable-quotation-area">
          {/* Company Letterhead Header */}
          <div className="invoice-letterhead">
            <div className="letterhead-brand">
              <div className="company-logo-badge" style={{ background: 'transparent', padding: 0 }}>
                <ApexDevLogo variant="horizontal" size={40} />
              </div>
              <h2 className="company-name" style={{ marginTop: '6px' }}>APEX DEV Technologies Pvt. Ltd.</h2>
              <p className="company-address">Suite 402, Business Bay, MG Road, Bangalore - 560001, India</p>
              <p className="company-contact">Phone: +91 80 4567 8900 | Email: sales@apexdev.com | Web: www.apexdev.com</p>
              <p className="company-gst">GSTIN: <strong>29AAACC1234H1Z5</strong> | PAN: <strong>AAACC1234H</strong></p>
            </div>
            <div className="invoice-header-meta">
              <h1 className="doc-title" style={{ color: '#7c3aed' }}>COMMERCIAL QUOTATION</h1>
              <div className={`invoice-status-badge status-${statusClass}`} style={statusClass === 'accepted' ? { background: '#dcfce7', color: '#15803d' } : {}}>
                {quotation.status || 'Draft'}
              </div>
            </div>
          </div>

          <div className="invoice-divider" style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #cbd5e1 100%)' }}></div>

          {/* Quotation Details & Client Grid */}
          <div className="invoice-details-grid">
            <div className="bill-to-box">
              <span className="details-label">QUOTATION PREPARED FOR:</span>
              <h3 className="client-company-name">{quotation.client_name || 'Valued Client'}</h3>
              <p className="client-info-line">Project Title: <strong>{quotation.project_title || 'Software & Tech Solutions'}</strong></p>
              {quotation.email && <p className="client-info-line">Email: <strong>{quotation.email}</strong></p>}
              {quotation.phone && <p className="client-info-line">Phone: <strong>{quotation.phone}</strong></p>}
            </div>

            <div className="invoice-meta-box">
              <div className="meta-row">
                <span className="meta-label">Quotation Ref #:</span>
                <span className="meta-value highlight" style={{ color: '#7c3aed' }}>{quotation.quotation_number || `QT-${quotation.id}`}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Quotation Date:</span>
                <span className="meta-value">{quotation.quotation_date ? new Date(quotation.quotation_date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Valid Until:</span>
                <span className="meta-value">{quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString('en-IN') : '15 Days from Date'}</span>
              </div>
            </div>
          </div>

          {/* Particulars & Scope Table */}
          <table className="invoice-items-table">
            <thead>
              <tr style={{ background: '#4c1d95' }}>
                <th style={{ width: '8%' }}>#</th>
                <th style={{ width: '48%' }}>Scope of Work / Deliverables Description</th>
                <th style={{ width: '10%' }}>Qty</th>
                <th style={{ width: '17%', textAlign: 'right' }}>Unit Price (₹)</th>
                <th style={{ width: '17%', textAlign: 'right' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <strong>{quotation.project_title || 'Enterprise Software Implementation & Support'}</strong>
                  <br />
                  <span className="item-subtext">Complete design, customization, deployment, and 12-month SLA maintenance package for {quotation.client_name}.</span>
                </td>
                <td>1</td>
                <td style={{ textAlign: 'right' }}>₹{subtotal.toLocaleString('en-IN')}</td>
                <td style={{ textAlign: 'right' }}>₹{subtotal.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          {/* Tax Calculation & Summary Table */}
          <div className="invoice-summary-section">
            <div className="bank-details-box">
              <h4>COMPANY PAYMENT TERMS</h4>
              <p>50% Advance upon Quotation acceptance.</p>
              <p>50% upon final delivery & sign-off.</p>
              <p>Bank: <strong>HDFC Bank Ltd</strong> (A/C: <strong>50200012345678</strong>)</p>
              <p>IFSC: <strong>HDFC0001234</strong> | UPI: <strong>apexdev@hdfcbank</strong></p>
            </div>

            <div className="totals-calculation-box">
              <div className="calc-row">
                <span>Estimated Subtotal:</span>
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
              <div className="calc-row total-row" style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)' }}>
                <span>Total Estimated Value:</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="amount-in-words-box">
            <span>Total Value (in words):</span>
            <strong>{numberToWords(totalAmount)}</strong>
          </div>

          {/* Terms & Conditions / Signatures */}
          <div className="invoice-signatures-section">
            <div className="terms-box">
              <h4>Terms &amp; Conditions</h4>
              <ol>
                <li>Prices quoted are valid for 15 days from the quotation date.</li>
                <li>{quotation.terms || 'GST (18%) extra as applicable under Indian Tax Laws.'}</li>
                <li>Any additional scope request will be billed separately upon mutual agreement.</li>
              </ol>
            </div>

            <div className="signatory-box">
              <div className="stamp-badge" style={{ borderColor: '#7c3aed', color: '#7c3aed' }}>
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
            <p>This is a computer-generated commercial quotation issued by APEX DEV Technologies Pvt. Ltd.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPrintModal;
