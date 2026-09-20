import React from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Building2,
  Calendar,
  IndianRupee,
  Shield,
  Heart,
  Mail,
  User,
  Clock,
  CreditCard,
  UserCheck,
  FileText
} from 'lucide-react';
import ResidentAvatar from './ResidentAvatar';

export default function ResidentDetailsModal({
  resident,
  isOpen,
  onClose,
  onEdit,
  onRecordPayment,
  onOpenMonthlyLedger
}) {
  if (!isOpen || !resident) return null;

  const fatherName = resident.father_name || resident.guardian_name || 'N/A';
  const parentPhone = resident.parent_phone || resident.guardian_phone || '';
  const joiningDate = resident.joining_date || resident.admission_date || 'N/A';
  const agentName = resident.agent_name || 'Direct Admission';
  const depositAmount = Number(resident.deposit !== undefined ? resident.deposit : (resident.security_deposit || 10000));
  const joiningRemarks = resident.joining_payment_remarks || resident.notes || '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        {/* Header with Photo */}
        <div style={{
          padding: '22px',
          background: 'linear-gradient(135deg, #fff4e6 0%, #fee2e2 100%)',
          borderBottom: '1.5px solid var(--border-color)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ position: 'absolute', top: '14px', right: '14px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>

          <ResidentAvatar
            name={resident.name}
            photoUrl={resident.photo_url}
            size={76}
            borderRadius="18px"
            border="3px solid #ffffff"
            style={{ boxShadow: 'var(--shadow-card)' }}
          />

          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>{resident.name}</h2>
              <span className={`badge badge-${resident.status === 'Active' ? 'active' : 'pending'}`}>
                {resident.status}
              </span>
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 700 }}>
              Room {resident.room_number || 'Unassigned'} • Joining Date: {joiningDate}
            </div>
            {resident.college_or_work && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-ruby)', fontWeight: 700, marginTop: '2px' }}>
                💼 {resident.college_or_work}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Quick Communication */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '18px' }}>
            <a
              href={`tel:${resident.phone}`}
              className="btn btn-secondary"
              style={{ justifyContent: 'center', padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <Phone size={15} color="#15803d" />
              <span>Call Resident</span>
            </a>
            <a
              href={`https://wa.me/${resident.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ justifyContent: 'center', padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <MessageSquare size={15} color="#15803d" />
              <span>WhatsApp Resident</span>
            </a>
            {parentPhone && (
              <a
                href={`tel:${parentPhone}`}
                className="btn btn-secondary"
                style={{ justifyContent: 'center', padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <Phone size={15} color="#b45309" />
                <span>Call Parents</span>
              </a>
            )}
          </div>

          {/* 12-Month Payment Details Banner Action */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1.5px solid #86efac',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontWeight: 900, color: '#15803d', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={18} /> Monthly Payment Details (12 Months)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '2px' }}>
                View 12-month payment sheet, record Cash/GPay entries, and print statements.
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                if (onOpenMonthlyLedger) onOpenMonthlyLedger(resident);
              }}
              className="btn btn-coral btn-sm"
              style={{ fontWeight: 800, padding: '8px 16px' }}
            >
              Open 12-Month Ledger →
            </button>
          </div>

          {/* Details Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Section 1: Resident & Parents Details */}
            <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 800 }}>
                1. Resident & Parents Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', fontSize: '0.84rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Resident Phone:</span>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{resident.phone}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Father’s Name:</span>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{fatherName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Parents’ Phone Number:</span>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{parentPhone || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Joining Date:</span>
                  <div style={{ fontWeight: 800 }}>{joiningDate}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Agent Name:</span>
                  <div style={{ fontWeight: 800, color: '#c2410c' }}>{agentName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Blood Group:</span>
                  <div style={{ fontWeight: 800, color: 'var(--color-ruby)' }}>🩸 {resident.blood_group || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Section 2: Payment Details (During Joining) */}
            <div style={{ padding: '14px', background: '#fffaf5', border: '1px solid #fed7aa', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.78rem', color: '#9a3412', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IndianRupee size={15} /> 2. Payment Details (During Joining)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', fontSize: '0.84rem' }}>
                <div>
                  <span style={{ color: '#9a3412' }}>Joining Deposit:</span>
                  <div style={{ fontWeight: 900, color: '#15803d', fontSize: '1.1rem' }}>
                    ₹{depositAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#9a3412' }}>Monthly Room Rent:</span>
                  <div style={{ fontWeight: 900, color: '#c2410c', fontSize: '1.1rem' }}>
                    ₹{Number(resident.monthly_rent || 7500).toLocaleString('en-IN')}/mo
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #fed7aa' }}>
                <span style={{ color: '#9a3412', fontWeight: 700, fontSize: '0.78rem' }}>Other Payment Details / Remarks:</span>
                <div style={{ fontSize: '0.85rem', color: '#431407', marginTop: '2px', whiteSpace: 'pre-line', background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fed7aa' }}>
                  {joiningRemarks || 'None recorded during joining.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            onClick={() => {
              onClose();
              onEdit(resident);
            }}
            className="btn btn-secondary btn-sm"
          >
            Edit Profile
          </button>
          <button
            onClick={() => {
              onClose();
              if (onOpenMonthlyLedger) onOpenMonthlyLedger(resident);
            }}
            className="btn btn-coral btn-sm"
          >
            <Calendar size={15} /> 12-Month Payment Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
