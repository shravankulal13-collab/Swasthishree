import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Printer,
  Edit2,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function MessMenu({ messMenu = [], onUpdateMessMenu }) {
  const [editingDay, setEditingDay] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const currentDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  const handleEditClick = (item) => {
    setEditingDay(item.id);
    setEditFormData({ ...item });
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    await onUpdateMessMenu(editingDay, editFormData);
    setEditingDay(null);
  };

  const handlePrintMenu = () => {
    window.print();
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 className="page-title">
              Weekly Dining & Mess Schedule
            </h2>
            <span className="badge badge-active">
              Today: {currentDayName}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '2px' }}>
            Nutritious, hygienic, multi-cuisine meal chart (Breakfast, Lunch, Snacks & Dinner).
          </p>
        </div>

        <button onClick={handlePrintMenu} className="btn btn-secondary">
          <Printer size={16} />
          <span>Print Weekly Menu</span>
        </button>
      </div>

      {/* Mess Timings Box */}
      <div className="warm-card" style={{ padding: '16px 20px', marginBottom: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '1.5px solid #fed7aa' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#9a3412' }}>Standard Dining Timings</h3>
            <p style={{ fontSize: '0.82rem', color: '#7c2d12', marginTop: '2px', lineHeight: 1.4 }}>
              Breakfast: 7:30 AM - 9:30 AM • Lunch: 12:30 PM - 2:30 PM • Snacks: 5:00 PM - 6:30 PM • Dinner: 7:30 PM - 9:45 PM
            </p>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="responsive-cards-grid">
        {messMenu.map(day => {
          const isToday = day.day_of_week === currentDayName;
          const isEditing = editingDay === day.id;

          return (
            <div
              key={day.id}
              className="warm-card"
              style={{
                padding: '20px',
                border: isToday ? '2px solid var(--color-coral)' : '1px solid var(--border-color)',
                boxShadow: isToday ? 'var(--shadow-hover)' : 'var(--shadow-card)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900 }}>{day.day_of_week}</h3>
                  {isToday && (
                    <span className="badge badge-active">Today</span>
                  )}
                </div>
                {!isEditing && (
                  <button onClick={() => handleEditClick(day)} className="btn-icon" title="Edit Day Menu" style={{ padding: '4px' }}>
                    <Edit2 size={14} color="var(--color-amber)" />
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.74rem' }}>Breakfast</label>
                      <input
                        type="text"
                        value={editFormData.breakfast}
                        onChange={e => setEditFormData({ ...editFormData, breakfast: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '6px 10px', minHeight: '36px' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.74rem' }}>Lunch</label>
                      <input
                        type="text"
                        value={editFormData.lunch}
                        onChange={e => setEditFormData({ ...editFormData, lunch: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '6px 10px', minHeight: '36px' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.74rem' }}>Evening Snacks</label>
                      <input
                        type="text"
                        value={editFormData.snacks}
                        onChange={e => setEditFormData({ ...editFormData, snacks: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '6px 10px', minHeight: '36px' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.74rem' }}>Dinner</label>
                      <input
                        type="text"
                        value={editFormData.dinner}
                        onChange={e => setEditFormData({ ...editFormData, dinner: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '6px 10px', minHeight: '36px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                      <button type="button" onClick={() => setEditingDay(null)} className="btn btn-secondary btn-sm">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-coral btn-sm">
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>🍳 Breakfast</span>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, marginTop: '2px', wordBreak: 'break-word' }}>{day.breakfast}</div>
                  </div>

                  <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>🍛 Lunch</span>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, marginTop: '2px', wordBreak: 'break-word' }}>{day.lunch}</div>
                  </div>

                  <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>☕ Snacks & Tea</span>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, marginTop: '2px', wordBreak: 'break-word' }}>{day.snacks}</div>
                  </div>

                  <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase' }}>🍲 Dinner</span>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, marginTop: '2px', wordBreak: 'break-word' }}>{day.dinner}</div>
                  </div>

                  {day.special_notes && (
                    <div style={{ fontSize: '0.75rem', color: '#15803d', fontStyle: 'italic', fontWeight: 600 }}>
                      ✨ {day.special_notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
