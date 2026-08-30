import React, { useState, useEffect } from 'react';
import {
  Home,
  UserPlus,
  Users,
  Building2,
  BedDouble,
  CreditCard,
  UtensilsCrossed,
  Bell,
  UserCheck,
  Menu,
  LogOut,
  X
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  onOpenAddResident,
  residentCount = 0,
  currentUser,
  onLogout
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when activeTab changes
  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'residents', label: `Directory ${residentCount > 0 ? `(${residentCount})` : ''}`, icon: Users },
    { id: 'rooms', label: 'Rooms & Beds', icon: BedDouble },
    { id: 'payments', label: 'Billing & Rent', icon: CreditCard },
    { id: 'mess', label: 'Mess Menu', icon: UtensilsCrossed },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'visitors', label: 'Gate Log', icon: UserCheck }
  ];

  return (
    <>
      <header className="top-navbar">
        {/* Brand Logo on Left */}
        <div className="navbar-logo" onClick={() => handleNavClick('dashboard')} role="button" tabIndex={0}>
          <span className="navbar-logo-text">ಸ್ವಸ್ತಿ ಶ್ರೀ</span>
          <span className="navbar-brand-sub">PORTAL</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="navbar-links desktop-nav" aria-label="Main Navigation">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`nav-link-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <Home size={16} />
            <span>Home</span>
          </button>

          <button
            onClick={onOpenAddResident}
            className="nav-link-btn nav-link-add-btn"
            title="Register New Resident"
          >
            <UserPlus size={16} />
            <span>Add Resident</span>
          </button>

          <button
            onClick={() => handleNavClick('residents')}
            className={`nav-link-btn ${activeTab === 'residents' ? 'active' : ''}`}
          >
            <Users size={16} />
            <span>Directory {residentCount > 0 && <span className="nav-counter-pill">{residentCount}</span>}</span>
          </button>

          <button
            onClick={() => handleNavClick('rooms')}
            className={`nav-link-btn ${activeTab === 'rooms' ? 'active' : ''}`}
          >
            <BedDouble size={16} />
            <span>Rooms & Beds</span>
          </button>

          <button
            onClick={() => handleNavClick('payments')}
            className={`nav-link-btn ${activeTab === 'payments' ? 'active' : ''}`}
          >
            <CreditCard size={16} />
            <span>Billing & Rent</span>
          </button>

          <button
            onClick={() => handleNavClick('mess')}
            className={`nav-link-btn ${activeTab === 'mess' ? 'active' : ''}`}
          >
            <UtensilsCrossed size={16} />
            <span>Mess Menu</span>
          </button>

          <button
            onClick={() => handleNavClick('notices')}
            className={`nav-link-btn ${activeTab === 'notices' ? 'active' : ''}`}
          >
            <Bell size={16} />
            <span>Notices</span>
          </button>

          <button
            onClick={() => handleNavClick('visitors')}
            className={`nav-link-btn ${activeTab === 'visitors' ? 'active' : ''}`}
          >
            <UserCheck size={16} />
            <span>Gate Log</span>
          </button>
        </nav>

        {/* User Badge & Logout in Desktop */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          {currentUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid #fed7aa',
              fontSize: '0.76rem',
              fontWeight: 800,
              color: '#9a3412'
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
              <span>{currentUser.name || currentUser.username}</span>
            </div>
          )}
          <button
            onClick={onLogout}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '4px 8px', color: '#be123c', borderColor: '#fecdd3' }}
            title="Sign Out"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Header Actions (Quick Add + Hamburger Toggle) */}
        <div className="mobile-header-actions">
          <button
            onClick={onOpenAddResident}
            className="mobile-quick-add-btn"
            title="Add Resident"
          >
            <UserPlus size={16} />
            <span>Add</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="hamburger-btn"
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay Backdrop */}
      <div
        className={`mobile-nav-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      <aside
        className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation Menu"
      >
        <div className="mobile-drawer-header">
          <div className="navbar-logo" onClick={() => handleNavClick('dashboard')}>
            <span className="navbar-logo-text">ಸ್ವಸ್ತಿ ಶ್ರೀ</span>
            <span className="navbar-brand-sub">PORTAL</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="btn-icon mobile-drawer-close"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Primary Action in Mobile Menu */}
        <div className="mobile-drawer-cta">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenAddResident();
            }}
            className="btn btn-coral mobile-drawer-add-btn"
          >
            <UserPlus size={18} />
            <span>Onboard New Resident</span>
          </button>
        </div>

        {/* Mobile Navigation List */}
        <nav className="mobile-drawer-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              >
                <div className="mobile-nav-item-icon">
                  <Icon size={18} />
                </div>
                <span className="mobile-nav-item-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Badge & Logout in Mobile */}
        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
            <span>{currentUser?.name || currentUser?.username || 'Admin'}</span>
          </div>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onLogout();
            }}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center', color: '#be123c', borderColor: '#fecdd3' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
