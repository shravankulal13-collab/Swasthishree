import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Printer,
  Edit2,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Save,
  X,
  RotateCcw
} from 'lucide-react';

export default function MessMenu({
  messMenu = [],
  messTimings = null,
  onUpdateMessMenu,
  onUpdateMessTimings
}) {
  const [editingDay, setEditingDay] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isTimingsModalOpen, setIsTimingsModalOpen] = useState(false);
  const [timingsData, setTimingsData] = useState({
    breakfast: messTimings?.breakfast || '7:30 AM - 9:30 AM',
    lunch: messTimings?.lunch || '12:30 PM - 2:30 PM',
    snacks: messTimings?.snacks || '5:00 PM - 6:30 PM',
    dinner: messTimings?.dinner || '7:30 PM - 9:30 PM'
  });

  const currentDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  const handleEditClick = (item) => {
    setEditingDay(item.id);
    setEditFormData({
      breakfast: item.breakfast || '',
      lunch: item.lunch || '',
      snacks: item.snacks || '',
      dinner: item.dinner || '',
      special_notes: item.special_notes || '',
      day_of_week: item.day_of_week
    });
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!editingDay) return;
    await onUpdateMessMenu(editingDay, editFormData);
    setEditingDay(null);
  };

  const handleClearDay = async (dayItem) => {
    if (window.confirm(`Clear all meal items for ${dayItem.day_of_week}?`)) {
      await onUpdateMessMenu(dayItem.id, {
        breakfast: '',
        lunch: '',
        snacks: '',
        dinner: '',
        special_notes: '',
        day_of_week: dayItem.day_of_week
      });
    }
  };

  const handleOpenTimingsModal = () => {
    setTimingsData({
      breakfast: messTimings?.breakfast || '7:30 AM - 9:30 AM',
      lunch: messTimings?.lunch || '12:30 PM - 2:30 PM',
      snacks: messTimings?.snacks || '5:00 PM - 6:30 PM',
      dinner: messTimings?.dinner || '7:30 PM - 9:30 PM'
    });
    setIsTimingsModalOpen(true);
  };

  const handleSaveTimings = async (e) => {
    e.preventDefault();
    if (onUpdateMessTimings) {
      await onUpdateMessTimings(timingsData);
    }
    setIsTimingsModalOpen(false);
  };

  const handlePrintMenu = () => {
    window.print();
  };

  // Safe fallback if messMenu is empty
  const daysList = messMenu.length > 0 ? messMenu : [
    { id: 'menu-1', day_of_week: 'Monday', breakfast: '', lunch: '', snacks: '', dinner: '', special_notes: '' },
    { id: 'menu-2', day_of_week: 'Tuesday', breakfast: '', lunch: '', snacks: '', dinner: '', special_notes: '' },
    { id: 'menu-3', day_of_week: 'Wednesday', breakfast: '', lunch: '', snacks: '', dinner: '', special_notes: '' },
    { id: 'menu-4', day_of_week: 'Thursday', breakfast: '', lunch: '', snacks: '', dinner: '', special_notes: '' },
    { id: 'menu-5', day_of_week: 'Friday', breakfast: '', lunch: '', snacks: '', dinner: '', special_notes: '' },
    { id: 'menu-6', day_of_week: 'Saturday', breakfast: '', lunch: '', snacks: '', dinner: '', special_notes: '' },
    { id: 'menu-7', day_of_week: 'Sunday', breakfast: '', lunch: '', snacks: '', dinner: '', special_notes: '' }
  ];

  const activeTimings = messTimings || {
    breakfast: '7:30 AM - 9:30 AM',
    lunch: '12:30 PM - 2:30 PM',
    snacks: '5:00 PM - 6:30 PM',
    dinner: '7:30 PM - 9:30 PM'
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
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleOpenTimingsModal} className="btn btn-coral">
            <Clock size={16} />
            <span>Edit Dining Timings</span>
          </button>
          <button onClick={handlePrintMenu} className="btn btn-secondary">
            <Printer size={16} />
            <span>Print Weekly Menu</span>
          </button>
        </div>
      </div>

      {/* Mess Timings Box */}
      <div
        className="warm-card"
        style={{
          padding: '16px 20px',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          border: '1.5px solid #fed7aa'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#ffedd5',
              color: '#c2410c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#9a3412' }}>Current Dining Timings</h3>
              <button
                onClick={handleOpenTimingsModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c2410c',
                  cursor: 'pointer',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Change Timings
              </button>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#7c2d12', marginTop: '3px', lineHeight: 1.4 }}>
              <strong>Breakfast:</strong> {activeTimings.breakfast || 'Not set'} • <strong>Lunch:</strong> {activeTimings.lunch || 'Not set'} • <strong>Snacks:</strong> {activeTimings.snacks || 'Not set'} • <strong>Dinner:</strong> {activeTimings.dinner || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="responsive-cards-grid">
        {daysList.map(day => {
          const isToday = day.day_of_week === currentDayName;
          const isEditing = editingDay === day.id;
          const hasAnyMeal = day.breakfast || day.lunch || day.snacks || day.dinner || day.special_notes;

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
                  {!hasAnyMeal && !isEditing && (
                    <span className="badge badge-pending" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                      Empty
                    </span>
                  )}
                </div>
                {!isEditing && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleEditClick(day)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                      title="Set/Edit Menu"
                    >
                      <Edit2 size={12} />
                      <span>{hasAnyMeal ? 'Edit' : '+ Set Menu'}</span>
                    </button>
                    {hasAnyMeal && (
                      <button
                        onClick={() => handleClearDay(day)}
                        className="btn-icon"
                        style={{ padding: '4px', color: 'var(--text-muted)' }}
                        title="Clear Day Menu"
                      >
                        <RotateCcw size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <label className="form-label" style={{ fontSize: '0.74rem', margin: 0 }}>🍳 Breakfast Menu</label>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>({activeTimings.breakfast})</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Idli, Sambar, Chutney, Coffee"
                        value={editFormData.breakfast || ''}
                        onChange={e => setEditFormData({ ...editFormData, breakfast: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '6px 10px', minHeight: '36px' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <label className="form-label" style={{ fontSize: '0.74rem', margin: 0 }}>🍛 Lunch Menu</label>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>({activeTimings.lunch})</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Rice, Dal, Rasam, Sabzi, Curd"
                        value={editFormData.lunch || ''}
                        onChange={e => setEditFormData({ ...editFormData, lunch: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '6px 10px', minHeight: '36px' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <label className="form-label" style={{ fontSize: '0.74rem', margin: 0 }}>☕ Evening Snacks & Tea</label>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>({activeTimings.snacks})</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Tea / Coffee & Biscuits"
                        value={editFormData.snacks || ''}
                        onChange={e => setEditFormData({ ...editFormData, snacks: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '6px 10px', minHeight: '36px' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <label className="form-label" style={{ fontSize: '0.74rem', margin: 0 }}>🍲 Dinner Menu</label>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>({activeTimings.dinner})</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Chapati, Curry, Rice, Salad"
                        value={editFormData.dinner || ''}
                        onChange={e => setEditFormData({ ...editFormData, dinner: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '6px 10px', minHeight: '36px' }}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '3px' }}>✨ Special Notes / Dessert (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Special Sweet / Fruit bowl"
                        value={editFormData.special_notes || ''}
                        onChange={e => setEditFormData({ ...editFormData, special_notes: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '6px 10px', minHeight: '36px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                      <button type="button" onClick={() => setEditingDay(null)} className="btn btn-secondary btn-sm">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-coral btn-sm">
                        <Save size={13} />
                        <span>Save Menu</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Breakfast */}
                  <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>🍳 Breakfast</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{activeTimings.breakfast}</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: day.breakfast ? 600 : 400, color: day.breakfast ? 'var(--text-primary)' : 'var(--text-muted)', marginTop: '2px', wordBreak: 'break-word', fontStyle: day.breakfast ? 'normal' : 'italic' }}>
                      {day.breakfast || 'Not set'}
                    </div>
                  </div>

                  {/* Lunch */}
                  <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>🍛 Lunch</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{activeTimings.lunch}</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: day.lunch ? 600 : 400, color: day.lunch ? 'var(--text-primary)' : 'var(--text-muted)', marginTop: '2px', wordBreak: 'break-word', fontStyle: day.lunch ? 'normal' : 'italic' }}>
                      {day.lunch || 'Not set'}
                    </div>
                  </div>

                  {/* Snacks */}
                  <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>☕ Snacks & Tea</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{activeTimings.snacks}</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: day.snacks ? 600 : 400, color: day.snacks ? 'var(--text-primary)' : 'var(--text-muted)', marginTop: '2px', wordBreak: 'break-word', fontStyle: day.snacks ? 'normal' : 'italic' }}>
                      {day.snacks || 'Not set'}
                    </div>
                  </div>

                  {/* Dinner */}
                  <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase' }}>🍲 Dinner</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{activeTimings.dinner}</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: day.dinner ? 600 : 400, color: day.dinner ? 'var(--text-primary)' : 'var(--text-muted)', marginTop: '2px', wordBreak: 'break-word', fontStyle: day.dinner ? 'normal' : 'italic' }}>
                      {day.dinner || 'Not set'}
                    </div>
                  </div>

                  {day.special_notes && (
                    <div style={{ fontSize: '0.75rem', color: '#15803d', fontStyle: 'italic', fontWeight: 600, marginTop: '2px' }}>
                      ✨ {day.special_notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Dining Timings Modal */}
      {isTimingsModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTimingsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--gradient-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900 }}>Configure Dining Timings</h3>
                </div>
              </div>
              <button onClick={() => setIsTimingsModalOpen(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTimings}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="form-label">🍳 Breakfast Timings</label>
                  <input
                    type="text"
                    placeholder="e.g. 7:30 AM - 9:30 AM"
                    value={timingsData.breakfast}
                    onChange={e => setTimingsData({ ...timingsData, breakfast: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">🍛 Lunch Timings</label>
                  <input
                    type="text"
                    placeholder="e.g. 12:30 PM - 2:30 PM"
                    value={timingsData.lunch}
                    onChange={e => setTimingsData({ ...timingsData, lunch: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">☕ Evening Snacks & Tea Timings</label>
                  <input
                    type="text"
                    placeholder="e.g. 5:00 PM - 6:30 PM"
                    value={timingsData.snacks}
                    onChange={e => setTimingsData({ ...timingsData, snacks: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">🍲 Dinner Timings</label>
                  <input
                    type="text"
                    placeholder="e.g. 7:30 PM - 9:30 PM"
                    value={timingsData.dinner}
                    onChange={e => setTimingsData({ ...timingsData, dinner: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsTimingsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-coral">
                  Save Timings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
