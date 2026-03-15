import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import SearchIcon from '../../components/icons/SearchIcon';
import CloseIcon from '../../components/icons/CloseIcon';
import Skeleton from '../../components/common/Skeleton';

const LoanView = () => {
  useDocumentTitle('Loan Portfolio');
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'foreclose' or 'lumpsum'
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'Bank',
    bankId: '',
    newBalance: '',
    newTenure: ''
  });
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    fetchLoans();
    fetchBanks();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/loans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(res.data.data);
      setFilteredLoans(res.data.data);
    } catch (err) {
      console.error('Error fetching loans', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/banks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBanks(res.data.data);
    } catch (err) {
      console.error('Error fetching banks', err);
    }
  };

  useEffect(() => {
    const results = loans.filter(loan =>
      loan.companyId?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLoans(results);
  }, [searchTerm, loans]);

  const handleViewSchedule = async (loan) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/loans/${loan._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedLoan(res.data.data); // { loan, reminders }
      setShowScheduleModal(true);
    } catch (err) {
      console.error('Error fetching schedule', err);
    }
  };

  const openActionModal = (loan, type) => {
    setSelectedLoan({ loan });
    setActionType(type);
    setFormData({
      ...formData,
      amount: type === 'foreclose' ? loan.totalBalanceAmount : '',
      newBalance: '',
      newTenure: ''
    });
    setShowActionModal(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        loanId: selectedLoan.loan._id,
        foreclosureDate: formData.date,
        foreclosureAmount: formData.amount,
        lumpsumAmount: formData.amount,
        lumpsumDate: formData.date,
        newBalance: formData.newBalance,
        newTenure: formData.newTenure,
        paymentMode: formData.paymentMode,
        bankId: formData.bankId
      };

      const endpoint = `${import.meta.env.VITE_API_URL}/loans/${selectedLoan.loan._id}/${actionType}`;
      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowActionModal(false);
      fetchLoans();
    } catch (err) {
      console.error(`Error processing ${actionType}`, err);
      alert(`Error processing ${actionType}. Please try again.`);
    }
  };

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Corporate Credit Portfolio</h1>
          <p>Track your high-value loan facilities and repayment metrics.</p>
        </div>
      </header>

      <section className="content-section" style={{ padding: 0 }}>
        <div className="section-header" style={{ padding: '32px 32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Active Loans</h2>
          <div className="search-container-elite">
            <SearchIcon className="search-icon-elite" />
            <input 
              type="text" 
              className="search-input-elite" 
              placeholder="Search Company or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive-elite">
          <div className="elite-table-container">
            <table className="elite-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Loan Number</th>
                  <th>Company Name</th>
                  <th>Principal</th>
                  <th>ROI</th>
                  <th>Bank</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={`sk-row-${i}`}>
                      <td colSpan="7" style={{ padding: '24px 32px' }}>
                        <Skeleton height="60px" borderRadius="12px" />
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredLoans.map((loan, idx) => (
                    <tr key={loan._id}>
                      <td style={{ fontWeight: 600 }}>{idx + 1}.</td>
                      <td style={{ fontWeight: 600, color: 'var(--elite-blue)' }}>{loan.loanNumber}</td>
                      <td style={{ fontWeight: 800 }}>{loan.companyId?.companyName || 'N/A'}</td>
                      <td style={{ fontWeight: 700 }}>₹{loan.principalAmount?.toLocaleString()}</td>
                      <td><span className="status-badge pending">{loan.rateOfInterest}%</span></td>
                      <td>{loan.bankId?.bankName || 'Cash'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-elite-ghost" style={{ padding: '8px 12px', fontSize: '11px' }} onClick={() => handleViewSchedule(loan)}>
                            Reminders
                          </button>
                          {loan.totalBalanceAmount > 0 && !loan.isForeClosure && (
                            <>
                              <button className="btn-elite-ghost" style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--elite-blue)' }} onClick={() => openActionModal(loan, 'lumpsum')}>
                                Lumpsum
                              </button>
                              <button className="btn-elite-ghost" style={{ padding: '8px 12px', fontSize: '11px', color: '#ef4444' }} onClick={() => openActionModal(loan, 'foreclose')}>
                                Foreclose
                              </button>
                            </>
                          )}
                          {loan.isForeClosure && <span className="status-badge success" style={{ fontSize: '10px' }}>Closed</span>}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filteredLoans.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: 'var(--elite-text-secondary)' }}>
                      No loans matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Schedule Modal */}
      {showScheduleModal && selectedLoan && (
        <div className="elite-modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="elite-modal" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
            <div className="elite-modal-header">
              <div className="modal-close" onClick={() => setShowScheduleModal(false)}>
                <CloseIcon />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '28px', marginBottom: '8px' }}>Repayment Reminders</h2>
              <p style={{ color: 'var(--elite-text-secondary)', marginBottom: 0 }}>Schedule for <strong>{selectedLoan.loan.companyId?.companyName}</strong> ({selectedLoan.loan.loanNumber})</p>
            </div>
            
            <div className="elite-modal-content">
              <div className="elite-table-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="elite-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>EMI Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLoan.reminders.map((rem, i) => (
                      <tr key={rem._id || i}>
                        <td>{new Date(rem.reminderDate).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 700 }}>₹{rem.emiAmount?.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${rem.isPaid ? 'success' : 'pending'}`}>
                            {rem.isPaid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Foreclose / Lumpsum) */}
      {showActionModal && selectedLoan && (
        <div className="elite-modal-overlay" onClick={() => setShowActionModal(false)}>
          <div className="elite-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="elite-modal-header">
              <div className="modal-close" onClick={() => setShowActionModal(false)}>
                <CloseIcon />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '28px', marginBottom: '8px', textTransform: 'capitalize' }}>{actionType} Loan</h2>
              <p style={{ color: 'var(--elite-text-secondary)' }}>Processing for <strong>{selectedLoan.loan.loanNumber}</strong></p>
            </div>
            <form onSubmit={handleActionSubmit} style={{ display: 'grid', gap: '20px', padding: '24px' }}>
              <div className="input-field-elite">
                <label>Amount</label>
                <input 
                  type="number" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                  required
                />
              </div>
              <div className="input-field-elite">
                <label>Date</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                  required
                />
              </div>
              <div className="input-field-elite">
                <label>Payment Mode</label>
                <select value={formData.paymentMode} onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}>
                  <option value="Bank">Bank</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              {formData.paymentMode === 'Bank' && (
                <div className="input-field-elite">
                  <label>Select Bank</label>
                  <select value={formData.bankId} onChange={(e) => setFormData({...formData, bankId: e.target.value})} required>
                    <option value="">Choose Bank...</option>
                    {banks.map(b => <option key={b._id} value={b._id}>{b.bankName}</option>)}
                  </select>
                </div>
              )}
              {actionType === 'lumpsum' && (
                <>
                  <div className="input-field-elite">
                    <label>New Balance Amount</label>
                    <input 
                      type="number" 
                      value={formData.newBalance} 
                      onChange={(e) => setFormData({...formData, newBalance: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="input-field-elite">
                    <label>Remaining Tenure (Reminders)</label>
                    <input 
                      type="number" 
                      value={formData.newTenure} 
                      onChange={(e) => setFormData({...formData, newTenure: e.target.value})} 
                      required
                    />
                  </div>
                </>
              )}
              <button type="submit" className="btn-elite" style={{ padding: '16px' }}>
                Submit {actionType}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default LoanView;
