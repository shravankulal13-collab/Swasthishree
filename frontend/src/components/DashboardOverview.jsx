import React from 'react';
import {
  UserPlus,
  Users,
  Building2,
  BedDouble,
  IndianRupee,
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  Calendar,
  CreditCard,
  Plus
} from 'lucide-react';

export default function DashboardOverview({
  stats,
  rooms = [],
  residents = [],
  payments = [],
  messMenu = [],
  messTimings = null,
  notices = [],
  setActiveTab,
  onOpenAddResident,
  onOpenAddPayment,
  onViewResident
}) {
  const currentDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const todaysMenu = messMenu.find(m => m.day_of_week === currentDayName) || messMenu[0];

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentDate = new Date();
  const currentMonthYear = `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  // Monthly Fee Calculations
  const activeResidents = residents.filter(r => r.status === 'Active');
  const paidResidents = activeResidents.filter(res =>
    payments.some(p =>
      ((p.resident_id && p.resident_id === res.id) || (p.resident_name && res.name && p.resident_name.toLowerCase() === res.name.toLowerCase())) &&
      p.month_year && p.month_year.toLowerCase() === currentMonthYear.toLowerCase() &&
      p.status === 'Paid'
    )
  );
  const unpaidResidents = activeResidents.filter(res =>
    !payments.some(p =>
      ((p.resident_id && p.resident_id === res.id) || (p.resident_name && res.name && p.resident_name.toLowerCase() === res.name.toLowerCase())) &&
      p.month_year && p.month_year.toLowerCase() === currentMonthYear.toLowerCase() &&
      p.status === 'Paid'
    )
  );

  const currentMonthTotalExpected = activeResidents.reduce((acc, r) => acc + Number(r.monthly_rent || 7500), 0);
  const currentMonthTotalCollected = paidResidents.reduce((acc, r) => acc + Number(r.monthly_rent || 7500), 0);
  const currentMonthTotalPending = unpaidResidents.reduce((acc, r) => acc + Number(r.monthly_rent || 7500), 0);

  // Calculate live occupancy dynamically categorized by Sharing types present in rooms
  const bedNumbersInRooms = Array.from(new Set(rooms.map(r => Number(r.total_beds) || 1))).sort((a, b) => a - b);
  const sharingTypeGradients = [
    'var(--gradient-coral)',
    'var(--gradient-ruby)',
    'var(--gradient-amber)',
    'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
    'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  ];

  const calculateSharingOccupancy = (sharingCount) => {
    const sharingRooms = rooms
      .filter(r => Number(r.total_beds) === sharingCount)
      .sort((a, b) => (parseInt(a.room_number) || 0) - (parseInt(b.room_number) || 0));

    const total = sharingRooms.reduce((acc, r) => acc + (Number(r.total_beds) || 0), 0);
    const roomIds = new Set(sharingRooms.map(r => r.id));
    const roomNumbers = new Set(sharingRooms.map(r => String(r.room_number)));

    const roomResidents = residents.filter(res => 
      res.status === 'Active' && 
      ((res.room_id && roomIds.has(res.room_id)) || (res.room_number && roomNumbers.has(String(res.room_number))))
    );

    const occ = Math.max(
      roomResidents.length,
      sharingRooms.reduce((acc, r) => acc + (Number(r.occupied_beds) || 0), 0)
    );

    return {
      rooms: sharingRooms,
      total,
      occupied: occ,
      percent: total > 0 ? Math.min(100, Math.round((occ / total) * 100)) : 0
    };
  };

  const sharingStats = (bedNumbersInRooms.length > 0 ? bedNumbersInRooms : [1, 2, 3]).map((beds, idx) => {
    const label = beds === 1 ? '1 Sharing (Single)' : (beds === 2 ? '2 Sharing (Double)' : (beds === 3 ? '3 Sharing (Triple)' : `${beds} Sharing`));
    const gradient = sharingTypeGradients[idx % sharingTypeGradients.length];
    return {
      key: beds,
      label,
      gradient,
      ...calculateSharingOccupancy(beds)
    };
  });

  return (
    <div>
      {/* Hero Section Matching Reference Image */}
      <section className="hero-container">
        {/* Official Management Portal Badge */}
        <div className="portal-badge">
          OFFICIAL MANAGEMENT PORTAL
        </div>

        {/* Kannada Title: ಸ್ವಸ್ತಿ ಶ್ರೀ */}
        <h1 className="kannada-hero-title">
          ಸ್ವಸ್ತಿ ಶ್ರೀ
        </h1>

        {/* Orange Accent Bar */}
        <div className="orange-accent-bar" />

        {/* Subtitle */}
        <p className="hero-subtitle">
          Seamless Living • Professional Management
        </p>

        {/* 3 Primary Action Cards Grid (Exact color & card format from reference) */}
        <div className="hero-cards-grid">
          {/* Card 1: Resident Onboarding (Coral / Orange) */}
          <button
            onClick={onOpenAddResident}
            className="hero-action-card card-coral"
          >
            <div className="hero-card-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
                <line x1="19" y1="11" x2="19" y2="17" />
                <line x1="22" y1="14" x2="16" y2="14" />
              </svg>
            </div>
            <h2 className="hero-card-title">Resident Onboarding</h2>
            <p className="hero-card-desc">Digital registration with profile photos</p>
          </button>

          {/* Card 2: Member Directory (Ruby Red) */}
          <button
            onClick={() => setActiveTab('residents')}
            className="hero-action-card card-ruby"
          >
            <div className="hero-card-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 className="hero-card-title">Member Directory</h2>
            <p className="hero-card-desc">Advanced resident database & search</p>
          </button>

          {/* Card 3: Occupancy Status (Warm Amber) */}
          <button
            onClick={() => setActiveTab('rooms')}
            className="hero-action-card card-amber"
          >
            <div className="hero-card-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h2 className="hero-card-title">Occupancy Status</h2>
            <p className="hero-card-desc">Real-time room & revenue tracking</p>
          </button>
        </div>
      </section>

      {/* Live Operational Metrics 4-Grid */}
      <div className="stats-metrics-grid">
        {/* Total Active Residents */}
        <div className="warm-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Active Residents
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffe4e6', color: '#be123c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {stats?.totalResidents || residents.length || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Enrolled members in Swasthishree
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="warm-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Occupancy Rate
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BedDouble size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {stats?.occupancyRate || 0}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            <strong style={{ color: '#15803d' }}>{stats?.vacantBeds || 0} Vacant beds</strong> available
          </div>
        </div>

        {/* Monthly Revenue Collected */}
        <div className="warm-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Revenue Collected
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#15803d' }}>
            ₹{(stats?.totalRevenueCollected || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Total rent verified this month
          </div>
        </div>

        {/* Total Rooms Configured */}
        <div className="warm-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Rooms
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {rooms.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            1 to 5 Sharing Rooms
          </div>
        </div>
      </div>

      {/* Monthly Fee Collection & Dues Tracker */}
      <div className="warm-card" style={{ padding: '20px', marginBottom: '22px', background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)', border: '1.5px solid #fed7aa' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IndianRupee size={20} color="var(--color-ruby)" />
              <h3 style={{ fontSize: '1.12rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {currentMonthYear} Rent Collection & Fee Status
              </h3>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('payments')}
            className="btn btn-coral btn-sm"
            style={{ padding: '6px 14px', fontWeight: 800 }}
          >
            Open Fee Ledger →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          <div style={{ background: '#ffffff', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>Paid Members</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
              {paidResidents.length} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Residents</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 700 }}>₹{currentMonthTotalCollected.toLocaleString('en-IN')} collected</div>
          </div>

          <div style={{ background: '#ffffff', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase' }}>Unpaid / Due</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: unpaidResidents.length > 0 ? '#b91c1c' : '#15803d', marginTop: '2px' }}>
              {unpaidResidents.length} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Residents</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#991b1b', fontWeight: 700 }}>₹{currentMonthTotalPending.toLocaleString('en-IN')} outstanding</div>
          </div>

          <div style={{ background: '#ffffff', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Expected Total Rent</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
              ₹{currentMonthTotalExpected.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>For {currentMonthYear}</div>
          </div>
        </div>
      </div>

      {/* Grid: Room Sharing & Occupancy Visualizer & Today's Dining Schedule */}
      <div className="split-two-col-grid">
        {/* Room Sharing & Occupancy Breakdown */}
        <div className="warm-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Room Sharing & Occupancy Breakdown
            </h3>
            <button onClick={() => setActiveTab('rooms')} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
              Manage Rooms →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {sharingStats.filter(st => st.total > 0 || st.rooms.length > 0).map(st => (
              <div key={st.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800 }}>🛏️ {st.label}</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
                    {st.occupied}/{st.total} beds ({st.percent}%)
                  </span>
                </div>
                <div style={{ height: '10px', background: 'var(--bg-input)', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ width: `${st.percent}%`, height: '100%', background: st.gradient, borderRadius: '6px' }} />
                </div>
                {/* Room Chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {st.rooms.map(rm => {
                    const occ = residents.filter(r => r.status === 'Active' && ((r.room_id && r.room_id === rm.id) || (r.room_number && String(r.room_number) === String(rm.room_number)))).length;
                    const isFull = occ >= rm.total_beds;
                    return (
                      <button
                        key={rm.id}
                        onClick={() => setActiveTab('rooms')}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: isFull ? '1px solid #fca5a5' : '1px solid #fed7aa',
                          background: isFull ? '#fee2e2' : '#fff7ed',
                          color: isFull ? '#991b1b' : '#9a3412',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title={`Room ${rm.room_number}: ${rm.total_beds} Sharing (${occ}/${rm.total_beds} beds occupied)`}
                      >
                        <span>Room {rm.room_number}</span>
                        <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>({occ}/{rm.total_beds} {isFull ? 'Full' : 'Bed'})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Mess Menu */}
        <div className="warm-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UtensilsCrossed size={18} color="var(--color-coral)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Today's Dining ({currentDayName})</h3>
            </div>
            <button onClick={() => setActiveTab('mess')} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
              Weekly Chart →
            </button>
          </div>

          {todaysMenu && (todaysMenu.breakfast || todaysMenu.lunch || todaysMenu.snacks || todaysMenu.dinner) ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>🍳 Breakfast</span>
                  {messTimings?.breakfast && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{messTimings.breakfast}</span>}
                </div>
                <div style={{ fontSize: '0.84rem', marginTop: '4px', fontWeight: 600, wordBreak: 'break-word' }}>{todaysMenu.breakfast || 'Not set'}</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>🍛 Lunch</span>
                  {messTimings?.lunch && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{messTimings.lunch}</span>}
                </div>
                <div style={{ fontSize: '0.84rem', marginTop: '4px', fontWeight: 600, wordBreak: 'break-word' }}>{todaysMenu.lunch || 'Not set'}</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>☕ Snacks</span>
                  {messTimings?.snacks && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{messTimings.snacks}</span>}
                </div>
                <div style={{ fontSize: '0.84rem', marginTop: '4px', fontWeight: 600, wordBreak: 'break-word' }}>{todaysMenu.snacks || 'Not set'}</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase' }}>🍲 Dinner</span>
                  {messTimings?.dinner && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{messTimings.dinner}</span>}
                </div>
                <div style={{ fontSize: '0.84rem', marginTop: '4px', fontWeight: 600, wordBreak: 'break-word' }}>{todaysMenu.dinner || 'Not set'}</div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px 16px', textAlign: 'center', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: 0 }}>
                Today's dining menu is currently empty.
              </p>
              <button onClick={() => setActiveTab('mess')} className="btn btn-coral btn-sm" style={{ marginTop: '10px', fontSize: '0.78rem' }}>
                + Configure Today's Menu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real Resident Roster or Clean Empty State */}
      <div className="warm-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Registered Residents ({residents.length})</h3>
          {residents.length > 0 && (
            <button onClick={() => setActiveTab('residents')} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
              View Directory →
            </button>
          )}
        </div>

        {residents.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
            <Users size={38} color="var(--color-coral)" style={{ margin: '0 auto 10px' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Welcome to your fresh portal!</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '420px', margin: '4px auto 14px' }}>
              No residents added yet. Start by onboarding your first resident using the button below. All dashboard metrics will compute automatically!
            </p>
            <button onClick={onOpenAddResident} className="btn btn-coral">
              <Plus size={16} /> Register First Resident
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
            {residents.slice(0, 6).map(res => (
              <div
                key={res.id}
                onClick={() => onViewResident(res)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <img
                  src={res.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={res.name}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {res.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Room {res.room_number || 'Unassigned'} • {res.phone}
                  </div>
                </div>
                <span className="badge badge-active" style={{ flexShrink: 0 }}>Active</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
