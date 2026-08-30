import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Pin,
  Trash2,
  Calendar,
  X
} from 'lucide-react';

export default function NoticesBoard({ notices = [], onCreateNotice, onDeleteNotice }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    message: '',
    category: 'General',
    priority: 'Normal',
    is_pinned: false,
    expires_at: ''
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    await onCreateNotice(newNotice);
    setIsModalOpen(false);
    setNewNotice({
      title: '',
      message: '',
      category: 'General',
      priority: 'Normal',
      is_pinned: false,
      expires_at: ''
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 className="page-title">
              Notice Board & Announcements
            </h2>
            <span className="badge badge-active">
              {notices.length} Published
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '2px' }}>
            Broadcast hostel circulars, mess announcements, and celebration notices to all residents.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-coral">
          <Plus size={18} />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* Grid */}
      <div className="responsive-cards-grid">
        {notices.map(n => (
          <div
            key={n.id}
            className="warm-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              border: n.is_pinned ? '2px solid #ea580c' : '1px solid var(--border-color)',
              background: n.is_pinned ? '#fffaf5' : '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: '#ffedd5',
                    color: '#c2410c'
                  }}>
                    {n.category || 'General'}
                  </span>
                  {n.is_pinned && (
                    <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Pin size={11} /> Pinned
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>{n.title}</h3>
              </div>

              <span className={`badge badge-${n.priority === 'Urgent' ? 'full' : n.priority === 'Important' ? 'pending' : 'active'}`} style={{ flexShrink: 0 }}>
                {n.priority}
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px', flex: 1, wordBreak: 'break-word' }}>
              {n.message}
            </p>

            <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Published: {n.published_at ? new Date(n.published_at).toLocaleDateString() : 'Today'}
              </span>

              <button
                onClick={() => onDeleteNotice(n.id)}
                className="btn-icon"
                style={{ padding: '4px', color: 'var(--color-ruby)' }}
                title="Remove Notice"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {notices.length === 0 && (
          <div className="warm-card" style={{ padding: '36px', textAlign: 'center', gridColumn: '1 / -1' }}>
            <Bell size={38} color="var(--color-coral)" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>No Announcements Posted</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px auto 14px' }}>
              Keep your residents updated on mess timings, holidays, and hostel news.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-coral">
              <Plus size={16} /> Post First Notice
            </button>
          </div>
        )}
      </div>

      {/* Post Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>Post Announcement</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Notice Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mess Timings on Sunday"
                    value={newNotice.title}
                    onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={newNotice.category}
                      onChange={e => setNewNotice({ ...newNotice, category: e.target.value })}
                      className="form-select"
                    >
                      <option value="General">General</option>
                      <option value="Mess">Mess & Dining</option>
                      <option value="Rules">Rules & Curfew</option>
                      <option value="Events">Festivals & Events</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      value={newNotice.priority}
                      onChange={e => setNewNotice({ ...newNotice, priority: e.target.value })}
                      className="form-select"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Important">Important</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Type the announcement to be displayed to all hostel residents..."
                    value={newNotice.message}
                    onChange={e => setNewNotice({ ...newNotice, message: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="checkbox"
                    id="is_pinned"
                    checked={newNotice.is_pinned}
                    onChange={e => setNewNotice({ ...newNotice, is_pinned: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--color-coral)' }}
                  />
                  <label htmlFor="is_pinned" style={{ fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}>
                    Pin notice to top
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-coral">
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
