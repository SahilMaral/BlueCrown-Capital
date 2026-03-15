import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import Skeleton from '../../components/common/Skeleton';

const LedgerReport = () => {
  useDocumentTitle('Account Ledger');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  
  const [filters, setFilters] = useState({
    companyId: '',
    counterpartyId: '',
    counterpartyType: 'client',
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [compRes, clientRes, ledgerRes] = await Promise.all([
        axios.get('http://localhost:5000/api/v1/companies', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/v1/clients', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/v1/ledgers', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCompanies(compRes.data.data);
      setClients(clientRes.data.data);
      setLedgers(ledgerRes.data.data);
      
      if (compRes.data.data.length > 0) {
        setFilters(f => ({ ...f, companyId: compRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching ledger data', err);
    }
  };

  const fetchLedger = async () => {
    if (!filters.companyId || !filters.counterpartyId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { companyId, counterpartyId, counterpartyType, dateFrom, dateTo } = filters;
      const url = `http://localhost:5000/api/v1/reports/ledger?companyId=${companyId}&counterpartyId=${counterpartyId}&counterpartyType=${counterpartyType}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setReport(res.data.data);
    } catch (err) {
      console.error('Error fetching ledger report', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Account Ledger</h1>
          <p>Detailed transaction history for counterparties.</p>
        </div>
      </header>

      <section className="content-section" style={{ padding: '32px' }}>
        <div className="filter-card-elite">
          <div className="filter-grid-elite">
            <div className="input-field-elite">
              <label>Our Company</label>
              <select value={filters.companyId} onChange={e => setFilters({...filters, companyId: e.target.value})}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
              </select>
            </div>
            <div className="input-field-elite">
              <label>Type</label>
              <select value={filters.counterpartyType} onChange={e => setFilters({...filters, counterpartyType: e.target.value, counterpartyId: ''})}>
                <option value="client">Client</option>
                <option value="company">Internal Company</option>
                <option value="ledger">General Ledger</option>
              </select>
            </div>
            <div className="input-field-elite">
              <label>Counterparty</label>
              <select value={filters.counterpartyId} onChange={e => setFilters({...filters, counterpartyId: e.target.value})}>
                <option value="">Choose...</option>
                {filters.counterpartyType === 'client' && clients.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
                {filters.counterpartyType === 'company' && companies.filter(c => c._id !== filters.companyId).map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
                {filters.counterpartyType === 'ledger' && ledgers.map(l => <option key={l._id} value={l._id}>{l.ledgerName}</option>)}
              </select>
            </div>
            <div className="date-range-elite">
              <div className="input-field-elite">
                <label>From</label>
                <input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} />
              </div>
              <div className="input-field-elite">
                <label>To</label>
                <input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="filter-actions-elite">
            <button className="btn-elite" onClick={fetchLedger} disabled={!filters.counterpartyId}>
              Generate Report
            </button>
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
            <div className="summary-cards-grid">
              <div className="summary-card-elite">
                <span className="label">Opening Balance</span>
                <span className={`value ${report.openingBalance >= 0 ? 'success' : 'danger'}`}>
                  ₹{Math.abs(report.openingBalance).toLocaleString()} {report.openingBalance >= 0 ? 'Cr' : 'Dr'}
                </span>
              </div>
              <div className="summary-card-elite">
                <span className="label">Total Debit</span>
                <span className="value danger">₹{report.totalDebit?.toLocaleString()}</span>
              </div>
              <div className="summary-card-elite">
                <span className="label">Total Credit</span>
                <span className="value success">₹{report.totalCredit?.toLocaleString()}</span>
              </div>
              <div className="summary-card-elite">
                <span className="label">Closing Balance</span>
                <span className={`value ${report.closingBalance >= 0 ? 'success' : 'danger'}`}>
                  ₹{Math.abs(report.closingBalance).toLocaleString()} {report.closingBalance >= 0 ? 'Cr' : 'Dr'}
                </span>
              </div>
            </div>

            <div className="elite-table-container shadow">
              <table className="elite-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Particulars</th>
                    <th>Type</th>
                    <th>Ref #</th>
                    <th className="text-right">Debit (Dr)</th>
                    <th className="text-right">Credit (Cr)</th>
                    <th className="text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {report.ledger.map((tr, idx) => (
                    <tr key={idx} className="hoverable">
                      <td>{new Date(tr.dateTime).toLocaleDateString()}</td>
                      <td>
                        <div className="particulars-info">
                          <span className="main-info">{tr.ledger?.ledgerName || 'General Entry'}</span>
                          <span className="sub-info">{tr.narration}</span>
                          {tr.bank && <span className="bank-info">{tr.bank.bankName}</span>}
                        </div>
                      </td>
                      <td><span className={`badge-elite ${tr.type.toLowerCase()}`}>{tr.type}</span></td>
                      <td className="text-secondary">{tr.receiptNumber || tr.paymentNumber || '-'}</td>
                      <td className="text-right danger-text">{tr.type === 'Payment' ? `₹${tr.amount.toLocaleString()}` : ''}</td>
                      <td className="text-right success-text">{tr.type === 'Receipt' ? `₹${tr.amount.toLocaleString()}` : ''}</td>
                      <td className="text-right font-bold">₹{tr.runningBalance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-state-elite">
            <div className="empty-icon">📊</div>
            <h3>No Report Generated</h3>
            <p>Adjust your filters above and click generate to see the ledger details.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default LedgerReport;
