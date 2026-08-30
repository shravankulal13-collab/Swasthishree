import React from 'react';
import { X, Printer, CheckCircle2, Building2 } from 'lucide-react';

export default function ReceiptModal({ payment, isOpen, onClose }) {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '660px', background: '#ffffff', color: '#0f172a' }} onClick={e => e.stopPropagation()}>
        {/* Controls */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e2e8f0', background: '#fdfbf7' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>
            Official Rent Receipt • {payment.receipt_number}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handlePrint} className="btn btn-coral btn-sm">
              <Printer size={15} /> Print / Save PDF
            </button>
            <button onClick={onClose} className="btn-icon" style={{ borderRadius: '50%' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="printable-area" style={{ padding: '28px 24px', background: '#ffffff', color: '#0f172a' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #dc2626', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div>
                  <h1 className="kannada-text" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#991b1b', margin: 0, lineHeight: 1 }}>
                    ಸ್ವಸ್ತಿ ಶ್ರೀ
                  </h1>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    SWASTHISHREE LUXURY LIVING & PG
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px', lineHeight: 1.3 }}>
                Premium Student & Professional Accommodations<br />
                Phone: +91 98450 12345 • Email: contact@swasthishree.com
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#dc2626', textTransform: 'uppercase' }}>
                RENT RECEIPT
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginTop: '2px' }}>
                No: <span style={{ fontFamily: 'monospace' }}>{payment.receipt_number}</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                Date: {payment.payment_date || new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>

          {/* Resident Details Box */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', background: '#fffaf5', border: '1.5px solid #fed7aa', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9a3412', textTransform: 'uppercase' }}>Received From:</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                {payment.resident_name}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>
                Room No: <strong style={{ color: '#ea580c' }}>{payment.room_number || '101'}</strong>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9a3412', textTransform: 'uppercase' }}>Billing Details:</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                Period: {payment.month_year}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                Mode: {payment.payment_method} {payment.transaction_ref ? `(${payment.transaction_ref})` : ''}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', textAlign: 'left', minWidth: '380px' }}>
              <thead>
                <tr style={{ background: '#fdfbf7', borderBottom: '2px solid #fed7aa' }}>
                  <th style={{ padding: '8px 10px', fontSize: '0.76rem', fontWeight: 900, color: '#334155' }}>#</th>
                  <th style={{ padding: '8px 10px', fontSize: '0.76rem', fontWeight: 900, color: '#334155' }}>Description</th>
                  <th style={{ padding: '8px 10px', fontSize: '0.76rem', fontWeight: 900, color: '#334155', textAlign: 'right' }}>Month</th>
                  <th style={{ padding: '8px 10px', fontSize: '0.76rem', fontWeight: 900, color: '#334155', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontSize: '0.82rem' }}>1</td>
                  <td style={{ padding: '10px', fontSize: '0.82rem' }}>
                    <strong>Accommodation & Mess (Room {payment.room_number})</strong>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Includes 3 daily meals, Wi-Fi, electricity, housekeeping</div>
                  </td>
                  <td style={{ padding: '10px', fontSize: '0.82rem', textAlign: 'right', color: '#475569' }}>{payment.month_year}</td>
                  <td style={{ padding: '10px', fontSize: '0.9rem', fontWeight: 800, textAlign: 'right' }}>
                    ₹{Number(payment.amount).toLocaleString('en-IN')}.00
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #0f172a' }}>
                  <td colSpan={3} style={{ padding: '12px 10px', fontSize: '0.9rem', fontWeight: 900, textAlign: 'right' }}>
                    Total Paid:
                  </td>
                  <td style={{ padding: '12px 10px', fontSize: '1.15rem', fontWeight: 900, textAlign: 'right', color: '#15803d' }}>
                    ₹{Number(payment.amount).toLocaleString('en-IN')}.00
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Stamp & Signature */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '2px solid #15803d',
              color: '#15803d',
              padding: '5px 12px',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '0.8rem',
              textTransform: 'uppercase'
            }}>
              <CheckCircle2 size={16} /> PAYMENT VERIFIED
            </div>

            <div style={{ textAlign: 'center', minWidth: '160px' }}>
              <div style={{ borderBottom: '1.5px solid #94a3b8', width: '140px', margin: '0 auto 4px' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>Authorized Signature</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Swasthishree Management</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
