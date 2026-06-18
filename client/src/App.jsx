import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './routes/ProtectedRoute';
import EmployeeRoute from './routes/EmployeeRoute';
import './styles/global.css';
import './styles/components.css';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Products = lazy(() => import('./pages/products/Products'));
const ProductForm = lazy(() => import('./pages/products/ProductForm'));
const Categories = lazy(() => import('./pages/products/Categories'));
const Inventory = lazy(() => import('./pages/inventory/Inventory'));
const Parties = lazy(() => import('./pages/parties/Parties'));
const PartyForm = lazy(() => import('./pages/parties/PartyForm'));
const Sales = lazy(() => import('./pages/sales/Sales'));
const SaleForm = lazy(() => import('./pages/sales/SaleForm'));
const Purchases = lazy(() => import('./pages/purchases/Purchases'));
const PurchaseForm = lazy(() => import('./pages/purchases/PurchaseForm'));
const SalesReport = lazy(() => import('./pages/reports/SalesReport'));
const PurchaseReport = lazy(() => import('./pages/reports/PurchaseReport'));
const StockReport = lazy(() => import('./pages/reports/StockReport'));
const PnLReport = lazy(() => import('./pages/reports/PnLReport'));
const BusinessSettings = lazy(() => import('./pages/settings/BusinessSettings'));
const TaxSettings = lazy(() => import('./pages/settings/TaxSettings'));
const UnitsSettings = lazy(() => import('./pages/settings/UnitsSettings'));
const UsersSettings = lazy(() => import('./pages/settings/UsersSettings'));
const SyncSettings = lazy(() => import('./pages/settings/SyncSettings'));
const Employees = lazy(() => import('./pages/employees/Employees'));

// Employee Portal
const EmployeeLogin = lazy(() => import('./pages/employee/EmployeeLogin'));
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'));
const EmployeeOrders = lazy(() => import('./pages/employee/EmployeeOrders'));
const EmployeeProfile = lazy(() => import('./pages/employee/EmployeeProfile'));
const EmployeeAttendance = lazy(() => import('./pages/employee/EmployeeAttendance'));

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });
const Loading = () => <div style={{ padding: 40, textAlign: 'center', color: 'var(--esp-text-muted)' }}>Loading…</div>;

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/employee-login" element={<EmployeeLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin / Owner Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/products/new" element={<ProtectedRoute permission="canAddProduct"><ProductForm /></ProtectedRoute>} />
            <Route path="/products/:id" element={<ProtectedRoute permission="canEditProduct"><ProductForm /></ProtectedRoute>} />
            <Route path="/products/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/parties" element={<ProtectedRoute><Parties /></ProtectedRoute>} />
            <Route path="/parties/new" element={<ProtectedRoute><PartyForm /></ProtectedRoute>} />
            <Route path="/parties/:id" element={<ProtectedRoute><PartyForm /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
            <Route path="/sales/new" element={<ProtectedRoute permission="canCreateInvoice"><SaleForm /></ProtectedRoute>} />
            <Route path="/sales/:id" element={<ProtectedRoute><SaleForm /></ProtectedRoute>} />
            <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
            <Route path="/purchases/new" element={<ProtectedRoute permission="canAddPurchase"><PurchaseForm /></ProtectedRoute>} />
            <Route path="/purchases/:id" element={<ProtectedRoute><PurchaseForm /></ProtectedRoute>} />
            <Route path="/reports/sales" element={<ProtectedRoute permission="canViewSalesReport"><SalesReport /></ProtectedRoute>} />
            <Route path="/reports/purchases" element={<ProtectedRoute permission="canViewPurchaseReport"><PurchaseReport /></ProtectedRoute>} />
            <Route path="/reports/stock" element={<ProtectedRoute roles={['owner', 'admin']}><StockReport /></ProtectedRoute>} />
            <Route path="/reports/pnl" element={<ProtectedRoute roles={['owner', 'admin']}><PnLReport /></ProtectedRoute>} />
            <Route path="/settings/business" element={<ProtectedRoute><BusinessSettings /></ProtectedRoute>} />
            <Route path="/settings/tax" element={<ProtectedRoute roles={['owner', 'admin']}><TaxSettings /></ProtectedRoute>} />
            <Route path="/settings/units" element={<ProtectedRoute><UnitsSettings /></ProtectedRoute>} />
            <Route path="/settings/users" element={<ProtectedRoute roles={['owner', 'admin']}><UsersSettings /></ProtectedRoute>} />
            <Route path="/settings/sync" element={<ProtectedRoute><SyncSettings /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute roles={['owner', 'admin']}><Employees /></ProtectedRoute>} />

            {/* Employee Portal */}
            <Route path="/employee/dashboard" element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
            <Route path="/employee/orders" element={<EmployeeRoute><EmployeeOrders /></EmployeeRoute>} />
            <Route path="/employee/profile" element={<EmployeeRoute><EmployeeProfile /></EmployeeRoute>} />
            <Route path="/employee/attendance" element={<EmployeeRoute><EmployeeAttendance /></EmployeeRoute>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
