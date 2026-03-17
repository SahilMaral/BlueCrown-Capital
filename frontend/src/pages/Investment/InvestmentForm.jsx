import React, { useState } from 'react';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import UserIcon from '../../components/icons/UserIcon';
import ClockIcon from '../../components/icons/ClockIcon';
import CompanyIcon from '../../components/icons/CompanyIcon';
import TrendingUpIcon from '../../components/icons/TrendingUpIcon';
import RupeeIcon from '../../components/icons/RupeeIcon';
import CalendarIcon from '../../components/icons/CalendarIcon';
import PlusCircleIcon from '../../components/icons/PlusCircleIcon';


const InvestmentForm = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    lenderCompany: '',
    principalAmount: '',
    tenureMonths: '',
    roiMonthly: '',
    dateOfPayment: '2025-04-02',
    repaymentSchedule: 'Principal + Interest',
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/investments`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Investment established successfully.' });
      setFormData({
        clientName: '',
        lenderCompany: '',
        principalAmount: '',
        tenureMonths: '',
        roiMonthly: '',
        dateOfPayment: '2025-04-02',
        repaymentSchedule: 'Principal + Interest',
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to establish investment.' });
    }
  };

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
          <div className={`auth-error ${message.type === 'success' ? 'success' : ''}`} style={{ marginBottom: '24px', background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', borderColor: message.type === 'success' ? '#bbf7d0' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#b91c1c' }}>
            {message.text}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-grid-elite">
            <div className="auth-input-group">
              <label className="form-label-elite">Client Name</label>
              <div className="auth-input-wrapper">
                {loading ? (
                  <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
                ) : (
                  <>
                    <UserIcon className="auth-input-icon" />
                    <input
                      type="text"
                      placeholder="Client Name"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      required
                    />
                  </>
                )}
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Tenure (in months)</label>
              <div className="auth-input-wrapper">
                {loading ? (
                  <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
                ) : (
                  <>
                    <ClockIcon className="auth-input-icon" />
                    <input
                      type="number"
                      placeholder="24"
                      value={formData.tenureMonths}
                      onChange={(e) => setFormData({ ...formData, tenureMonths: e.target.value })}
                      required
                    />
                  </>
                )}
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Lender Company</label>
              <div className="auth-input-wrapper">
                {loading ? (
                  <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
                ) : (
                  <>
                    <CompanyIcon className="auth-input-icon" />
                    <input
                      type="text"
                      placeholder="Blue Crown Capital"
                      value={formData.lenderCompany}
                      onChange={(e) => setFormData({ ...formData, lenderCompany: e.target.value })}
                      required
                    />
                  </>
                )}
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Rate of Interest (per month)</label>
              <div className="auth-input-wrapper">
                {loading ? (
                  <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
                ) : (
                  <>
                    <TrendingUpIcon className="auth-input-icon" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="10%"
                      value={formData.roiMonthly}
                      onChange={(e) => setFormData({ ...formData, roiMonthly: e.target.value })}
                      required
                    />
                  </>
                )}
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Principal Amount</label>
              <div className="auth-input-wrapper">
                {loading ? (
                  <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
                ) : (
                  <>
                    <RupeeIcon className="auth-input-icon" />
                    <input
                      type="number"
                      placeholder="₹8,00,000"
                      value={formData.principalAmount}
                      onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                      required
                    />
                  </>
                )}
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Interest Type</label>
              <div className="auth-input-wrapper">
                {loading ? (
                  <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
                ) : (
                  <>
                    <PlusCircleIcon className="auth-input-icon" />
                    <input type="text" value="Flat" disabled />
                  </>
                )}
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Date of Payment every month</label>
              <div className="auth-input-wrapper">
                {loading ? (
                  <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
                ) : (
                  <>
                    <CalendarIcon className="auth-input-icon" />
                    <input
                      type="date"
                      value={formData.dateOfPayment}
                      onChange={(e) => setFormData({ ...formData, dateOfPayment: e.target.value })}
                      required
                    />
                  </>
                )}
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Repayment Schedule</label>
              <div className="elite-radio-group">
                {loading ? (
                  <div className="skeleton skeleton-text" style={{ width: '80%', height: '20px' }}></div>
                ) : (
                  <>
                    <label className="elite-radio-label">
                      <input
                        type="radio"
                        name="schedule"
                        value="Only interest"
                        checked={formData.repaymentSchedule === 'Only interest'}
                        onChange={(e) => setFormData({ ...formData, repaymentSchedule: e.target.value })}
                      /> Only interest
                    </label>
                    <label className="elite-radio-label">
                      <input
                        type="radio"
                        name="schedule"
                        value="Principal + Interest"
                        checked={formData.repaymentSchedule === 'Principal + Interest'}
                        onChange={(e) => setFormData({ ...formData, repaymentSchedule: e.target.value })}
                      /> Principal + Interest
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            {loading ? (
              <>
                <div className="skeleton skeleton-text" style={{ width: '180px', height: '48px', borderRadius: '12px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '120px', height: '48px', borderRadius: '12px' }}></div>
              </>
            ) : (
              <>
                <button type="submit" className="btn-elite">Establish Account</button>
                <button type="button" className="btn-elite-ghost btn-elite-danger" onClick={() => window.history.back()}>Discard</button>
              </>
            )}
          </div>
        </form>
      </section>
    </main>
  );
};

export default InvestmentForm;
