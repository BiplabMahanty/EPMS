import axios from 'axios';

let accessToken = null;

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;

const api = axios.create({ baseURL: '/api', withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        setAccessToken(null);
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authApi = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (d) => api.post('/auth/forgot-password', d),
  resetPassword: (token, d) => api.post(`/auth/reset-password/${token}`, d),
};

// Products
export const productsApi = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (d) => api.post('/products', d),
  update: (id, d) => api.patch(`/products/${id}`, d),
  delete: (id) => api.delete(`/products/${id}`),
};

// Categories
export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (d) => api.post('/categories', d),
  update: (id, d) => api.patch(`/categories/${id}`, d),
  delete: (id) => api.delete(`/categories/${id}`),
  listSubs: (params) => api.get('/subcategories', { params }),
  createSub: (d) => api.post('/subcategories', d),
  updateSub: (id, d) => api.patch(`/subcategories/${id}`, d),
  deleteSub: (id) => api.delete(`/subcategories/${id}`),
};

// Units
export const unitsApi = {
  list: () => api.get('/units'),
  create: (d) => api.post('/units', d),
  update: (id, d) => api.patch(`/units/${id}`, d),
  delete: (id) => api.delete(`/units/${id}`),
};

// Parties
export const partiesApi = {
  list: (params) => api.get('/parties', { params }),
  get: (id) => api.get(`/parties/${id}`),
  create: (d) => api.post('/parties', d),
  update: (id, d) => api.patch(`/parties/${id}`, d),
  delete: (id) => api.delete(`/parties/${id}`),
  ledger: (id) => api.get(`/parties/${id}/ledger`),
};

// Invoices
export const invoicesApi = {
  list: (params) => api.get('/invoices', { params }),
  get: (id) => api.get(`/invoices/${id}`),
  create: (d) => api.post('/invoices', d),
  update: (id, d) => api.patch(`/invoices/${id}`, d),
  recordPayment: (id, d) => api.post(`/invoices/${id}/payment`, d),
};

// Inventory
export const inventoryApi = {
  list: (params) => api.get('/inventory', { params }),
  adjust: (d) => api.post('/inventory/adjust', d),
  ledger: (params) => api.get('/inventory/ledger', { params }),
};

// Reports
export const reportsApi = {
  sales: (params) => api.get('/reports/sales', { params }),
  purchases: (params) => api.get('/reports/purchases', { params }),
  stock: () => api.get('/reports/stock'),
  pnl: (params) => api.get('/reports/pnl', { params }),
};

// Settings
export const settingsApi = {
  getBusiness: () => api.get('/settings/business'),
  updateBusiness: (d) => api.patch('/settings/business', d),
  getTax: () => api.get('/settings/tax'),
  updateTax: (d) => api.patch('/settings/tax', d),
};

// Users
export const usersApi = {
  list: () => api.get('/users'),
  invite: (d) => api.post('/users/invite', d),
  updatePermissions: (id, d) => api.patch(`/users/${id}/permissions`, d),
  updateStatus: (id, d) => api.patch(`/users/${id}/status`, d),
  delete: (id) => api.delete(`/users/${id}`),
};
