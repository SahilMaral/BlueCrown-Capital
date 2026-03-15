import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import WalletIcon from '../../components/icons/WalletIcon';
import TrendingUpIcon from '../../components/icons/TrendingUpIcon';
import BriefcaseIcon from '../../components/icons/BriefcaseIcon';
import InvestmentIcon from '../../components/icons/InvestmentIcon';
import PaymentIcon from '../../components/icons/PaymentIcon';
import ReceiptIcon from '../../components/icons/ReceiptIcon';
import './Dashboard.css';
import '../../components/icons/AnimatedIcons.css';
import Skeleton from '../../components/common/Skeleton';

const Dashboard = () => {
  useDocumentTitle('Elite Overview');
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [stats, setStats] = useState({
    netWorth: 0,
    totalLoan: 0,
    totalInvestment: 0,
    activeLoans: 0,
    activeInvestments: 0
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchTransactionHistory();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.data);
    } catch (err) {
      console.error('Error fetching dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/transaction-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Format dates for display (e.g., "15 Mar")
      const formattedData = res.data.data.map(item => ({
        ...item,
        displayDate: new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      }));
      setHistory(formattedData);
    } catch (err) {
      console.error('Error fetching transaction history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Net Worth', value: `₹${(stats.netWorth || 0).toLocaleString()}`, sub: 'Cash + Bank', icon: 'wallet' },
    { label: 'Loan Portfolio', value: `₹${(stats.totalLoan || 0).toLocaleString()}`, sub: `${stats.activeLoans || 0} active loans`, icon: 'trending-up' },
    { label: 'Investments', value: `₹${(stats.totalInvestment || 0).toLocaleString()}`, sub: `${stats.activeInvestments || 0} active investments`, icon: 'briefcase' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="elite-chart-tooltip">
          <p className="tooltip-label">{label}</p>
          <p style={{ color: 'var(--success)', marginBottom: '4px' }}>
            Income: ₹{payload[0].value.toLocaleString()}
          </p>
          <p style={{ color: 'var(--error)' }}>
            Expense: ₹{payload[1].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
      <main className="main-content">
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Elite Overview</h1>
            <p>Welcome back, {user?.name || 'Valued Member'}. Your portfolio is performing optimally.</p>
          </div>
          <div className="header-actions">
             <button className="auth-button" style={{ width: 'auto', padding: '12px 24px', borderRadius: '12px', fontSize: '14px' }} onClick={() => window.location.href='/accounting/day-report'}>
                View Day Report
             </button>
          </div>
        </header>

        <section className="summary-grid">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={`sk-card-${i}`} className="summary-card">
                <Skeleton width="56px" height="56px" borderRadius="18px" style={{ marginBottom: '20px' }} />
                <Skeleton width="40%" height="13px" style={{ marginBottom: '12px' }} />
                <Skeleton width="60%" height="34px" style={{ marginBottom: '12px' }} />
                <Skeleton width="50%" height="24px" borderRadius="100px" />
              </div>
            ))
          ) : (
            statCards.map((stat, index) => (
              <div key={index} className="summary-card">
                <div className="card-icon">
                  {stat.icon === 'wallet' && <WalletIcon />}
                  {stat.icon === 'trending-up' && <TrendingUpIcon />}
                  {stat.icon === 'briefcase' && <BriefcaseIcon />}
                </div>
                <div className="card-label">{stat.label}</div>
                <div className="card-value">{stat.value}</div>
                <div className="card-trend" style={{ color: 'var(--elite-text-secondary)', fontWeight: 500, fontSize: '13px' }}>
                  {stat.sub}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Analytics Chart Section */}
        <section className="chart-container-elite">
          <div className="chart-header">
            <h3>Transaction Trends</h3>
            <p>Income vs Expense over the last 30 days</p>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            {historyLoading ? (
              <Skeleton width="100%" height="100%" borderRadius="20px" />
            ) : (
              <ResponsiveContainer>
                <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--success)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--error)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--error)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,23,42,0.05)" />
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--elite-text-secondary)', fontSize: 12, fontWeight: 500 }}
                    minTickGap={30}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--elite-text-secondary)', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(val) => `₹${val > 999 ? (val/1000).toFixed(0) + 'k' : val}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="var(--success)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="var(--error)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorExpense)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="content-section" style={{ marginTop: '40px' }}>
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <button className="stat-card-elite" style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => window.location.href='/accounting/receipts/new'}>
              <ReceiptIcon className="pop-on-hover" style={{ marginBottom: '12px', color: 'var(--success)', display: 'block' }} />
              <h4 style={{ margin: 0 }}>New Receipt</h4>
            </button>
            <button className="stat-card-elite" style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => window.location.href='/accounting/payments/new'}>
              <PaymentIcon className="pop-on-hover" style={{ marginBottom: '12px', color: '#ef4444', display: 'block' }} />
              <h4 style={{ margin: 0 }}>New Payment</h4>
            </button>
            <button className="stat-card-elite" style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => window.location.href='/accounting/self-transfer'}>
              <WalletIcon className="pop-on-hover" style={{ marginBottom: '12px', color: 'var(--elite-blue)', display: 'block' }} />
              <h4 style={{ margin: 0 }}>Self Transfer</h4>
            </button>
          </div>
        </section>
      </main>
  );
};

export default Dashboard;
