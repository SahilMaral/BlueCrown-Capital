import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '../store/slices/authSlice';
import ProtectedRoute from '../components/common/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

// Skeleton Fallbacks
import DashboardSkeleton from '../components/common/skeletons/DashboardSkeleton';
import TableSkeleton from '../components/common/skeletons/TableSkeleton';
import FormSkeleton from '../components/common/skeletons/FormSkeleton';
import AuthSkeleton from '../components/common/skeletons/AuthSkeleton';

// Lazy-loaded Pages
const Login = lazy(() => import('../pages/Login/Login'));
const Register = lazy(() => import('../pages/Register/Register'));
const ForgotPassword = lazy(() => import('../pages/Login/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/Login/ResetPassword'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const InvestmentForm = lazy(() => import('../pages/Investment/InvestmentForm'));
const InvestmentView = lazy(() => import('../pages/Investment/InvestmentView'));
const InvestmentInstallmentList = lazy(() => import('../pages/Investment/InvestmentInstallmentList'));
const InvestmentReport = lazy(() => import('../pages/Investment/InvestmentReport'));
const LoanForm = lazy(() => import('../pages/Loan/LoanForm'));
const LoanView = lazy(() => import('../pages/Loan/LoanView'));
const LoanReminderView = lazy(() => import('../pages/Loan/LoanReminderView'));
const Settings = lazy(() => import('../pages/Settings/Settings'));
const LedgerManagement = lazy(() => import('../pages/Accounting/LedgerManagement'));
const BankManagement = lazy(() => import('../pages/Accounting/BankManagement'));
const CompanyManagement = lazy(() => import('../pages/Accounting/CompanyManagement'));
const ClientManagement = lazy(() => import('../pages/Accounting/ClientManagement'));
const UserManagement = lazy(() => import('../pages/Accounting/UserManagement'));
const CounterManagement = lazy(() => import('../pages/Accounting/CounterManagement'));
const ReceiptView = lazy(() => import('../pages/Accounting/ReceiptView'));
const ReceiptEntry = lazy(() => import('../pages/Accounting/ReceiptEntry'));
const ReceiptEdit = lazy(() => import('../pages/Accounting/ReceiptEdit'));
const ReceiptPrint = lazy(() => import('../pages/Accounting/ReceiptPrint'));
const PaymentView = lazy(() => import('../pages/Accounting/PaymentView'));
const PaymentEntry = lazy(() => import('../pages/Accounting/PaymentEntry'));
const PaymentEdit = lazy(() => import('../pages/Accounting/PaymentEdit'));
const PaymentPrint = lazy(() => import('../pages/Accounting/PaymentPrint'));
const SelfTransfer = lazy(() => import('../pages/Accounting/SelfTransfer'));
const DayReport = lazy(() => import('../pages/Accounting/DayReport'));
const LedgerReport = lazy(() => import('../pages/Accounting/LedgerReport'));
const CancelReceiptReport = lazy(() => import('../pages/Accounting/CancelReceiptReport'));
const PenaltyChargesReport = lazy(() => import('../pages/Accounting/PenaltyChargesReport'));
const CancelPaymentReport = lazy(() => import('../pages/Accounting/CancelPaymentReport'));
const AdminChargesReport = lazy(() => import('../pages/Accounting/AdminChargesReport'));

const AppRoutes = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    // If we have a token but no user profile loaded, fetch it
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Suspense fallback={<AuthSkeleton />}><Login /></Suspense>} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Suspense fallback={<AuthSkeleton />}><Register /></Suspense>} 
      />
      <Route 
        path="/forgot-password" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Suspense fallback={<AuthSkeleton />}><ForgotPassword /></Suspense>} 
      />
      <Route 
        path="/reset-password/:token" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Suspense fallback={<AuthSkeleton />}><ResetPassword /></Suspense>} 
      />
      
       {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Print routes (No Layout) */}
        <Route path="/accounting/receipts/print/:id" element={<Suspense fallback={<div style={{padding: '40px', textAlign: 'center'}}>Preparing voucher...</div>}><ReceiptPrint /></Suspense>} />
        <Route path="/accounting/payments/print/:id" element={<Suspense fallback={<div style={{padding: '40px', textAlign: 'center'}}>Preparing voucher...</div>}><PaymentPrint /></Suspense>} />

        <Route element={<MainLayout />}>
           <Route path="/dashboard" element={<Suspense fallback={<DashboardSkeleton />}><Dashboard /></Suspense>} />
         
         {/* Investment Routes */}
         <Route path="/investment/new" element={<Suspense fallback={<FormSkeleton />}><InvestmentForm /></Suspense>} />
         <Route path="/investment/view" element={<Suspense fallback={<TableSkeleton />}><InvestmentView /></Suspense>} />
         <Route path="/investment/collections" element={<Suspense fallback={<TableSkeleton />}><InvestmentInstallmentList /></Suspense>} />
         
         {/* Loan Routes */}
         <Route path="/loan/entry" element={<Suspense fallback={<FormSkeleton />}><LoanForm /></Suspense>} />
         <Route path="/loan/view" element={<Suspense fallback={<TableSkeleton />}><LoanView /></Suspense>} />
         <Route path="/loan/reminders" element={<Suspense fallback={<TableSkeleton />}><LoanReminderView /></Suspense>} />

          {/* Settings Route */}
          <Route path="/settings" element={<Suspense fallback={<FormSkeleton />}><Settings /></Suspense>} />

          {/* Accounting Routes */}
          <Route path="/accounting/ledgers" element={<Suspense fallback={<TableSkeleton />}><LedgerManagement /></Suspense>} />
          <Route path="/accounting/banks" element={<Suspense fallback={<TableSkeleton />}><BankManagement /></Suspense>} />
          <Route path="/accounting/companies" element={<Suspense fallback={<TableSkeleton />}><CompanyManagement /></Suspense>} />
          <Route path="/accounting/clients" element={<Suspense fallback={<TableSkeleton />}><ClientManagement /></Suspense>} />
          <Route path="/accounting/users" element={<Suspense fallback={<TableSkeleton />}><UserManagement /></Suspense>} />
          <Route path="/accounting/counters" element={<Suspense fallback={<TableSkeleton />}><CounterManagement /></Suspense>} />
          
          {/* Transaction Routes */}
          <Route path="/accounting/receipts" element={<Suspense fallback={<TableSkeleton />}><ReceiptView /></Suspense>} />
          <Route path="/accounting/receipts/new" element={<Suspense fallback={<FormSkeleton />}><ReceiptEntry /></Suspense>} />
          <Route path="/accounting/receipts/edit/:id" element={<Suspense fallback={<FormSkeleton />}><ReceiptEdit /></Suspense>} />
          
          <Route path="/accounting/payments" element={<Suspense fallback={<TableSkeleton />}><PaymentView /></Suspense>} />
          <Route path="/accounting/payments/new" element={<Suspense fallback={<FormSkeleton />}><PaymentEntry /></Suspense>} />
          <Route path="/accounting/payments/edit/:id" element={<Suspense fallback={<FormSkeleton />}><PaymentEdit /></Suspense>} />
          <Route path="/accounting/self-transfer" element={<Suspense fallback={<FormSkeleton />}><SelfTransfer /></Suspense>} />
          <Route path="/accounting/day-report" element={<Suspense fallback={<TableSkeleton />}><DayReport /></Suspense>} />
          <Route path="/accounting/ledger-report" element={<Suspense fallback={<TableSkeleton />}><LedgerReport /></Suspense>} />
          
          {/* New Report Routes */}
          <Route path="/accounting/cancel-receipt-report" element={<Suspense fallback={<TableSkeleton />}><CancelReceiptReport /></Suspense>} />
          <Route path="/accounting/penalty-charges-report" element={<Suspense fallback={<TableSkeleton />}><PenaltyChargesReport /></Suspense>} />
          <Route path="/accounting/cancel-payment-report" element={<Suspense fallback={<TableSkeleton />}><CancelPaymentReport /></Suspense>} />
          <Route path="/accounting/admin-charges-report" element={<Suspense fallback={<TableSkeleton />}><AdminChargesReport /></Suspense>} />
          <Route path="/investment/report" element={<Suspense fallback={<TableSkeleton />}><InvestmentReport /></Suspense>} />

        </Route>
      </Route>

      {/* Default redirect or 404 */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
};

export default AppRoutes;
