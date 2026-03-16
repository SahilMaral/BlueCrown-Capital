import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import ReportSkeleton from '../../components/common/skeletons/ReportSkeleton';

const InvestmentReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchInvestments();
    } else {
      setInvestments([]);
      setSelectedInvestment('');
    }
  }, [selectedCompany]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedCompany(res.data.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching companies', err);
    }
  };

  const fetchInvestments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/investments?lenderCompany=${selectedCompany}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvestments(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedInvestment(res.data.data[0]._id);
      } else {
        setSelectedInvestment('');
      }
    } catch (err) {
      console.error('Error fetching investments', err);
    }
  };

  const fetchReport = async () => {
    if (!selectedInvestment) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/investment-report?companyId=${selectedCompany}&investmentId=${selectedInvestment}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(res.data.data);
    } catch (err) {
      console.error('Error fetching investment report', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Investment Analysis Report</h1>
          <p>Detailed performance and installment tracker for your investments.</p>
        </div>
      </header>

      <section className="content-section content-section-elite">
        <div className="filter-card-elite">
          <div className="filter-grid-elite">
            <div className="input-field-elite">
              <label>Our Company</label>
              <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
              </select>
            </div>
            <div className="input-field-elite">
              <label>Investment No.</label>
              <select 
                value={selectedInvestment} 
                onChange={(e) => setSelectedInvestment(e.target.value)}
                disabled={!selectedCompany}
              >
                <option value="">Select Investment</option>
                {investments.map(i => <option key={i._id} value={i._id}>{i.investmentNumber}</option>)}
              </select>
            </div>
            <div className="filter-actions-elite">
               <button className="btn-elite" onClick={fetchReport} disabled={loading || !selectedInvestment}>
                 Generate Analysis
               </button>
            </div>
          </div>
        </div>

        {loading ? (
          <ReportSkeleton hasSummaryGrid={true} rows={8} />
        ) : report ? (
          <>
            <div className="section-header">
              <h2>Investment Profile</h2>
            </div>
            <div className="filter-card-elite" style={{ background: 'rgba(37, 99, 235, 0.02)', borderStyle: 'dashed' }}>
              <div className="report-profile-grid">
                <div className="particulars-info">
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--elite-text-secondary)' }}>Client Name</span>
                  <span className="main-info">{report.investment.clientId?.clientName}</span>
                </div>
                <div className="particulars-info">
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--elite-text-secondary)' }}>Principal Amount</span>
                  <span className="main-info">₹{report.investment.principalAmount?.toLocaleString()}</span>
                </div>
                <div className="particulars-info">
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--elite-text-secondary)' }}>Interest Rate</span>
                  <span className="main-info">{report.investment.rateOfInterest}% ({report.investment.interestType})</span>
                </div>
                <div className="particulars-info">
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--elite-text-secondary)' }}>Tenure</span>
                  <span className="main-info">{report.investment.tenure} Months</span>
                </div>
                <div className="particulars-info">
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--elite-text-secondary)' }}>Repayment</span>
                  <span className="main-info">{report.investment.isInterestOrPrincipal}</span>
                </div>
                <div className="particulars-info">
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--elite-text-secondary)' }}>EMI Amount</span>
                  <span className="main-info">₹{report.investment.emiAmount?.toLocaleString()}</span>
                </div>
                <div className="particulars-info">
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--elite-text-secondary)' }}>Balance Principal</span>
                  <span className="main-info" style={{ color: 'var(--elite-blue)' }}>₹{report.investment.balancePrincipal?.toLocaleString()}</span>
                </div>
                <div className="particulars-info">
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--elite-text-secondary)' }}>Status</span>
                  <span className={`badge-elite ${report.investment.isForeClosure ? 'payment' : 'receipt'}`}>
                    {report.investment.isForeClosure ? 'Closed' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="section-header">
              <h2>Installment Ledger</h2>
            </div>
            <div className="elite-table-container shadow">
              <table className="elite-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Due Date</th>
                    <th>Receipt #</th>
                    <th className="text-right">Principal EMI</th>
                    <th className="text-right">Interest EMI</th>
                    <th className="text-right">Total EMI</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Handle Initial Principal Outflow */}
                  {report.initialPayment && (
                    <tr className="hoverable" style={{ background: 'rgba(239, 68, 68, 0.02)' }}>
                      <td className="font-bold">0</td>
                      <td>{new Date(report.investment.dateOfPayment).toLocaleDateString()}</td>
                      <td><span className="text-secondary">{report.initialPayment.paymentNumber}</span></td>
                      <td className="text-right danger-text font-bold">₹{report.investment.principalAmount?.toLocaleString()}</td>
                      <td className="text-right">-</td>
                      <td className="text-right danger-text font-bold">₹{report.investment.principalAmount?.toLocaleString()}</td>
                      <td><span className="badge-elite payment">Principal Out</span></td>
                    </tr>
                  )}
                  {report.installments.map((inst, idx) => (
                    <tr key={idx} className="hoverable">
                      <td className="font-bold">{inst.installmentNumber}</td>
                      <td>{new Date(inst.dateOfInstallment).toLocaleDateString()}</td>
                      <td>{inst.receiptId?.receiptNumber || '-'}</td>
                      <td className="text-right">₹{inst.principalEmi?.toLocaleString()}</td>
                      <td className="text-right">₹{inst.interestEmi?.toLocaleString()}</td>
                      <td className="text-right font-bold success-text">₹{inst.emiAmount?.toLocaleString()}</td>
                      <td>
                        <span className={`badge-elite ${inst.isPaid ? 'receipt' : 'payment'}`} style={{ opacity: inst.isPaid ? 1 : 0.5 }}>
                          {inst.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="3" className="text-right">Total Paid:</th>
                    <th className="text-right">₹{report.totals.principalPaid.toLocaleString()}</th>
                    <th className="text-right">₹{report.totals.interestPaid.toLocaleString()}</th>
                    <th className="text-right success-text">₹{report.totals.totalEmiPaid.toLocaleString()}</th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-state-elite">
            <div className="empty-icon">📈</div>
            <h3>Ready to Analyze</h3>
            <p>Select an investment to view its complete financial lifecycle and installment tracking.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default InvestmentReport;
