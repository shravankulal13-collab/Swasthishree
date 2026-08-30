import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
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

export default function App() {
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
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handlers for Residents
  const handleSaveResident = async (formDataOrJson, id) => {
    if (id) {
      await api.updateResident(id, formDataOrJson);
      showToast('✅ Resident updated successfully');
    } else {
      await api.createResident(formDataOrJson);
      showToast('✅ New resident registered successfully');
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
    try {
      await api.createRoom(roomData);
      showToast(`✅ Room ${roomData.room_number || ''} added with rent ₹${Number(roomData.monthly_rent || 0).toLocaleString('en-IN')}`);
      await loadAllData();
      return true;
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Failed to create room'}`);
      throw err;
    }
  };

  const handleUpdateRoom = async (id, roomData) => {
    try {
      await api.updateRoom(id, roomData);
      showToast(`✅ Room ${roomData.room_number || ''} details & price updated`);
      await loadAllData();
      return true;
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Failed to update room'}`);
      throw err;
    }
  };

  const handleDeleteRoom = async (id, roomNumber) => {
    try {
      await api.deleteRoom(id);
      showToast(`🗑️ Room ${roomNumber || ''} deleted successfully`);
      await loadAllData();
      return true;
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Failed to delete room'}`);
      throw err;
    }
  };

  // Handlers for Payments
  const handleCreatePayment = async (paymentData) => {
    // Check if payment already exists for this resident and month
    const existing = payments.find(p =>
      (p.resident_id === paymentData.resident_id || (p.resident_name && p.resident_name === paymentData.resident_name)) &&
      p.month_year === paymentData.month_year
    );

    let savedPayment;
    if (existing && existing.id) {
      savedPayment = await api.updatePayment(existing.id, paymentData);
      showToast(`✅ ${paymentData.month_year} payment updated (${paymentData.payment_method})`);
    } else {
      savedPayment = await api.createPayment(paymentData);
      showToast(`✅ ${paymentData.month_year} payment recorded (${paymentData.payment_method})`);
    }

    await loadAllData();
    return savedPayment;
  };

  const handleDeletePayment = async (id) => {
    await api.deletePayment(id);
    showToast('Payment record deleted');
    await loadAllData();
  };

  // Monthly Ledger Opener
  const handleOpenMonthlyLedger = (res) => {
    const targetResident = res || residents[0];
    if (!targetResident) {
      showToast('⚠️ Please register a resident first to view payment ledger.');
      return;
    }
    setMonthlyLedgerResident(targetResident);
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

  // Handlers for Mess Menu & Timings
  const handleUpdateMessMenu = async (id, data) => {
    await api.updateMessMenu(id, data);
    showToast('✅ Mess menu updated');
    await loadAllData();
  };

  const handleUpdateMessTimings = async (data) => {
    await api.updateMessTimings(data);
    showToast('✅ Dining timings updated');
    await loadAllData();
  };

  // Handlers for Notices
  const handleCreateNotice = async (data) => {
    await api.createNotice(data);
    showToast('✅ Announcement posted');
    await loadAllData();
  };

  const handleDeleteNotice = async (id) => {
    await api.deleteNotice(id);
    showToast('Notice removed');
    await loadAllData();
  };

  return (
    <div className="app-root-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
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
            onAssignResident={(targetRoom) => {
              if (targetRoom) {
                setResidentToEdit({
                  room_id: targetRoom.id,
                  room_number: targetRoom.room_number,
                  monthly_rent: targetRoom.monthly_rent
                });
              } else {
                setResidentToEdit(null);
              }
              setIsResidentModalOpen(true);
            }}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsLedger
            payments={payments}
            residents={residents}
            onCreatePayment={async (pData) => {
              const res = await handleCreatePayment(pData);
              setSelectedPaymentReceipt(res);
              setIsReceiptModalOpen(true);
            }}
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
          />
        )}

        {activeTab === 'mess' && (
          <MessMenu
            messMenu={messMenu}
            messTimings={messTimings}
            onUpdateMessMenu={handleUpdateMessMenu}
            onUpdateMessTimings={handleUpdateMessTimings}
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
        isOpen={Boolean(viewingResident)}
        resident={viewingResident}
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
