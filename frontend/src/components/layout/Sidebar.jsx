import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import OverviewIcon from '../icons/OverviewIcon';
import InvestmentIcon from '../icons/InvestmentIcon';
import LoanIcon from '../icons/LoanIcon';
import ReceiptIcon from '../icons/ReceiptIcon';
import PaymentIcon from '../icons/PaymentIcon';
import LedgerIcon from '../icons/LedgerIcon';
import BankIcon from '../icons/BankIcon';
import CompanyIcon from '../icons/CompanyIcon';
import ClientIcon from '../icons/ClientIcon';
import AnalyticsIcon from '../icons/AnalyticsIcon';
import SettingsIcon from '../icons/SettingsIcon';
import SignOutIcon from '../icons/SignOutIcon';
import WalletIcon from '../icons/WalletIcon';
import UserIcon from '../icons/UserIcon';
import BriefcaseIcon from '../icons/BriefcaseIcon';
import PiggyBankIcon from '../icons/PiggyBankIcon';
import CalendarIcon from '../icons/CalendarIcon';
import ClockIcon from '../icons/ClockIcon';
import PlusCircleIcon from '../icons/PlusCircleIcon';
import RupeeIcon from '../icons/RupeeIcon';
import '../icons/AnimatedIcons.css';
import '../../pages/Dashboard/Dashboard.css';
import LogoIcon from '../icons/LogoIcon';

/* ── Inline Sign-Out Confirmation Modal ─────────────────────── */
const SignOutModal = ({ onConfirm, onCancel }) => (
  <div
    style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.25s ease-out',
    }}
    onClick={onCancel}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: '#ffffff',
        borderRadius: '32px',
        padding: '48px 40px',
        width: '400px',
        boxShadow: '0 40px 100px rgba(15,23,42,0.2), 0 10px 30px rgba(15,23,42,0.1)',
        border: '1px solid rgba(226,232,240,0.6)',
        textAlign: 'center',
        position: 'relative',
        animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Icon Backdrop */}
      <div style={{
        width: '72px', height: '72px', borderRadius: '22px',
        background: 'rgba(37, 99, 235, 0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 28px',
        color: '#2563eb',
      }}>
        <SignOutIcon className="pop-on-hover" />
      </div>

      <h3 style={{
        fontFamily: 'Outfit, sans-serif', fontSize: '24px',
        fontWeight: 800, color: '#0f172a', marginBottom: '12px',
        letterSpacing: '-0.02em'
      }}>
        Confirm Sign Out
      </h3>
      <p style={{
        color: '#64748b', fontSize: '15px', lineHeight: 1.6,
        marginBottom: '36px', fontWeight: 500,
      }}>
        Are you sure you want to end your session?<br />Your secure workspace remains protected.
      </p>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: '14px 0', borderRadius: '16px',
            border: '1.5px solid #e2e8f0', background: '#ffffff',
            color: '#475569', fontWeight: 700, fontSize: '15px',
            cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#cbd5e1'; e.target.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.target.style.background = '#ffffff'; e.target.style.borderColor = '#e2e8f0'; e.target.style.transform = 'none'; }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1.2, padding: '14px 0', borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff', fontWeight: 700, fontSize: '15px',
            cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
            boxShadow: '0 8px 20px rgba(37,99,235,0.3)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 28px rgba(37,99,235,0.4)'; }}
          onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 8px 20px rgba(37,99,235,0.3)'; }}
        >
          Sign Out
        </button>
      </div>
    </div>

    <style>{`
      @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: none; opacity: 1; } }
    `}</style>
  </div>
);




