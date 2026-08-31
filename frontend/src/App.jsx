import React, { useState, useEffect, useCallback } from 'react';
import { api, getStoredUser } from './services/api';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import ResidentsList from './components/ResidentsList';
import ResidentModal from './components/ResidentModal';
import ResidentDetailsModal from './components/ResidentDetailsModal';
import MonthlyPaymentDetailsModal from './components/MonthlyPaymentDetailsModal';
import RoomsView from './components/RoomsView';
import PaymentsLedger from './components/PaymentsLedger';
import ReceiptModal from './components/ReceiptModal';
import VisitorsLog from './components/VisitorsLog';
import MessMenu from './components/MessMenu';
import NoticesBoard from './components/NoticesBoard';
import SupabaseSettingsModal from './components/SupabaseSettingsModal';
import { Building2 } from 'lucide-react';
import LoginPage from './components/LoginPage';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  // Data States
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [residents, setResidents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [messMenu, setMessMenu] = useState([]);
  const [messTimings, setMessTimings] = useState(null);
  const [notices, setNotices] = useState([]);
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Modal States
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [residentToEdit, setResidentToEdit] = useState(null);
  const [viewingResident, setViewingResident] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPaymentReceipt, setSelectedPaymentReceipt] = useState(null);
  const [isMonthlyLedgerOpen, setIsMonthlyLedgerOpen] = useState(false);
  const [monthlyLedgerResident, setMonthlyLedgerResident] = useState(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load live data from backend / Supabase
  const loadAllData = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    try {
      const [
        healthRes,
        statsRes,
        roomsRes,
        residentsRes,
        paymentsRes,
        visitorsRes,
        messRes,
        timingsRes,
        noticesRes
      ] = await Promise.allSettled([
        api.getHealth(),
        api.getStats(),
        api.getRooms(),
        api.getResidents(),
        api.getPayments(),
        api.getVisitors(),
        api.getMessMenu(),
        api.getMessTimings(),
        api.getNotices()
      ]);

      if (healthRes.status === 'fulfilled') setSupabaseStatus(healthRes.value?.database);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (roomsRes.status === 'fulfilled') setRooms(roomsRes.value);
      if (residentsRes.status === 'fulfilled') setResidents(residentsRes.value);
      if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value);
      if (visitorsRes.status === 'fulfilled') setVisitors(visitorsRes.value);
      if (messRes.status === 'fulfilled') setMessMenu(messRes.value);
      if (timingsRes.status === 'fulfilled') setMessTimings(timingsRes.value);
      if (noticesRes.status === 'fulfilled') setNotices(noticesRes.value);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Welcome, ${user.name || user.username}!`);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    showToast('Signed out successfully');
  };

  // Handlers for Residents
  const handleSaveResident = async (formDataOrJson, id) => {
    if (id) {
      await api.updateResident(id, formDataOrJson);
      showToast('✅ Resident profile updated');
    } else {
      await api.createResident(formDataOrJson);
      showToast('✅ New resident registered');
    }
    await loadAllData();
  };

  const handleDeleteResident = async (id) => {
    if (window.confirm('Are you sure you want to remove / vacate this resident?')) {
      await api.deleteResident(id);
      showToast('Resident removed');
      await loadAllData();
    }
  };

  // Handlers for Rooms
  const handleCreateRoom = async (roomData) => {
    await api.createRoom(roomData);
    showToast(`✅ Room ${roomData.room_number} created`);
    await loadAllData();
  };

  const handleUpdateRoom = async (id, roomData) => {
    await api.updateRoom(id, roomData);
    showToast(`✅ Room updated`);
    await loadAllData();
  };

  const handleDeleteRoom = async (id) => {
    await api.deleteRoom(id);
    showToast('Room deleted successfully');
    await loadAllData();
  };

  // Handlers for Payments & Ledger
  const handleCreatePayment = async (paymentData) => {
    const res = await api.createPayment(paymentData);
    showToast(`Payment recorded: ₹${paymentData.amount}`);
    await loadAllData();
    return res;
  };

  const handleUpdatePayment = async (id, paymentData) => {
    await api.updatePayment(id, paymentData);
    showToast(`Payment updated`);
    await loadAllData();
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      await api.deletePayment(id);
      showToast('Payment record deleted');
      await loadAllData();
    }
  };

  const handleOpenMonthlyLedger = (resident) => {
    setMonthlyLedgerResident(resident);
    setIsMonthlyLedgerOpen(true);
  };

  // Handlers for Visitors
  const handleCreateVisitor = async (data) => {
    await api.createVisitor(data);
    showToast('✅ Guest checked in');
    await loadAllData();
  };

  const handleCheckoutVisitor = async (id) => {
    await api.checkoutVisitor(id);
    showToast('Guest checked out');
    await loadAllData();
  };

  const handleDeleteVisitor = async (id) => {
    await api.deleteVisitor(id);
    showToast('Visitor entry deleted');
    await loadAllData();
  };

  // Handlers for Mess Menu & Timings
  const handleUpdateMessMenu = async (id, data) => {
    await api.updateMessMenu(id, data);
    showToast('Dining menu saved');
    await loadAllData();
  };

  const handleUpdateMessTimings = async (data) => {
    await api.updateMessTimings(data);
    showToast('Dining timings saved');
    await loadAllData();
  };

  // Handlers for Notices
  const handleCreateNotice = async (data) => {
    await api.createNotice(data);
    showToast('📢 Notice broadcasted');
    await loadAllData();
  };

  const handleDeleteNotice = async (id) => {
    if (window.confirm('Remove this announcement?')) {
      await api.deleteNotice(id);
      showToast('Notice removed');
      await loadAllData();
    }
  };

  // Unauthenticated Gate
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'var(--gradient-coral)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '16px',
          animation: 'pulse 1.5s infinite'
        }}>
          <Building2 size={28} color="#ffffff" />
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
          ಸ್ವಸ್ತಿ ಶ್ರೀ Swasthishree
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Loading admin portal...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.88rem',
          fontWeight: 700,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Clean Top Navbar with Mobile Hamburger Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddResident={() => {
          setResidentToEdit(null);
          setIsResidentModalOpen(true);
        }}
        residentCount={residents.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="app-container">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            stats={stats}
            rooms={rooms}
            residents={residents}
            payments={payments}
            messMenu={messMenu}
            messTimings={messTimings}
            notices={notices}
            setActiveTab={setActiveTab}
            onOpenAddResident={() => {
              setResidentToEdit(null);
              setIsResidentModalOpen(true);
            }}
            onOpenAddPayment={() => setActiveTab('payments')}
            onViewResident={(res) => setViewingResident(res)}
          />
        )}

        {activeTab === 'residents' && (
          <ResidentsList
            residents={residents}
            rooms={rooms}
            payments={payments}
            globalSearch={globalSearch}
            onOpenAddResident={() => {
              setResidentToEdit(null);
              setIsResidentModalOpen(true);
            }}
            onEditResident={(res) => {
              setResidentToEdit(res);
              setIsResidentModalOpen(true);
            }}
            onDeleteResident={handleDeleteResident}
            onViewResident={(res) => setViewingResident(res)}
            onOpenMonthlyLedger={handleOpenMonthlyLedger}
          />
        )}

        {activeTab === 'rooms' && (
          <RoomsView
            rooms={rooms}
            residents={residents}
            onCreateRoom={handleCreateRoom}
            onUpdateRoom={handleUpdateRoom}
            onDeleteRoom={handleDeleteRoom}
            onAssignResident={(room) => {
              setResidentToEdit({ room_id: room.id, room_number: room.room_number, monthly_rent: room.monthly_rent });
              setIsResidentModalOpen(true);
            }}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsLedger
            payments={payments}
            residents={residents}
            rooms={rooms}
            onCreatePayment={handleCreatePayment}
            onUpdatePayment={handleUpdatePayment}
            onDeletePayment={handleDeletePayment}
            onViewReceipt={(p) => {
              setSelectedPaymentReceipt(p);
              setIsReceiptModalOpen(true);
            }}
            onOpenMonthlyLedger={handleOpenMonthlyLedger}
          />
        )}

        {activeTab === 'visitors' && (
          <VisitorsLog
            visitors={visitors}
            residents={residents}
            onCreateVisitor={handleCreateVisitor}
            onCheckoutVisitor={handleCheckoutVisitor}
            onDeleteVisitor={handleDeleteVisitor}
          />
        )}

        {activeTab === 'mess' && (
          <MessMenu
            messMenu={messMenu}
            messTimings={messTimings}
            onUpdateDay={handleUpdateMessMenu}
            onUpdateTimings={handleUpdateMessTimings}
          />
        )}

        {activeTab === 'notices' && (
          <NoticesBoard
            notices={notices}
            onCreateNotice={handleCreateNotice}
            onDeleteNotice={handleDeleteNotice}
          />
        )}
      </main>

      {/* Modals */}
      <ResidentModal
        isOpen={isResidentModalOpen}
        onClose={() => {
          setIsResidentModalOpen(false);
          setResidentToEdit(null);
        }}
        onSave={handleSaveResident}
        residentToEdit={residentToEdit}
        rooms={rooms}
        residents={residents}
      />

      <ResidentDetailsModal
        resident={viewingResident}
        isOpen={!!viewingResident}
        onClose={() => setViewingResident(null)}
        onEdit={(res) => {
          setViewingResident(null);
          setResidentToEdit(res);
          setIsResidentModalOpen(true);
        }}
        onRecordPayment={(res) => {
          setViewingResident(null);
          handleOpenMonthlyLedger(res);
        }}
        onOpenMonthlyLedger={handleOpenMonthlyLedger}
      />

      {/* 12-Month Payment Details Modal (Displays 12 months with Clickable Date, Cash, GPay, and Amount Entry) */}
      <MonthlyPaymentDetailsModal
        isOpen={isMonthlyLedgerOpen}
        onClose={() => {
          setIsMonthlyLedgerOpen(false);
          setMonthlyLedgerResident(null);
        }}
        resident={monthlyLedgerResident}
        residents={residents}
        payments={payments}
        onRecordPayment={handleCreatePayment}
        onDeletePayment={handleDeletePayment}
        onViewReceipt={(p) => {
          setSelectedPaymentReceipt(p);
          setIsReceiptModalOpen(true);
        }}
        onSelectResident={(res) => setMonthlyLedgerResident(res)}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        payment={selectedPaymentReceipt}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedPaymentReceipt(null);
        }}
      />

      <SupabaseSettingsModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        supabaseStatus={supabaseStatus}
        onRefreshStatus={loadAllData}
      />
    </div>
  );
}
