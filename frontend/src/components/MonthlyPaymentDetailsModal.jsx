import React, { useState } from 'react';
import {
  X,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  Printer,
  Edit2,
  Trash2,
  User,
  Building2,
  Phone,
  ArrowRight,
  Shield,
  Smartphone,
  Banknote,
  Plus
} from 'lucide-react';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export default function MonthlyPaymentDetailsModal({
  isOpen,
  onClose,
  resident,
  residents = [],
  payments = [],
  onRecordPayment,
  onDeletePayment,
  onViewReceipt,
  onSelectResident
}) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingMonthIndex, setEditingMonthIndex] = useState(null); // 0 to 11
  const [monthPaymentForm, setMonthPaymentForm] = useState({
    amount: 7500,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'GPay', // GPay or Cash
    transaction_ref: '',
    status: 'Paid',
    notes: ''
  });

  if (!isOpen || !resident) return null;

  // Filter payments for this resident and selected year
  const residentPayments = payments.filter(p => {
    if (p.resident_id && p.resident_id === resident.id) return true;
    if (p.resident_name && resident.name && p.resident_name.toLowerCase() === resident.name.toLowerCase()) return true;
    return false;
  });

  // Map 12 months to payment records
  const monthlyRecords = MONTH_NAMES.map((monthName, index) => {
    const monthYearString = `${monthName} ${selectedYear}`;
    // Match exact month or string containing month and year
    const matchedPayment = residentPayments.find(p => {
      if (!p.month_year) return false;
      const lower = p.month_year.toLowerCase();
      return lower.includes(monthName.toLowerCase()) && (lower.includes(String(selectedYear)) || residentPayments.length <= 12);
    });

    return {
      monthIndex: index,
      monthName,
      monthYear: monthYearString,
      payment: matchedPayment || null,
      isPaid: matchedPayment && matchedPayment.status === 'Paid'
    };
  });

  const totalMonthlyDue = Number(resident.monthly_rent || 7500);
  const totalAnnualDue = totalMonthlyDue * 12;
  const totalPaidAmount = monthlyRecords.reduce((acc, m) => acc + (m.payment ? Number(m.payment.amount || 0) : 0), 0);
  const totalPendingAmount = Math.max(0, totalAnnualDue - totalPaidAmount);
  const paidMonthsCount = monthlyRecords.filter(m => m.isPaid).length;

  const handleOpenMonthDialog = (monthObj) => {
    setEditingMonthIndex(monthObj.monthIndex);
    if (monthObj.payment) {
      setMonthPaymentForm({
        amount: monthObj.payment.amount || totalMonthlyDue,
        payment_date: monthObj.payment.payment_date || new Date().toISOString().split('T')[0],
        payment_method: monthObj.payment.payment_method || 'GPay',
        transaction_ref: monthObj.payment.transaction_ref || '',
        status: monthObj.payment.status || 'Paid',
        notes: monthObj.payment.notes || '',
        id: monthObj.payment.id
      });
    } else {
      setMonthPaymentForm({
        amount: totalMonthlyDue,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'GPay',
        transaction_ref: '',
        status: 'Paid',
        notes: ''
      });
    }
  };

  const handleSaveMonthPayment = async (e) => {
    e.preventDefault();
    if (editingMonthIndex === null) return;

    const monthName = MONTH_NAMES[editingMonthIndex];
    const monthYear = `${monthName} ${selectedYear}`;

    const paymentPayload = {
      resident_id: resident.id,
      resident_name: resident.name,
      room_number: resident.room_number || '',
      amount: Number(monthPaymentForm.amount),
      month_year: monthYear,
      payment_date: monthPaymentForm.payment_date,
      payment_method: monthPaymentForm.payment_method,
      transaction_ref: monthPaymentForm.transaction_ref || `${monthPaymentForm.payment_method}-${Date.now()}`,
      status: monthPaymentForm.status || 'Paid',
      notes: monthPaymentForm.notes || ''
    };

    await onRecordPayment(paymentPayload);
    setEditingMonthIndex(null);
  };

  const handleDeleteMonthPayment = async (paymentId) => {
    if (window.confirm('Clear payment record for this month?')) {
      await onDeletePayment(paymentId);
      setEditingMonthIndex(null);
    }
  };

  const handlePrintLedger = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '900px', width: '96%', maxHeight: '92vh', background: '#ffffff' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Controls */}
        <div className="no-print modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--gradient-coral)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                12-Month Payment Details & Ledger
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Monthly fee tracking with GPay & Cash recording for each of the 12 months.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={handlePrintLedger} className="btn btn-secondary btn-sm" title="Print 12-Month Statement">
              <Printer size={14} /> Print Statement
            </button>
            <button onClick={onClose} className="btn-icon">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Resident Summary Info Box */}
        <div className="printable-area" style={{ padding: '20px 24px 8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            border: '1.5px solid #fed7aa',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={resident.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={resident.name}
                  style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', border: '2px solid #ea580c' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#7c2d12' }}>{resident.name}</h2>
                    <span className="badge badge-active">Room {resident.room_number || 'Unassigned'}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#9a3412', marginTop: '2px' }}>
                    Phone: <strong>{resident.phone}</strong> • Father: <strong>{resident.father_name || resident.guardian_name || 'N/A'}</strong> (Parent Phone: {resident.parent_phone || resident.guardian_phone || 'N/A'})
                  </div>
                </div>
              </div>

              {/* Resident Switcher Dropdown (No-Print) */}
              {residents.length > 1 && (
                <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9a3412' }}>Switch Resident:</span>
                  <select
                    value={resident.id}
                    onChange={(e) => {
                      const found = residents.find(r => r.id === e.target.value);
                      if (found && onSelectResident) onSelectResident(found);
                    }}
                    className="form-select"
                    style={{ width: 'auto', padding: '5px 10px', fontSize: '0.82rem', minHeight: '34px', borderColor: '#fed7aa', background: '#fff' }}
                  >
                    {residents.map(r => (
                      <option key={r.id} value={r.id}>{r.name} (Room {r.room_number})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Detailed Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', borderTop: '1px solid #fed7aa', paddingTop: '12px', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: '#9a3412', fontWeight: 700 }}>Joining Date:</span>
                <div style={{ fontWeight: 800, color: '#431407' }}>{resident.joining_date || resident.admission_date || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: '#9a3412', fontWeight: 700 }}>Agent Name:</span>
                <div style={{ fontWeight: 800, color: '#431407' }}>{resident.agent_name || 'Direct Admission'}</div>
              </div>
              <div>
                <span style={{ color: '#9a3412', fontWeight: 700 }}>Joining Deposit:</span>
                <div style={{ fontWeight: 900, color: '#15803d' }}>₹{Number(resident.deposit !== undefined ? resident.deposit : (resident.security_deposit || 10000)).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ color: '#9a3412', fontWeight: 700 }}>Monthly Rent:</span>
                <div style={{ fontWeight: 900, color: '#c2410c' }}>₹{Number(resident.monthly_rent || 7500).toLocaleString('en-IN')}/mo</div>
              </div>
              {resident.joining_payment_remarks && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: '#9a3412', fontWeight: 700 }}>Joining Payment Remarks:</span>
                  <div style={{ color: '#431407', fontStyle: 'italic', marginTop: '2px' }}>{resident.joining_payment_remarks}</div>
                </div>
              )}
            </div>
          </div>

          {/* 12-Month Financial KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div className="warm-card" style={{ padding: '12px 16px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>12-Month Expected</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>₹{totalAnnualDue.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>12 months × ₹{totalMonthlyDue}</div>
            </div>

            <div className="warm-card" style={{ padding: '12px 16px', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>Total Paid</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>₹{totalPaidAmount.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>{paidMonthsCount} of 12 Months Cleared</div>
            </div>

            <div className="warm-card" style={{ padding: '12px 16px', background: totalPendingAmount > 0 ? '#fffbeb' : '#f0fdf4', borderColor: totalPendingAmount > 0 ? '#fde68a' : '#bbf7d0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: totalPendingAmount > 0 ? '#b45309' : '#15803d', textTransform: 'uppercase' }}>Remaining Balance</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: totalPendingAmount > 0 ? '#b45309' : '#15803d', marginTop: '2px' }}>₹{totalPendingAmount.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{12 - paidMonthsCount} months remaining</div>
            </div>
          </div>

          {/* Year Selector (No-Print) */}
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              12 Months Payment Schedule ({selectedYear})
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Year:</span>
              {[2025, 2026, 2027].map(yr => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedYear === yr ? 'var(--color-coral)' : 'var(--bg-input)',
                    color: selectedYear === yr ? '#ffffff' : 'var(--text-secondary)'
                  }}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {/* 12 MONTHS PAYMENT ROWS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {monthlyRecords.map((m) => {
              const isPaid = m.isPaid;
              const p = m.payment;

              return (
                <div
                  key={m.monthName}
                  style={{
                    border: isPaid ? '1.5px solid #86efac' : '1.5px solid var(--border-color)',
                    background: isPaid ? '#fcfdfa' : '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    flexWrap: 'wrap',
                    transition: 'var(--transition)'
                  }}
                >
                  {/* Month Label */}
                  <div style={{ minWidth: '130px' }}>
                    <div style={{ fontSize: '0.98rem', fontWeight: 900, color: isPaid ? '#15803d' : 'var(--text-primary)' }}>
                      {m.monthName} {selectedYear}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Rent Due: ₹{totalMonthlyDue}
                    </div>
                  </div>

                  {/* CLICKABLE PAYMENT BOX (Sufficient space for payment details) */}
                  <div
                    onClick={() => handleOpenMonthDialog(m)}
                    style={{
                      flex: 1,
                      minWidth: 'min(100%, 260px)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isPaid ? '#f0fdf4' : 'var(--bg-input)',
                      border: isPaid ? '1.5px solid #bbf7d0' : '1.5px dashed #cbd5e1',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                    title={isPaid ? "Click to view / modify payment details" : "Click to enter Cash or GPay payment"}
                  >
                    {isPaid ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#15803d' }}>
                            ₹{Number(p.amount).toLocaleString('en-IN')}
                          </span>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: p.payment_method === 'Cash' ? '#ffedd5' : '#e0e7ff',
                            color: p.payment_method === 'Cash' ? '#c2410c' : '#4338ca',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {p.payment_method === 'Cash' ? <Banknote size={12} /> : <Smartphone size={12} />}
                            {p.payment_method}
                          </span>
                          <span className="badge badge-paid" style={{ fontSize: '0.68rem' }}>
                            Verified
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '3px' }}>
                          Paid on: <strong>{p.payment_date}</strong> {p.transaction_ref ? `• Ref: ${p.transaction_ref}` : ''}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ea580c' }}>
                            Click to Enter Payment Details
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            Supports Date, Cash, GPay & custom amount
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="no-print" style={{ fontSize: '0.76rem', color: isPaid ? '#15803d' : '#94a3b8', fontWeight: 700 }}>
                      {isPaid ? '✏️ Edit' : 'Pay'}
                    </div>
                  </div>

                  {/* Actions (Receipt / Edit) */}
                  <div className="no-print" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {isPaid && (
                      <button
                        onClick={() => onViewReceipt(p)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                        title="Print Official Rent Receipt"
                      >
                        <Printer size={13} /> Receipt
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenMonthDialog(m)}
                      className="btn-icon"
                      style={{ padding: '4px' }}
                      title="Enter/Update Details"
                    >
                      <Edit2 size={14} color="var(--color-amber)" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="no-print modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close Ledger
          </button>
          <button onClick={handlePrintLedger} className="btn btn-coral">
            <Printer size={15} /> Print Full 12-Month Sheet
          </button>
        </div>

        {/* ==============================================================================
            MONTH PAYMENT POPUP (Option for Date, Cash, GPay, and Sufficient Amount Space)
            ============================================================================== */}
        {editingMonthIndex !== null && (
          <div
            className="modal-overlay"
            style={{ zIndex: 1050, background: 'rgba(15, 23, 42, 0.7)' }}
            onClick={() => setEditingMonthIndex(null)}
          >
            <div
              className="modal-content"
              style={{ maxWidth: '480px', width: '92%' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h3 style={{ fontSize: '1.18rem', fontWeight: 900 }}>
                    Payment Details: {MONTH_NAMES[editingMonthIndex]} {selectedYear}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Resident: <strong>{resident.name}</strong> (Room {resident.room_number})
                  </p>
                </div>
                <button onClick={() => setEditingMonthIndex(null)} className="btn-icon">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveMonthPayment}>
                <div className="modal-body">
                  {/* 1. Payment Date Option */}
                  <div className="form-group">
                    <label className="form-label">Payment Date *</label>
                    <input
                      type="date"
                      required
                      value={monthPaymentForm.payment_date}
                      onChange={e => setMonthPaymentForm({ ...monthPaymentForm, payment_date: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  {/* 2. Payment Mode (Cash / GPay) Option */}
                  <div className="form-group">
                    <label className="form-label">Payment Mode *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {/* GPay Option */}
                      <button
                        type="button"
                        onClick={() => setMonthPaymentForm({ ...monthPaymentForm, payment_method: 'GPay' })}
                        style={{
                          padding: '14px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: monthPaymentForm.payment_method === 'GPay' ? '2.5px solid #4f46e5' : '1.5px solid var(--border-color)',
                          background: monthPaymentForm.payment_method === 'GPay' ? '#eef2ff' : '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'var(--transition)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Smartphone size={22} color={monthPaymentForm.payment_method === 'GPay' ? '#4f46e5' : '#64748b'} />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: monthPaymentForm.payment_method === 'GPay' ? '#4f46e5' : 'var(--text-primary)' }}>
                          📱 GPay (Google Pay)
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>UPI / Digital Transfer</span>
                      </button>

                      {/* Cash Option */}
                      <button
                        type="button"
                        onClick={() => setMonthPaymentForm({ ...monthPaymentForm, payment_method: 'Cash' })}
                        style={{
                          padding: '14px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: monthPaymentForm.payment_method === 'Cash' ? '2.5px solid #ea580c' : '1.5px solid var(--border-color)',
                          background: monthPaymentForm.payment_method === 'Cash' ? '#fff7ed' : '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'var(--transition)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Banknote size={22} color={monthPaymentForm.payment_method === 'Cash' ? '#ea580c' : '#64748b'} />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: monthPaymentForm.payment_method === 'Cash' ? '#ea580c' : 'var(--text-primary)' }}>
                          💵 Cash
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Cash at Desk</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Sufficient Space to Enter Payment Amount */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.9rem', color: '#15803d' }}>
                      Payment Amount (₹) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                        ₹
                      </span>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 7500"
                        value={monthPaymentForm.amount}
                        onChange={e => setMonthPaymentForm({ ...monthPaymentForm, amount: e.target.value })}
                        className="form-input"
                        style={{
                          paddingLeft: '34px',
                          fontSize: '1.25rem',
                          fontWeight: 900,
                          height: '52px',
                          color: '#15803d',
                          border: '2px solid #bbf7d0',
                          background: '#f0fdf4'
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Standard monthly rent: ₹{totalMonthlyDue}
                    </div>
                  </div>

                  {/* 4. Transaction Reference / Remarks */}
                  <div className="form-group">
                    <label className="form-label">
                      {monthPaymentForm.payment_method === 'GPay' ? 'UPI Transaction ID / Ref #' : 'Cash Receipt No / Remarks'}
                    </label>
                    <input
                      type="text"
                      placeholder={monthPaymentForm.payment_method === 'GPay' ? 'e.g. UPI/2026/894721' : 'e.g. Received by Warden at Desk'}
                      value={monthPaymentForm.transaction_ref}
                      onChange={e => setMonthPaymentForm({ ...monthPaymentForm, transaction_ref: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  {/* 5. Payment Status */}
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={monthPaymentForm.status}
                      onChange={e => setMonthPaymentForm({ ...monthPaymentForm, status: e.target.value })}
                      className="form-select"
                    >
                      <option value="Paid">Paid (Full Payment Verified)</option>
                      <option value="Pending">Pending / Due</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                  {monthPaymentForm.id ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteMonthPayment(monthPaymentForm.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--color-ruby)' }}
                    >
                      <Trash2 size={14} /> Clear Month
                    </button>
                  ) : <div />}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setEditingMonthIndex(null)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-coral">
                      Save {monthPaymentForm.payment_method} Payment
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
