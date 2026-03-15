import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard/Dashboard.css';

const PenaltyChargesReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [loans, setLoans] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedLoan, setSelectedLoan] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchLoans();
    }
  }, [selectedCompany]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [compRes, clientRes] = await Promise.all([
        axios.get('http://localhost:5000/api/v1/companies', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/v1/clients', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCompanies(compRes.data.data);
      setClients(clientRes.data.data);
      if (compRes.data.data.length > 0) setSelectedCompany(compRes.data.data[0]._id);
      if (clientRes.data.data.length > 0) setSelectedClient(clientRes.data.data[0]._id);
    } catch (err) {
      console.error('Error fetching initial data', err);
    }
  };

  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/v1/loans?lenderCompany=${selectedCompany}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(res.data.data);
      if (res.data.data.length > 0) setSelectedLoan(res.data.data[0]._id);
      else setSelectedLoan('');
    } catch (err) {
      console.error('Error fetching loans', err);
    }
  };

  const fetchReport = async () => {
    if (!selectedCompany || !selectedLoan || !selectedClient) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/v1/reports/penalty-charges?companyId=${selectedCompany}&loanId=${selectedLoan}&clientId=${selectedClient}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(res.data.data);
    } catch (err) {
      console.error('Error fetching penalty charges report', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Penalty Charges Report</h1>
          <p>Detailed log of all penalty fees collected on loans.</p>
        </div>
      </header>

      <section className="content-section" style={{ padding: '32px' }}>
        <div className="filter-card-elite">
          <div className="filter-grid-elite">
            <div className="input-field-elite">
              <label>Our Company</label>
              <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
              </select>
            </div>
            <div className="input-field-elite">
              <label>Client</label>
              <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
                <option value="">Select Client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
              </select>
            </div>
            <div className="input-field-elite">
              <label>Loan</label>
              <select value={selectedLoan} onChange={(e) => setSelectedLoan(e.target.value)} disabled={!selectedCompany}>
                <option value="">Select Loan</option>
                {loans.map(l => <option key={l._id} value={l._id}>{l.loanNumber}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
               <button className="btn-elite" onClick={fetchReport} disabled={loading || !selectedLoan}>
                 Generate Report
               </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="skeleton-loader-elite" style={{ height: '400px' }}></div>
        ) : report ? (
          <>
            <div className="summary-cards-grid">
              <div className="summary-card-elite">
                <span className="label">Total Penalties</span>
                <span className="value success">
                  ₹{([...report.receipts, ...report.payments].reduce((sum, item) => sum + (item.receiptNumber ? item.amount : -item.amount), 0)).toLocaleString()}
                </span>
              </div>
              <div className="summary-card-elite">
                <span className="label">Loan Number</span>
                <span className="value">{report.loan?.loanNumber}</span>
              </div>
            </div>

            <div className="elite-table-container shadow">
              <table className="elite-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Voucher #</th>
                    <th>Type</th>
                    <th>Mode</th>
                    <th>Narration</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[...report.receipts, ...report.payments].sort((a,b) => new Date(a.dateTime) - new Date(b.dateTime)).map((item, idx) => (
                    <tr key={idx} className="hoverable">
                      <td>{new Date(item.dateTime).toLocaleDateString()}</td>
                      <td className="font-bold">{item.receiptNumber || item.paymentNumber}</td>
                      <td>
                        <span className={`badge-elite ${item.receiptNumber ? 'receipt' : 'payment'}`}>
                          {item.receiptNumber ? 'Receipt' : 'Payment'}
                        </span>
                      </td>
                      <td><span className="badge-elite receipt" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--elite-blue)' }}>{item.paymentMode}</span></td>
                      <td className="text-secondary">{item.narration}</td>
                      <td className={`text-right font-bold ${item.receiptNumber ? 'success-text' : 'danger-text'}`}>
                        ₹{item.amount?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {report.receipts.length === 0 && report.payments.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state-elite">
                          <div className="empty-icon">📑</div>
                          <h3>No Penalties Found</h3>
                          <p>No penalty charges recorded for this loan.</p>
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
            <div className="empty-icon">📊</div>
            <h3>Report Ready</h3>
            <p>Select the company, client, and loan to generate the penalty charges report.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default PenaltyChargesReport;
