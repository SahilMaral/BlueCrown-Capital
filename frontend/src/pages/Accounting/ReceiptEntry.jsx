import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import LedgerIcon from '../../components/icons/LedgerIcon';
import PlusCircleIcon from '../../components/icons/PlusCircleIcon';
import PhoneIcon from '../../components/icons/PhoneIcon';
import FileIcon from '../../components/icons/FileIcon';
import './EntryForm.css';

const PAYMENT_MODES = [
  { value: 'Cash', label: '💵  Cash' },
  { value: 'Bank', label: '🏦  Bank Transfer' },
  { value: 'Cheque', label: '📄  Cheque' },
  { value: 'Online', label: '📱  Online / UPI' },
];

const ReceiptEntry = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
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
  const [error, setError] = useState('');
  const [modalType, setModalType] = useState(null); // 'Client', 'Company', 'Ledger', 'Bank'

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [clients, companies, ledgers, banks] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/clients`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/companies`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/ledgers`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/banks`, config)
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
    setError('');

    // Frontend Validation
    if (!formData.payerId) return setError('Please select a Client/Payer.');
    if (!formData.receiverId) return setError('Please select a Receiver Company.');
    if (!formData.ledgerId) return setError('Please select a Ledger Account.');
    if (formData.paymentMode !== 'Cash' && !formData.bankId) return setError('Please select a Bank Account for this transaction.');
    if (!formData.amount || Number(formData.amount) <= 0) return setError('Please enter a valid amount greater than zero.');

    setLoading(true);
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
      await axios.post(`${import.meta.env.VITE_API_URL}/receipts`, payload, {
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
  const clientOptions = masters.clients.map(c => ({ value: c._id, label: c.clientName }));
  const companyOptions = masters.companies.map(c => ({ value: c._id, label: c.companyName }));
  const ledgerOptions = masters.ledgers.map(l => ({ value: l._id, label: l.name }));
  const bankOptions = masters.banks.map(b => ({ value: b._id, label: `${b.bankName} — ${b.accountNumber}` }));
  const payerOptions = formData.payerType === 'Client' ? clientOptions : companyOptions;
  const selectedBank = masters.banks.find(b => b._id === formData.bankId);

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
            {loading && !masters.clients.length ? (
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
                <div className="auth-input-group has-quick-add">
                  <label className="form-label-elite">Select Client <span style={{ color: 'var(--error)' }}>*</span></label>
                  <div className="auth-input-wrapper">
                    <UserIcon className="auth-input-icon" />
                    <EliteSelect
                      options={payerOptions}
                      value={formData.payerId}
                      onChange={(val) => setFormData({ ...formData, payerId: val })}
                      placeholder="Choose Client"
                    />
                    <button type="button" className="quick-add-btn" onClick={() => setModalType('Client')}>
                      <PlusCircleIcon size={16} />
                    </button>
                  </div>
                </div>

                {/* Receiver (Company) */}
                <div className="auth-input-group has-quick-add">
                  <label className="form-label-elite">Receiver (Company) <span style={{ color: 'var(--error)' }}>*</span></label>
                  <div className="auth-input-wrapper">
                    <CompanyIcon className="auth-input-icon" />
                    <EliteSelect
                      options={companyOptions}
                      value={formData.receiverId}
                      onChange={(val) => setFormData({ ...formData, receiverId: val })}
                      placeholder="Choose Company"
                    />
                    <button type="button" className="quick-add-btn" onClick={() => setModalType('Company')}>
                      <PlusCircleIcon size={16} />
                    </button>
                  </div>
                </div>

                {/* Ledger */}
                <div className="auth-input-group has-quick-add">
                  <label className="form-label-elite">Ledger Account <span style={{ color: 'var(--error)' }}>*</span></label>
                  <div className="auth-input-wrapper">
                    <LedgerIcon className="auth-input-icon" />
                    <EliteSelect
                      options={ledgerOptions}
                      value={formData.ledgerId}
                      onChange={(val) => setFormData({ ...formData, ledgerId: val })}
                      placeholder="Choose Ledger"
                    />
                    <button type="button" className="quick-add-btn" onClick={() => setModalType('Ledger')}>
                      <PlusCircleIcon size={16} />
                    </button>
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="auth-input-group">
                  <label className="form-label-elite">Payment Mode <span style={{ color: 'var(--error)' }}>*</span></label>
                  <div className="auth-input-wrapper">
                    <WalletIcon className="auth-input-icon" />
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
                    <FileIcon className="auth-input-icon" />
                    <input type="text" name="paymentDetails" className="elite-input-classic" placeholder="Ref No / Cheque No / Notes..."
                      value={formData.paymentDetails} onChange={handleInputChange} />
                  </div>
                </div>

                {/* Bank Account (conditional) */}
                {formData.paymentMode !== 'Cash' && (
                  <div className="auth-input-group has-quick-add">
                    <label className="form-label-elite">Bank Account <span style={{ color: 'var(--error)' }}>*</span></label>
                    <div className="auth-input-wrapper">
                      <BankIcon className="auth-input-icon" />
                      <EliteSelect
                        options={bankOptions}
                        value={formData.bankId}
                        onChange={(val) => setFormData({ ...formData, bankId: val })}
                        placeholder="Choose Bank"
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
                  <label className="form-label-elite">Amount (₹) <span style={{ color: 'var(--error)' }}>*</span></label>
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
            <div className="auth-input-wrapper disabled-wrapper" style={{ opacity: 0.8 }}>
              <UserIcon className="auth-input-icon" />
              <input type="text" value={user?.name || 'admin'} readOnly className="elite-input-classic" style={{ backgroundColor: '#f1f5f9' }} />
            </div>
          </div>

          {/* Narration */}
          {!loading && (
            <div className="auth-input-group elite-full-width" style={{ marginTop: '24px' }}>
              <label className="form-label-elite">Narration / Remarks</label>
              <div className="auth-input-wrapper">
                <FileIcon className="auth-input-icon" />
                <textarea name="narration" className="elite-textarea-classic"
                  placeholder="Transaction details..." value={formData.narration} onChange={handleInputChange} />
              </div>
            </div>
          )}

          {error && <p style={{ color: 'var(--error)', marginTop: '24px', fontWeight: 600 }}>{error}</p>}

          <div className="entry-form-footer" style={{ marginTop: '32px' }}>
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