/* ── Sidebar ─────────────────────────────────────────────────── */
const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isDayBookOpen, setIsDayBookOpen] = useState(false);
  const [isInvestmentOpen, setIsInvestmentOpen] = useState(false);
  const [isLoansOpen, setIsLoansOpen] = useState(false);

  // Auto-expand sections if child route is active
  React.useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/accounting/receipts') || path.startsWith('/accounting/payments') || path.startsWith('/accounting/self-transfer')) {
      setIsDayBookOpen(true);
    }
    if (path.startsWith('/investment/view') || path.startsWith('/investment/entry')) {
      setIsInvestmentOpen(true);
    }
    if (path.startsWith('/loan/view') || path.startsWith('/loan/reminders')) {
      setIsLoansOpen(true);
    }
    if (path.includes('report')) {
      setIsReportsOpen(true);
    }
    if (path.startsWith('/accounting/ledgers') || path.startsWith('/accounting/banks') || path.startsWith('/accounting/companies') || path.startsWith('/accounting/clients') || path.startsWith('/accounting/users') || path.startsWith('/accounting/counters')) {
      setIsSettingOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = () => dispatch(logout());

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <LogoIcon className="sidebar-logo animated-icon breathe" />
          <span className="sidebar-title">BlueCrown Capital</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <OverviewIcon />
            Overview
          </NavLink>

          {/* Day Book - Hidden for checker */}
          {user?.role !== 'checker' && (
            <>
              <div 
                className="sidebar-section-label" 
                onClick={() => setIsDayBookOpen(!isDayBookOpen)}
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  userSelect: 'none'
                }}
              >
                Day Book
                <svg 
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  style={{ 
                    transform: isDayBookOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div style={{ 
                maxHeight: isDayBookOpen ? '300px' : '0', 
                overflow: 'hidden', 
                transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                paddingLeft: '8px'
              }}>
                <NavLink to="/accounting/receipts" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                  <ReceiptIcon />
                  Receipts
                </NavLink>
                <NavLink to="/accounting/payments" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                  <PaymentIcon />
                  Payments
                </NavLink>
                <NavLink to="/accounting/self-transfer" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                  <WalletIcon />
                  Self Transfer
                </NavLink>
              </div>
            </>
          )}

          {/* Investment Section */}
          <div 
            className="sidebar-section-label" 
            onClick={() => setIsInvestmentOpen(!isInvestmentOpen)}
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              userSelect: 'none',
              marginTop: '8px'
            }}
          >
            Investment
            <svg 
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              style={{ 
                transform: isInvestmentOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <div style={{ 
            maxHeight: isInvestmentOpen ? '200px' : '0', 
            overflow: 'hidden', 
            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            paddingLeft: '8px'
          }}>
            <NavLink to="/investment/view" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <PiggyBankIcon />
              Investment
            </NavLink>
            {user?.role !== 'checker' && (
              <NavLink to="/investment/entry" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <ReceiptIcon />
                Investment Collection
              </NavLink>
            )}
          </div>

          {/* Loans Section */}
          <div 
            className="sidebar-section-label" 
            onClick={() => setIsLoansOpen(!isLoansOpen)}
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              userSelect: 'none',
              marginTop: '8px'
            }}
          >
            Loans
            <svg 
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              style={{ 
                transform: isLoansOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <div style={{ 
            maxHeight: isLoansOpen ? '200px' : '0', 
            overflow: 'hidden', 
            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            paddingLeft: '8px'
          }}>
            <NavLink to="/loan/view" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <LoanIcon />
              Loan
            </NavLink>
            {user?.role !== 'checker' && (
              <NavLink to="/loan/reminders" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <CalendarIcon />
                Loan Reminder
              </NavLink>
            )}
          </div>

          {/* Reports Section */}
          <div 
            className="sidebar-section-label" 
            onClick={() => setIsReportsOpen(!isReportsOpen)}
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              userSelect: 'none'
            }}
          >
            Reports
            <svg 
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              style={{ 
                transform: isReportsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <div style={{ 
            maxHeight: isReportsOpen ? '600px' : '0', 
            overflow: 'hidden', 
            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            paddingLeft: '8px'
          }}>
            {user?.role !== 'checker' && (
              <NavLink to="/accounting/day-report" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <AnalyticsIcon />
                Day Report
              </NavLink>
            )}
            <NavLink to="/accounting/ledger-report" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <LedgerIcon />
              Ledger Report
            </NavLink>
            {user?.role !== 'checker' && (
              <>
                <NavLink to="/accounting/cancel-receipt-report" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                  <ReceiptIcon />
                  Cancel Receipt Report
                </NavLink>
                <NavLink to="/accounting/penalty-charges-report" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                  <RupeeIcon />
                  Penalty charges Report
                </NavLink>
                <NavLink to="/accounting/cancel-payment-report" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                  <PaymentIcon />
                  Cancel Payment Report
                </NavLink>
                <NavLink to="/accounting/admin-charges-report" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                  <SettingsIcon />
                  Admin Charges Report
                </NavLink>
              </>
            )}
            <NavLink to="/investment/report" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <PiggyBankIcon />
              Investment Report
            </NavLink>
          </div>

          {/* Setting Section - Hidden for checker */}
          {user?.role !== 'checker' && (
            <>
              <div 
                className="sidebar-section-label" 
                onClick={() => setIsSettingOpen(!isSettingOpen)}
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  userSelect: 'none'
                }}
              >
                Setting
                <svg 
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  style={{ 
                    transform: isSettingOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              <div style={{ 
                maxHeight: isSettingOpen ? '500px' : '0', 
                overflow: 'hidden', 
                transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                paddingLeft: '8px'
              }}>
                <NavLink to="/accounting/ledgers" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                  <LedgerIcon />
                  Ledger
                </NavLink>
                <NavLink to="/accounting/banks" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                  <BankIcon />
                  Bank
                </NavLink>
                <NavLink to="/accounting/companies" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                  <CompanyIcon />
                  Company
                </NavLink>
                <NavLink to="/accounting/clients" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                  <ClientIcon />
                  Client
                </NavLink>
                {/* User management restricted to super_admin and admin */}
                {(user?.role === 'super_admin' || user?.role === 'admin') && (
                  <NavLink to="/accounting/users" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                    <UserIcon />
                    User
                  </NavLink>
                )}
                {/* Counter restricted to super_admin */}
                {user?.role === 'super_admin' && (
                  <NavLink to="/accounting/counters" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                    <BriefcaseIcon />
                    Counter
                  </NavLink>
                )}
              </div>
            </>
          )}

          <NavLink to="/settings" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"} style={{ marginTop: '8px' }}>
            <SettingsIcon />
            App Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="sidebar-link"
            style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
          >
            <SignOutIcon />
            Sign Out
          </button>
        </div>
      </aside>

      {showLogoutModal && (
        <SignOutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
