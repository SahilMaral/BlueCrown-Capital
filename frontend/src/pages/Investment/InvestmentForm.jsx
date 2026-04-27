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

      if (formData.isInterestOrPrincipal === 'Only interest') {
        const monthlyInterest = (principal * annualRate) / (12 * 100);
        emi = monthlyInterest;
        totalInterest = monthlyInterest * tenureMonths;
      } else {
        totalInterest = (principal * annualRate * tenureMonths) / (12 * 100);
        emi = (principal + totalInterest) / tenureMonths;
      }

      const installments = [];
      if (startDate) {
        let monthlyInterest = formData.isInterestOrPrincipal === 'Only interest' ? emi : totalInterest / tenureMonths;
        let monthlyPrincipal = formData.isInterestOrPrincipal === 'Only interest' ? 0 : principal / tenureMonths;
        
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
            balance_interest_total: remainingInterest.toFixed(2)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      // 1. Balance Check
      const entityId = formData.paymentMode === 'Cash' ? formData.lenderCompanyId : formData.bankId;
      const accountModel = formData.paymentMode === 'Cash' ? 'Company' : 'Bank';
      
      if (entityId) {
        const balanceCheck = await api.post('/payments/check-balance', {
          entityId,
          accountModel,
          amount: formData.principalAmount
        });

        if (!balanceCheck.data.isSufficient) {
          setMessage({ type: 'error', text: balanceCheck.data.message });
          setSubmitting(false);
          return;
        }
      }

      // 2. Submit Investment
      await api.post('/investments', formData);
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
              <label>Investment Date</label>
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

            <div className="auth-input-group">
              <label>Client (Investor)</label>
              <div className="auth-input-wrapper">
                <UserIcon className="auth-input-icon" />
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2: Lender & Payment Mode */}
            <div className="auth-input-group">
              <label>Lender Company</label>
              <div className="auth-input-wrapper">
                <CompanyIcon className="auth-input-icon" />
                <select
                  value={formData.lenderCompanyId}
                  onChange={(e) => setFormData({ ...formData, lenderCompanyId: e.target.value })}
                  required
                >
                  <option value="">Select Company</option>
                  {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
                </select>
              </div>
            </div>

            <div className="auth-input-group">
              <label>Payment Mode</label>
              <div className="auth-input-wrapper">
                <WalletIcon className="auth-input-icon" />
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  required
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Online">Online</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            {/* Row 3: Bank (Optional) & Principal */}
            <div className="auth-input-group">
              <label>Lender Bank</label>
              <div className="auth-input-wrapper">
                <CompanyIcon className="auth-input-icon" />
                <select
                  value={formData.bankId}
                  onChange={(e) => setFormData({ ...formData, bankId: e.target.value })}
                  disabled={formData.paymentMode === 'Cash'}
                  required={formData.paymentMode !== 'Cash'}
                >
                  <option value="">Select Bank</option>
                  {banks.map(b => <option key={b._id} value={b._id}>{b.bankName} ({b.accountNo})</option>)}
                </select>
              </div>
            </div>

            <div className="auth-input-group">
              <label>Principal Amount</label>
              <div className="auth-input-wrapper">
                <RupeeIcon className="auth-input-icon" />
                <input
                  type="number"
                  placeholder="₹8,00,000"
                  value={formData.principalAmount}
                  onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Row 4: Tenure & ROI */}
            <div className="auth-input-group">
              <label>Tenure (Months)</label>
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
              <label>ROI per year (%)</label>
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
              <label>Investment Type</label>
              <div className="auth-input-wrapper">
                <PlusCircleIcon className="auth-input-icon" />
                <select
                  value={formData.investmentType}
                  onChange={(e) => setFormData({ ...formData, investmentType: e.target.value })}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Secured">Secured</option>
                  <option value="Unsecured">Unsecured</option>
                </select>
              </div>
            </div>

            <div className="auth-input-group">
              <label>Repayment Schedule</label>
              <div className="elite-radio-group">
                <label className="elite-radio-label">
                  <input
                    type="radio"
                    name="schedule"
                    value="Only interest"
                    checked={formData.isInterestOrPrincipal === 'Only interest'}
                    onChange={(e) => setFormData({ ...formData, isInterestOrPrincipal: e.target.value })}
                  /> Only interest
                </label>
                <label className="elite-radio-label">
                  <input
                    type="radio"
                    name="schedule"
                    value="Principal + Interest"
                    checked={formData.isInterestOrPrincipal === 'Principal + Interest'}
                    onChange={(e) => setFormData({ ...formData, isInterestOrPrincipal: e.target.value })}
                  /> Principal + Interest
                </label>
              </div>
            </div>

            {/* Row 6: First Payment Date & Reason */}
            <div className="auth-input-group">
              <label>First Payment Date</label>
              <div className="auth-input-wrapper">
                <CalendarIcon className="auth-input-icon" />
                <input
                  type="date"
                  value={formData.dateOfPayment}
                  onChange={(e) => setFormData({ ...formData, dateOfPayment: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Investment Reason</label>
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
              <label>Mortgage Details</label>
              <div className="auth-input-wrapper">
                <textarea
                  placeholder="Property documents, assets..."
                  value={formData.mortgageDetails}
                  onChange={(e) => setFormData({ ...formData, mortgageDetails: e.target.value })}
                />
              </div>
            </div>
            <div className="auth-input-group">
              <label>Guarantor Details</label>
              <div className="auth-input-wrapper">
                <textarea
                  placeholder="Name, Contact, Address of guarantor..."
                  value={formData.guranterDetails}
                  onChange={(e) => setFormData({ ...formData, guranterDetails: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="auth-input-group" style={{ marginBottom: '32px' }}>
            <label>Official Address</label>
            <div className="auth-input-wrapper">
              <textarea
                placeholder="Business site address..."
                value={formData.officialAddress}
                onChange={(e) => setFormData({ ...formData, officialAddress: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button type="submit" className="btn-elite" disabled={submitting}>
              {submitting ? 'Establishing...' : 'Establish Account'}
            </button>
            <button type="button" className="btn-elite-ghost btn-elite-danger" onClick={() => navigate(-1)}>Discard</button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default InvestmentForm;

