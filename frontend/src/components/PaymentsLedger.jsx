import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  IndianRupee,
  Search,
  Printer,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  X,
  UserCheck,
  Smartphone,
  Banknote,
  Filter
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PaymentsLedger({
  payments = [],
  residents = [],
  onCreatePayment,
  onDeletePayment,
  onViewReceipt,
  onOpenMonthlyLedger
}) {
  const currentDate = new Date();
  const currentMonthName = MONTH_NAMES[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  const defaultMonthYear = `${currentMonthName} ${currentYear}`;

  const [selectedMonth, setSelectedMonth] = useState(defaultMonthYear);
  const [activeFeeTab, setActiveFeeTab] = useState('unpaid'); // 'unpaid' | 'paid' | 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [isQuickPayOpen, setIsQuickPayOpen] = useState(false);
  const [quickPayData, setQuickPayData] = useState({
    resident_id: '',
    resident_name: '',
    room_number: '',
    amount: 7500,
    month_year: defaultMonthYear,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'GPay',
    transaction_ref: '',
    status: 'Paid',
    notes: ''
  });

  // Generate available months list (past 6 months + next 6 months)
  const availableMonths = useMemo(() => {
    const list = [];
    const baseDate = new Date();
    for (let i = -3; i <= 6; i++) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      list.push(`${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`);
    }
    return list;
  }, []);

  // Compute Active Residents Fee Status for the selectedMonth
  const { paidResidents, unpaidResidents, monthTotalExpected, monthTotalCollected, monthTotalPending } = useMemo(() => {
    const activeResidents = residents.filter(r => r.status === 'Active');
    const paidList = [];
    const unpaidList = [];

    activeResidents.forEach(res => {
      // Find matching paid payment for this resident in selectedMonth
      const matchedPayment = payments.find(p => {
        const matchesRes = (p.resident_id && p.resident_id === res.id) ||
          (p.resident_name && res.name && p.resident_name.toLowerCase() === res.name.toLowerCase());
        const matchesMonth = p.month_year && p.month_year.toLowerCase() === selectedMonth.toLowerCase();
        return matchesRes && matchesMonth && p.status === 'Paid';
      });

      const rentAmount = Number(res.monthly_rent || 7500);

      if (matchedPayment) {
        paidList.push({
          resident: res,
          payment: matchedPayment,
          amountPaid: Number(matchedPayment.amount || rentAmount),
          paidDate: matchedPayment.payment_date,
          method: matchedPayment.payment_method || 'GPay',
          receiptNumber: matchedPayment.receipt_number
        });
      } else {
        unpaidList.push({
          resident: res,
          rentDue: rentAmount
        });
      }
    });

    const totalExpected = activeResidents.reduce((acc, r) => acc + Number(r.monthly_rent || 7500), 0);
    const totalCollected = paidList.reduce((acc, p) => acc + p.amountPaid, 0);
    const totalPending = unpaidList.reduce((acc, u) => acc + u.rentDue, 0);

    return {
      paidResidents: paidList,
      unpaidResidents: unpaidList,
      monthTotalExpected: totalExpected,
      monthTotalCollected: totalCollected,
      monthTotalPending: totalPending
    };
  }, [residents, payments, selectedMonth]);

  // Filtered lists by search term
  const filteredUnpaid = unpaidResidents.filter(u =>
    u.resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.resident.room_number && u.resident.room_number.includes(searchTerm)) ||
    (u.resident.phone && u.resident.phone.includes(searchTerm))
  );

  const filteredPaid = paidResidents.filter(p =>
    p.resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.resident.room_number && p.resident.room_number.includes(searchTerm)) ||
    (p.receiptNumber && p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAllPayments = payments.filter(p =>
    p.resident_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.room_number && p.room_number.includes(searchTerm)) ||
    (p.receipt_number && p.receipt_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.month_year && p.month_year.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Open Quick Pay Modal for an unpaid resident
  const handleOpenMarkPaid = (resident) => {
    setQuickPayData({
      resident_id: resident.id,
      resident_name: resident.name,
      room_number: resident.room_number || '',
      amount: Number(resident.monthly_rent || 7500),
      month_year: selectedMonth,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'GPay',
      transaction_ref: '',
      status: 'Paid',
      notes: ''
    });
    setIsQuickPayOpen(true);
  };

  // Submit Quick Payment
  const handleQuickPaySubmit = async (e) => {
    e.preventDefault();
    await onCreatePayment({
      ...quickPayData,
      amount: Number(quickPayData.amount)
    });
    setIsQuickPayOpen(false);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 className="page-title">
              Fee Management & Rent Ledger
            </h2>
            <span className="badge badge-active">
              {residents.length} Total Residents
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '2px' }}>
            Track monthly room rent payments, separate Paid and Unpaid members, and record GPay or Cash payments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Month Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '4px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <Calendar size={16} color="var(--color-ruby)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Month:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="form-select"
              style={{ border: 'none', background: 'transparent', padding: '4px 8px', fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setQuickPayData({
                resident_id: residents[0]?.id || '',
                resident_name: residents[0]?.name || '',
                room_number: residents[0]?.room_number || '',
                amount: Number(residents[0]?.monthly_rent || 7500),
                month_year: selectedMonth,
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: 'GPay',
                transaction_ref: '',
                status: 'Paid',
                notes: ''
              });
              setIsQuickPayOpen(true);
            }}
            className="btn btn-coral"
          >
            <IndianRupee size={16} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Monthly Financial Summary Cards for Selected Month */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {/* Expected Rent */}
        <div className="warm-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            {selectedMonth} Expected Rent
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
            ₹{monthTotalExpected.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            From {residents.filter(r => r.status === 'Active').length} active residents
          </div>
        </div>

        {/* Collected Rent (Paid) */}
        <div className="warm-card" style={{ padding: '18px 20px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
              ✓ Collected (Paid)
            </span>
            <span className="badge badge-paid" style={{ fontSize: '0.72rem' }}>
              {paidResidents.length} Paid
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>
            ₹{monthTotalCollected.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#166534' }}>
            {monthTotalExpected > 0 ? Math.round((monthTotalCollected / monthTotalExpected) * 100) : 0}% collection rate
          </div>
        </div>

        {/* Pending Due (Unpaid) */}
        <div className="warm-card" style={{ padding: '18px 20px', borderLeft: '4px solid #dc2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase' }}>
              ⚠️ Pending Dues (Unpaid)
            </span>
            <span className="badge badge-overdue" style={{ fontSize: '0.72rem' }}>
              {unpaidResidents.length} Unpaid
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: monthTotalPending > 0 ? '#b91c1c' : '#15803d', marginTop: '4px' }}>
            ₹{monthTotalPending.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.76rem', color: monthTotalPending > 0 ? '#991b1b' : '#15803d' }}>
            {unpaidResidents.length > 0 ? `${unpaidResidents.length} members have fee pending` : 'All rents cleared for this month'}
          </div>
        </div>
      </div>

      {/* Main Tab Switcher & Search Bar */}
      <div className="warm-card filter-toolbar" style={{ marginBottom: '16px' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 'min(100%, 220px)' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder={`Search resident or room in ${selectedMonth}...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px', height: '40px', fontSize: '0.86rem' }}
          />
        </div>

        {/* Category Tabs: Unpaid vs Paid vs All */}
        <div className="filter-chips-row">
          <button
            onClick={() => setActiveFeeTab('unpaid')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              background: activeFeeTab === 'unpaid' ? '#dc2626' : 'var(--bg-input)',
              color: activeFeeTab === 'unpaid' ? '#ffffff' : '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition)'
            }}
          >
            <span>🔴 Unpaid / Due</span>
            <span style={{
              background: activeFeeTab === 'unpaid' ? '#ffffff' : '#fee2e2',
              color: activeFeeTab === 'unpaid' ? '#dc2626' : '#991b1b',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '0.72rem',
              fontWeight: 900
            }}>
              {unpaidResidents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFeeTab('paid')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              background: activeFeeTab === 'paid' ? '#16a34a' : 'var(--bg-input)',
              color: activeFeeTab === 'paid' ? '#ffffff' : '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition)'
            }}
          >
            <span>🟢 Paid</span>
            <span style={{
              background: activeFeeTab === 'paid' ? '#ffffff' : '#dcfce7',
              color: activeFeeTab === 'paid' ? '#16a34a' : '#15803d',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '0.72rem',
              fontWeight: 900
            }}>
              {paidResidents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFeeTab('all')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              background: activeFeeTab === 'all' ? 'var(--color-ruby)' : 'var(--bg-input)',
              color: activeFeeTab === 'all' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'var(--transition)'
            }}
          >
            <span>All Records ({payments.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: UNPAID RESIDENTS FOR THIS MONTH */}
      {activeFeeTab === 'unpaid' && (
        <div className="warm-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> Unpaid Members for {selectedMonth} ({filteredUnpaid.length})
            </div>
            <div style={{ fontSize: '0.78rem', color: '#b91c1c' }}>
              Click "Mark as Paid" after collecting GPay/Cash
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Room</th>
                  <th>Contact</th>
                  <th>Monthly Room Rent</th>
                  <th>Fee Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnpaid.map(item => (
                  <tr key={item.resident.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={item.resident.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
                          alt={item.resident.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 800 }}>{item.resident.name}</div>
                          {item.resident.father_name && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Father: {item.resident.father_name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
                        Room {item.resident.room_number || 'N/A'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>
                      {item.resident.phone}
                    </td>
                    <td style={{ fontWeight: 900, color: '#dc2626', fontSize: '0.98rem' }}>
                      ₹{item.rentDue.toLocaleString('en-IN')}/mo
                    </td>
                    <td>
                      <span className="badge badge-overdue">
                        🔴 Unpaid ({selectedMonth})
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenMarkPaid(item.resident)}
                          className="btn btn-coral btn-sm"
                          style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800, background: '#16a34a' }}
                        >
                          <CheckCircle2 size={14} /> Mark as Paid
                        </button>
                        {onOpenMonthlyLedger && (
                          <button
                            onClick={() => onOpenMonthlyLedger(item.resident)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px 10px', fontSize: '0.76rem', fontWeight: 700 }}
                            title="Open 12-Month Payment Sheet"
                          >
                            <Calendar size={13} /> 12M Sheet
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUnpaid.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: '#15803d', fontWeight: 700 }}>
                      🎉 Great news! All active residents have paid their rent for {selectedMonth}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: PAID RESIDENTS FOR THIS MONTH */}
      {activeFeeTab === 'paid' && (
        <div className="warm-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Verified Paid Members for {selectedMonth} ({filteredPaid.length})
            </div>
            <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700 }}>
              Total Collected: ₹{monthTotalCollected.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Resident</th>
                  <th>Room</th>
                  <th>Amount Paid</th>
                  <th>Date</th>
                  <th>Payment Mode</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPaid.map(item => (
                  <tr key={item.payment.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-ruby)' }}>
                      {item.receiptNumber || 'REC-AUTO'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{item.resident.name}</div>
                    </td>
                    <td>
                      <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
                        Room {item.resident.room_number || 'N/A'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 900, color: '#15803d', fontSize: '0.98rem' }}>
                      ₹{item.amountPaid.toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {item.paidDate}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {item.method === 'Cash' ? <Banknote size={14} color="#15803d" /> : <Smartphone size={14} color="#0284c7" />}
                        {item.method}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-paid">
                        ✓ PAID
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={() => onViewReceipt(item.payment)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          <Printer size={13} /> Receipt
                        </button>
                        {onOpenMonthlyLedger && (
                          <button
                            onClick={() => onOpenMonthlyLedger(item.resident)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 8px', fontSize: '0.76rem', color: '#15803d' }}
                            title="Open 12-Month Payment Sheet"
                          >
                            <Calendar size={13} /> 12M Sheet
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPaid.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                      No payments recorded yet for {selectedMonth}. Click "Unpaid / Due" tab to record fee payments.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: ALL HISTORICAL RECORDS */}
      {activeFeeTab === 'all' && (
        <div className="warm-card" style={{ overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Resident</th>
                  <th>Room</th>
                  <th>Billing Month</th>
                  <th>Date</th>
                  <th>Mode</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllPayments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-ruby)' }}>
                      {p.receipt_number}
                    </td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{p.resident_name}</div>
                    </td>
                    <td>
                      <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 7px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 800 }}>
                        Room {p.room_number}
                      </span>
                    </td>
                    <td>{p.month_year}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{p.payment_date}</td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{p.payment_method}</span>
                    </td>
                    <td style={{ fontWeight: 900, color: '#15803d', fontSize: '0.95rem' }}>
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge badge-${p.status === 'Paid' ? 'paid' : 'overdue'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={() => onViewReceipt(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          <Printer size={13} /> Receipt
                        </button>
                        <button
                          onClick={() => onDeletePayment(p.id)}
                          className="btn-icon"
                          style={{ padding: '5px', color: 'var(--color-ruby)' }}
                          title="Delete Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK MARK AS PAID / RECORD PAYMENT MODAL */}
      {isQuickPayOpen && (
        <div className="modal-overlay" onClick={() => setIsQuickPayOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>Record Monthly Room Rent</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Mark fee as paid for {quickPayData.month_year}
                </p>
              </div>
              <button onClick={() => setIsQuickPayOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleQuickPaySubmit}>
              <div className="modal-body">
                {/* Resident Selection */}
                <div className="form-group">
                  <label className="form-label">Resident Name *</label>
                  <select
                    required
                    value={quickPayData.resident_id}
                    onChange={e => {
                      const res = residents.find(r => r.id === e.target.value);
                      if (res) {
                        setQuickPayData(prev => ({
                          ...prev,
                          resident_id: res.id,
                          resident_name: res.name,
                          room_number: res.room_number || '',
                          amount: Number(res.monthly_rent || 7500)
                        }));
                      }
                    }}
                    className="form-select"
                  >
                    <option value="">-- Choose Resident --</option>
                    {residents.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Room {r.room_number || 'N/A'}) • Rent: ₹{r.monthly_rent}/mo
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Billing Month *</label>
                    <select
                      value={quickPayData.month_year}
                      onChange={e => setQuickPayData({ ...quickPayData, month_year: e.target.value })}
                      className="form-select"
                    >
                      {availableMonths.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monthly Room Rent (₹) *</label>
                    <input
                      type="number"
                      required
                      value={quickPayData.amount}
                      onChange={e => setQuickPayData({ ...quickPayData, amount: e.target.value })}
                      className="form-input"
                      style={{ fontWeight: 800 }}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Payment Date</label>
                    <input
                      type="date"
                      required
                      value={quickPayData.payment_date}
                      onChange={e => setQuickPayData({ ...quickPayData, payment_date: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Mode</label>
                    <select
                      value={quickPayData.payment_method}
                      onChange={e => setQuickPayData({ ...quickPayData, payment_method: e.target.value })}
                      className="form-select"
                      style={{ fontWeight: 700 }}
                    >
                      <option value="GPay">GPay (Google Pay / UPI)</option>
                      <option value="Cash">Cash at Desk</option>
                      <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction Ref # / Remarks (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI/2026/984721 or Cash verified"
                    value={quickPayData.transaction_ref}
                    onChange={e => setQuickPayData({ ...quickPayData, transaction_ref: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsQuickPayOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-coral" style={{ background: '#16a34a' }}>
                  <CheckCircle2 size={16} /> Confirm Paid & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
