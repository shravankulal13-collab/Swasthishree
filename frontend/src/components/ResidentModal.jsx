import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  User,
  Phone,
  Mail,
  Building2,
  Calendar,
  IndianRupee,
  Shield,
  Heart,
  UserCheck,
  FileText,
  BedDouble,
  Info,
  Trash2
} from 'lucide-react';
import ResidentAvatar, { isDummyPhoto } from './ResidentAvatar';

export default function ResidentModal({
  isOpen,
  onClose,
  onSave,
  residentToEdit,
  rooms = [],
  residents = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    father_name: '',
    parent_phone: '',
    joining_date: new Date().toISOString().split('T')[0],
    agent_name: '',
    deposit: '',
    joining_payment_remarks: '',
    room_id: '',
    room_number: '',
    monthly_rent: '',
    email: '',
    blood_group: '',
    college_or_work: '',
    status: 'Active',
    photo_url: '',
    notes: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (residentToEdit && residentToEdit.id) {
      // Editing existing resident profile
      const matchedRoom = rooms.find(r =>
        (residentToEdit.room_id && (r.id === residentToEdit.room_id || String(r.id) === String(residentToEdit.room_id))) ||
        (residentToEdit.room_number && String(r.room_number) === String(residentToEdit.room_number))
      );

      const validExistingPhoto = isDummyPhoto(residentToEdit.photo_url) ? '' : (residentToEdit.photo_url || '');

      setFormData({
        name: residentToEdit.name || '',
        phone: residentToEdit.phone || '',
        father_name: residentToEdit.father_name || residentToEdit.guardian_name || '',
        parent_phone: residentToEdit.parent_phone || residentToEdit.guardian_phone || '',
        joining_date: residentToEdit.joining_date || residentToEdit.admission_date || new Date().toISOString().split('T')[0],
        agent_name: residentToEdit.agent_name || '',
        deposit: residentToEdit.deposit !== undefined && residentToEdit.deposit !== null ? residentToEdit.deposit : (residentToEdit.security_deposit || ''),
        joining_payment_remarks: residentToEdit.joining_payment_remarks || residentToEdit.notes || '',
        room_id: matchedRoom ? matchedRoom.id : (residentToEdit.room_id || ''),
        room_number: matchedRoom ? matchedRoom.room_number : (residentToEdit.room_number || ''),
        monthly_rent: residentToEdit.monthly_rent !== undefined && residentToEdit.monthly_rent !== null ? residentToEdit.monthly_rent : (matchedRoom ? matchedRoom.monthly_rent : ''),
        email: residentToEdit.email || '',
        blood_group: residentToEdit.blood_group || '',
        college_or_work: residentToEdit.college_or_work || '',
        status: residentToEdit.status || 'Active',
        photo_url: validExistingPhoto,
        notes: residentToEdit.notes || ''
      });
      setPreviewUrl(validExistingPhoto);
    } else if (residentToEdit && (residentToEdit.room_id || residentToEdit.room_number)) {
      // Pre-assigned room for new resident onboarding
      const matchedRoom = rooms.find(r =>
        (residentToEdit.room_id && (r.id === residentToEdit.room_id || String(r.id) === String(residentToEdit.room_id))) ||
        (residentToEdit.room_number && String(r.room_number) === String(residentToEdit.room_number))
      );

      setFormData({
        name: '',
        phone: '',
        father_name: '',
        parent_phone: '',
        joining_date: new Date().toISOString().split('T')[0],
        agent_name: '',
        deposit: '',
        joining_payment_remarks: '',
        room_id: matchedRoom ? matchedRoom.id : (residentToEdit.room_id || ''),
        room_number: matchedRoom ? matchedRoom.room_number : (residentToEdit.room_number || ''),
        monthly_rent: matchedRoom ? matchedRoom.monthly_rent : (residentToEdit.monthly_rent || ''),
        email: '',
        blood_group: '',
        college_or_work: '',
        status: 'Active',
        photo_url: '',
        notes: ''
      });
      setPreviewUrl('');
    } else {
      setFormData({
        name: '',
        phone: '',
        father_name: '',
        parent_phone: '',
        joining_date: new Date().toISOString().split('T')[0],
        agent_name: '',
        deposit: '',
        joining_payment_remarks: '',
        room_id: '',
        room_number: '',
        monthly_rent: '',
        email: '',
        blood_group: '',
        college_or_work: '',
        status: 'Active',
        photo_url: '',
        notes: ''
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setErrorMsg('');
  }, [residentToEdit, isOpen, rooms]);

  if (!isOpen) return null;

  // Selected room object
  const selectedRoom = rooms.find(r =>
    (formData.room_id && (r.id === formData.room_id || String(r.id) === String(formData.room_id))) ||
    (formData.room_number && String(r.room_number) === String(formData.room_number))
  );

  // Sorted rooms list
  const sortedRooms = [...rooms].sort((a, b) => (parseInt(a.room_number) || 0) - (parseInt(b.room_number) || 0));

  const handleRoomChange = (selectedVal) => {
    if (!selectedVal) {
      setFormData(prev => ({ ...prev, room_id: '', room_number: '', monthly_rent: '' }));
      return;
    }

    const roomObj = rooms.find(r => r.id === selectedVal || String(r.room_number) === String(selectedVal));
    if (roomObj) {
      setFormData(prev => ({
        ...prev,
        room_id: roomObj.id,
        room_number: roomObj.room_number,
        monthly_rent: roomObj.monthly_rent !== undefined ? roomObj.monthly_rent : prev.monthly_rent
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        room_id: '',
        room_number: selectedVal
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create an immediate preview and persistent data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target.result;
        setPreviewUrl(rawDataUrl);
        setFormData(prev => ({ ...prev, photo_url: rawDataUrl }));

        try {
          const img = new Image();
          img.onload = () => {
            try {
              const maxDim = 480;
              let width = img.width;
              let height = img.height;

              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }

              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);

              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
              setPreviewUrl(compressedDataUrl);
              setFormData(prev => ({ ...prev, photo_url: compressedDataUrl }));
            } catch (canvasErr) {}
          };
          img.src = rawDataUrl;
        } catch (imgErr) {}
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, photo_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg('Resident Name and Phone number are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const depositNum = formData.deposit !== '' && formData.deposit !== null ? Number(formData.deposit) : 0;
      const rentNum = formData.monthly_rent !== '' && formData.monthly_rent !== null ? Number(formData.monthly_rent) : 0;

      const submissionPayload = {
        ...formData,
        photo_url: formData.photo_url || previewUrl || '',
        room_id: selectedRoom ? selectedRoom.id : (formData.room_id || null),
        room_number: selectedRoom ? selectedRoom.room_number : (formData.room_number || ''),
        guardian_name: formData.father_name,
        guardian_phone: formData.parent_phone,
        admission_date: formData.joining_date,
        security_deposit: depositNum,
        deposit: depositNum,
        monthly_rent: rentNum,
        notes: formData.joining_payment_remarks || formData.notes
      };

      if (selectedFile) {
        const data = new FormData();
        Object.keys(submissionPayload).forEach(key => {
          if (submissionPayload[key] !== undefined && submissionPayload[key] !== null) {
            data.append(key, submissionPayload[key]);
          }
        });
        data.append('photo', selectedFile);
        await onSave(data, residentToEdit?.id);
      } else {
        await onSave(submissionPayload, residentToEdit?.id);
      }

      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save resident.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Occupants of the currently selected room
  const currentRoomOccupants = selectedRoom ? residents.filter(res =>
    res.status === 'Active' &&
    res.id !== residentToEdit?.id &&
    ((res.room_id && res.room_id === selectedRoom.id) || (res.room_number && String(res.room_number) === String(selectedRoom.room_number)))
  ) : [];

  const occupiedCount = currentRoomOccupants.length;
  const totalBeds = selectedRoom ? Number(selectedRoom.total_beds) : 0;
  const isRoomFull = totalBeds > 0 && occupiedCount >= totalBeds;
  const vacantBeds = Math.max(0, totalBeds - occupiedCount);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {residentToEdit ? 'Edit Resident Profile' : 'Resident Onboarding (ದಾಖಲಾತಿ)'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Register resident details, room allocation, parents contact, and payment details.
            </p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMsg && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: '#ffe4e6', color: '#be123c', marginBottom: '16px', fontSize: '0.84rem', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            {/* Photo Upload Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)', flexWrap: 'wrap' }}>
              <ResidentAvatar
                name={formData.name || 'Resident'}
                photoUrl={previewUrl || formData.photo_url}
                size={68}
                borderRadius="16px"
                border="2.5px solid var(--color-coral)"
              />
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label className="form-label" style={{ marginBottom: '4px' }}>Resident Photo</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload size={14} /> {previewUrl || formData.photo_url ? 'Change Picture' : 'Upload Picture'}
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                  {(previewUrl || formData.photo_url) && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#be123c', borderColor: '#fecdd3' }}
                      title="Remove Photo"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {selectedFile ? selectedFile.name : (formData.photo_url ? 'Photo attached' : 'Optional photograph')}
                  </span>
                </div>
              </div>
            </div>

            {/* 1. Basic Resident Information */}
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-coral)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.04em' }}>
              1. Resident Information
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            {/* 2. Family & Referral Details */}
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-coral)', textTransform: 'uppercase', marginTop: '6px', marginBottom: '10px', letterSpacing: '0.04em' }}>
              2. Parents & Referral Details
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Father’s Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Father's name"
                  value={formData.father_name}
                  onChange={e => setFormData({ ...formData, father_name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Parents’ Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="Parent's phone number"
                  value={formData.parent_phone}
                  onChange={e => setFormData({ ...formData, parent_phone: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Joining Date *</label>
                <input
                  type="date"
                  required
                  value={formData.joining_date}
                  onChange={e => setFormData({ ...formData, joining_date: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Agent Name / Reference</label>
                <input
                  type="text"
                  placeholder="Agent name or reference (optional)"
                  value={formData.agent_name}
                  onChange={e => setFormData({ ...formData, agent_name: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            {/* 3. Room & Bed Assignment */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              marginTop: '10px',
              marginBottom: '18px'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--color-ruby)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BedDouble size={17} /> 3. Room Assignment
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Select Room</label>
                  <select
                    value={selectedRoom ? selectedRoom.id : (formData.room_id || '')}
                    onChange={e => handleRoomChange(e.target.value)}
                    className="form-select"
                    style={{ fontSize: '0.88rem', fontWeight: 600 }}
                  >
                    <option value="">-- Choose From Existing Rooms --</option>
                    {sortedRooms.map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.room_number} ({r.total_beds} Sharing • ₹{r.monthly_rent}/mo)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="Room number"
                    value={formData.room_number}
                    onChange={e => handleRoomChange(e.target.value)}
                    className="form-input"
                    style={{ fontWeight: 800 }}
                  />
                </div>
              </div>

              {/* Selected Room Live Card */}
              {selectedRoom && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px 14px',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  border: isRoomFull ? '1.5px solid #f87171' : '1.5px solid #86efac',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: 'var(--gradient-coral)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontWeight: 900,
                      fontSize: '0.92rem'
                    }}>
                      Room {selectedRoom.room_number}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {selectedRoom.total_beds} Sharing Room • ₹{selectedRoom.monthly_rent}/mo
                    </span>
                  </div>

                  <span className={`badge badge-${isRoomFull ? 'full' : 'available'}`}>
                    {isRoomFull ? 'Full Capacity' : `${vacantBeds} of ${totalBeds} beds available`}
                  </span>
                </div>
              )}
            </div>

            {/* 4. Payment Details (During Joining) */}
            <div style={{
              background: '#fff9f5',
              border: '1.5px solid #fed7aa',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              marginTop: '8px',
              marginBottom: '18px'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#9a3412', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IndianRupee size={16} /> 4. Payment & Rent Details (During Joining)
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" style={{ color: '#7c2d12' }}>Joining Deposit (₹)</label>
                  <input
                    type="number"
                    placeholder="Security deposit amount"
                    value={formData.deposit}
                    onChange={e => setFormData({ ...formData, deposit: e.target.value })}
                    className="form-input"
                    style={{ borderColor: '#fed7aa', fontWeight: 800 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#7c2d12' }}>Monthly Room Rent (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Monthly rent"
                    value={formData.monthly_rent}
                    onChange={e => setFormData({ ...formData, monthly_rent: e.target.value })}
                    className="form-input"
                    style={{ borderColor: '#fed7aa', fontWeight: 800 }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#7c2d12' }}>Other Payment Details / Advance Remarks</label>
                <textarea
                  rows="2"
                  placeholder="Advance payment details, receipt number or remarks (optional)..."
                  value={formData.joining_payment_remarks}
                  onChange={e => setFormData({ ...formData, joining_payment_remarks: e.target.value })}
                  className="form-textarea"
                  style={{ borderColor: '#fed7aa' }}
                />
              </div>
            </div>

            {/* 5. Additional Resident Details */}
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-coral)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.04em' }}>
              5. Profile Status & Personal Details
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="form-select"
                >
                  <option value="Active">Active Resident</option>
                  <option value="Notice Period">Notice Period</option>
                  <option value="Vacated">Vacated</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  value={formData.blood_group}
                  onChange={e => setFormData({ ...formData, blood_group: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select Blood Group (Optional)</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Workplace / College</label>
                <input
                  type="text"
                  placeholder="Workplace / College (optional)"
                  value={formData.college_or_work}
                  onChange={e => setFormData({ ...formData, college_or_work: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  placeholder="Email address (optional)"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-coral">
              {isSubmitting ? 'Saving...' : residentToEdit ? 'Update Resident' : 'Register Resident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
