import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Clock,
  Phone,
  LogOut,
  ShieldCheck,
  X
} from 'lucide-react';

export default function VisitorsLog({
  visitors = [],
  residents = [],
  onCreateVisitor,
  onCheckoutVisitor
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVisitor, setNewVisitor] = useState({
    resident_id: '',
    resident_name: '',
    room_number: '',
    visitor_name: '',
    relation: 'Friend',
    phone: '',
    purpose: 'Visit / Discussion'
  });

  const activeVisitors = visitors.filter(v => v.status === 'Checked In');

  const handleResidentSelect = (residentId) => {
    const res = residents.find(r => r.id === residentId);
    if (res) {
      setNewVisitor(prev => ({
        ...prev,
        resident_id: res.id,
        resident_name: res.name,
        room_number: res.room_number || ''
      }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    await onCreateVisitor(newVisitor);
    setIsModalOpen(false);
    setNewVisitor({
      resident_id: '',
      resident_name: '',
      room_number: '',
      visitor_name: '',
      relation: 'Friend',
      phone: '',
      purpose: 'Visit / Discussion'
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 className="page-title">
              Gate & Visitor Pass Log
            </h2>
            <span className="badge badge-active">
              {activeVisitors.length} Active in Premises
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '2px' }}>
            Record guest entry, verify relationship with host resident, and log departure timestamps.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-coral">
          <Plus size={18} />
          <span>Log Guest Check-In</span>
        </button>
      </div>

      {/* Table */}
      <div className="warm-card" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Visitor Name</th>
                <th>Host Resident</th>
                <th>Room</th>
                <th>Relationship</th>
                <th>Phone Number</th>
                <th>Purpose</th>
                <th>Check-In</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 800 }}>{v.visitor_name}</td>
                  <td>{v.resident_name || 'Office'}</td>
                  <td>
                    <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 7px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 800 }}>
                      Room {v.room_number || '-'}
                    </span>
                  </td>
                  <td>{v.relation || 'Friend'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>{v.phone || '-'}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{v.purpose || '-'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {v.check_in_time ? new Date(v.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td>
                    <span className={`badge badge-${v.status === 'Checked In' ? 'pending' : 'available'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {v.status === 'Checked In' && (
                      <button
                        onClick={() => onCheckoutVisitor(v.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.76rem', padding: '4px 8px', color: '#b45309' }}
                      >
                        <LogOut size={12} /> Check Out
                      </button>
                    )}
                    {v.status === 'Checked Out' && (
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Departed {v.check_out_time ? new Date(v.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {visitors.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No visitor logs recorded. Click above to log guest entry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check In Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>Log Guest Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Visiting Resident *</label>
                  <select
                    required
                    value={newVisitor.resident_id}
                    onChange={e => handleResidentSelect(e.target.value)}
                    className="form-select"
                  >
                    <option value="">-- Choose Host Resident --</option>
                    {residents.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Room {r.room_number || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Visitor Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Karthik Rao"
                      value={newVisitor.visitor_name}
                      onChange={e => setNewVisitor({ ...newVisitor, visitor_name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Relationship</label>
                    <input
                      type="text"
                      placeholder="e.g. Father / Friend"
                      value={newVisitor.relation}
                      onChange={e => setNewVisitor({ ...newVisitor, relation: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Visitor Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 99001 22334"
                      value={newVisitor.phone}
                      onChange={e => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Purpose</label>
                    <input
                      type="text"
                      placeholder="e.g. Luggage delivery"
                      value={newVisitor.purpose}
                      onChange={e => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-coral">
                  Log Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
