import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import api from '../../services/api';
import '../Dashboard/Dashboard.css';
import SearchIcon from '../../components/icons/SearchIcon';
import CloseIcon from '../../components/icons/CloseIcon';
import RupeeIcon from '../../components/icons/RupeeIcon';
import CalendarIcon from '../../components/icons/CalendarIcon';
import WalletIcon from '../../components/icons/WalletIcon';
import CompanyIcon from '../../components/icons/CompanyIcon';
import TrendingUpIcon from '../../components/icons/TrendingUpIcon';
import ClockIcon from '../../components/icons/ClockIcon';
import Skeleton from '../../components/common/Skeleton';

import EliteSelect from '../../components/common/EliteSelect';

const InvestmentView = () => {
  useDocumentTitle('Investment Portfolio');
  const [investments, setInvestments] = useState([]);
  const [filteredInvestments, setFilteredInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'foreclose' or 'lumpsum'
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'Bank Transfer',
    bankId: '',
    newBalancePrincipal: '',
    newBalanceInterest: '',
    newTenure: '',
    newEmi: ''
  });
  const [banks, setBanks] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInvestments();
  }, []);



  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/investments');
      setInvestments(res.data);
      setFilteredInvestments(res.data);
    } catch (err) {
      console.error('Error fetching investments', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async (companyId) => {
    try {
      const res = await api.get(`/banks?companyId=${companyId}`);
      setBanks(res.data);
    } catch (err) {
      console.error('Error fetching banks', err);
    }
  };

  useEffect(() => {
    const results = investments.filter(inv =>
      inv.clientId?.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.investmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvestments(results);
  }, [searchTerm, investments]);

  const handleViewSchedule = async (inv) => {
    try {
      const res = await api.get(`/investments/${inv._id}`);
      setSelectedInvestment(res.data); // Contains { investment, installments }
      setShowScheduleModal(true);
    } catch (err) {
      console.error('Error fetching schedule', err);
    }
  };

  const openActionModal = (inv, type) => {
    setSelectedInvestment({ investment: inv });
    setActionType(type);
    setFormData({
      ...formData,
      amount: type === 'foreclose' ? inv.balancePrincipal : '',
      newBalancePrincipal: type === 'restructure' ? inv.balancePrincipal : '',
      newBalanceInterest: '',
      newTenure: '',
      newEmi: ''
    });
    fetchBanks(inv.lenderCompanyId?._id || inv.lenderCompanyId);
    setShowActionModal(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = `/investments/${selectedInvestment.investment._id}/${actionType}`;
      await api.post(endpoint, formData);
      setShowActionModal(false);
      fetchInvestments();
    } catch (err) {
      console.error(`Error processing ${actionType}`, err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Error processing ${actionType}: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Investment Portfolio</h1>
          <p>Monitor your active capital deployments and returns.</p>
        </div>
      </header>

      <section className="content-section" style={{ padding: 0 }}>
        <div className="section-header-elite">
          <div className="header-info-elite">
            <h2>Active Investments</h2>
            <span className="count-badge-elite">{filteredInvestments.length} Active</span>
          </div>
          <div className="search-container-elite">
            <SearchIcon className="search-icon-elite" />
            <input 
              type="text" 
              className="search-input-elite" 
              placeholder="Search Client or ID..." 
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
                  <th>SR. NO.</th>
                  <th>INV NUMBER</th>
                  <th>CLIENT NAME</th>
                  <th>PRINCIPAL</th>
                  <th>BAL PRINCIPAL</th>
                  <th>ROI</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={`sk-row-${i}`}>
                      <td colSpan="8" style={{ padding: '24px 32px' }}>
                        <Skeleton height="60px" borderRadius="12px" />
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredInvestments.map((inv, idx) => (
                    <tr key={inv._id}>
                      <td style={{ fontWeight: 600 }}>{idx + 1}.</td>
                      <td style={{ fontWeight: 600, color: 'var(--elite-blue)' }}>{inv.investmentNumber}</td>
                      <td style={{ fontWeight: 800 }}>{inv.clientId?.clientName || 'N/A'}</td>
                      <td style={{ fontWeight: 700 }}>₹{inv.principalAmount?.toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: inv.balancePrincipal > 0 ? '#ef4444' : '#10b981' }}>
                        ₹{inv.balancePrincipal?.toLocaleString()}
                      </td>
                      <td><span className="status-badge pending">{inv.rateOfInterest}%</span></td>
                      <td style={{ fontSize: '13px', color: '#64748b' }}>{new Date(inv.date).toLocaleDateString('en-GB')}</td>
                      <td>
                        <div className="action-group-elite">
                          <button className="action-btn-elite secondary" title="View Schedule" onClick={() => handleViewSchedule(inv)}>
                            <ClockIcon size={16} />
                            <span>Schedule</span>
                          </button>
                          
                          {inv.balancePrincipal > 0 && !inv.isForeClosure && (
                            <>
                              <button 
                                className="action-btn-elite primary" 
                                title="Add Lumpsum"
                                onClick={() => openActionModal(inv, 'lumpsum')}
                              >
                                <RupeeIcon size={16} />
                                <span>Lumpsum</span>
                              </button>
                              
                              <button 
                                className="action-btn-elite info" 
                                title="Restructure"
                                onClick={() => openActionModal(inv, 'restructure')}
                              >
                                <TrendingUpIcon size={16} />
                                <span>Restruct</span>
                              </button>

                              <button 
                                className="action-btn-elite danger" 
                                title="Foreclose"
                                onClick={() => openActionModal(inv, 'foreclose')}
                              >
                                <CloseIcon size={16} />
                                <span>Close</span>
                              </button>
                            </>
                          )}
                          {inv.isForeClosure && <span className="status-badge success">CLOSED</span>}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filteredInvestments.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ padding: '60px', textAlign: 'center', color: 'var(--elite-text-secondary)' }}>
                      No active investments matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Schedule Modal */}
      {showScheduleModal && selectedInvestment && (
        <div className="elite-modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="elite-modal" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
            <div className="elite-modal-header">
              <div className="modal-close" onClick={() => setShowScheduleModal(false)}>
                <CloseIcon />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '28px', marginBottom: '8px' }}>Repayment Schedule</h2>
              <p style={{ color: 'var(--elite-text-secondary)', marginBottom: 0 }}>Breakdown for <strong>{selectedInvestment.investment.clientId?.clientName}</strong> ({selectedInvestment.investment.investmentNumber})</p>
            </div>
            
            <div className="elite-modal-content">
              <div className="elite-table-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="elite-table">
                  <thead>
                    <tr>
                      <th>Inst #</th>
                      <th>Date</th>
                      <th>EMI Amount</th>
                      <th>Principal</th>
                      <th>Interest</th>
                      <th>Bal Principal</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvestment.installments.map((inst) => (
                      <tr key={inst._id}>
                        <td>{inst.installmentNumber}</td>
                        <td>{new Date(inst.dateOfInstallment).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 700 }}>₹{inst.emiAmount?.toLocaleString()}</td>
                        <td>₹{inst.principalEmi?.toLocaleString()}</td>
                        <td>₹{inst.interestEmi?.toLocaleString()}</td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>₹{inst.balancePrincipal?.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${inst.isPaid ? 'success' : 'pending'}`}>
                            {inst.isPaid ? 'Paid' : 'Pending'}
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

      {/* Action Modal (Foreclose / Lumpsum / Restructure) */}
      {showActionModal && selectedInvestment && (
        <div className="elite-modal-overlay" onClick={() => setShowActionModal(false)}>
          <div className="elite-modal" style={{ maxWidth: actionType === 'foreclose' ? '500px' : '800px' }} onClick={e => e.stopPropagation()}>
            <div className="elite-modal-header">
              <div className="modal-close" onClick={() => setShowActionModal(false)}>
                <CloseIcon />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '28px', marginBottom: '8px', textTransform: 'capitalize' }}>{actionType} Investment</h2>
              <p style={{ color: 'var(--elite-text-secondary)', marginBottom: 0 }}>Processing for <strong>{selectedInvestment.investment.investmentNumber}</strong></p>
            </div>
            <form className="elite-form" onSubmit={handleActionSubmit} style={{ padding: '40px' }}>
              <div className="form-grid-elite" style={{ gridTemplateColumns: actionType === 'foreclose' ? '1fr' : '1fr 1fr', gap: '24px' }}>
                
                {actionType !== 'restructure' && (
                  <div className="auth-input-group">
                    <label>{actionType === 'foreclose' ? 'FORECLOSURE AMOUNT' : 'LUMPSUM AMOUNT'}</label>
                    <div className="auth-input-wrapper">
                      <RupeeIcon className="auth-input-icon" />
                      <input 
                        type="number" 
                        value={formData.amount} 
                        onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="auth-input-group">
                  <label>PROCESSING DATE</label>
                  <div className="auth-input-wrapper">
                    <CalendarIcon className="auth-input-icon" />
                    <input 
                      type="date" 
                      value={formData.date} 
                      onChange={(e) => setFormData({...formData, date: e.target.value})} 
                      required
                    />
                  </div>
                </div>

                {(actionType === 'lumpsum' || actionType === 'restructure') && (
                  <>
                    <div className="auth-input-group">
                      <label>NEW BAL PRINCIPAL</label>
                      <div className="auth-input-wrapper">
                        <TrendingUpIcon className="auth-input-icon" />
                        <input 
                          type="number" 
                          value={formData.newBalancePrincipal} 
                          onChange={(e) => setFormData({...formData, newBalancePrincipal: e.target.value})} 
                          required
                        />
                      </div>
                    </div>
                    <div className="auth-input-group">
                      <label>REM TENURE (MONTHS)</label>
                      <div className="auth-input-wrapper">
                        <ClockIcon className="auth-input-icon" />
                        <input 
                          type="number" 
                          value={formData.newTenure} 
                          onChange={(e) => setFormData({...formData, newTenure: e.target.value})} 
                          required
                        />
                      </div>
                    </div>
                    <div className="auth-input-group">
                      <label>NEW EMI AMOUNT</label>
                      <div className="auth-input-wrapper">
                        <RupeeIcon className="auth-input-icon" />
                        <input 
                          type="number" 
                          value={formData.newEmi} 
                          onChange={(e) => setFormData({...formData, newEmi: e.target.value})} 
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {actionType !== 'restructure' && (
                  <>
                    <div className="auth-input-group">
                      <label>PAYMENT MODE</label>
                      <div className="auth-input-wrapper">
                        <WalletIcon className="auth-input-icon" />
                        <EliteSelect
                          options={[
                            { value: 'Bank Transfer', label: '🏦  Bank Transfer' },
                            { value: 'Online', label: '📱  Online' },
                            { value: 'Cash', label: '💵  Cash' }
                          ]}
                          value={formData.paymentMode}
                          onChange={(val) => setFormData({ ...formData, paymentMode: val })}
                          isSearchable={false}
                        />
                      </div>
                    </div>

                    {formData.paymentMode !== 'Cash' && (
                      <div className="auth-input-group">
                        <label>SELECT BANK</label>
                        <div className="auth-input-wrapper">
                          <CompanyIcon className="auth-input-icon" />
                          <EliteSelect
                            options={banks.map(b => ({ value: b._id, label: `${b.bankName} (${b.accountNumber})` }))}
                            value={formData.bankId}
                            onChange={(val) => setFormData({ ...formData, bankId: val })}
                            placeholder="Choose Bank..."
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                <button type="submit" className="btn-elite" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'PROCESSING...' : `CONFIRM ${actionType.toUpperCase()}`}
                </button>
                <button type="button" className="btn-elite-ghost" style={{ flex: 0.4 }} onClick={() => setShowActionModal(false)}>CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default InvestmentView;
