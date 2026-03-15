import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import Skeleton from '../../components/common/Skeleton';

const DayReport = () => {
  useDocumentTitle('Daily Report');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchReport();
    }
  }, [date, selectedCompany]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedCompany(res.data.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching companies', err);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/day?companyId=${selectedCompany}&date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(res.data.data);
    } catch (err) {
      console.error('Error fetching day report', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Daily Financial Report</h1>
          <p>Real-time snapshot of cash flow and bank balances.</p>
        </div>
      </header>

      <section className="content-section" style={{ padding: '32px' }}>
        <div className="filter-card-elite">
          <div className="filter-grid-elite">
            <div className="input-field-elite">
              <label>Our Company</label>
              <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
                {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
              </select>
            </div>
            <div className="input-field-elite">
              <label>Report Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gridColumn: 'span 2' }}>
               <button className="btn-elite" onClick={fetchReport} style={{ height: '48px' }}>
                 Refresh Data
               </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="summary-cards-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="summary-card-elite">
                   <Skeleton width="100px" height="12px" style={{ marginBottom: '12px' }} />
                   <Skeleton width="140px" height="24px" />
                </div>
              ))}
            </div>
            <div className="elite-table-container shadow">
               <div style={{ padding: '32px' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} height="60px" borderRadius="12px" style={{ marginBottom: '12px' }} />
                  ))}
               </div>
            </div>
          </div>
        ) : report ? (
          <>
            <div className="section-header">
              <h2>Cash & Online Summary</h2>
            </div>
            <div className="summary-cards-grid">
              <div className="summary-card-elite">
                <span className="label">Opening Cash Balance</span>
                <span className="value">₹{report.cashOpeningSum?.toLocaleString()}</span>
              </div>
              <div className="summary-card-elite">
                <span className="label">Total Online Receipts</span>
                <span className="value success">₹{report.totalOnlineReceipts?.toLocaleString()}</span>
              </div>
              <div className="summary-card-elite">
                <span className="label">Total Online Payments</span>
                <span className="value danger">₹{report.totalOnlinePayments?.toLocaleString()}</span>
              </div>
              <div className="summary-card-elite">
                <span className="label">Aggregate Closing Balance</span>
                <span className="value" style={{ color: 'var(--elite-blue)' }}>
                  ₹{(report.cashClosingSum + report.onlineClosingSum).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="section-header">
              <h2>Source Balances (Cash & Bank)</h2>
            </div>
            <div className="elite-table-container shadow">
              <table className="elite-table">
                <thead>
                  <tr>
                    <th>Source Name</th>
                    <th>Type</th>
                    <th className="text-right">Opening Balance</th>
                    <th className="text-right">Closing Balance</th>
                    <th className="text-right">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {report.sourceBalances.map((item, idx) => (
                    <tr key={idx} className="hoverable">
                      <td className="font-bold">{item.source}</td>
                      <td>
                        <span className={`badge-elite ${item.isCash ? 'receipt' : 'payment'}`} style={{ background: item.isCash ? 'rgba(16, 185, 129, 0.1)' : 'rgba(37, 99, 235, 0.1)', color: item.isCash ? 'var(--success)' : 'var(--elite-blue)' }}>
                          {item.isCash ? 'CASH' : 'ONLINE'}
                        </span>
                      </td>
                      <td className="text-right">₹{item.openingBalance?.toLocaleString()}</td>
                      <td className="text-right font-bold">₹{item.closingBalance?.toLocaleString()}</td>
                      <td className="text-right">
                        <span className={item.closingBalance - item.openingBalance >= 0 ? 'success-text' : 'danger-text'}>
                          {item.closingBalance - item.openingBalance >= 0 ? '+' : '-'}₹{Math.abs(item.closingBalance - item.openingBalance).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-state-elite">
            <div className="empty-icon">📅</div>
            <h3>No Data Found</h3>
            <p>We couldn't find any financial records for the selected company on this date.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default DayReport;
