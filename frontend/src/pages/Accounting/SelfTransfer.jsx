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
import EliteSelect from '../../components/common/EliteSelect';
import FileIcon from '../../components/icons/FileIcon';

const PAYMENT_MODES = [
  { value: 'Cash', label: '💵  Cash' },
  { value: 'Bank', label: '🏦  Bank Transfer' }
];

const SelfTransfer = () => {
  const [data, setData] = useState({ companies: [], banks: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    dateTime: new Date().toISOString().slice(0, 16),
    payerCompanyId: '',
    receiverCompanyId: '',
    payerPaymentMode: 'Cash',
    receiverPaymentMode: 'Cash',
    payerBankId: '',
    receiverBankId: '',
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
      setData(res.data.data);
      if (res.data.data.companies.length > 0) {
        setForm(f => ({ 
          ...f, 
          payerCompanyId: res.data.data.companies[0]._id,
          receiverCompanyId: res.data.data.companies.length > 1 ? res.data.data.companies[1]._id : res.data.data.companies[0]._id 
        }));
      }
    } catch (err) {
      console.error('Error fetching transfer data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return alert('Enter valid amount');
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/transactions/self-transfer`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Self-transfer completed successfully');
      setForm(f => ({ ...f, amount: '', narration: '', paymentDetails: '' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Transfer failed');
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
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#ef4444', marginBottom: '8px', letterSpacing: '0.5px' }}>
                FROM (PAYER)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: 'rgba(239, 68, 68, 0.03)', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <div className="auth-input-group">
                  <label className="form-label-elite">Payer Company</label>
                  <div style={{ position: 'relative' }}>
                    <CompanyIcon className="auth-input-icon" />
                    <EliteSelect 
                      options={companyOptions} 
                      value={form.payerCompanyId} 
                      onChange={val => setForm({...form, payerCompanyId: val, payerBankId: ''})} 
                      placeholder="Select Payer..."
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="form-label-elite">Payment Mode</label>
                  <div style={{ position: 'relative' }}>
                    <WalletIcon className="auth-input-icon" />
                    <EliteSelect 
                      options={PAYMENT_MODES} 
                      value={form.payerPaymentMode} 
                      onChange={val => setForm({...form, payerPaymentMode: val})} 
                      isSearchable={false}
                    />
                  </div>
                </div>

                {form.payerPaymentMode === 'Bank' && (
                  <div className="auth-input-group animate-fade-in">
                    <label className="form-label-elite">Payer Bank Account</label>
                    <div style={{ position: 'relative' }}>
                      <BankIcon className="auth-input-icon" />
                      <EliteSelect 
                        options={payerBankOptions} 
                        value={form.payerBankId} 
                        onChange={val => setForm({...form, payerBankId: val})} 
                        placeholder="Choose Bank..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* --- TO SECTION --- */}
            <div className="auth-input-group animate-fade-in">
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--success)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                TO (RECEIVER)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: 'rgba(34, 197, 94, 0.03)', borderRadius: '24px', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                <div className="auth-input-group">
                  <label className="form-label-elite">Receiver Company</label>
                  <div style={{ position: 'relative' }}>
                    <CompanyIcon className="auth-input-icon" />
                    <EliteSelect 
                      options={companyOptions} 
                      value={form.receiverCompanyId} 
                      onChange={val => setForm({...form, receiverCompanyId: val, receiverBankId: ''})} 
                      placeholder="Select Receiver..."
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="form-label-elite">Receipt Mode</label>
                  <div style={{ position: 'relative' }}>
                    <WalletIcon className="auth-input-icon" />
                    <EliteSelect 
                      options={PAYMENT_MODES} 
                      value={form.receiverPaymentMode} 
                      onChange={val => setForm({...form, receiverPaymentMode: val})} 
                      isSearchable={false}
                    />
                  </div>
                </div>

                {form.receiverPaymentMode === 'Bank' && (
                  <div className="auth-input-group animate-fade-in">
                    <label className="form-label-elite">Receiver Bank Account</label>
                    <div style={{ position: 'relative' }}>
                      <BankIcon className="auth-input-icon" />
                      <EliteSelect 
                        options={receiverBankOptions} 
                        value={form.receiverBankId} 
                        onChange={val => setForm({...form, receiverBankId: val})} 
                        placeholder="Choose Bank..."
                      />
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
                <FileIcon className="auth-input-icon" style={{ top: '20px' }} />
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

          <div className="entry-form-footer" style={{ marginTop: '40px' }}>
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
    </main>
  );
};

export default SelfTransfer;
