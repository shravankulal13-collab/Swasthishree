// Unified API Service for Swasthishree (ಸ್ವಸ್ತಿ ಶ್ರೀ)

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('swasthishree_api_url');
    if (savedUrl && savedUrl.trim()) {
      return `${savedUrl.trim().replace(/\/$/, '')}/api`;
    }
  }
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '';
  if (envUrl && envUrl.trim()) {
    return `${envUrl.trim().replace(/\/$/, '')}/api`;
  }
  return '/api';
}

export function getBackendOrigin() {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('swasthishree_api_url');
    if (savedUrl && savedUrl.trim()) return savedUrl.trim().replace(/\/$/, '');
  }
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '';
  if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/$/, '');
  return '';
}

export function setBackendOrigin(url) {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim()) {
      localStorage.removeItem('swasthishree_api_url');
    } else {
      localStorage.setItem('swasthishree_api_url', url.trim().replace(/\/$/, ''));
    }
  }
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('swasthishree_admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user) {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem('swasthishree_admin_user');
  } else {
    localStorage.setItem('swasthishree_admin_user', JSON.stringify(user));
  }
}

export function clearStoredUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('swasthishree_admin_user');
}

export const api = {
  // Config & Diagnostics
  getBackendOrigin,
  setBackendOrigin,
  getStoredUser,
  setStoredUser,
  clearStoredUser,

  // Admin Authentication
  async login(username, password) {
    const res = await fetch(`${getBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid credentials');
    }
    const data = await res.json();
    if (data.user) {
      setStoredUser(data.user);
    }
    return data;
  },

  logout() {
    clearStoredUser();
  },

  // Health & Diagnostics
  async getHealth() {
    const res = await fetch(`${getBaseUrl()}/health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  // Stats (Real-time computed)
  async getStats() {
    const res = await fetch(`${getBaseUrl()}/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Residents
  async getResidents() {
    const res = await fetch(`${getBaseUrl()}/residents`);
    if (!res.ok) throw new Error('Failed to fetch residents');
    return res.json();
  },

  async createResident(formData) {
    const isFormData = formData instanceof FormData;
    const res = await fetch(`${getBaseUrl()}/residents`, {
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
    const res = await fetch(`${getBaseUrl()}/residents/${id}`, {
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
    const res = await fetch(`${getBaseUrl()}/residents/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to delete resident');
    }
    return res.json();
  },

  // Rooms
  async getRooms() {
    const res = await fetch(`${getBaseUrl()}/rooms`);
    if (!res.ok) throw new Error('Failed to fetch rooms');
    return res.json();
  },

  async createRoom(roomData) {
    const res = await fetch(`${getBaseUrl()}/rooms`, {
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
    const res = await fetch(`${getBaseUrl()}/rooms/${id}`, {
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
    const res = await fetch(`${getBaseUrl()}/rooms/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to delete room');
    }
    return res.json();
  },

  // Payments & Ledger
  async getPayments() {
    const res = await fetch(`${getBaseUrl()}/payments`);
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  async createPayment(paymentData) {
    const res = await fetch(`${getBaseUrl()}/payments`, {
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
    const res = await fetch(`${getBaseUrl()}/payments/${id}`, {
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
    const res = await fetch(`${getBaseUrl()}/payments/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to delete payment');
    }
    return res.json();
  },

  // Visitors & Gate Log
  async getVisitors() {
    const res = await fetch(`${getBaseUrl()}/visitors`);
    if (!res.ok) throw new Error('Failed to fetch visitors');
    return res.json();
  },

  async createVisitor(visitorData) {
    const res = await fetch(`${getBaseUrl()}/visitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitorData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to log visitor');
    }
    return res.json();
  },

  async checkoutVisitor(id) {
    const res = await fetch(`${getBaseUrl()}/visitors/${id}/checkout`, { method: 'PATCH' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to check out visitor');
    }
    return res.json();
  },

  async deleteVisitor(id) {
    const res = await fetch(`${getBaseUrl()}/visitors/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to delete visitor log');
    }
    return res.json();
  },

  // Mess Menu & Timings
  async getMessMenu() {
    const res = await fetch(`${getBaseUrl()}/mess-menu`);
    if (!res.ok) throw new Error('Failed to fetch mess menu');
    return res.json();
  },

  async updateMessMenu(id, data) {
    const res = await fetch(`${getBaseUrl()}/mess-menu/${id}`, {
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
      const res = await fetch(`${getBaseUrl()}/mess-timings`);
      if (!res.ok) return null;
      return res.json();
    } catch (e) {
      return null;
    }
  },

  async updateMessTimings(data) {
    const res = await fetch(`${getBaseUrl()}/mess-timings`, {
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
    const res = await fetch(`${getBaseUrl()}/notices`);
    if (!res.ok) throw new Error('Failed to fetch notices');
    return res.json();
  },

  async createNotice(data) {
    const res = await fetch(`${getBaseUrl()}/notices`, {
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
    const res = await fetch(`${getBaseUrl()}/notices/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to delete notice');
    }
    return res.json();
  }
};
