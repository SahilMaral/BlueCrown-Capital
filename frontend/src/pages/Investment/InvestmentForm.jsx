import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../Dashboard/Dashboard.css';
import '../../styles/EliteForms.css';
import UserIcon from '../../components/icons/UserIcon';
import ClockIcon from '../../components/icons/ClockIcon';
import CompanyIcon from '../../components/icons/CompanyIcon';
import TrendingUpIcon from '../../components/icons/TrendingUpIcon';
import RupeeIcon from '../../components/icons/RupeeIcon';
import CalendarIcon from '../../components/icons/CalendarIcon';
import PlusCircleIcon from '../../components/icons/PlusCircleIcon';
import Skeleton from '../../components/common/Skeleton';
import WalletIcon from '../../components/icons/WalletIcon';
import AnalyticsIcon from '../../components/icons/AnalyticsIcon';
import EliteSelect from '../../components/common/EliteSelect';
import QuickMasterModal from '../../components/common/QuickMasterModal';
import BankIcon from '../../components/icons/BankIcon';
import MapPinIcon from '../../components/icons/MapPinIcon';
import FileIcon from '../../components/icons/FileIcon';

const InvestmentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    clientId: '',
    lenderCompanyId: '',
    paymentMode: 'Bank Transfer',
    bankId: '',
    principalAmount: '',
    tenure: '',
    rateOfInterest: '',
    interestType: 'Flat',
    investmentType: '',
    isInterestOrPrincipal: 'Principal + Interest',
    dateOfPayment: '',
    investmentReason: '',
    emiAmount: 0,
    balanceInterestTotal: 0,
    mortgageDetails: '',
    guranterDetails: '',
    officialAddress: '',
    installments: []
  });

  const [clients, setClients] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [modalType, setModalType] = useState(null); // 'Client', 'Company', 'Bank'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, companiesRes] = await Promise.all([
          api.get('/clients'),
          api.get('/companies')
        ]);
        setClients(clientsRes.data);
        setCompanies(companiesRes.data);
      } catch (err) {
        console.error('Error fetching initial data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchBanks = async () => {
      if (formData.lenderCompanyId) {
        try {
          const res = await api.get(`/banks?companyId=${formData.lenderCompanyId}`);
          setBanks(res.data);
        } catch (err) {
          console.error('Error fetching banks', err);
        }
      } else {
        setBanks([]);
      }
    };
    fetchBanks();
  }, [formData.lenderCompanyId]);

  // Recalculate EMI and Installments whenever key fields change
  useEffect(() => {
    calculateEMI();
  }, [formData.principalAmount, formData.tenure, formData.rateOfInterest, formData.isInterestOrPrincipal, formData.dateOfPayment]);

  const calculateEMI = () => {
    const principal = parseFloat(formData.principalAmount);
    const annualRate = parseFloat(formData.rateOfInterest);
    const tenureMonths = parseInt(formData.tenure);
    const startDate = formData.dateOfPayment ? new Date(formData.dateOfPayment) : null;

    if (principal && annualRate && tenureMonths && tenureMonths > 0) {
      let emi = 0;
      let totalInterest = 0;

      if (formData.isInterestOrPrincipal === 'Interest Only') {
        const monthlyInterest = (principal * annualRate) / (12 * 100);
        emi = monthlyInterest;
        totalInterest = monthlyInterest * tenureMonths;
      } else {
        totalInterest = (principal * annualRate * tenureMonths) / (12 * 100);
        emi = (principal + totalInterest) / tenureMonths;
      }

      const installments = [];
      if (startDate) {
        let monthlyInterest = formData.isInterestOrPrincipal === 'Interest Only' ? emi : totalInterest / tenureMonths;
        let monthlyPrincipal = formData.isInterestOrPrincipal === 'Interest Only' ? 0 : principal / tenureMonths;
        
        let remainingPrincipal = principal;
        let remainingInterest = totalInterest;

        for (let i = 1; i <= tenureMonths; i++) {
          const instDate = new Date(startDate);
          instDate.setMonth(startDate.getMonth() + (i - 1));

          remainingPrincipal = Math.max(0, remainingPrincipal - monthlyPrincipal);
          remainingInterest = Math.max(0, remainingInterest - monthlyInterest);

          installments.push({
            installment_number: i,
            date_of_installment: instDate.toISOString().split('T')[0],
            emi_amount: emi.toFixed(2),
            principal_emi: monthlyPrincipal.toFixed(2),
            interest_emi: monthlyInterest.toFixed(2),
            balance_principal: remainingPrincipal.toFixed(2),
            balance_interest_total: remainingInterest.toFixed(2),
            is_paid: false,
            receipt_id: null
          });
        }
      }

      setFormData(prev => ({
        ...prev,
        emiAmount: emi.toFixed(2),
        balanceInterestTotal: totalInterest.toFixed(2),
        installments: installments
      }));
    }
  };

  const getFinancialYear = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth();
    if (month >= 3) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  };

  const [dateError, setDateError] = useState(null);

  // Real-time Date Validation
  useEffect(() => {
    if (formData.date && formData.dateOfPayment) {
      const invDate = new Date(formData.date);
      const payDate = new Date(formData.dateOfPayment);
      if (payDate <= invDate) {
        setDateError("First payment date must be after the investment date.");
      } else {
        setDateError(null);
      }
    }
  }, [formData.date, formData.dateOfPayment]);

  const handleQuickAddSuccess = (newData) => {
    if (modalType === 'Client') {
      setClients(prev => [...prev, newData]);
      setFormData(prev => ({ ...prev, clientId: newData._id }));
    } else if (modalType === 'Company') {
      setCompanies(prev => [...prev, newData]);
      setFormData(prev => ({ ...prev, lenderCompanyId: newData._id }));
    } else if (modalType === 'Bank') {
      setBanks(prev => [...prev, newData]);
      setFormData(prev => ({ ...prev, bankId: newData._id }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dateError) return;
    
    setSubmitting(true);
    setMessage(null);

    try {
      const entityId = formData.paymentMode === 'Cash' ? formData.lenderCompanyId : formData.bankId;
      const accountModel = formData.paymentMode === 'Cash' ? 'Company' : 'Bank';
      
      // 1. Passbook Entry Date Validation (as per project reference)
      try {
        const dateCheck = await api.post('/payments/validate-entry-date', {
          dateTime: formData.date,
          paymentMode: formData.paymentMode,
          entityId: entityId,
          counterType: "investment"
        });
        if (dateCheck.data && !dateCheck.data.isValid) {
          setMessage({ type: 'error', text: dateCheck.data.message });
          setSubmitting(false);
          return;
        }
      } catch (err) {
        // Fallback if endpoint doesn't exist yet, but logging it
        console.warn('Date validation endpoint failed or missing:', err);
      }

      // 2. Balance Check
      if (entityId) {
        const balanceCheck = await api.post('/payments/check-balance', {
          entityId,
          accountModel,
          amount: formData.principalAmount,
          financialYear: getFinancialYear(formData.date),
          date: formData.date
        });

        if (!balanceCheck.data.isSufficient) {
          setMessage({ type: 'error', text: balanceCheck.data.message });
          setSubmitting(false);
          return;
        }
      }

      // 3. Submit Investment
      await api.post('/investments', {
        ...formData,
        financialYear: getFinancialYear(formData.date)
      });
      setMessage({ type: 'success', text: 'Investment established successfully.' });
      setTimeout(() => navigate('/investment/view'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err || 'Failed to establish investment.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="main-content">
        <header className="dashboard-header">
          <Skeleton height="80px" />
        </header>
        <section className="content-section">
          <div className="form-grid-elite">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} height="60px" borderRadius="12px" />)}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Investment Configuration</h1>
          <p>Initialize a new elite capital investment portfolio.</p>
        </div>
      </header>

      <section className="content-section">
        <div className="section-header">
          <h2>New Investment Entry</h2>
        </div>

        {message && (
          <div className={`auth-error ${message.type === 'success' ? 'success' : ''}`} style={{ marginBottom: '24px' }}>
            {message.text}
          </div>
        )}

        <form className="elite-form" onSubmit={handleSubmit}>
          <div className="form-grid-elite">
            {/* Row 1: Date & Client */}
            <div className="auth-input-group">
              <label>INVESTMENT DATE <span className="required-mark">*</span></label>
              <div className="auth-input-wrapper">
                <CalendarIcon className="auth-input-icon" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group has-quick-add">
              <label>SELECT CLIENT <span className="required-mark">*</span></label>
              <div className="auth-input-wrapper">
                <UserIcon className="auth-input-icon" />
                <EliteSelect
                  options={clients.map(c => ({ value: c._id, label: c.clientName }))}
                  value={formData.clientId}
                  onChange={(val) => setFormData({ ...formData, clientId: val })}
                  placeholder="Choose Client"
                />
                <button type="button" className="quick-add-btn" onClick={() => setModalType('Client')}>
                  <PlusCircleIcon size={16} />
                </button>
              </div>
            </div>

            {/* Row 2: Lender & Payment Mode */}
            <div className="auth-input-group has-quick-add">
              <label>SELECT COMPANY <span className="required-mark">*</span></label>
              <div className="auth-input-wrapper">
                <CompanyIcon className="auth-input-icon" />
                <EliteSelect
                  options={companies.map(c => ({ value: c._id, label: c.companyName }))}
                  value={formData.lenderCompanyId}
                  onChange={(val) => setFormData({ ...formData, lenderCompanyId: val })}
                  placeholder="Choose Company"
                />
                <button type="button" className="quick-add-btn" onClick={() => setModalType('Company')}>
                  <PlusCircleIcon size={16} />
                </button>
              </div>
            </div>

            <div className="auth-input-group">
              <label>Payment Mode <span className="required-mark">*</span></label>
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

            {/* Row 3: Bank (Optional) & Principal */}
            <div className={`auth-input-group ${formData.paymentMode !== 'Cash' ? 'has-quick-add' : ''}`}>
              <label>SELECT BANK {formData.paymentMode !== 'Cash' && <span className="required-mark">*</span>}</label>
              <div className={`auth-input-wrapper ${formData.paymentMode === 'Cash' ? 'disabled-wrapper' : ''}`} style={formData.paymentMode === 'Cash' ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                <BankIcon className="auth-input-icon" />
                <EliteSelect
                  options={banks.map(b => ({ value: b._id, label: `${b.bankName} (${b.accountNumber})` }))}
                  value={formData.bankId}
                  onChange={(val) => setFormData({ ...formData, bankId: val })}
                  placeholder="Choose Bank"
                  isDisabled={formData.paymentMode === 'Cash'}
                />
                {formData.paymentMode !== 'Cash' && (
                  <button type="button" className="quick-add-btn" onClick={() => setModalType('Bank')}>
                    <PlusCircleIcon size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="auth-input-group">
              <label>PRINCIPAL AMOUNT <span className="required-mark">*</span></label>
              <div className="auth-input-wrapper">
                <RupeeIcon className="auth-input-icon" />
                <input
                  type="number"
                  placeholder="8,00,000"
                  value={formData.principalAmount}
                  onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Row 4: Tenure & ROI */}
            <div className="auth-input-group">
              <label>TENURE (MONTHS) <span className="required-mark">*</span></label>
              <div className="auth-input-wrapper">
                <ClockIcon className="auth-input-icon" />
                <input
                  type="number"
                  placeholder="24"
                  value={formData.tenure}
                  onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>ROI PER YEAR (%) <span className="required-mark">*</span></label>
              <div className="auth-input-wrapper">
                <TrendingUpIcon className="auth-input-icon" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="12%"
                  value={formData.rateOfInterest}
                  onChange={(e) => setFormData({ ...formData, rateOfInterest: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Row 5: Investment Type & Schedule */}
            <div className="auth-input-group">
              <label>INVESTMENT TYPE <span className="required-mark">*</span></label>
              <div className="auth-input-wrapper">
                <PlusCircleIcon className="auth-input-icon" />
                <EliteSelect
                  options={[
                    { value: 'Secured', label: '🛡️  Secured' },
                    { value: 'Unsecured', label: '🔓  Unsecured' }
                  ]}
                  value={formData.investmentType}
                  onChange={(val) => setFormData({ ...formData, investmentType: val })}
                  placeholder="Select Type"
                  isSearchable={false}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>REPAYMENT SCHEDULE</label>
              <div className="elite-radio-group">
                <label className="elite-radio-label">
                  <input
                    type="radio"
                    name="schedule"
                    value="Interest Only"
                    checked={formData.isInterestOrPrincipal === 'Interest Only'}
                    onChange={(e) => setFormData({ ...formData, isInterestOrPrincipal: e.target.value })}
                  /> INTEREST ONLY
                </label>
                <label className="elite-radio-label">
                  <input
                    type="radio"
                    name="schedule"
                    value="Principal + Interest"
                    checked={formData.isInterestOrPrincipal === 'Principal + Interest'}
                    onChange={(e) => setFormData({ ...formData, isInterestOrPrincipal: e.target.value })}
                  /> PRINCIPAL + INTEREST
                </label>
              </div>
            </div>

            {/* Row 6: First Payment Date & Reason */}
            <div className="auth-input-group">
              <label>FIRST PAYMENT DATE <span className="required-mark">*</span></label>
              <div className="auth-input-wrapper">
                <CalendarIcon className="auth-input-icon" />
                <input
                  type="date"
                  className={dateError ? 'is-invalid' : ''}
                  value={formData.dateOfPayment}
                  onChange={(e) => setFormData({ ...formData, dateOfPayment: e.target.value })}
                  required
                />
              </div>
              {dateError && <span className="error-text-elite">{dateError}</span>}
            </div>

            <div className="auth-input-group">
              <label>INVESTMENT REASON</label>
              <div className="auth-input-wrapper">
                <PlusCircleIcon className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Business Expansion..."
                  value={formData.investmentReason}
                  onChange={(e) => setFormData({ ...formData, investmentReason: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Calculations Summary - Premium Cards */}
          <div className="calculation-summary-elite">
             <div className="summary-item-elite theme-blue">
                <div className="summary-item-icon">
                   <ClockIcon />
                </div>
                <div className="summary-item-details">
                   <span className="summary-item-label">Monthly EMI</span>
                   <span className="summary-item-value">₹{parseFloat(formData.emiAmount || 0).toLocaleString()}</span>
                </div>
             </div>
             
             <div className="summary-item-elite theme-green">
                <div className="summary-item-icon">
                   <TrendingUpIcon />
                </div>
                <div className="summary-item-details">
                   <span className="summary-item-label">Total Interest</span>
                   <span className="summary-item-value">₹{parseFloat(formData.balanceInterestTotal || 0).toLocaleString()}</span>
                </div>
             </div>

             <div className="summary-item-elite theme-indigo">
                <div className="summary-item-icon">
                   <AnalyticsIcon />
                </div>
                <div className="summary-item-details">
                   <span className="summary-item-label">Total Repayment</span>
                   <span className="summary-item-value">₹{(parseFloat(formData.principalAmount || 0) + parseFloat(formData.balanceInterestTotal || 0)).toLocaleString()}</span>
                </div>
             </div>
          </div>

          {/* Details Section */}
          <div className="form-grid-elite">
            <div className="auth-input-group">
              <label>MORTGAGE DETAILS</label>
              <div className="auth-input-wrapper">
                <FileIcon className="auth-input-icon textarea-icon" />
                <textarea
                  placeholder="Property documents, assets..."
                  value={formData.mortgageDetails}
                  onChange={(e) => setFormData({ ...formData, mortgageDetails: e.target.value })}
                />
              </div>
            </div>
            <div className="auth-input-group">
              <label>GUARANTOR DETAILS</label>
              <div className="auth-input-wrapper">
                <UserIcon className="auth-input-icon textarea-icon" />
                <textarea
                  placeholder="Name, Contact, Address of guarantor..."
                  value={formData.guranterDetails}
                  onChange={(e) => setFormData({ ...formData, guranterDetails: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="auth-input-group" style={{ marginTop: '24px' }}>
            <label>OFFICIAL ADDRESS</label>
            <div className="auth-input-wrapper">
              <MapPinIcon className="auth-input-icon textarea-icon" />
              <textarea
                placeholder="Business site address..."
                value={formData.officialAddress}
                onChange={(e) => setFormData({ ...formData, officialAddress: e.target.value })}
              />
            </div>
          </div>

          <div className="elite-form-footer">
            <button type="submit" className="btn-elite btn-primary" disabled={submitting}>
              {submitting ? 'Establishing...' : 'Establish Account'}
            </button>
            <button type="button" className="btn-elite-ghost btn-secondary btn-elite-danger" onClick={() => navigate(-1)}>Discard</button>
          </div>
        </form>
      </section>

      {/* Quick Add Modal */}
      <QuickMasterModal
        type={modalType}
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        onSuccess={handleQuickAddSuccess}
        companyId={modalType === 'Bank' ? formData.lenderCompanyId : undefined}
      />
    </main>
  );
};

export default InvestmentForm;

