// Unified API Service for Swasthishree (ಸ್ವಸ್ತಿ ಶ್ರೀ)
const BASE_URL = '/api';

export const api = {
  // Health & Supabase Diagnostics
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  // Stats (Real-time computed)
  async getStats() {
    const res = await fetch(`${BASE_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Residents
  async getResidents() {
    const res = await fetch(`${BASE_URL}/residents`);
    if (!res.ok) throw new Error('Failed to fetch residents');
    return res.json();
  },

  async createResident(formData) {
    const isFormData = formData instanceof FormData;
    const res = await fetch(`${BASE_URL}/residents`, {
      method: 'POST',
      body: isFormData ? formData : JSON.stringify(formData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to create resident');
    }
    return res.json();
  },

  async updateResident(id, formData) {
    const isFormData = formData instanceof FormData;
    const res = await fetch(`${BASE_URL}/residents/${id}`, {
      method: 'PUT',
      body: isFormData ? formData : JSON.stringify(formData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to update resident');
    }
    return res.json();
  },

  async deleteResident(id) {
    const res = await fetch(`${BASE_URL}/residents/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to delete resident');
    }
    return res.json();
  },

  // Rooms
  async getRooms() {
    const res = await fetch(`${BASE_URL}/rooms`);
    if (!res.ok) throw new Error('Failed to fetch rooms');
    return res.json();
  },

  async createRoom(roomData) {
    const res = await fetch(`${BASE_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to create room');
    }
    return res.json();
  },

  async updateRoom(id, roomData) {
    const res = await fetch(`${BASE_URL}/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to update room');
    }
    return res.json();
  },

  async deleteRoom(id) {
    const res = await fetch(`${BASE_URL}/rooms/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to delete room');
    }
    return res.json();
  },

  // Payments & Invoices
  async getPayments() {
    const res = await fetch(`${BASE_URL}/payments`);
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  async createPayment(paymentData) {
    const res = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to record payment');
    }
    return res.json();
  },

  async updatePayment(id, paymentData) {
    const res = await fetch(`${BASE_URL}/payments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to update payment');
    }
    return res.json();
  },

  async deletePayment(id) {
    const res = await fetch(`${BASE_URL}/payments/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to delete payment');
    }
    return res.json();
  },

  // Visitors
  async getVisitors() {
    const res = await fetch(`${BASE_URL}/visitors`);
    if (!res.ok) throw new Error('Failed to fetch visitors');
    return res.json();
  },

  async createVisitor(data) {
    const res = await fetch(`${BASE_URL}/visitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to log visitor');
    }
    return res.json();
  },

  async checkoutVisitor(id) {
    const res = await fetch(`${BASE_URL}/visitors/${id}/checkout`, { method: 'PATCH' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to check out visitor');
    }
    return res.json();
  },

  async deleteVisitor(id) {
    const res = await fetch(`${BASE_URL}/visitors/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to delete visitor log');
    }
    return res.json();
  },

  // Mess Menu & Timings
  async getMessMenu() {
    const res = await fetch(`${BASE_URL}/mess-menu`);
    if (!res.ok) throw new Error('Failed to fetch mess menu');
    return res.json();
  },

  async updateMessMenu(id, data) {
    const res = await fetch(`${BASE_URL}/mess-menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to update mess menu');
    }
    return res.json();
  },

  async getMessTimings() {
    try {
      const res = await fetch(`${BASE_URL}/mess-timings`);
      if (!res.ok) return null;
      return res.json();
    } catch (e) {
      return null;
    }
  },

  async updateMessTimings(data) {
    const res = await fetch(`${BASE_URL}/mess-timings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to update mess timings');
    }
    return res.json();
  },

  // Notices
  async getNotices() {
    const res = await fetch(`${BASE_URL}/notices`);
    if (!res.ok) throw new Error('Failed to fetch notices');
    return res.json();
  },

  async createNotice(data) {
    const res = await fetch(`${BASE_URL}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to create notice');
    }
    return res.json();
  },

  async deleteNotice(id) {
    const res = await fetch(`${BASE_URL}/notices/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to delete notice');
    }
    return res.json();
  }
};
