import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import './Reports.css';
import ReportSkeleton from '../../components/common/skeletons/ReportSkeleton';
import { exportToExcel, formatIndianNumber } from '../../utils/reportUtils';
import ReportEmailModal from '../../components/common/ReportEmailModal';
import { Printer, FileSpreadsheet, Mail } from 'lucide-react';

const AdminChargesReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchInvestments();
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

  const fetchInvestments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/investments?lenderCompany=${selectedCompany}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvestments(res.data.data);
      if (res.data.data.length > 0) setSelectedInvestment(res.data.data[0]._id);
      else setSelectedInvestment('');
    } catch (err) {
      console.error('Error fetching investments', err);
    }
  };

  const fetchReport = async () => {
    if (!selectedCompany || !selectedInvestment || !selectedClient) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/admin-charges?companyId=${selectedCompany}&investmentId=${selectedInvestment}&clientId=${selectedClient}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(res.data.data);
    } catch (err) {
      console.error('Error fetching admin charges report', err);
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
    const investment = investments.find(i => i._id === selectedInvestment);

    const metaData = [
      [company?.companyName || 'Admin Charges Report'],
      [`Client: ${client?.clientName}`],
      [`Investment: ${investment?.investmentNumber}`],
      [`Total Collected: ${formatIndianNumber(transactions.reduce((sum, item) => sum + (item.receiptNumber ? item.amount : -item.amount), 0))}`]
    ];

    exportToExcel(headers, data, `AdminCharges_${investment?.investmentNumber}`, metaData);
  };

  const getEmailProps = () => {
    if (!report) return {};
    const company = companies.find(c => c._id === selectedCompany);
    const client = clients.find(c => c._id === selectedClient);
    const investment = investments.find(i => i._id === selectedInvestment);
    const transactions = [...report.receipts, ...report.payments].sort((a,b) => new Date(a.dateTime) - new Date(b.dateTime));

    return {
      title: `Admin Charges Report - ${investment?.investmentNumber}`,
      subTitle: `Client: ${client?.clientName}`,
      companyName: company?.companyName,
      fileName: `AdminCharges_${investment?.investmentNumber}`,
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
          <h1>Admin Charges Report</h1>
          <p>Track all administrative fees collected from investments.</p>
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
              <label>Investment</label>
              <select value={selectedInvestment} onChange={(e) => setSelectedInvestment(e.target.value)} disabled={!selectedCompany}>
                <option value="">Select Investment</option>
                {investments.map(i => <option key={i._id} value={i._id}>{i.investmentNumber}</option>)}
              </select>
            </div>
            <div className="filter-actions-elite">
               <button className="btn-elite" onClick={fetchReport} disabled={loading || !selectedInvestment}>
                 Generate Report
               </button>
            </div>
          </div>
        </div>

        {loading ? (
          <ReportSkeleton hasSummaryGrid={true} rows={4} />
        ) : report ? (
          <>
            <div className="print-only">
               <center>
                 <h1>{companies.find(c => c._id === selectedCompany)?.companyName}</h1>
                 <h3>Admin Charges Report - {investments.find(i => i._id === selectedInvestment)?.investmentNumber}</h3>
               </center>
            </div>

            <div className="summary-cards-grid">
              <div className="summary-card-elite">
                <span className="label">Total Collected</span>
                <span className="value success">
                  ₹{formatIndianNumber([...report.receipts, ...report.payments].reduce((sum, item) => sum + (item.receiptNumber ? item.amount : -item.amount), 0))}
                </span>
              </div>
              <div className="summary-card-elite">
                <span className="label">Investment Number</span>
                <span className="value">{report.investment?.investmentNumber}</span>
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
                          <div className="empty-icon">💸</div>
                          <h3>No Charges Found</h3>
                          <p>No admin charges recorded for this investment.</p>
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
            <p>Select the company, client, and investment to generate the admin charges report.</p>
          </div>
        )}
      </section>

      <ReportEmailModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        {...getEmailProps()}
        reportType="AdminChargesReport"
      />
    </main>
  );
};

export default AdminChargesReport;
