import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import ReportSkeleton from '../../components/common/skeletons/ReportSkeleton';

const CancelPaymentReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
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
    if (!selectedCompany) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/cancel-payment?companyId=${selectedCompany}&fromDate=${fromDate}&toDate=${toDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(res.data.data);
    } catch (err) {
      console.error('Error fetching cancel payment report', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Cancel Payment Report</h1>
          <p>Detailed log of all voided or cancelled payment vouchers.</p>
        </div>
      </header>

      <section className="content-section content-section-elite">
        <div className="filter-card-elite">
          <div className="filter-grid-elite">
            <div className="input-field-elite">
              <label>Our Company</label>
              <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
              </select>
            </div>
            <div className="date-range-elite">
              <div className="input-field-elite">
                <label>From Date</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="input-field-elite">
                <label>To Date</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
            <div className="filter-actions-elite">
               <button 
                 className="btn-elite" 
                 onClick={fetchReport}
                 disabled={!selectedCompany || loading}
               >
                 Search Records
               </button>
            </div>
          </div>
        </div>

        {loading ? (
          <ReportSkeleton hasSummaryGrid={true} rows={5} />
        ) : report ? (
          <>
            <div className="summary-cards-grid">
              <div className="summary-card-elite">
                <span className="label">Total Cancelled Records</span>
                <span className="value">{report.length}</span>
              </div>
              <div className="summary-card-elite">
                <span className="label">Total Amount</span>
                <span className="value danger">₹{report.reduce((sum, r) => sum + (r.amount || 0), 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="elite-table-container shadow">
              <table className="elite-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Voucher #</th>
                    <th>Receiver / Counterparty</th>
                    <th>Ledger</th>
                    <th>Mode</th>
                    <th className="text-right">Amount</th>
                    <th>Cancelled By</th>
                  </tr>
                </thead>
                <tbody>
                  {report.length > 0 ? report.map((r, idx) => (
                    <tr key={idx} className="hoverable">
                      <td>{new Date(r.dateTime).toLocaleDateString()}</td>
                      <td className="font-bold">{r.paymentNumber}</td>
                      <td>
                        <div className="particulars-info">
                          <span className="main-info">{r.receiver?.clientName || r.receiver?.companyName || 'N/A'}</span>
                          <span className="sub-info">{r.narration}</span>
                        </div>
                      </td>
                      <td>{r.ledger?.ledgerName}</td>
                      <td><span className="badge-elite receipt" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--elite-blue)' }}>{r.paymentMode}</span></td>
                      <td className="text-right danger-text font-bold">₹{r.amount?.toLocaleString()}</td>
                      <td>
                        <div className="particulars-info">
                          <span className="main-info">{r.paidBy?.username}</span>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7">
                        <div className="empty-state-elite">
                          <div className="empty-icon">📂</div>
                          <h3>No Records Found</h3>
                          <p>No cancelled payments found for the selected period.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-state-elite">
            <div className="empty-icon">🔍</div>
            <h3>Specify Criteria</h3>
            <p>Select a company and date range to view cancelled payments.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default CancelPaymentReport;
