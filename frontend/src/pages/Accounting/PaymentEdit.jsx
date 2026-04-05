import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import CompanyIcon from '../../components/icons/CompanyIcon';
import UserIcon from '../../components/icons/UserIcon';
import RupeeIcon from '../../components/icons/RupeeIcon';
import WalletIcon from '../../components/icons/WalletIcon';
import BankIcon from '../../components/icons/BankIcon';
import CalendarIcon from '../../components/icons/CalendarIcon';
import LedgerIcon from '../../components/icons/LedgerIcon';
import FileIcon from '../../components/icons/FileIcon';
import EliteSelect from '../../components/common/EliteSelect';
import EliteStatusModal from '../../components/common/EliteStatusModal';
import './EntryForm.css';

const PAYMENT_MODES = [
  { value: 'Cash',   label: '💵  Cash' },
  { value: 'Bank',   label: '🏦  Bank Transfer' },
  { value: 'Cheque', label: '📄  Cheque' },
  { value: 'Online', label: '📱  Online / UPI' },
];

const PaymentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [masters, setMasters] = useState({ ledgers: [], banks: [] });
  const [formData, setFormData] = useState({
    receiverName: '',
    payerName: '',
    ledgerId: '',
    bankId: '',
    paymentMode: '',
    paymentDetails: '',
    amount: '',
    dateTime: '',
    narration: '',
    paymentNumber: ''
  });
  const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', type: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [paymentRes, ledgersRes, banksRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/payments/${id}`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/ledgers`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/banks`, config)
        ]);

        const p = paymentRes.data.data;
        setFormData({
          receiverName: p.receiver?.clientName || p.receiver?.companyName || 'Unknown',
          payerName: p.payer?.companyName || 'Unknown',
          ledgerId: p.ledger || '',
          bankId: p.bank || '',
          paymentMode: p.paymentMode || 'Cash',
          paymentDetails: p.paymentDetails || '',
          amount: p.amount || 0,
          dateTime: p.dateTime ? new Date(p.dateTime).toISOString().slice(0, 16) : '',
          narration: p.narration || '',
          paymentNumber: p.paymentNumber || ''
        });

        setMasters({
          ledgers: ledgersRes.data.data,
          banks: banksRes.data.data
        });
      } catch (err) {
        console.error('Error fetching payment data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ledger: formData.ledgerId,
        paymentMode: formData.paymentMode,
        bank: formData.paymentMode === 'Cash' ? undefined : formData.bankId,
        paymentDetails: formData.paymentDetails,
        narration: formData.narration
      };

      await axios.patch(`${import.meta.env.VITE_API_URL}/payments/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStatusModal({
        show: true,
        title: 'Payment Updated',
        message: 'The payment details and associated account balances have been successfully updated.',
        type: 'success'
      });
    } catch (err) {
      setStatusModal({
        show: true,
        title: 'Update Failed',
        message: err.response?.data?.message || 'Error updating payment',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const ledgerOptions = masters.ledgers.map(l => ({ value: l._id, label: l.name }));
  const bankOptions   = masters.banks.map(b => ({ value: b._id, label: `${b.bankName} — ${b.accountNumber}` }));
  const selectedBank  = masters.banks.find(b => b._id === formData.bankId);

  if (loading) return <div className="main-content"><p>Loading payment data...</p></div>;

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Edit Payment Voucher</h1>
          <p>Update metadata or payment mode for voucher #{formData.paymentNumber}</p>
        </div>
      </header>

      <section className="content-section entry-form-container">
        <form className="elite-form-padding" onSubmit={handleSubmit}>
          <div className="form-grid-elite">
            {/* Read Only Fields */}
            <div className="auth-input-group">
              <label className="form-label-elite">Date & Time (Read Only)</label>
              <div className="auth-input-wrapper readonly">
                <CalendarIcon className="auth-input-icon" />
                <input type="datetime-local" className="elite-input-classic" value={formData.dateTime} readOnly />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Payer (Company)</label>
              <div className="auth-input-wrapper readonly">
                <CompanyIcon className="auth-input-icon" />
                <input type="text" className="elite-input-classic" value={formData.payerName} readOnly />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Receiver (Client/Company)</label>
              <div className="auth-input-wrapper readonly">
                <UserIcon className="auth-input-icon" />
                <input type="text" className="elite-input-classic" value={formData.receiverName} readOnly />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Amount (₹)</label>
              <div className="auth-input-wrapper readonly">
                <RupeeIcon className="auth-input-icon" />
                <input type="text" className="elite-input-classic" value={formData.amount} readOnly />
              </div>
            </div>

            {/* Editable Fields */}
            <div className="auth-input-group">
              <label className="form-label-elite">Ledger Account <span className="text-danger">*</span></label>
              <div className="auth-input-wrapper">
                <LedgerIcon className="auth-input-icon" />
                <EliteSelect
                  options={ledgerOptions}
                  value={formData.ledgerId}
                  onChange={(val) => setFormData({ ...formData, ledgerId: val })}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Payment Mode <span className="text-danger">*</span></label>
              <div className="auth-input-wrapper">
                <WalletIcon className="auth-input-icon" />
                <EliteSelect
                  options={PAYMENT_MODES}
                  value={formData.paymentMode}
                  onChange={(val) => setFormData({ ...formData, paymentMode: val })}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Payment Details</label>
              <div className="auth-input-wrapper">
                <FileIcon className="auth-input-icon" />
                <input type="text" name="paymentDetails" className="elite-input-classic"
                  value={formData.paymentDetails} onChange={handleInputChange} />
              </div>
            </div>

            {formData.paymentMode !== 'Cash' && (
              <div className="auth-input-group">
                <label className="form-label-elite">Bank Account <span className="text-danger">*</span></label>
                <div className="auth-input-wrapper">
                  <BankIcon className="auth-input-icon" />
                  <EliteSelect
                    options={bankOptions}
                    value={formData.bankId}
                    onChange={(val) => setFormData({ ...formData, bankId: val })}
                  />
                </div>
                {selectedBank && (
                  <div className="bank-details-elite">
                    <span className="detail-label">IFSC: {selectedBank.ifscCode}</span>
                    <span className="detail-value balance-pill">Balance: ₹{selectedBank.balance?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="auth-input-group elite-full-width" style={{ marginTop: '24px' }}>
            <label className="form-label-elite">Narration / Remarks</label>
            <div className="auth-input-wrapper">
              <FileIcon className="auth-input-icon" />
              <textarea name="narration" className="elite-textarea-classic"
                value={formData.narration} onChange={handleInputChange} />
            </div>
          </div>

          <div className="entry-form-footer" style={{ marginTop: '32px' }}>
            <button type="submit" className="btn-elite-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Update Payment'}
            </button>
            <button type="button" className="btn-elite-outline" onClick={() => navigate('/accounting/payments')}>
              Cancel
            </button>
          </div>
        </form>
      </section>

      <EliteStatusModal 
        isOpen={statusModal.show}
        onClose={() => {
          setStatusModal({ ...statusModal, show: false });
          if (statusModal.type === 'success') navigate('/accounting/payments');
        }}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </main>
  );
};

export default PaymentEdit;
