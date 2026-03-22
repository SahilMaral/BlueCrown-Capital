import React, { useState, useEffect, useRef } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import ReportSkeleton from '../../components/common/skeletons/ReportSkeleton';
import { exportToExcel, formatIndianNumber } from '../../utils/reportUtils';
import ReportEmailModal from '../../components/common/ReportEmailModal';
import { Printer, FileSpreadsheet, Mail, RefreshCw } from 'lucide-react';

const DayReport = () => {
  useDocumentTitle('Daily Report');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchReport();
    }
  }, [date, selectedCompany]);

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

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/day?companyId=${selectedCompany}&date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(res.data.data);
    } catch (err) {
      console.error('Error fetching day report', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!report) return;
    const headers = ['Sr', 'Receipt #', 'Particulars', 'Mode', 'Amount', 'Sr', 'Payment #', 'Particulars', 'Mode', 'Amount'];
    const data = report.reportData.map((row, idx) => [
      idx + 1,
      row.receipt.receiptNumber || '',
      row.receipt.particular || '',
      row.receipt.paymentMode || '',
      row.receipt.amount || '',
      idx + 1,
      row.payment.paymentNumber || '',
      row.payment.particular || '',
      row.payment.paymentMode || '',
      row.payment.amount || ''
    ]);
    
    const company = companies.find(c => c._id === selectedCompany);
    const metaData = [
      [company?.companyName || 'Daily Report'],
      [`Date: ${new Date(date).toLocaleDateString()}`],
      ['Detailed Day Report']
    ];

    exportToExcel(headers, data, `DayReport_${date}`, metaData);
  };

  const handlePrint = () => {
    window.print();
  };

  const getEmailProps = () => {
    if (!report) return {};
    const company = companies.find(c => c._id === selectedCompany);
    return {
      title: `Daily Financial Report - ${new Date(date).toLocaleDateString()}`,
      subTitle: `Company: ${company?.companyName}`,
      companyName: company?.companyName,
      fileName: `DayReport_${date}`,
      headers: ['Receipt #', 'Payer', 'Mode', 'Amount (Rec)', 'Payment #', 'Receiver', 'Mode', 'Amount (Pay)'],
      body: report.reportData.map(row => [
        row.receipt.receiptNumber || '-',
        row.receipt.particular || '-',
        row.receipt.paymentMode || '-',
        row.receipt.amount ? `₹${row.receipt.amount}` : '-',
        row.payment.paymentNumber || '-',
        row.payment.particular || '-',
        row.payment.paymentMode || '-',
        row.payment.amount ? `₹${row.payment.amount}` : '-'
      ])
    };
  };

  return (
    <main className="main-content">
      <header className="dashboard-header no-print">
        <div className="welcome-section">
          <h1>Daily Financial Report</h1>
          <p>Real-time snapshot of cash flow and bank balances.</p>
        </div>
        <div className="header-actions-elite">
          <button className="btn-elite secondary" onClick={handlePrint}>
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
                {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
              </select>
            </div>
            <div className="input-field-elite">
              <label>Report Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="filter-actions-elite">
               <button className="btn-elite" onClick={fetchReport} style={{ height: '48px' }}>
                 <RefreshCw size={18} /> Refresh Data
               </button>
            </div>
          </div>
        </div>

        {loading ? (
          <ReportSkeleton />
        ) : report ? (
          <>
            <div className="print-only">
               <center>
                 <h1>{companies.find(c => c._id === selectedCompany)?.companyName}</h1>
                 <h3>Daily Financial Report - {new Date(date).toLocaleDateString()}</h3>
               </center>
            </div>

            <div className="section-header">
              <h2>Cash & Online Summary</h2>
            </div>
            <div className="summary-cards-grid">
              <div className="summary-card-elite">
                <span className="label">Opening Cash Balance</span>
                <span className="value">₹{formatIndianNumber(report.cashOpeningSum)}</span>
              </div>
              <div className="summary-card-elite">
                <span className="label">Total Receipts</span>
                <span className="value success">₹{formatIndianNumber(report.totalCashReceipts + report.totalOnlineReceipts)}</span>
              </div>
              <div className="summary-card-elite">
                <span className="label">Total Payments</span>
                <span className="value danger">₹{formatIndianNumber(report.totalCashPayments + report.totalOnlinePayments)}</span>
              </div>
              <div className="summary-card-elite">
                <span className="label">Aggregate Closing Balance</span>
                <span className="value" style={{ color: 'var(--elite-blue)' }}>
                  ₹{formatIndianNumber(report.cashClosingSum + report.onlineClosingSum)}
                </span>
              </div>
            </div>

            <div className="section-header">
              <h2>Detailed Transactions (Side-by-Side)</h2>
            </div>
            <div className="elite-table-container shadow overflow-x">
              <table className="elite-table day-report-table">
                <thead>
                  <tr className="table-header-group">
                    <th colSpan="5" className="text-center bg-success-light">RECEIPTS</th>
                    <th colSpan="5" className="text-center bg-danger-light">PAYMENTS</th>
                  </tr>
                  <tr>
                    <th>#</th>
                    <th>Ref #</th>
                    <th>Particulars</th>
                    <th>Mode</th>
                    <th className="text-right">Amount</th>
                    <th>#</th>
                    <th>Ref #</th>
                    <th>Particulars</th>
                    <th>Mode</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {report.reportData.map((row, idx) => (
                    <tr key={idx} className="hoverable">
                      {/* Receipt Side */}
                      <td className="text-secondary">{row.receipt.amount ? idx + 1 : ''}</td>
                      <td className="font-bold">{row.receipt.receiptNumber || ''}</td>
                      <td>
                        <div className="particular-cell">
                           <span className="main">{row.receipt.particular || ''}</span>
                           <span className="sub">{row.receipt.narration}</span>
                        </div>
                      </td>
                      <td>{row.receipt.paymentMode}</td>
                      <td className="text-right success-text">{row.receipt.amount ? `₹${formatIndianNumber(row.receipt.amount)}` : ''}</td>
                      
                      {/* Payment Side */}
                      <td className="text-secondary">{row.payment.amount ? idx + 1 : ''}</td>
                      <td className="font-bold">{row.payment.paymentNumber || ''}</td>
                      <td>
                        <div className="particular-cell">
                           <span className="main">{row.payment.particular || ''}</span>
                           <span className="sub">{row.payment.narration}</span>
                        </div>
                      </td>
                      <td>{row.payment.paymentMode}</td>
                      <td className="text-right danger-text">{row.payment.amount ? `₹${formatIndianNumber(row.payment.amount)}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                   <tr className="font-bold">
                     <td colSpan="4" className="text-right">Total Receipts:</td>
                     <td className="text-right success-text">₹{formatIndianNumber(report.totalCashReceipts + report.totalOnlineReceipts)}</td>
                     <td colSpan="4" className="text-right">Total Payments:</td>
                     <td className="text-right danger-text">₹{formatIndianNumber(report.totalCashPayments + report.totalOnlinePayments)}</td>
                   </tr>
                </tfoot>
              </table>
            </div>

            <div className="section-header mt-8">
              <h2>Source Balances (Cash & Bank)</h2>
            </div>
            <div className="elite-table-container shadow">
              <table className="elite-table">
                <thead>
                  <tr>
                    <th>Source Name</th>
                    <th>Type</th>
                    <th className="text-right">Opening Balance</th>
                    <th className="text-right">Closing Balance</th>
                    <th className="text-right">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {report.sourceBalances.map((item, idx) => (
                    <tr key={idx} className="hoverable">
                      <td className="font-bold">{item.source}</td>
                      <td>
                        <span className={`badge-elite ${item.isCash ? 'receipt' : 'payment'}`} style={{ background: item.isCash ? 'rgba(16, 185, 129, 0.1)' : 'rgba(37, 99, 235, 0.1)', color: item.isCash ? 'var(--success)' : 'var(--elite-blue)' }}>
                           {item.isCash ? 'CASH' : 'ONLINE'}
                        </span>
                      </td>
                      <td className="text-right">₹{formatIndianNumber(item.openingBalance)}</td>
                      <td className="text-right font-bold">₹{formatIndianNumber(item.closingBalance)}</td>
                      <td className="text-right">
                        <span className={item.closingBalance - item.openingBalance >= 0 ? 'success-text' : 'danger-text'}>
                          {item.closingBalance - item.openingBalance >= 0 ? '+' : '-'}₹{formatIndianNumber(Math.abs(item.closingBalance - item.openingBalance))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-state-elite">
            <div className="empty-icon">📅</div>
            <h3>No Data Found</h3>
            <p>We couldn't find any financial records for the selected company on this date.</p>
          </div>
        )}
      </section>

      <ReportEmailModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        {...getEmailProps()}
        reportType="DayReport"
      />
    </main>
  );
};

export default DayReport;
