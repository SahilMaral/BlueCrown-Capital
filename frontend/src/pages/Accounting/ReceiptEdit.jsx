import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../Dashboard/Dashboard.css';
import UserIcon from '../../components/icons/UserIcon';
import CompanyIcon from '../../components/icons/CompanyIcon';
import BriefcaseIcon from '../../components/icons/BriefcaseIcon';
import RupeeIcon from '../../components/icons/RupeeIcon';
import WalletIcon from '../../components/icons/WalletIcon';
import CalendarIcon from '../../components/icons/CalendarIcon';
import EliteSelect from '../../components/common/EliteSelect';
import FileIcon from '../../components/icons/FileIcon';
import BankIcon from '../../components/icons/BankIcon';
import './EntryForm.css';

const PAYMENT_MODES = [
  { value: 'Cash', label: '💵  Cash' },
  { value: 'Bank', label: '🏦  Bank Transfer' },
  { value: 'Cheque', label: '📄  Cheque' },
  { value: 'Online', label: '📱  Online / UPI' },
];

const ReceiptEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [masters, setMasters] = useState({ ledgers: [], banks: [] });
  const [originalReceipt, setOriginalReceipt] = useState(null);

  const [formData, setFormData] = useState({
    ledgerId: '',
    paymentMode: '',
    bankId: '',
    paymentDetails: '',
    narration: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch masters
        const [ledgersRes, banksRes, receiptRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/ledgers`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/banks`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/receipts/${id}`, config)
        ]);
        
        setMasters({ 
          ledgers: ledgersRes.data.data,
          banks: banksRes.data.data
        });

        const receiptData = receiptRes.data.data;
        setOriginalReceipt(receiptData);
        setFormData({
          ledgerId: receiptData.ledger?._id || '',
          paymentMode: receiptData.paymentMode || '',
          bankId: receiptData.bank?._id || '',
          paymentDetails: receiptData.paymentDetails || '',
          narration: receiptData.narration || ''
        });
      } catch (err) {
        console.error('Error fetching data', err);
        setError('Failed to load receipt details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend Validation
    if (!formData.ledgerId) return setError('Please select a Ledger Account.');
    if (!formData.paymentMode) return setError('Please select a Payment Mode.');
    if (formData.paymentMode !== 'Cash' && !formData.bankId) return setError('Please select a Bank Account.');

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ledger: formData.ledgerId,
        paymentMode: formData.paymentMode,
        bank: formData.paymentMode === 'Cash' ? undefined : formData.bankId,
        paymentDetails: formData.paymentDetails,
        narration: formData.narration
      };
      await axios.put(`${import.meta.env.VITE_API_URL}/receipts/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/accounting/receipts');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating receipt');
    } finally {
      setUpdating(false);
    }
  };

  const ledgerOptions = masters.ledgers.map(l => ({ value: l._id, label: l.name }));
  const bankOptions = masters.banks.map(b => ({ value: b._id, label: `${b.bankName} — ${b.accountNumber}` }));

  if (loading) {
    return (
      <main className="main-content">
        <section className="content-section entry-form-container">
          <div className="elite-form-padding" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner-elite" style={{ margin: '0 auto 16px' }}></div>
            <p>Loading receipt data...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!originalReceipt && !loading) {
    return (
      <main className="main-content">
        <section className="content-section entry-form-container">
          <div className="elite-form-padding" style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Receipt Not Found</h2>
            <button className="btn-elite-primary" onClick={() => navigate('/accounting/receipts')} style={{ marginTop: '16px' }}>
              Back to List
            </button>
          </div>
        </section>
      </main>
    );
  }

  // Format dates for display
  const formattedDateString = new Date(originalReceipt.dateTime).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short'
  });

  const payerName = originalReceipt.payer?.clientName ? `${originalReceipt.payer.clientName} (Client)` : (originalReceipt.payer?.companyName || 'Unknown');
  const receiverName = originalReceipt.receiver?.companyName || 'Unknown';

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Edit Receipt</h1>
          <p>Update metadata for {originalReceipt.receiptNumber}</p>
        </div>
      </header>

      <section className="content-section entry-form-container">
        <form className="elite-form-padding" onSubmit={handleSubmit}>

          <h3 className="section-title" style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--elite-border)' }}>Edit Receipt Details</h3>

          <div className="form-grid-elite">
            {/* READ-ONLY: Receipt Number */}
            <div className="auth-input-group">
              <label className="form-label-elite" style={{ color: 'var(--elite-text-secondary)' }}>Receipt Number</label>
              <div className="auth-input-wrapper disabled-wrapper" style={{ opacity: 0.8 }}>
                <FileIcon className="auth-input-icon" style={{ opacity: 0.6 }} />
                <input type="text" className="elite-input-classic" style={{ backgroundColor: '#f1f5f9' }} value={originalReceipt.receiptNumber} readOnly disabled />
              </div>
            </div>

            {/* READ-ONLY: Date & Time */}
            <div className="auth-input-group">
              <label className="form-label-elite" style={{ color: 'var(--elite-text-secondary)' }}>Date & Time</label>
              <div className="auth-input-wrapper disabled-wrapper" style={{ opacity: 0.8 }}>
                <CalendarIcon className="auth-input-icon" style={{ opacity: 0.6 }} />
                <input type="text" className="elite-input-classic" style={{ backgroundColor: '#f1f5f9' }} value={formattedDateString} readOnly disabled />
              </div>
            </div>

            {/* READ-ONLY: Payer */}
            <div className="auth-input-group">
              <label className="form-label-elite" style={{ color: 'var(--elite-text-secondary)' }}>Payer (Client Name)</label>
              <div className="auth-input-wrapper disabled-wrapper" style={{ opacity: 0.8 }}>
                <UserIcon className="auth-input-icon" style={{ opacity: 0.6 }} />
                <input type="text" className="elite-input-classic" style={{ backgroundColor: '#f1f5f9' }} value={payerName} readOnly disabled />
              </div>
            </div>

            {/* READ-ONLY: Receiver */}
            <div className="auth-input-group">
              <label className="form-label-elite" style={{ color: 'var(--elite-text-secondary)' }}>Receiver (Company Name)</label>
              <div className="auth-input-wrapper disabled-wrapper" style={{ opacity: 0.8 }}>
                <CompanyIcon className="auth-input-icon" style={{ opacity: 0.6 }} />
                <input type="text" className="elite-input-classic" style={{ backgroundColor: '#f1f5f9' }} value={receiverName} readOnly disabled />
              </div>
            </div>

            {/* EDITABLE: Payment Mode */}
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

            {/* EDITABLE: Ledger Account */}
            <div className="auth-input-group">
              <label className="form-label-elite">Ledger <span style={{ color: 'var(--error)' }}>*</span></label>
              <div className="auth-input-wrapper">
                <BriefcaseIcon className="auth-input-icon" />
                <EliteSelect
                  options={ledgerOptions}
                  value={formData.ledgerId}
                  onChange={(val) => setFormData({ ...formData, ledgerId: val })}
                  placeholder="Choose Ledger"
                />
              </div>
            </div>

            {/* EDITABLE: Bank Account (conditional) */}
            {formData.paymentMode !== 'Cash' && (
              <div className="auth-input-group">
                <label className="form-label-elite">Bank Account <span style={{ color: 'var(--error)' }}>*</span></label>
                <div className="auth-input-wrapper">
                  <BankIcon className="auth-input-icon" />
                  <EliteSelect
                    options={bankOptions}
                    value={formData.bankId}
                    onChange={(val) => setFormData({ ...formData, bankId: val })}
                    placeholder="Choose Bank"
                  />
                </div>
              </div>
            )}

            {/* READ-ONLY: Amount */}
            <div className="auth-input-group">
              <label className="form-label-elite" style={{ color: 'var(--elite-text-secondary)' }}>Amount</label>
              <div className="auth-input-wrapper disabled-wrapper" style={{ opacity: 0.8 }}>
                <RupeeIcon className="auth-input-icon" style={{ opacity: 0.7 }} />
                <input type="text" className="elite-input-classic" style={{ backgroundColor: '#f1f5f9', fontWeight: 600 }}
                  value={originalReceipt.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} readOnly disabled />
              </div>
            </div>
          </div>

          {/* EDITABLE: Payment Details */}
          <div className="auth-input-group elite-full-width" style={{ marginTop: '24px' }}>
            <label className="form-label-elite">Payment Details</label>
            <div className="auth-input-wrapper">
              <FileIcon className="auth-input-icon" />
              <input type="text" name="paymentDetails" className="elite-input-classic"
                placeholder="Ref No / Cheque No / Notes..." value={formData.paymentDetails} onChange={handleInputChange} />
            </div>
          </div>

          {/* EDITABLE: Narration */}
          <div className="auth-input-group elite-full-width" style={{ marginTop: '24px' }}>
            <label className="form-label-elite">Narration</label>
            <div className="auth-input-wrapper">
              <textarea name="narration" className="elite-textarea-classic"
                placeholder="Transaction details..." value={formData.narration} onChange={handleInputChange} />
            </div>
          </div>

          {/* READ-ONLY: Received By */}
          <div className="auth-input-group elite-full-width" style={{ marginTop: '24px' }}>
            <label className="form-label-elite" style={{ color: 'var(--elite-text-secondary)' }}>Received By</label>
            <div className="auth-input-wrapper disabled-wrapper" style={{ opacity: 0.8 }}>
              <UserIcon className="auth-input-icon" style={{ opacity: 0.5 }} />
              <input type="text" value={originalReceipt.receivedBy?.name || 'admin'} readOnly disabled className="elite-input-classic" style={{ backgroundColor: '#f1f5f9' }} />
            </div>
          </div>

          {error && <p style={{ color: 'var(--error)', marginTop: '24px', fontWeight: 600 }}>{error}</p>}

          <div className="entry-form-footer" style={{ marginTop: '32px' }}>
            <button type="submit" className="btn-elite-primary" disabled={updating || loading}>
              {updating ? 'Updating...' : 'Update Receipt'}
            </button>
            <button type="button" className="btn-elite-outline" onClick={() => navigate('/accounting/receipts')}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default ReceiptEdit;
