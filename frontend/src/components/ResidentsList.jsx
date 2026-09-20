import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  Eye,
  Edit2,
  Trash2,
  Building2,
  Calendar,
  IndianRupee,
  LayoutGrid,
  List,
  CreditCard
} from 'lucide-react';
import ResidentAvatar from './ResidentAvatar';

export default function ResidentsList({
  residents = [],
  rooms = [],
  payments = [],
  onOpenAddResident,
  onEditResident,
  onDeleteResident,
  onViewResident,
  onOpenMonthlyLedger,
  globalSearch = ''
}) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [feeFilter, setFeeFilter] = useState('All'); // 'All' | 'Paid' | 'Unpaid'
  const [viewMode, setViewMode] = useState('grid');
  const [localSearch, setLocalSearch] = useState('');

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentDate = new Date();
  const currentMonthYear = `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  const currentMonthShort = MONTH_NAMES[currentDate.getMonth()].slice(0, 3);

  const searchKeyword = (globalSearch || localSearch).toLowerCase();

  const isResidentPaidForCurrentMonth = (res) => {
    return payments.some(p =>
      ((p.resident_id && p.resident_id === res.id) || (p.resident_name && res.name && p.resident_name.toLowerCase() === res.name.toLowerCase())) &&
      p.month_year && p.month_year.toLowerCase() === currentMonthYear.toLowerCase() &&
      p.status === 'Paid'
    );
  };

  const filteredResidents = residents.filter(res => {
    const fatherName = (res.father_name || res.guardian_name || '').toLowerCase();
    const agentName = (res.agent_name || '').toLowerCase();
    const parentPhone = (res.parent_phone || res.guardian_phone || '').toLowerCase();

    const matchesSearch =
      res.name.toLowerCase().includes(searchKeyword) ||
      (res.room_number && res.room_number.toLowerCase().includes(searchKeyword)) ||
      (res.phone && res.phone.toLowerCase().includes(searchKeyword)) ||
      fatherName.includes(searchKeyword) ||
      agentName.includes(searchKeyword) ||
      parentPhone.includes(searchKeyword) ||
      (res.college_or_work && res.college_or_work.toLowerCase().includes(searchKeyword));

    const matchesStatus = statusFilter === 'All' || res.status === statusFilter;

    const isPaid = isResidentPaidForCurrentMonth(res);
    const matchesFee = feeFilter === 'All' || (feeFilter === 'Paid' && isPaid) || (feeFilter === 'Unpaid' && !isPaid);

    return matchesSearch && matchesStatus && matchesFee;
  });

  return (
    <div>
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 className="page-title">
              Member Directory & Profiles
            </h2>
            <span className="badge badge-active">
              {residents.length} Members
            </span>
          </div>
        </div>

        <button onClick={onOpenAddResident} className="btn btn-coral">
          <Plus size={18} />
          <span>Add New Resident</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="warm-card filter-toolbar">
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: 'min(100%, 260px)', width: '100%' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search name, room, father's name, phone, agent..."
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px', height: '40px', fontSize: '0.86rem' }}
          />
        </div>

        {/* Controls: Status Chips + View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
          {/* Status & Fee Filter Buttons */}
          <div className="filter-chips-row">
            {['All', 'Active', 'Notice Period', 'Vacated'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: statusFilter === st ? 'var(--color-ruby)' : 'var(--bg-input)',
                  color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'var(--transition)',
                  whiteSpace: 'nowrap'
                }}
              >
                {st}
              </button>
            ))}

            <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 4px' }} />

            <button
              onClick={() => setFeeFilter(feeFilter === 'Unpaid' ? 'All' : 'Unpaid')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: feeFilter === 'Unpaid' ? '#dc2626' : 'var(--bg-input)',
                color: feeFilter === 'Unpaid' ? '#ffffff' : '#b91c1c',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap'
              }}
            >
              Unpaid ({currentMonthShort})
            </button>

            <button
              onClick={() => setFeeFilter(feeFilter === 'Paid' ? 'All' : 'Paid')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: feeFilter === 'Paid' ? '#16a34a' : 'var(--bg-input)',
                color: feeFilter === 'Paid' ? '#ffffff' : '#15803d',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap'
              }}
            >
              Paid ({currentMonthShort})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-input)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '5px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? 'var(--color-ruby)' : 'var(--text-muted)',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '5px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? 'var(--color-ruby)' : 'var(--text-muted)',
                boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <List size={14} /> Table
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredResidents.length === 0 && (
        <div className="warm-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Users size={44} color="var(--color-coral)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>No Residents Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '380px', margin: '4px auto 16px' }}>
            {residents.length === 0 ? 'No residents currently registered. Click below to add the first member.' : 'No residents match your search keyword or filter.'}
          </p>
          <button onClick={onOpenAddResident} className="btn btn-coral">
            <Plus size={16} /> Add New Resident
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredResidents.length > 0 && (
        <div className="responsive-cards-grid">
          {filteredResidents.map(res => {
            const fatherName = res.father_name || res.guardian_name;
            const depositAmt = res.deposit !== undefined && res.deposit !== '' ? res.deposit : (res.security_deposit || 0);

            return (
              <div key={res.id} className="warm-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Photo & Name */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <ResidentAvatar
                    name={res.name}
                    photoUrl={res.photo_url}
                    size={60}
                    borderRadius="14px"
                    border="2px solid var(--border-color)"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {res.name}
                      </h3>
                      <span className={`badge badge-${res.status === 'Active' ? 'active' : (res.status === 'Notice Period' ? 'pending' : 'full')}`}>
                        {res.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{
                        background: '#ffedd5',
                        color: '#c2410c',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.78rem'
                      }}>
                        Room {res.room_number || 'Unassigned'}
                      </span>
                      {res.agent_name && (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Ref: {res.agent_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Key Details Summary */}
                <div style={{
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  marginBottom: '12px',
                  flex: 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{res.phone}</span>
                  </div>
                  {fatherName && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Father:</span>
                      <span style={{ fontWeight: 600 }}>{fatherName}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{currentMonthShort} Fee Status:</span>
                    <span className={`badge badge-${isResidentPaidForCurrentMonth(res) ? 'paid' : 'overdue'}`} style={{ fontSize: '0.72rem' }}>
                      {isResidentPaidForCurrentMonth(res) ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Joining Deposit:</span>
                    <span style={{ fontWeight: 800, color: '#15803d' }}>₹{Number(depositAmt).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Monthly Room Rent:</span>
                    <span style={{ fontWeight: 900, color: '#c2410c' }}>
                      ₹{Number(res.monthly_rent || 0).toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                </div>

                {/* 12-Month Payment Button */}
                <button
                  onClick={() => onOpenMonthlyLedger && onOpenMonthlyLedger(res)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    width: '100%',
                    marginBottom: '10px',
                    background: '#f0fdf4',
                    borderColor: '#86efac',
                    color: '#15803d',
                    fontWeight: 800,
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  title="View 12 Months Payment Schedule & GPay/Cash Entries"
                >
                  <Calendar size={14} />
                  <span>12-Month Payments Ledger</span>
                </button>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <a
                      href={`tel:${res.phone}`}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 7px' }}
                      title="Call Resident"
                    >
                      <Phone size={13} color="#15803d" />
                    </a>
                    <a
                      href={`https://wa.me/${res.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 7px' }}
                      title="WhatsApp Chat"
                    >
                      <MessageSquare size={13} color="#15803d" />
                    </a>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => onViewResident(res)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 7px' }}
                      title="View Full Profile"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      onClick={() => onEditResident(res)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 7px' }}
                      title="Edit Resident"
                    >
                      <Edit2 size={13} color="var(--color-amber)" />
                    </button>
                    <button
                      onClick={() => onDeleteResident(res.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 7px', color: 'var(--color-ruby)' }}
                      title="Vacate Resident"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredResidents.length > 0 && (
        <div className="warm-card" style={{ overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Room</th>
                  <th>Contact</th>
                  <th>Father / Parents</th>
                  <th>Joining Date</th>
                  <th>Deposit</th>
                  <th>Monthly Room Rent</th>
                  <th>{currentMonthShort} Fee</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.map(res => {
                  const isPaid = isResidentPaidForCurrentMonth(res);
                  return (
                    <tr key={res.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <ResidentAvatar
                            name={res.name}
                            photoUrl={res.photo_url}
                            size={36}
                            borderRadius="50%"
                          />
                          <div>
                            <div style={{ fontWeight: 800 }}>{res.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Agent: {res.agent_name || 'Direct'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          background: '#ffedd5',
                          color: '#c2410c',
                          padding: '3px 7px',
                          borderRadius: '6px',
                          fontWeight: 800,
                          fontSize: '0.76rem'
                        }}>
                          Room {res.room_number || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', fontWeight: 600 }}>{res.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{res.father_name || res.guardian_name || '-'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{res.parent_phone || res.guardian_phone || ''}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{res.joining_date || res.admission_date || '-'}</td>
                      <td style={{ fontWeight: 800, color: '#15803d' }}>
                        ₹{Number(res.deposit !== undefined ? res.deposit : (res.security_deposit || 10000)).toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontWeight: 900, color: '#c2410c' }}>
                        ₹{Number(res.monthly_rent || 0).toLocaleString('en-IN')}/mo
                      </td>
                      <td>
                        <span className={`badge badge-${isPaid ? 'paid' : 'overdue'}`}>
                          {isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${res.status === 'Active' ? 'active' : 'pending'}`}>
                          {res.status}
                        </span>
                      </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                        <button
                          onClick={() => onOpenMonthlyLedger && onOpenMonthlyLedger(res)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#15803d', fontWeight: 800, background: '#f0fdf4', borderColor: '#86efac' }}
                          title="12 Months Payment Sheet"
                        >
                          <Calendar size={13} /> 12M Ledger
                        </button>
                        <button onClick={() => onViewResident(res)} className="btn-icon" style={{ padding: '4px' }} title="View">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => onEditResident(res)} className="btn-icon" style={{ padding: '4px' }} title="Edit">
                          <Edit2 size={14} color="var(--color-amber)" />
                        </button>
                        <button onClick={() => onDeleteResident(res.id)} className="btn-icon" style={{ padding: '4px', color: 'var(--color-ruby)' }} title="Remove">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
