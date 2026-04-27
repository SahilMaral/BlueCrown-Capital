import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import SearchIcon from '../../components/icons/SearchIcon';
import CalendarIcon from '../../components/icons/CalendarIcon';
import RupeeIcon from '../../components/icons/RupeeIcon';
import { useNavigate } from 'react-router-dom';

const LoanReminderView = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/loans/reminders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(res.data.data);
    } catch (err) {
      console.error('Error fetching reminders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReminder = async (reminderId, field, value) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/loans/reminders/${reminderId}`, { [field]: Number(value) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setReminders(prev => prev.map(r => r._id === reminderId ? { ...r, [field]: Number(value) } : r));
    } catch (err) {
      console.error('Error updating reminder', err);
      alert('Failed to update reminder');
    }
  };

  const filteredReminders = reminders.filter(rem => 
    rem.loanId?.companyId?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rem.loanId?.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Repayment Schedule</h1>
          <p>Global monitoring of all upcoming loan EMIs and maturities.</p>
        </div>
      </header>

      <section className="content-section" style={{ padding: 0 }}>
        <div className="section-header" style={{ padding: '32px 32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Upcoming Reminders</h2>
          <div className="search-container-elite">
            <SearchIcon className="search-icon-elite" />
            <input 
              type="text" 
              className="search-input-elite" 
              placeholder="Search Company or Loan ID..." 
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
                  <th>Date</th>
                  <th>Company</th>
                  <th>Loan Number</th>
                  <th>EMI Amount</th>
                  <th>Penalty</th>
                  <th>Bank</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={`sk-row-${i}`}>
                      <td colSpan="8" style={{ padding: '8px 32px' }}>
                        <div className="skeleton-row skeleton" style={{ margin: 0, height: '60px', borderRadius: '12px' }}></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredReminders.map((rem, idx) => (
                    <tr key={rem._id || idx}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CalendarIcon style={{ width: '16px', color: 'var(--elite-blue)' }} />
                          {new Date(rem.reminderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={{ fontWeight: 800 }}>{rem.loanId?.companyId?.companyName || 'N/A'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--elite-blue)' }}>{rem.loanId?.loanNumber}</td>
                      <td>
                        <input 
                          type="number" 
                          className="elite-input-classic" 
                          style={{ width: '120px', padding: '4px 8px', height: '32px', fontSize: '13px' }}
                          defaultValue={rem.emiAmount}
                          onBlur={(e) => handleUpdateReminder(rem._id, 'emiAmount', e.target.value)}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="elite-input-classic" 
                          style={{ width: '100px', padding: '4px 8px', height: '32px', fontSize: '13px', color: rem.penaltyAmount > 0 ? 'var(--error)' : 'inherit' }}
                          defaultValue={rem.penaltyAmount || 0}
                          onBlur={(e) => handleUpdateReminder(rem._id, 'penaltyAmount', e.target.value)}
                        />
                      </td>
                      <td>{rem.loanId?.bankId?.bankName || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${rem.isPaid ? 'success' : 'pending'}`}>
                          {rem.isPaid ? 'Paid' : 'Upcoming'}
                        </span>
                      </td>
                      <td>
                        {rem.isPaid ? (
                          <span className="status-badge success" style={{ opacity: 0.6 }}>Payment Posted</span>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn-elite-primary" 
                              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
                              onClick={() => navigate('/accounting/payments/new', { 
                                state: { 
                                  prefill: {
                                    receiverId: rem.loanId?.clientId,
                                    payerId: rem.loanId?.companyId?._id,
                                    amount: rem.emiAmount,
                                    reminderId: rem._id,
                                    narration: `EMI Payment for Loan #${rem.loanId?.loanNumber} (Reminder: ${new Date(rem.reminderDate).toLocaleDateString('en-GB')})`
                                  } 
                                } 
                              })}
                            >
                              Voucher
                            </button>
                            <button 
                              className="btn-elite-outline" 
                              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', color: 'var(--error)', borderColor: 'var(--error)' }}
                              onClick={() => navigate('/accounting/payments/new', { 
                                state: { 
                                  prefill: {
                                    receiverId: rem.loanId?.clientId?._id || rem.loanId?.clientId,
                                    payerId: rem.loanId?.companyId?._id,
                                    amount: rem.penaltyAmount || 0,
                                    reminderId: rem._id,
                                    narration: `Penalty Payment for Loan #${rem.loanId?.loanNumber} (Reminder: ${new Date(rem.reminderDate).toLocaleDateString('en-GB')})`,
                                    ledgerName: 'Penalty'
                                  } 
                                } 
                              })}
                            >
                              Penalty
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filteredReminders.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '80px', textAlign: 'center', color: 'var(--elite-text-secondary)' }}>
                      <div style={{ opacity: 0.5, marginBottom: '12px' }}>
                        <CalendarIcon style={{ width: '48px', height: '48px' }} />
                      </div>
                      No reminders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoanReminderView;
