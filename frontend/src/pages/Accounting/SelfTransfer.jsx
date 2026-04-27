import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Dashboard/Dashboard.css';
import './EntryForm.css';
import CompanyIcon from '../../components/icons/CompanyIcon';
import BankIcon from '../../components/icons/BankIcon';
import WalletIcon from '../../components/icons/WalletIcon';
import RupeeIcon from '../../components/icons/RupeeIcon';
import CalendarIcon from '../../components/icons/CalendarIcon';
import FileIcon from '../../components/icons/FileIcon';
import EliteSelect from '../../components/common/EliteSelect';
import EliteStatusModal from '../../components/common/EliteStatusModal';
import QuickMasterModal from '../../components/common/QuickMasterModal';
import PlusCircleIcon from '../../components/icons/PlusCircleIcon';

const PAYMENT_MODES = [
  { value: 'Cash', label: '💵  Cash' },
  { value: 'Bank', label: '🏦  Bank Transfer' }
];

const SelfTransfer = () => {
  const [data, setData] = useState({ companies: [], banks: [], ledgers: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null); // 'Company', 'Ledger', 'Bank'
  const [activeSide, setActiveSide] = useState('payer'); // 'payer' or 'receiver'
  
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusConfig, setStatusConfig] = useState({ title: '', message: '', type: 'success' });

  const [form, setForm] = useState({
    dateTime: new Date().toISOString().slice(0, 16),
    payerCompanyId: '',
    receiverCompanyId: '',
    payerPaymentMode: 'Cash',
    receiverPaymentMode: 'Cash',
    payerBankId: '',
    receiverBankId: '',
    payerLedgerId: '',
    receiverLedgerId: '',
    amount: '',
    narration: '',
    paymentDetails: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/self-transfer-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedData = res.data.data;
      setData(fetchedData);
      
      // Auto-select first company and ledger if available
      const defaultPayer = fetchedData.companies.length > 0 ? fetchedData.companies[0]._id : '';
      const defaultReceiver = fetchedData.companies.length > 1 ? fetchedData.companies[1]._id : defaultPayer;
      const defaultLedger = fetchedData.ledgers.length > 0 ? fetchedData.ledgers[0]._id : '';

      setForm(f => ({ 
        ...f, 
        payerCompanyId: f.payerCompanyId || defaultPayer,
        receiverCompanyId: f.receiverCompanyId || defaultReceiver,
        payerLedgerId: f.payerLedgerId || defaultLedger,
        receiverLedgerId: f.receiverLedgerId || defaultLedger
      }));
    } catch (err) {
      console.error('Error fetching transfer data', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setStatusConfig({ title: 'Invalid Amount', message: 'Please enter a valid transfer amount greater than zero.', type: 'error' });
      setShowStatusModal(true);
      return false;
    }

    if (form.payerCompanyId === form.receiverCompanyId) {
      if (form.payerPaymentMode === 'Cash' && form.receiverPaymentMode === 'Cash') {
        setStatusConfig({ title: 'Transfer Restricted', message: 'For transactions within the same company, Cash-to-Cash transfers are not allowed.', type: 'error' });
        setShowStatusModal(true);
        return false;
      }

      if (form.payerPaymentMode !== 'Cash' && form.receiverPaymentMode !== 'Cash') {
        if (form.payerBankId === form.receiverBankId) {
          setStatusConfig({ title: 'Transfer Restricted', message: 'For bank-to-bank transfers within the same company, the payer and receiver banks must be different.', type: 'error' });
          setShowStatusModal(true);
          return false;
        }
      }
    }

    if (
      (form.payerPaymentMode === 'Online' && form.receiverPaymentMode === 'Cash') ||
      (form.payerPaymentMode === 'Cash' && form.receiverPaymentMode === 'Online')
    ) {
      setStatusConfig({ title: 'Transfer Restricted', message: 'Transfers between Online and Cash modes are not allowed.', type: 'error' });
      setShowStatusModal(true);
      return false;
    }

    if (!form.payerLedgerId || !form.receiverLedgerId) {
      setStatusConfig({ title: 'Missing Information', message: 'Please select both payer and receiver ledgers.', type: 'error' });
      setShowStatusModal(true);
      return false;
    }

    return true;
  };

  const handleQuickAddSuccess = (newData) => {
    const typeKey = modalType === 'Company' ? 'companies' : 
                    modalType === 'Ledger' ? 'ledgers' : 'banks';
    
    setData(prev => ({
      ...prev,
      [typeKey]: [...prev[typeKey], newData]
    }));

    // Auto-select the newly added item based on which side it was added from
    if (modalType === 'Company') {
      const idKey = activeSide === 'payer' ? 'payerCompanyId' : 'receiverCompanyId';
      setForm(prev => ({ ...prev, [idKey]: newData._id }));
    } else if (modalType === 'Ledger') {
      const idKey = activeSide === 'payer' ? 'payerLedgerId' : 'receiverLedgerId';
      setForm(prev => ({ ...prev, [idKey]: newData._id }));
    } else {
      const idKey = activeSide === 'payer' ? 'payerBankId' : 'receiverBankId';
      setForm(prev => ({ ...prev, [idKey]: newData._id }));
    }
    
    setModalType(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/transactions/self-transfer`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatusConfig({ title: 'Transfer Successful', message: 'The self-transfer has been executed successfully and balances have been updated.', type: 'success' });
      setShowStatusModal(true);
      setForm(f => ({ ...f, amount: '', narration: '', paymentDetails: '' }));
    } catch (err) {
      setStatusConfig({ title: 'Transfer Failed', message: err.response?.data?.message || 'There was an error executing the transfer.', type: 'error' });
      setShowStatusModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Self-Transfer</h1>
          <p>Move funds between internal companies and bank accounts.</p>
        </div>
      </header>
      <section className="content-section entry-form-container">
        <div className="elite-form-padding">
           <div className="form-grid-elite">
             {[...Array(6)].map((_, i) => (
                <div key={i} className="auth-input-group">
                  <div className="skeleton skeleton-text" style={{ width: '120px', height: '16px', marginBottom: '12px' }}></div>
                  <div className="skeleton-row skeleton" style={{ margin: 0, height: '52px', borderRadius: '18px' }}></div>
                </div>
              ))}
           </div>
        </div>
      </section>
    </main>
  );

  const companyOptions = data.companies.map(c => ({ value: c._id, label: c.companyName }));
  const ledgerOptions = data.ledgers.map(l => ({ value: l._id, label: l.name }));
  
  const payerBankOptions = data.banks
    .filter(b => b.companyId === form.payerCompanyId)
    .map(b => ({ value: b._id, label: `${b.bankName} (${b.accountNumber})` }));
    
  const receiverBankOptions = data.banks
    .filter(b => b.companyId === form.receiverCompanyId)
    .map(b => ({ value: b._id, label: `${b.bankName} (${b.accountNumber})` }));

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Self-Transfer</h1>
          <p>Move funds between internal companies and bank accounts.</p>
        </div>
      </header>
      
      <section className="content-section entry-form-container">
        <form className="elite-form-padding" onSubmit={handleSubmit}>
          
          <div className="form-grid-elite">
            {/* --- FROM SECTION --- */}
            <div className="auth-input-group animate-fade-in">
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#ef4444', marginBottom: '8px', letterSpacing: '0.5px' }}>
                FROM (PAYER)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', background: 'rgba(239, 68, 68, 0.03)', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.1)', height: '100%' }}>
                <div className="auth-input-group has-quick-add">
                  <label className="form-label-elite">Payer Company</label>
                  <div className="auth-input-wrapper">
                    <CompanyIcon className="auth-input-icon" />
                    <EliteSelect 
                      options={companyOptions} 
                      value={form.payerCompanyId} 
                      onChange={val => setForm({...form, payerCompanyId: val, payerBankId: ''})} 
                      placeholder="Select Payer..."
                    />
                    <button type="button" className="quick-add-btn" onClick={() => { setActiveSide('payer'); setModalType('Company'); }}>
                      <PlusCircleIcon size={16} />
                    </button>
                  </div>
                </div>

                <div className="auth-input-group has-quick-add">
                  <label className="form-label-elite">Payer Ledger</label>
                  <div className="auth-input-wrapper">
                    <FileIcon className="auth-input-icon" />
                    <EliteSelect 
                      options={ledgerOptions} 
                      value={form.payerLedgerId} 
                      onChange={val => setForm({...form, payerLedgerId: val})} 
                      placeholder="Select Ledger..."
                    />
                    <button type="button" className="quick-add-btn" onClick={() => { setActiveSide('payer'); setModalType('Ledger'); }}>
                      <PlusCircleIcon size={16} />
                    </button>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="form-label-elite">Payment Mode</label>
                  <div className="auth-input-wrapper">
                    <WalletIcon className="auth-input-icon" />
                    <EliteSelect 
                      options={PAYMENT_MODES} 
                      value={form.payerPaymentMode} 
                      onChange={val => setForm({...form, payerPaymentMode: val})} 
                      isSearchable={false}
                    />
                  </div>
                </div>

                {form.payerPaymentMode !== 'Cash' && (
                  <div className="auth-input-group has-quick-add animate-fade-in">
                    <label className="form-label-elite">Payer Bank Account</label>
                    <div className="auth-input-wrapper">
                      <BankIcon className="auth-input-icon" />
                      <EliteSelect 
                        options={payerBankOptions} 
                        value={form.payerBankId} 
                        onChange={val => setForm({...form, payerBankId: val})} 
                        placeholder="Choose Bank..."
                      />
                      <button type="button" className="quick-add-btn" onClick={() => { setActiveSide('payer'); setModalType('Bank'); }}>
                        <PlusCircleIcon size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* --- TO SECTION --- */}
            <div className="auth-input-group animate-fade-in">
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--success)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                TO (RECEIVER)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', background: 'rgba(34, 197, 94, 0.03)', borderRadius: '24px', border: '1px solid rgba(34, 197, 94, 0.1)', height: '100%' }}>
                <div className="auth-input-group has-quick-add">
                  <label className="form-label-elite">Receiver Company</label>
                  <div className="auth-input-wrapper">
                    <CompanyIcon className="auth-input-icon" />
                    <EliteSelect 
                      options={companyOptions} 
                      value={form.receiverCompanyId} 
                      onChange={val => setForm({...form, receiverCompanyId: val, receiverBankId: ''})} 
                      placeholder="Select Receiver..."
                    />
                    <button type="button" className="quick-add-btn" onClick={() => { setActiveSide('receiver'); setModalType('Company'); }}>
                      <PlusCircleIcon size={16} />
                    </button>
                  </div>
                </div>

                <div className="auth-input-group has-quick-add">
                  <label className="form-label-elite">Receiver Ledger</label>
                  <div className="auth-input-wrapper">
                    <FileIcon className="auth-input-icon" />
                    <EliteSelect 
                      options={ledgerOptions} 
                      value={form.receiverLedgerId} 
                      onChange={val => setForm({...form, receiverLedgerId: val})} 
                      placeholder="Select Ledger..."
                    />
                    <button type="button" className="quick-add-btn" onClick={() => { setActiveSide('receiver'); setModalType('Ledger'); }}>
                      <PlusCircleIcon size={16} />
                    </button>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="form-label-elite">Receipt Mode</label>
                  <div className="auth-input-wrapper">
                    <WalletIcon className="auth-input-icon" />
                    <EliteSelect 
                      options={PAYMENT_MODES} 
                      value={form.receiverPaymentMode} 
                      onChange={val => setForm({...form, receiverPaymentMode: val})} 
                      isSearchable={false}
                    />
                  </div>
                </div>

                {form.receiverPaymentMode !== 'Cash' && (
                  <div className="auth-input-group has-quick-add animate-fade-in">
                    <label className="form-label-elite">Receiver Bank Account</label>
                    <div className="auth-input-wrapper">
                      <BankIcon className="auth-input-icon" />
                      <EliteSelect 
                        options={receiverBankOptions} 
                        value={form.receiverBankId} 
                        onChange={val => setForm({...form, receiverBankId: val})} 
                        placeholder="Choose Bank..."
                      />
                      <button type="button" className="quick-add-btn" onClick={() => { setActiveSide('receiver'); setModalType('Bank'); }}>
                        <PlusCircleIcon size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* --- COMMON DETAILS --- */}
            <div className="auth-input-group">
              <label className="form-label-elite">Transfer Amount (₹)</label>
              <div className="auth-input-wrapper">
                <RupeeIcon className="auth-input-icon" />
                <input 
                  type="number" 
                  step="0.01"
                  className="elite-input-classic" 
                  value={form.amount} 
                  onChange={e => setForm({...form, amount: e.target.value})} 
                  placeholder="0.00" 
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Execution Date & Time</label>
              <div className="auth-input-wrapper">
                <CalendarIcon className="auth-input-icon" />
                <input 
                  type="datetime-local" 
                  className="elite-input-classic" 
                  value={form.dateTime} 
                  onChange={e => setForm({...form, dateTime: e.target.value})} 
                  required
                />
              </div>
            </div>

            <div className="auth-input-group elite-full-width">
              <label className="form-label-elite">Narration / Internal Note</label>
              <div className="auth-input-wrapper">
                <FileIcon className="auth-input-icon" />
                <textarea 
                  className="elite-textarea-classic" 
                  value={form.narration} 
                  onChange={e => setForm({...form, narration: e.target.value})} 
                  placeholder="Describe the purpose of this internal transfer..."
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="entry-form-footer" style={{ marginTop: '32px' }}>
            <button type="submit" className="btn-elite-primary" disabled={submitting}>
              {submitting ? 'Executing Transfer...' : 'Confirm Self-Transfer'}
            </button>
            <button 
              type="button" 
              className="btn-elite-red" 
              onClick={() => setForm({ ...form, amount: '', narration: '', paymentDetails: '' })}
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      {/* Quick Add Modals */}
      <QuickMasterModal
        type={modalType}
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        onSuccess={handleQuickAddSuccess}
        companyId={modalType === 'Bank' ? (activeSide === 'payer' ? form.payerCompanyId : form.receiverCompanyId) : undefined}
      />

      <EliteStatusModal 
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={statusConfig.title}
        message={statusConfig.message}
        type={statusConfig.type}
      />
    </main>
  );
};

export default SelfTransfer;
