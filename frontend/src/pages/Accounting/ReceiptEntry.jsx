import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Dashboard/Dashboard.css';
import UserIcon from '../../components/icons/UserIcon';
import CompanyIcon from '../../components/icons/CompanyIcon';
import BriefcaseIcon from '../../components/icons/BriefcaseIcon';
import RupeeIcon from '../../components/icons/RupeeIcon';
import WalletIcon from '../../components/icons/WalletIcon';
import BankIcon from '../../components/icons/BankIcon';
import CalendarIcon from '../../components/icons/CalendarIcon';
import EliteSelect from '../../components/common/EliteSelect';
import QuickMasterModal from '../../components/common/QuickMasterModal';
import PlusCircleIcon from '../../components/icons/PlusCircleIcon';
import PhoneIcon from '../../components/icons/PhoneIcon';
import './EntryForm.css';

const PAYMENT_MODES = [
  { value: 'Cash',   label: '💵  Cash' },
  { value: 'Bank',   label: '🏦  Bank Transfer' },
  { value: 'Cheque', label: '📄  Cheque' },
  { value: 'Online', label: '📱  Online / UPI' },
];

const ReceiptEntry = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [masters, setMasters] = useState({ clients: [], companies: [], ledgers: [], banks: [] });
  const [formData, setFormData] = useState({
    payerType: 'Client',
    payerId: '',
    receiverId: '',
    ledgerId: '',
    bankId: '',
    paymentMode: 'Cash',
    paymentDetails: '',
    amount: '',
    dateTime: new Date().toISOString().slice(0, 16),
    narration: '',
    isInternal: false
  });
  const { user } = masters; // We'll add current user to masters or fetch separately
  const [error, setError] = useState('');
  const [modalType, setModalType] = useState(null); // 'Client', 'Company', 'Ledger', 'Bank'

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [clients, companies, ledgers, banks] = await Promise.all([
          axios.get('http://localhost:5000/api/v1/clients', config),
          axios.get('http://localhost:5000/api/v1/companies', config),
          axios.get('http://localhost:5000/api/v1/ledgers', config),
          axios.get('http://localhost:5000/api/v1/banks', config)
        ]);
        setMasters({
          clients: clients.data.data,
          companies: companies.data.data,
          ledgers: ledgers.data.data,
          banks: banks.data.data
        });
        if (companies.data.data.length > 0) {
          setFormData(prev => ({ ...prev, receiverId: companies.data.data[0]._id }));
        }
      } catch (err) {
        console.error('Error fetching masters', err);
      }
    };
    fetchMasters();
  }, []);

  const handleQuickAddSuccess = (newData) => {
    const typeKey = modalType === 'Client' ? 'clients' : 
                    modalType === 'Company' ? 'companies' : 
                    modalType === 'Ledger' ? 'ledgers' : 'banks';
    
    setMasters(prev => ({
      ...prev,
      [typeKey]: [...prev[typeKey], newData]
    }));

    // Auto-select the newly added item
    const idKey = modalType === 'Client' ? 'payerId' :
                  modalType === 'Company' ? (formData.payerType === 'Company' && modalType === 'Company' ? 'payerId' : 'receiverId') :
                  modalType === 'Ledger' ? 'ledgerId' : 'bankId';
    
    setFormData(prev => ({ ...prev, [idKey]: newData._id }));
    setModalType(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError('');
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getFinancialYear = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    // FY starts in April (month 3)
    if (month < 3) {
      return `${year - 1}-${(year).toString().slice(-2)}`;
    } else {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const payload = {
        payer: formData.payerId,
        payerModel: formData.payerType,
        receiver: formData.receiverId,
        ledger: formData.ledgerId,
        bank: formData.paymentMode === 'Cash' ? undefined : formData.bankId,
        paymentMode: formData.paymentMode,
        paymentDetails: formData.paymentDetails,
        amount: Number(formData.amount),
        dateTime: formData.dateTime,
        financialYear: getFinancialYear(formData.dateTime),
        narration: formData.narration,
        isInternal: formData.isInternal
      };
      await axios.post('http://localhost:5000/api/v1/receipts', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/accounting/receipts');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating receipt');
    } finally {
      setLoading(false);
    }
  };

  /* ── option arrays for react-select ── */
  const clientOptions  = masters.clients.map(c => ({ value: c._id, label: c.clientName }));
  const companyOptions = masters.companies.map(c => ({ value: c._id, label: c.companyName }));
  const ledgerOptions  = masters.ledgers.map(l => ({ value: l._id, label: l.name }));
  const bankOptions    = masters.banks.map(b => ({ value: b._id, label: `${b.bankName} — ${b.accountNumber}` }));
  const payerOptions   = formData.payerType === 'Client' ? clientOptions : companyOptions;
  const selectedBank   = masters.banks.find(b => b._id === formData.bankId);

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>New Receipt Entry</h1>
          <p>Generate a payment voucher and update accounts.</p>
        </div>
      </header>

      <section className="content-section entry-form-container">
        <form className="elite-form-padding" onSubmit={handleSubmit}>

          <div className="form-grid-elite">
            {loading ? (
              <>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="form-group">
                    <div className="skeleton skeleton-text" style={{ width: '120px', height: '16px', marginBottom: '12px' }}></div>
                    <div className="skeleton-row skeleton" style={{ margin: 0, height: '52px', borderRadius: '16px' }}></div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {/* Payer Type Removed - defaulting to Client */}

                <div className="auth-input-group">
                  <label className="form-label-elite">Date & Time</label>
                  <div className="auth-input-wrapper">
                    <CalendarIcon className="auth-input-icon" />
                    <input type="datetime-local" name="dateTime" className="elite-input-classic" value={formData.dateTime} onChange={handleInputChange} required />
                  </div>
                </div>

                {/* Select Payer */}
                <div className="auth-input-group">
                  <label className="form-label-elite">Select Client</label>
                  <div style={{ position: 'relative', marginRight: '40px' }}>
                    <UserIcon className="auth-input-icon" style={{ zIndex: 10 }} />
                    <EliteSelect
                      options={payerOptions}
                      value={formData.payerId}
                      onChange={(val) => setFormData({ ...formData, payerId: val })}
                       placeholder="-- Choose Client --"
                    />
                    <button type="button" className="quick-add-btn" onClick={() => setModalType('Client')}>
                      <PlusCircleIcon size={16} />
                    </button>
                  </div>
                </div>

                {/* Receiver (Company) */}
                <div className="auth-input-group">
                  <label className="form-label-elite">Receiver (Company)</label>
                  <div style={{ position: 'relative', marginRight: '40px' }}>
                    <CompanyIcon className="auth-input-icon" style={{ zIndex: 10 }} />
                    <EliteSelect
                      options={companyOptions}
                      value={formData.receiverId}
                      onChange={(val) => setFormData({ ...formData, receiverId: val })}
                      placeholder="-- Choose Company --"
                    />
                    <button type="button" className="quick-add-btn" onClick={() => setModalType('Company')}>
                      <PlusCircleIcon size={16} />
                    </button>
                  </div>
                </div>

                {/* Ledger */}
                <div className="auth-input-group">
                  <label className="form-label-elite">Ledger Account</label>
                  <div style={{ position: 'relative', marginRight: '40px' }}>
                    <BriefcaseIcon className="auth-input-icon" style={{ zIndex: 10 }} />
                    <EliteSelect
                      options={ledgerOptions}
                      value={formData.ledgerId}
                      onChange={(val) => setFormData({ ...formData, ledgerId: val })}
                      placeholder="-- Choose Ledger --"
                    />
                    <button type="button" className="quick-add-btn" onClick={() => setModalType('Ledger')}>
                      <PlusCircleIcon size={16} />
                    </button>
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="auth-input-group">
                  <label className="form-label-elite">Payment Mode</label>
                  <div style={{ position: 'relative' }}>
                    <WalletIcon className="auth-input-icon" style={{ zIndex: 10 }} />
                    <EliteSelect
                      options={PAYMENT_MODES}
                      value={formData.paymentMode}
                      onChange={(val) => setFormData({ ...formData, paymentMode: val })}
                      placeholder="Select mode"
                      isSearchable={false}
                    />
                  </div>
                </div>

                {/* Always show Payment Details after Payment Mode */}
                <div className="auth-input-group">
                  <label className="form-label-elite">Payment Details</label>
                  <div className="auth-input-wrapper">
                    <input type="text" name="paymentDetails" className="elite-input-classic" style={{ paddingLeft: '20px' }} placeholder="Ref No / Cheque No / Notes..." 
                      value={formData.paymentDetails} onChange={handleInputChange} />
                  </div>
                </div>

                {/* Bank Account (conditional) */}
                {formData.paymentMode !== 'Cash' && (
                  <div className="auth-input-group">
                    <label className="form-label-elite">Bank Account</label>
                    <div style={{ position: 'relative', marginRight: '40px' }}>
                      <BankIcon className="auth-input-icon" style={{ zIndex: 10 }} />
                      <EliteSelect
                        options={bankOptions}
                        value={formData.bankId}
                        onChange={(val) => setFormData({ ...formData, bankId: val })}
                        placeholder="-- Choose Bank --"
                      />
                      <button type="button" className="quick-add-btn" onClick={() => setModalType('Bank')}>
                        <PlusCircleIcon size={16} />
                      </button>
                    </div>

                    {/* Fetched Bank Details Display */}
                    {selectedBank && (
                      <div className="bank-details-elite animate-fade-in">
                        <div className="bank-detail-item">
                          <span className="detail-label">IFSC</span>
                          <span className="detail-value">{selectedBank.ifscCode || 'N/A'}</span>
                        </div>
                        <div className="bank-detail-item">
                          <span className="detail-label">Balance</span>
                          <span className="detail-value balance-pill">₹{selectedBank.balance?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Amount */}
                <div className="auth-input-group">
                  <label className="form-label-elite">Amount (₹)</label>
                  <div className="auth-input-wrapper">
                    <RupeeIcon className="auth-input-icon" />
                    <input type="number" name="amount" min="0.01" step="0.01" className="elite-input-classic"
                      placeholder="0.00" value={formData.amount} onChange={handleInputChange} required />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Received By (Read Only) */}
          <div className="auth-input-group elite-full-width" style={{ marginTop: '24px' }}>
            <label className="form-label-elite">Received By</label>
            <div className="auth-input-wrapper">
              <input type="text" value="admin" readOnly className="elite-input-classic" style={{ paddingLeft: '20px' }} />
            </div>
          </div>

          {/* Narration */}
          {!loading && (
            <div className="auth-input-group elite-full-width" style={{ marginTop: '24px' }}>
              <label className="form-label-elite">Narration / Remarks</label>
              <div className="auth-input-wrapper">
                <textarea name="narration" className="elite-textarea-classic" style={{ paddingLeft: '20px' }}
                  placeholder="Transaction details..." value={formData.narration} onChange={handleInputChange} />
              </div>
            </div>
          )}

          {error && <p style={{ color: 'var(--error)', marginBottom: '24px', fontWeight: 500 }}>{error}</p>}

          <div className="entry-form-footer">
            <button type="submit" className="btn-elite-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Post Receipt'}
            </button>
            <button type="button" className="btn-elite-red" 
              onClick={() => setFormData({
                payerType: 'Client', payerId: '', receiverId: masters.companies[0]?._id || '',
                ledgerId: '', bankId: '', paymentMode: 'Cash', paymentDetails: '',
                amount: '', dateTime: new Date().toISOString().slice(0, 16), narration: '', isInternal: false
              })}>
              Reset
            </button>
            <button type="button" className="btn-elite-outline" onClick={() => navigate('/accounting/receipts')}>
              Cancel
            </button>
          </div>
        </form>
      </section>

      {/* Quick Add Modal */}
      <QuickMasterModal
        type={modalType}
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        onSuccess={handleQuickAddSuccess}
        companyId={modalType === 'Bank' ? formData.receiverId : undefined}
      />
    </main>
  );
};

export default ReceiptEntry;
