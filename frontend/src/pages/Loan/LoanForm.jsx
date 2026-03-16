import React, { useState } from 'react';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import CompanyIcon from '../../components/icons/CompanyIcon';
import ClockIcon from '../../components/icons/ClockIcon';
import BankIcon from '../../components/icons/BankIcon';
import TrendingUpIcon from '../../components/icons/TrendingUpIcon';
import RupeeIcon from '../../components/icons/RupeeIcon';
import CalendarIcon from '../../components/icons/CalendarIcon';
import PlusCircleIcon from '../../components/icons/PlusCircleIcon';
import EliteSelect from '../../components/common/EliteSelect';
import QuickMasterModal from '../../components/common/QuickMasterModal';
import '../Accounting/EntryForm.css';


const LoanForm = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [masters, setMasters] = useState({ companies: [], banks: [], clients: [] });
  const [formData, setFormData] = useState({
    companyId: '',
    bankId: '',
    clientId: '',
    principalAmount: '',
    tenure: '',
    rateOfInterest: '',
    dateOfPayment: new Date().toISOString().split('T')[0],
    isInterestOrPrincipal: 1, // 1 = P+I, 2 = Interest Only
    totalAmount: '',
    loanType: 'Secured',
    loanReason: '',
    mortgageDetails: '',
    guranterDetails: ''
  });
  const [message, setMessage] = useState(null);
  const [modalType, setModalType] = useState(null);

  React.useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [companies, clients] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/companies`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/clients`, config)
      ]);
      setMasters(prev => ({
        ...prev,
        companies: companies.data.data,
        clients: clients.data.data
      }));
    } catch (err) {
      console.error('Error fetching masters', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async (companyId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/banks?companyId=${companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMasters(prev => ({ ...prev, banks: res.data.data }));
    } catch (err) {
      console.error('Error fetching banks', err);
    }
  };

  const handleCompanyChange = (val) => {
    setFormData({ ...formData, companyId: val, bankId: '' });
    fetchBanks(val);
  };

  const handleQuickAddSuccess = (newData) => {
    if (modalType === 'Company') {
      setMasters(prev => ({ ...prev, companies: [...prev.companies, newData] }));
      handleCompanyChange(newData._id);
    } else if (modalType === 'Client') {
      setMasters(prev => ({ ...prev, clients: [...prev.clients, newData] }));
      setFormData({ ...formData, clientId: newData._id });
    } else if (modalType === 'Bank') {
      setMasters(prev => ({ ...prev, banks: [...prev.banks, newData] }));
      setFormData({ ...formData, bankId: newData._id });
    }
    setModalType(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        date: new Date().toISOString(),
        totalBalanceAmount: formData.totalAmount
      };
      await axios.post(`${import.meta.env.VITE_API_URL}/loans`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Loan initialized successfully with repayment schedule.' });
      setFormData({
        companyId: '', bankId: '', clientId: '', principalAmount: '',
        tenure: '', rateOfInterest: '', dateOfPayment: new Date().toISOString().split('T')[0],
        isInterestOrPrincipal: 1, totalAmount: '', loanType: 'Secured',
        loanReason: '', mortgageDetails: '', guranterDetails: ''
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to initialize loan.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="main-content">
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Loan Configuration</h1>
            <p>Initialize a new corporate credit facility.</p>
          </div>
        </header>

        <section className="content-section">
          <div className="section-header">
            <h2>New Loan Entry</h2>
          </div>

          {message && (
            <div className={`auth-error ${message.type === 'success' ? 'success' : ''}`} style={{ marginBottom: '24px', background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', borderColor: message.type === 'success' ? '#bbf7d0' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#b91c1c' }}>
              {message.text}
            </div>
          )}

          <form className="elite-form-padding" onSubmit={handleSubmit}>
            <div className="form-grid-elite">
            {/* Company Selection */}
            <div className="auth-input-group has-quick-add">
              <label className="form-label-elite">Company</label>
              <div style={{ position: 'relative' }}>
                <CompanyIcon className="auth-input-icon" style={{ zIndex: 10 }} />
                <EliteSelect
                  options={masters.companies.map(c => ({ value: c._id, label: c.companyName }))}
                  value={formData.companyId}
                  onChange={handleCompanyChange}
                  placeholder="-- Select Company --"
                />
                <button type="button" className="quick-add-btn" onClick={() => setModalType('Company')}>
                  <PlusCircleIcon size={16} />
                </button>
              </div>
            </div>

            {/* Bank Selection */}
            <div className="auth-input-group has-quick-add">
              <label className="form-label-elite">Company Bank</label>
              <div style={{ position: 'relative' }}>
                <BankIcon className="auth-input-icon" style={{ zIndex: 10 }} />
                <EliteSelect
                  options={masters.banks.map(b => ({ value: b._id, label: b.bankName }))}
                  value={formData.bankId}
                  onChange={(val) => setFormData({ ...formData, bankId: val })}
                  placeholder="-- Select Bank --"
                  isDisabled={!formData.companyId}
                />
                <button type="button" className="quick-add-btn" onClick={() => setModalType('Bank')} disabled={!formData.companyId}>
                  <PlusCircleIcon size={16} />
                </button>
              </div>
            </div>

            {/* Client Selection */}
            <div className="auth-input-group has-quick-add">
              <label className="form-label-elite">Client (Lender)</label>
              <div style={{ position: 'relative' }}>
                <TrendingUpIcon className="auth-input-icon" style={{ zIndex: 10 }} />
                <EliteSelect
                  options={masters.clients.map(c => ({ value: c._id, label: c.clientName }))}
                  value={formData.clientId}
                  onChange={(val) => setFormData({ ...formData, clientId: val })}
                  placeholder="-- Select Client --"
                />
                <button type="button" className="quick-add-btn" onClick={() => setModalType('Client')}>
                  <PlusCircleIcon size={16} />
                </button>
              </div>
            </div>

            {/* Tenure */}
            <div className="auth-input-group">
              <label className="form-label-elite">Tenure (Months)</label>
              <div className="auth-input-wrapper">
                <ClockIcon className="auth-input-icon" />
                <input 
                  type="number" 
                  placeholder="24" 
                  value={formData.tenure}
                  onChange={(e) => setFormData({...formData, tenure: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Principal Amount */}
            <div className="auth-input-group">
              <label className="form-label-elite">Principal Amount</label>
              <div className="auth-input-wrapper">
                <RupeeIcon className="auth-input-icon" />
                <input 
                  type="number" 
                  placeholder="₹0.00" 
                  value={formData.principalAmount}
                  onChange={(e) => setFormData({...formData, principalAmount: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Total Amount */}
            <div className="auth-input-group">
              <label className="form-label-elite">Total Repayment Amount</label>
              <div className="auth-input-wrapper">
                <RupeeIcon className="auth-input-icon" />
                <input 
                  type="number" 
                  placeholder="₹0.00" 
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Rate of Interest */}
            <div className="auth-input-group">
              <label className="form-label-elite">Rate of Interest (%)</label>
              <div className="auth-input-wrapper">
                <TrendingUpIcon className="auth-input-icon" />
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="10.5" 
                  value={formData.rateOfInterest}
                  onChange={(e) => setFormData({...formData, rateOfInterest: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Date of Payment */}
            <div className="auth-input-group">
              <label className="form-label-elite">EMI Start Date</label>
              <div className="auth-input-wrapper">
                <CalendarIcon className="auth-input-icon" />
                <input 
                  type="date" 
                  value={formData.dateOfPayment}
                  onChange={(e) => setFormData({...formData, dateOfPayment: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Loan Type</label>
              <div className="auth-input-wrapper">
                <PlusCircleIcon className="auth-input-icon" style={{ zIndex: 10 }} />
                <EliteSelect
                  options={[
                    { value: 'Secured', label: 'Secured' },
                    { value: 'Unsecured', label: 'Unsecured' }
                  ]}
                  value={formData.loanType}
                  onChange={(val) => setFormData({ ...formData, loanType: val })}
                  isSearchable={false}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Repayment Schedule</label>
              <div className="elite-radio-group" style={{ height: '52px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <label className="elite-radio-label">
                  <input 
                    type="radio" 
                    name="loanSchedule" 
                    value={2}
                    checked={formData.isInterestOrPrincipal === 2}
                    onChange={() => setFormData({...formData, isInterestOrPrincipal: 2})}
                  /> Only Interest
                </label>
                <label className="elite-radio-label">
                  <input 
                    type="radio" 
                    name="loanSchedule" 
                    value={1}
                    checked={formData.isInterestOrPrincipal === 1}
                    onChange={() => setFormData({...formData, isInterestOrPrincipal: 1})}
                  /> Principal + Interest
                </label>
              </div>
            </div>

            <div className="auth-input-group elite-full-width">
              <label className="form-label-elite">Loan Reason / Remarks</label>
              <div className="auth-input-wrapper">
                <textarea 
                  className="elite-textarea-classic"
                  placeholder="Reason for taking loan..."
                  value={formData.loanReason}
                  onChange={(e) => setFormData({...formData, loanReason: e.target.value})}
                  style={{ minHeight: '80px', padding: '12px 20px' }}
                />
              </div>
            </div>

            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <button type="submit" className="btn-elite-primary" disabled={submitting}>
                {submitting ? 'Initializing...' : 'Activate Credit'}
              </button>
              <button type="button" className="btn-elite-outline" onClick={() => window.history.back()}>Discard</button>
            </div>
          </form>
        </section>

        <QuickMasterModal
          type={modalType}
          isOpen={!!modalType}
          onClose={() => setModalType(null)}
          onSuccess={handleQuickAddSuccess}
          companyId={modalType === 'Bank' ? formData.companyId : undefined}
        />
      </main>
  );
};

export default LoanForm;
