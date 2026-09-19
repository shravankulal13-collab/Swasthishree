import React, { useState, useMemo } from 'react';
import {
  BedDouble,
  Plus,
  Building2,
  CheckCircle2,
  AlertCircle,
  Users,
  Edit2,
  Trash2,
  IndianRupee,
  X,
  Search,
  Check,
  AlertTriangle,
  UserPlus
} from 'lucide-react';

const COMMON_AMENITIES = [
  'Attached Washroom',
  'High-Speed Wi-Fi',
  'Personal Wardrobe',
  'Study Desk & Chair',
  'Geyser / Hot Water',
  'Ceiling Fan',
  'Air Conditioner (AC)',
  'Balcony View',
  'Smart TV',
  'Individual Lockers'
];

export default function RoomsView({
  rooms = [],
  residents = [],
  onCreateRoom,
  onUpdateRoom,
  onDeleteRoom,
  onAssignResident
}) {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSharing, setSelectedSharing] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Available' | 'Full'

  // Modal States
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    room_number: '',
    floor: 1,
    total_beds: 2,
    room_type: '2 Sharing',
    monthly_rent: '',
    amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Personal Wardrobe', 'Study Desk & Chair'],
    customAmenityInput: ''
  });

  // Calculate distinct sharing categories dynamically from existing rooms
  const dynamicSharingTypes = useMemo(() => {
    const bedSet = new Set();
    rooms.forEach(r => {
      const beds = Number(r.total_beds) || 1;
      bedSet.add(beds);
    });
    const sorted = Array.from(bedSet).sort((a, b) => a - b);
    return ['All', ...sorted.map(b => `${b} Sharing`)];
  }, [rooms]);

  // KPI Calculations
  const totalRoomsCount = rooms.length;
  const totalBedsCount = rooms.reduce((acc, r) => acc + (Number(r.total_beds) || 0), 0);

  // Real active occupants mapped to rooms
  const activeResidents = residents.filter(res => res.status === 'Active');
  const totalOccupiedBeds = rooms.reduce((acc, room) => {
    const roomOcc = activeResidents.filter(res =>
      (res.room_id && res.room_id === room.id) ||
      (res.room_number && String(res.room_number).trim() === String(room.room_number).trim())
    ).length;
    return acc + roomOcc;
  }, 0);
  const totalVacantBeds = Math.max(0, totalBedsCount - totalOccupiedBeds);

  // Filtered rooms list
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const roomNum = String(room.room_number || '').toLowerCase();
      const floorStr = String(room.floor || '');
      const search = searchQuery.toLowerCase().trim();

      const matchesSearch = !search ||
        roomNum.includes(search) ||
        floorStr.includes(search) ||
        `floor ${floorStr}`.includes(search);

      const beds = Number(room.total_beds) || 1;
      const sharingLabel = `${beds} Sharing`;
      const matchesSharing = selectedSharing === 'All' || selectedSharing === sharingLabel;

      const roomResidents = activeResidents.filter(res =>
        (res.room_id && res.room_id === room.id) ||
        (res.room_number && String(res.room_number).trim() === String(room.room_number).trim())
      );
      const isFull = roomResidents.length >= beds;

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Full' && isFull) ||
        (statusFilter === 'Available' && !isFull);

      return matchesSearch && matchesSharing && matchesStatus;
    }).sort((a, b) => (parseInt(a.room_number) || 0) - (parseInt(b.room_number) || 0));
  }, [rooms, searchQuery, selectedSharing, statusFilter, activeResidents]);

  // Open Create Modal
  const handleOpenAddModal = () => {
    setErrorMessage('');
    setFormData({
      room_number: '',
      floor: 1,
      total_beds: 2,
      room_type: '2 Sharing',
      monthly_rent: '',
      amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Personal Wardrobe', 'Study Desk & Chair'],
      customAmenityInput: ''
    });
    setIsAddRoomOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (room) => {
    setErrorMessage('');
    setEditingRoom(room);
    const existingAmenities = Array.isArray(room.amenities)
      ? room.amenities
      : (typeof room.amenities === 'string' ? room.amenities.split(',').map(s => s.trim()).filter(Boolean) : []);

    setFormData({
      room_number: room.room_number || '',
      floor: room.floor || 1,
      total_beds: Number(room.total_beds) || 2,
      room_type: room.room_type || `${Number(room.total_beds) || 2} Sharing`,
      monthly_rent: Number(room.monthly_rent !== undefined ? room.monthly_rent : 7500),
      amenities: existingAmenities.length > 0 ? existingAmenities : ['Attached Washroom', 'High-Speed Wi-Fi'],
      customAmenityInput: ''
    });
  };

  // Toggle Amenity tag
  const handleToggleAmenity = (amenity) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  // Add custom amenity
  const handleAddCustomAmenity = () => {
    const trimmed = formData.customAmenityInput.trim();
    if (!trimmed) return;
    if (!formData.amenities.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, trimmed],
        customAmenityInput: ''
      }));
    } else {
      setFormData(prev => ({ ...prev, customAmenityInput: '' }));
    }
  };

  // Submit Create Room
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.room_number.trim()) {
      setErrorMessage('Please provide a valid Room Number.');
      return;
    }

    const beds = Math.max(1, Number(formData.total_beds) || 1);
    const price = Math.max(0, Number(formData.monthly_rent) || 0);

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await onCreateRoom({
        room_number: formData.room_number.trim(),
        floor: Number(formData.floor) || 1,
        total_beds: beds,
        room_type: `${beds} Sharing`,
        monthly_rent: price,
        amenities: formData.amenities
      });
      setIsAddRoomOpen(false);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Room
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingRoom) return;
    if (!formData.room_number.trim()) {
      setErrorMessage('Please provide a valid Room Number.');
      return;
    }

    const beds = Math.max(1, Number(formData.total_beds) || 1);
    const price = Math.max(0, Number(formData.monthly_rent) || 0);

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await onUpdateRoom(editingRoom.id, {
        room_number: formData.room_number.trim(),
        floor: Number(formData.floor) || 1,
        total_beds: beds,
        room_type: `${beds} Sharing`,
        monthly_rent: price,
        amenities: formData.amenities
      });
      setEditingRoom(null);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm and Execute Delete Room
  const handleConfirmDelete = async () => {
    if (!deletingRoom) return;
    try {
      setIsSubmitting(true);
      await onDeleteRoom(deletingRoom.id, deletingRoom.room_number);
      setDeletingRoom(null);
    } catch (err) {
      alert(`Failed to delete room: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 className="page-title">
              Room & Bed Inventory Management
            </h2>
            <span className="badge badge-active">
              {rooms.length} Active Rooms
            </span>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-coral"
          id="btn-add-new-room"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-md)' }}
        >
          <Plus size={18} />
          <span>Add Custom Room</span>
        </button>
      </div>

      {/* KPI Cards Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div className="warm-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--gradient-coral)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Rooms
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {totalRoomsCount} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Rooms</span>
            </div>
          </div>
        </div>

        <div className="warm-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--gradient-ruby)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BedDouble size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Beds
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {totalBedsCount} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Capacity</span>
            </div>
          </div>
        </div>

        <div className="warm-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
              Occupied Beds
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#047857' }}>
              {totalOccupiedBeds} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Active</span>
            </div>
          </div>
        </div>

        <div className="warm-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--gradient-amber)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
              Vacant Available
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#b45309' }}>
              {totalVacantBeds} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Beds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="warm-card filter-toolbar" style={{ marginBottom: '22px' }}>
        {/* Search by Room / Floor */}
        <div style={{ position: 'relative', flex: 1, minWidth: 'min(100%, 240px)' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search room number (e.g. 101, 202) or floor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px', height: '40px', fontSize: '0.86rem' }}
          />
        </div>

        {/* Sharing Category Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', marginRight: '4px' }}>
            Sharing:
          </span>
          <div className="filter-chips-row">
            {dynamicSharingTypes.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedSharing(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedSharing === cat ? 'var(--color-ruby)' : 'var(--bg-input)',
                  color: selectedSharing === cat ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'var(--transition)'
                }}
              >
                {cat === 'All' ? 'All Sharing' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', marginRight: '4px' }}>
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ height: '38px', fontSize: '0.82rem', padding: '4px 10px', minWidth: '130px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available Beds</option>
            <option value="Full">Full Capacity</option>
          </select>
        </div>
      </div>

      {/* Rooms Grid or Empty State */}
      {filteredRooms.length === 0 ? (
        <div className="warm-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Building2 size={48} color="var(--color-coral)" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>
            {rooms.length === 0 ? 'No Rooms Registered Yet' : 'No Rooms Match Your Filter'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '460px', margin: '0 auto 20px' }}>
            {rooms.length === 0
              ? 'Start by adding your hostel rooms. You can set custom room numbers (e.g. 101, 102, G-01), choose bed capacity, and define your own monthly price.'
              : 'Try clearing your search query or switching sharing categories to view other rooms.'}
          </p>
          {rooms.length === 0 ? (
            <button onClick={handleOpenAddModal} className="btn btn-coral">
              <Plus size={18} />
              <span>Create Your First Room</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSharing('All');
                setStatusFilter('All');
              }}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="responsive-cards-grid">
          {filteredRooms.map(room => {
            const roomResidents = activeResidents.filter(res =>
              (res.room_id && res.room_id === room.id) ||
              (res.room_number && String(res.room_number).trim() === String(room.room_number).trim())
            );
            const beds = Number(room.total_beds) || 1;
            const occupiedCount = roomResidents.length;
            const isFull = occupiedCount >= beds;
            const vacantCount = Math.max(0, beds - occupiedCount);
            const monthlyRent = Number(room.monthly_rent !== undefined ? room.monthly_rent : 7500);

            const roomAmenities = Array.isArray(room.amenities)
              ? room.amenities
              : (typeof room.amenities === 'string' ? room.amenities.split(',').map(s => s.trim()).filter(Boolean) : []);

            return (
              <div
                key={room.id}
                className="warm-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: isFull ? '1.5px solid #fca5a5' : '1.5px solid #fed7aa',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Top Room Banner & Badges */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: isFull ? 'var(--gradient-ruby)' : 'var(--gradient-coral)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.15rem',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                      flexShrink: 0
                    }}>
                      {room.room_number}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                          Room {room.room_number}
                        </h3>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'var(--bg-input)',
                          color: 'var(--text-secondary)'
                        }}>
                          Floor {room.floor || 1}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {beds} Sharing Room
                      </div>
                    </div>
                  </div>

                  <span
                    className={`badge badge-${isFull ? 'full' : 'available'}`}
                    style={{ flexShrink: 0, padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    {isFull ? '🔴 Full' : `🟢 ${vacantCount} of ${beds} Vacant`}
                  </span>
                </div>

                {/* Price Display Card (Admin Configured Rent) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f0fdf4',
                  border: '1.5px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IndianRupee size={17} color="#15803d" />
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', display: 'block' }}>
                        Room Rent / Month
                      </span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#15803d' }}>
                        ₹{monthlyRent.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#166534', marginLeft: '4px', fontWeight: 600 }}>/ bed</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEditModal(room)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.72rem', fontWeight: 800, borderColor: '#86efac' }}
                    title="Change Room Price or Details"
                  >
                    <Edit2 size={12} style={{ marginRight: '4px' }} />
                    Edit Price
                  </button>
                </div>

                {/* Bed Allocation Visualizer */}
                <div style={{
                  marginBottom: '14px',
                  padding: '12px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    marginBottom: '8px',
                    color: 'var(--text-secondary)'
                  }}>
                    <span>Bed Allocation ({occupiedCount}/{beds})</span>
                    <span style={{ color: isFull ? 'var(--color-ruby)' : '#15803d' }}>
                      {isFull ? '100% Filled' : `${Math.round((occupiedCount / beds) * 100)}% Filled`}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(beds, 4)}, 1fr)`, gap: '6px' }}>
                    {Array.from({ length: beds }).map((_, idx) => {
                      const isBedOccupied = idx < occupiedCount;
                      const occupant = roomResidents[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (!isBedOccupied && onAssignResident) {
                              onAssignResident(room);
                            }
                          }}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '8px',
                            background: isBedOccupied ? '#fff7ed' : '#ffffff',
                            border: `1.5px solid ${isBedOccupied ? '#fed7aa' : '#cbd5e1'}`,
                            textAlign: 'center',
                            cursor: !isBedOccupied ? 'pointer' : 'default',
                            transition: 'var(--transition)'
                          }}
                          title={isBedOccupied ? `Occupied by ${occupant?.name || 'Resident'}` : 'Click to assign resident'}
                        >
                          <BedDouble
                            size={16}
                            color={isBedOccupied ? '#ea580c' : '#94a3b8'}
                            style={{ margin: '0 auto 2px' }}
                          />
                          <div style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: isBedOccupied ? '#c2410c' : '#64748b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {isBedOccupied ? (occupant ? occupant.name.split(' ')[0] : 'Occupied') : '+ Assign'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Current Occupants List */}
                {roomResidents.length > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Active Residents ({roomResidents.length}):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {roomResidents.map(res => (
                        <div
                          key={res.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.8rem',
                            padding: '4px 8px',
                            background: '#ffffff',
                            borderRadius: '6px',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          <img
                            src={res.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
                            alt={res.name}
                            style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontWeight: 800, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {res.name}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                            {res.phone}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities Tags */}
                {roomAmenities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px', marginTop: 'auto' }}>
                    {roomAmenities.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'var(--bg-input)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {amenity}
                      </span>
                    ))}
                    {roomAmenities.length > 3 && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', alignSelf: 'center' }}>
                        +{roomAmenities.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Action Bar (Edit Room & Delete Room) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: '6px'
                }}>
                  <button
                    onClick={() => handleOpenEditModal(room)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem', fontWeight: 800 }}
                  >
                    <Edit2 size={13} style={{ marginRight: '4px' }} />
                    Edit Room
                  </button>

                  {!isFull && onAssignResident && (
                    <button
                      onClick={() => onAssignResident(room)}
                      className="btn btn-coral btn-sm"
                      style={{ padding: '6px 10px', fontSize: '0.78rem', fontWeight: 800 }}
                      title="Onboard Resident to this Room"
                    >
                      <UserPlus size={13} style={{ marginRight: '4px' }} />
                      Assign
                    </button>
                  )}

                  <button
                    onClick={() => setDeletingRoom(room)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      padding: '6px 10px',
                      color: '#dc2626',
                      borderColor: '#fca5a5',
                      background: '#fff5f5'
                    }}
                    title={`Delete Room ${room.room_number}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ROOM MODAL */}
      {isAddRoomOpen && (
        <div className="modal-overlay" onClick={() => setIsAddRoomOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '520px', maxHeight: '92vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  Add New Room
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Define custom room number, floor, bed capacity, and monthly rent price.
                </p>
              </div>
              <button onClick={() => setIsAddRoomOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                {errorMessage && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffe4e6',
                    color: '#be123c',
                    marginBottom: '14px',
                    fontSize: '0.84rem',
                    fontWeight: 600
                  }}>
                    ⚠️ {errorMessage}
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Room Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 101, 102, G-01, 305A"
                      value={formData.room_number}
                      onChange={e => setFormData({ ...formData, room_number: e.target.value })}
                      className="form-input"
                      style={{ fontWeight: 800, fontSize: '1rem' }}
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Floor Number *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={20}
                      placeholder="1"
                      value={formData.floor}
                      onChange={e => setFormData({ ...formData, floor: e.target.value })}
                      className="form-input"
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Bed Capacity / Sharing *</label>
                    <select
                      value={formData.total_beds}
                      onChange={e => {
                        const beds = Number(e.target.value);
                        setFormData({
                          ...formData,
                          total_beds: beds,
                          room_type: `${beds} Sharing`
                        });
                      }}
                      className="form-select"
                      style={{ fontWeight: 700 }}
                    >
                      <option value={1}>1 Sharing (Single Bed Room)</option>
                      <option value={2}>2 Sharing (Double Room)</option>
                      <option value={3}>3 Sharing (Triple Room)</option>
                      <option value={4}>4 Sharing (Four Beds)</option>
                      <option value={5}>5 Sharing (Five Beds)</option>
                      <option value={6}>6 Sharing (Six Beds)</option>
                      <option value={7}>7 Sharing</option>
                      <option value={8}>8 Sharing (Dormitory)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#15803d', fontWeight: 800 }}>
                      Monthly Room Rent / Price (₹) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <IndianRupee size={16} color="#15803d" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="number"
                        required
                        min={0}
                        step={100}
                        placeholder="Monthly rent"
                        value={formData.monthly_rent}
                        onChange={e => setFormData({ ...formData, monthly_rent: e.target.value })}
                        className="form-input"
                        style={{
                          paddingLeft: '34px',
                          fontWeight: 900,
                          fontSize: '1rem',
                          borderColor: '#86efac',
                          color: '#15803d'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Amenities Selection */}
                <div style={{ marginTop: '10px' }}>
                  <label className="form-label">Select Room Amenities</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {COMMON_AMENITIES.map(amenity => {
                      const isSelected = formData.amenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => handleToggleAmenity(amenity)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: `1.5px solid ${isSelected ? 'var(--color-coral)' : 'var(--border-color)'}`,
                            background: isSelected ? '#fff7ed' : '#ffffff',
                            color: isSelected ? 'var(--color-coral)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                          }}
                        >
                          {isSelected ? amenity : `+ ${amenity}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Amenity Input */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Add other custom amenity..."
                      value={formData.customAmenityInput}
                      onChange={e => setFormData({ ...formData, customAmenityInput: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomAmenity();
                        }
                      }}
                      className="form-input"
                      style={{ height: '36px', fontSize: '0.82rem' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomAmenity}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0 12px' }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-coral"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving Room...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROOM MODAL */}
      {editingRoom && (
        <div className="modal-overlay" onClick={() => setEditingRoom(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '520px', maxHeight: '92vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  Edit Room {editingRoom.room_number}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Update room number, bed capacity, floor, or monthly rent price.
                </p>
              </div>
              <button onClick={() => setEditingRoom(null)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {errorMessage && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffe4e6',
                    color: '#be123c',
                    marginBottom: '14px',
                    fontSize: '0.84rem',
                    fontWeight: 600
                  }}>
                    ⚠️ {errorMessage}
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Room Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 101, 102, G-01"
                      value={formData.room_number}
                      onChange={e => setFormData({ ...formData, room_number: e.target.value })}
                      className="form-input"
                      style={{ fontWeight: 800, fontSize: '1rem' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Floor Number *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={20}
                      value={formData.floor}
                      onChange={e => setFormData({ ...formData, floor: e.target.value })}
                      className="form-input"
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Bed Capacity / Sharing *</label>
                    <select
                      value={formData.total_beds}
                      onChange={e => {
                        const beds = Number(e.target.value);
                        setFormData({
                          ...formData,
                          total_beds: beds,
                          room_type: `${beds} Sharing`
                        });
                      }}
                      className="form-select"
                      style={{ fontWeight: 700 }}
                    >
                      <option value={1}>1 Sharing (Single Bed Room)</option>
                      <option value={2}>2 Sharing (Double Room)</option>
                      <option value={3}>3 Sharing (Triple Room)</option>
                      <option value={4}>4 Sharing (Four Beds)</option>
                      <option value={5}>5 Sharing (Five Beds)</option>
                      <option value={6}>6 Sharing (Six Beds)</option>
                      <option value={7}>7 Sharing</option>
                      <option value={8}>8 Sharing (Dormitory)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#15803d', fontWeight: 800 }}>
                      Monthly Room Rent / Price (₹) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <IndianRupee size={16} color="#15803d" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="number"
                        required
                        min={0}
                        step={100}
                        value={formData.monthly_rent}
                        onChange={e => setFormData({ ...formData, monthly_rent: e.target.value })}
                        className="form-input"
                        style={{
                          paddingLeft: '34px',
                          fontWeight: 900,
                          fontSize: '1rem',
                          borderColor: '#86efac',
                          color: '#15803d'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Amenities Selection */}
                <div style={{ marginTop: '10px' }}>
                  <label className="form-label">Select Room Amenities</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {COMMON_AMENITIES.map(amenity => {
                      const isSelected = formData.amenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => handleToggleAmenity(amenity)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: `1.5px solid ${isSelected ? 'var(--color-coral)' : 'var(--border-color)'}`,
                            background: isSelected ? '#fff7ed' : '#ffffff',
                            color: isSelected ? 'var(--color-coral)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                          }}
                        >
                          {isSelected ? amenity : `+ ${amenity}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Amenity Input */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Add other custom amenity..."
                      value={formData.customAmenityInput}
                      onChange={e => setFormData({ ...formData, customAmenityInput: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomAmenity();
                        }
                      }}
                      className="form-input"
                      style={{ height: '36px', fontSize: '0.82rem' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomAmenity}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0 12px' }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-coral"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating Room...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ROOM CONFIRMATION MODAL */}
      {deletingRoom && (
        <div className="modal-overlay" onClick={() => setDeletingRoom(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '440px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header" style={{ borderBottomColor: '#fecaca' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#991b1b' }}>
                    Delete Room {deletingRoom.room_number}?
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Action cannot be undone.
                  </span>
                </div>
              </div>
              <button onClick={() => setDeletingRoom(null)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {(() => {
                const occupants = activeResidents.filter(res =>
                  (res.room_id && res.room_id === deletingRoom.id) ||
                  (res.room_number && String(res.room_number).trim() === String(deletingRoom.room_number).trim())
                );

                if (occupants.length > 0) {
                  return (
                    <div style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      marginBottom: '10px'
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#9f1239', marginBottom: '6px' }}>
                        ⚠️ Warning: {occupants.length} Active Resident(s) in this Room!
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#881337', marginBottom: '8px' }}>
                        Deleting this room will unassign: <strong>{occupants.map(o => o.name).join(', ')}</strong>.
                      </div>
                    </div>
                  );
                }

                return (
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '4px 0' }}>
                    Are you sure you want to permanently delete <strong>Room {deletingRoom.room_number}</strong> ({deletingRoom.total_beds} Sharing • ₹{Number(deletingRoom.monthly_rent).toLocaleString('en-IN')}/mo)?
                  </p>
                );
              })()}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setDeletingRoom(null)}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn"
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 800,
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
