import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import './Reports.css';
import ReportSkeleton from '../../components/common/skeletons/ReportSkeleton';
import { exportToExcel, formatIndianNumber } from '../../utils/reportUtils';
import ReportEmailModal from '../../components/common/ReportEmailModal';
import { Printer, FileSpreadsheet, Mail } from 'lucide-react';

const PenaltyChargesReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [loans, setLoans] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedLoan, setSelectedLoan] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchLoans();
    }
  }, [selectedCompany]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [compRes, clientRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/companies`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/clients`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCompanies(compRes.data.data);
      setClients(clientRes.data.data);
      if (compRes.data.data.length > 0) setSelectedCompany(compRes.data.data[0]._id);
      if (clientRes.data.data.length > 0) setSelectedClient(clientRes.data.data[0]._id);
    } catch (err) {
      console.error('Error fetching initial data', err);
    }
  };

  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/loans?lenderCompany=${selectedCompany}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(res.data.data);
      if (res.data.data.length > 0) setSelectedLoan(res.data.data[0]._id);
      else setSelectedLoan('');
    } catch (err) {
      console.error('Error fetching loans', err);
    }
  };

  const fetchReport = async () => {
    if (!selectedCompany || !selectedLoan || !selectedClient) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/penalty-charges?companyId=${selectedCompany}&loanId=${selectedLoan}&clientId=${selectedClient}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(res.data.data);
    } catch (err) {
      console.error('Error fetching penalty charges report', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!report) return;
    const headers = ['Date', 'Voucher #', 'Type', 'Mode', 'Narration', 'Amount'];
    const transactions = [...report.receipts, ...report.payments].sort((a,b) => new Date(a.dateTime) - new Date(b.dateTime));
    const data = transactions.map(item => [
      new Date(item.dateTime).toLocaleDateString(),
      item.receiptNumber || item.paymentNumber,
      item.receiptNumber ? 'Receipt' : 'Payment',
      item.paymentMode,
      item.narration,
      item.amount
    ]);
    
    const company = companies.find(c => c._id === selectedCompany);
    const client = clients.find(c => c._id === selectedClient);
    const loan = loans.find(l => l._id === selectedLoan);

    const metaData = [
      [company?.companyName || 'Penalty Charges Report'],
      [`Client: ${client?.clientName}`],
      [`Loan: ${loan?.loanNumber}`],
      [`Total Penalties: ${formatIndianNumber(transactions.reduce((sum, item) => sum + (item.receiptNumber ? item.amount : -item.amount), 0))}`]
    ];

    exportToExcel(headers, data, `PenaltyCharges_${loan?.loanNumber}`, metaData);
  };

  const getEmailProps = () => {
    if (!report) return {};
    const company = companies.find(c => c._id === selectedCompany);
    const client = clients.find(c => c._id === selectedClient);
    const loan = loans.find(l => l._id === selectedLoan);
    const transactions = [...report.receipts, ...report.payments].sort((a,b) => new Date(a.dateTime) - new Date(b.dateTime));

    return {
      title: `Penalty Charges Report - ${loan?.loanNumber}`,
      subTitle: `Client: ${client?.clientName}`,
      companyName: company?.companyName,
      fileName: `PenaltyCharges_${loan?.loanNumber}`,
      headers: ['Date', 'Type', 'Ref #', 'Amount'],
      body: transactions.map(item => [
        new Date(item.dateTime).toLocaleDateString(),
        item.receiptNumber ? 'Receipt' : 'Payment',
        item.receiptNumber || item.paymentNumber,
        `₹${formatIndianNumber(item.amount)}`
      ])
    };
  };

  return (
    <main className="main-content">
      <header className="dashboard-header no-print">
        <div className="welcome-section">
          <h1>Penalty Charges Report</h1>
          <p>Detailed log of all penalty fees collected on loans.</p>
        </div>
        <div className="header-actions-elite">
          <button className="btn-elite secondary" onClick={() => window.print()}>
            <Printer size={18} /> Print
          </button>
          <button className="btn-elite secondary" onClick={handleExportExcel}>
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button className="btn-elite secondary" onClick={() => setIsEmailModalOpen(true)}>
            <Mail size={18} /> Email
          </button>
        </div>
      </header>

      <section className="content-section content-section-elite">
        <div className="filter-card-elite no-print">
          <div className="filter-grid-elite">
            <div className="input-field-elite">
              <label>Our Company</label>
              <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
              </select>
            </div>
            <div className="input-field-elite">
              <label>Client</label>
              <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
                <option value="">Select Client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
              </select>
            </div>
            <div className="input-field-elite">
              <label>Loan</label>
              <select value={selectedLoan} onChange={(e) => setSelectedLoan(e.target.value)} disabled={!selectedCompany}>
                <option value="">Select Loan</option>
                {loans.map(l => <option key={l._id} value={l._id}>{l.loanNumber}</option>)}
              </select>
            </div>
            <div className="filter-actions-elite">
               <button className="btn-elite" onClick={fetchReport} disabled={loading || !selectedLoan}>
                 Generate Report
               </button>
            </div>
          </div>
        </div>

        {loading ? (
          <ReportSkeleton hasSummaryGrid={true} rows={3} />
        ) : report ? (
          <>
            <div className="print-only">
               <center>
                 <h1>{companies.find(c => c._id === selectedCompany)?.companyName}</h1>
                 <h3>Penalty Charges Report - {loans.find(l => l._id === selectedLoan)?.loanNumber}</h3>
               </center>
            </div>

            <div className="summary-cards-grid">
              <div className="summary-card-elite">
                <span className="label">Total Penalties</span>
                <span className="value success">
                  ₹{formatIndianNumber([...report.receipts, ...report.payments].reduce((sum, item) => sum + (item.receiptNumber ? item.amount : -item.amount), 0))}
                </span>
              </div>
              <div className="summary-card-elite">
                <span className="label">Loan Number</span>
                <span className="value">{report.loan?.loanNumber}</span>
              </div>
            </div>

            <div className="elite-table-container shadow">
              <table className="elite-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Voucher #</th>
                    <th>Type</th>
                    <th>Mode</th>
                    <th>Narration</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[...report.receipts, ...report.payments].sort((a,b) => new Date(a.dateTime) - new Date(b.dateTime)).map((item, idx) => (
                    <tr key={idx} className="hoverable">
                      <td>{new Date(item.dateTime).toLocaleDateString()}</td>
                      <td className="font-bold">{item.receiptNumber || item.paymentNumber}</td>
                      <td>
                        <span className={`badge-elite ${item.receiptNumber ? 'receipt' : 'payment'}`}>
                          {item.receiptNumber ? 'Receipt' : 'Payment'}
                        </span>
                      </td>
                      <td><span className="badge-elite receipt" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--elite-blue)' }}>{item.paymentMode}</span></td>
                      <td className="text-secondary">{item.narration}</td>
                      <td className={`text-right font-bold ${item.receiptNumber ? 'success-text' : 'danger-text'}`}>
                        ₹{formatIndianNumber(item.amount)}
                      </td>
                    </tr>
                  ))}
                  {report.receipts.length === 0 && report.payments.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state-elite">
                          <div className="empty-icon">📑</div>
                          <h3>No Penalties Found</h3>
                          <p>No penalty charges recorded for this loan.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-state-elite">
            <div className="empty-icon">📊</div>
            <h3>Report Ready</h3>
            <p>Select the company, client, and loan to generate the penalty charges report.</p>
          </div>
        )}
      </section>

      <ReportEmailModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        {...getEmailProps()}
        reportType="PenaltyChargesReport"
      />
    </main>
  );
};

export default PenaltyChargesReport;
