import axios from 'axios';

let accessToken = null;
let employeeAccessToken = null;

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;
export const setEmployeeAccessToken = (token) => { employeeAccessToken = token; };

const api = axios.create({ baseURL: '/api', withCredentials: true });
export const empApi = axios.create({ baseURL: '/api', withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

empApi.interceptors.request.use((config) => {
  if (employeeAccessToken) config.headers.Authorization = `Bearer ${employeeAccessToken}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      setAccessToken(null);
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

empApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/employee/login')) {
      setEmployeeAccessToken(null);
      window.location.href = '/employee/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const authApi = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (d) => api.post('/auth/forgot-password', d),
  resetPassword: (token, d) => api.post(`/auth/reset-password/${token}`, d),
};

export const employeeAuthApi = {
  login: (d) => empApi.post('/employee/login', d),
  logout: () => empApi.post('/employee/logout'),
  getDashboard: () => empApi.get('/employee/dashboard'),
  getOrders: (params) => empApi.get('/employee/orders', { params }),
  getProfile: () => empApi.get('/employee/profile'),
  updateProfile: (d) => empApi.patch('/employee/profile', d),
  changePassword: (d) => empApi.post('/employee/change-password', d),
  checkIn: () => empApi.post('/employees/attendance/checkin'),
  checkOut: () => empApi.post('/employees/attendance/checkout'),
  attendanceHistory: (params) => empApi.get('/employees/attendance/history', { params }),
};

export const productsApi = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (d) => api.post('/products', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, d) => api.patch(`/products/${id}`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
  setMainImage: (id, idx) => api.patch(`/products/${id}/main-image/${idx}`),
};

export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (d) => api.post('/categories', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, d) => api.patch(`/categories/${id}`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/categories/${id}`),
  listSubs: (params) => api.get('/subcategories', { params }),
  getSubsByCategory: (categoryId) => api.get(`/subcategories/category/${categoryId}`),
  createSub: (d) => api.post('/subcategories', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateSub: (id, d) => api.patch(`/subcategories/${id}`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteSub: (id) => api.delete(`/subcategories/${id}`),
};

export const unitsApi = {
  list: () => api.get('/units'),
  create: (d) => api.post('/units', d),
  update: (id, d) => api.patch(`/units/${id}`, d),
  delete: (id) => api.delete(`/units/${id}`),
};

export const partiesApi = {
  list: (params) => api.get('/parties', { params }),
  get: (id) => api.get(`/parties/${id}`),
  create: (d) => api.post('/parties', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, d) => api.patch(`/parties/${id}`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/parties/${id}`),
  ledger: (id) => api.get(`/parties/${id}/ledger`),
};

export const employeesApi = {
  list: (params) => api.get('/employees/manage', { params }),
  get: (id) => api.get(`/employees/manage/${id}`),
  create: (d) => api.post('/employees/manage', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, d) => api.patch(`/employees/manage/${id}`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/employees/manage/${id}`),
  resetPassword: (id, d) => api.post(`/employees/manage/${id}/reset-password`, d),
};

export const invoicesApi = {
  list: (params) => api.get('/invoices', { params }),
  get: (id) => api.get(`/invoices/${id}`),
  create: (d) => api.post('/invoices', d),
  update: (id, d) => api.patch(`/invoices/${id}`, d),
  recordPayment: (id, d) => api.post(`/invoices/${id}/payment`, d),
};

export const inventoryApi = {
  list: (params) => api.get('/inventory', { params }),
  adjust: (d) => api.post('/inventory/adjust', d),
  ledger: (params) => api.get('/inventory/ledger', { params }),
};

export const reportsApi = {
  sales: (params) => api.get('/reports/sales', { params }),
  purchases: (params) => api.get('/reports/purchases', { params }),
  stock: () => api.get('/reports/stock'),
  pnl: (params) => api.get('/reports/pnl', { params }),
};

export const taxApi = {
  list: () => api.get('/taxes'),
  create: (d) => api.post('/taxes', d),
  update: (id, d) => api.patch(`/taxes/${id}`, d),
  delete: (id) => api.delete(`/taxes/${id}`),
};

export const settingsApi = {
  getBusiness: () => api.get('/settings/business'),
  updateBusiness: (d) => api.patch('/settings/business', d),
  getTax: () => api.get('/settings/tax'),
  updateTax: (d) => api.patch('/settings/tax', d),
};

export const usersApi = {
  list: () => api.get('/users'),
  invite: (d) => api.post('/users/invite', d),
  updatePermissions: (id, d) => api.patch(`/users/${id}/permissions`, d),
  updateStatus: (id, d) => api.patch(`/users/${id}/status`, d),
  delete: (id) => api.delete(`/users/${id}`),
};
