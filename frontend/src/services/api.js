/**
 * BHOOMI AI - Centralized REST API Client
 * Connects Frontend Dashboard to Node.js / Express / MongoDB Backend (Port 5000)
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const TOKEN_STORAGE_KEY = 'bhoomi_token';
export const USER_STORAGE_KEY = 'bhoomi_user';

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
}

export function setAuthSession(token, user) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.headers || {};

  const token = getToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.message || data?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    console.warn(`[API] ${options.method || 'GET'} ${endpoint} failed:`, err.message);
    throw err;
  }
}

/* =========================================================================
   API MODULES
   ========================================================================= */

export const authApi = {
  login: async (email = 'operator@bhoomi.ai', password = 'Bhoomi@2026') => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res?.data?.token) {
      setAuthSession(res.data.token, res.data.user);
    }
    return res.data;
  },
  getMe: async () => {
    const res = await request('/auth/me');
    return res.data?.user;
  },
  logout: () => {
    clearAuthSession();
  },
};

export const documentApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/documents${query ? `?${query}` : ''}`);
    return res.data?.documents || [];
  },
  getById: async (id) => {
    const res = await request(`/documents/${id}`);
    return res.data?.document || null;
  },
  upload: async (formData) => {
    const res = await request('/documents/upload', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  },
  resolveReview: async (id, payload) => {
    const res = await request(`/documents/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  reprocess: async (id) => {
    const res = await request(`/documents/${id}/reprocess`, {
      method: 'POST',
    });
    return res.data;
  },
  delete: async (id) => {
    const res = await request(`/documents/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },
};

export const gisApi = {
  getParcels: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/gis/parcels${query ? `?${query}` : ''}`);
    return res.data?.parcels || [];
  },
  getParcelById: async (id) => {
    const res = await request(`/gis/parcels/${id}`);
    return res.data?.parcel || null;
  },
  saveGcps: async (docId, gcps) => {
    const res = await request(`/gis/gcps/${docId}`, {
      method: 'POST',
      body: JSON.stringify({ gcps }),
    });
    return res.data;
  },
  getGcps: async (docId) => {
    const res = await request(`/gis/gcps/${docId}`);
    return res.data?.gcps || null;
  },
  validateSpatial: async (docId) => {
    const res = await request('/gis/validate-spatial', {
      method: 'POST',
      body: JSON.stringify({ documentId: docId }),
    });
    return res.data;
  },
};

export const discrepancyApi = {
  getAll: async () => {
    const res = await request('/discrepancies');
    return res.data?.discrepancies || [];
  },
};

export const auditApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/audit${query ? `?${query}` : ''}`);
    return res.data?.logs || [];
  },
};

export const dashboardApi = {
  getMetrics: async () => {
    const res = await request('/dashboard/metrics');
    return res.data || null;
  },
};

export const aiApi = {
  processDocument: async (file, docType = 'auto', language = 'ta+en') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', docType);
    formData.append('language', language);
    formData.append('enable_fallback', 'false');

    const res = await fetch('http://localhost:8000/api/v1/process-document', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`AI Service Error: ${res.statusText}`);
    }
    return await res.json();
  },
};

export default {
  auth: authApi,
  documents: documentApi,
  gis: gisApi,
  discrepancies: discrepancyApi,
  audit: auditApi,
  dashboard: dashboardApi,
  ai: aiApi,
};
