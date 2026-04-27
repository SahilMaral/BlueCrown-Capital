import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import './Reports.css';
import ReportSkeleton from '../../components/common/skeletons/ReportSkeleton';
import { exportToExcel, formatIndianNumber } from '../../utils/reportUtils';
import ReportEmailModal from '../../components/common/ReportEmailModal';
import { Printer, FileSpreadsheet, Mail, RefreshCw, Wallet, ArrowUpRight, ArrowDownLeft, CircleDollarSign } from 'lucide-react';
import EliteSelect from '../../components/common/EliteSelect';
import CompanyIcon from '../../components/icons/CompanyIcon';
import UserIcon from '../../components/icons/UserIcon';
import LedgerIcon from '../../components/icons/LedgerIcon';
import CalendarIcon from '../../components/icons/CalendarIcon';
import BriefcaseIcon from '../../components/icons/BriefcaseIcon';

const LedgerReport = () => {
  useDocumentTitle('Account Ledger');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    companyId: '',
    counterpartyId: '',
    counterpartyType: 'client',
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [compRes, clientRes, ledgerRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/companies`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/clients`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/ledgers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCompanies(compRes.data.data);
      setClients(clientRes.data.data);
      setLedgers(ledgerRes.data.data);
      
      if (compRes.data.data.length > 0) {
        setFilters(f => ({ ...f, companyId: compRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching ledger data', err);
    }
  };

  const fetchLedger = async () => {
    if (!filters.companyId || !filters.counterpartyId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_API_URL}/reports/ledger?companyId=${filters.companyId}&counterpartyId=${filters.counterpartyId}&counterpartyType=${filters.counterpartyType}&dateFrom=${filters.dateFrom}&dateTo=${filters.dateTo}`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setReport(res.data.data);
    } catch (err) {
      console.error('Error fetching ledger report', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!report) return;
    const headers = ['Date', 'Particulars', 'Narration', 'Type', 'Ref #', 'Debit (Dr)', 'Credit (Cr)'];
    
    const openingBalRow = [
      '', 'Opening Balance', '', '', '',
      report.openingBalance < 0 ? Math.abs(report.openingBalance) : '',
      report.openingBalance >= 0 ? report.openingBalance : ''
    ];

    const transactionData = report.ledger.map(tr => [
      new Date(tr.dateTime).toLocaleDateString('en-GB'),
      tr.ledger?.ledgerName || 'General Entry',
      tr.narration || '',
      tr.type,
      tr.receiptNumber || tr.paymentNumber || '',
      tr.type === 'Payment' ? tr.amount : '',
      tr.type === 'Receipt' ? tr.amount : ''
    ]);

    const totalDebitBefore = report.totalDebit + (report.openingBalance < 0 ? Math.abs(report.openingBalance) : 0);
    const totalCreditBefore = report.totalCredit + (report.openingBalance >= 0 ? report.openingBalance : 0);

    const totalBeforeRow = ['', 'Total (Before Balancing)', '', '', '', totalDebitBefore, totalCreditBefore];
    
    const balancingDebit = report.closingBalance >= 0 ? report.closingBalance : 0;
    const balancingCredit = report.closingBalance < 0 ? Math.abs(report.closingBalance) : 0;
    
    const balancingRow = ['', 'Closing Balance (Balancing Entry)', '', '', '', balancingDebit || '', balancingCredit || ''];
    const tallyRow = ['', 'Tally', '', '', '', totalDebitBefore + balancingDebit, totalCreditBefore + balancingCredit];

    const data = [openingBalRow, ...transactionData, totalBeforeRow, balancingRow, tallyRow];
    
    const company = companies.find(c => c._id === filters.companyId);
    let counterpartyName = '';
    if (filters.counterpartyType === 'client') counterpartyName = clients.find(c => c._id === filters.counterpartyId)?.clientName;
    else if (filters.counterpartyType === 'company') counterpartyName = companies.find(c => c._id === filters.counterpartyId)?.companyName;
    else counterpartyName = ledgers.find(l => l._id === filters.counterpartyId)?.ledgerName;

    const metaData = [
      [company?.companyName || 'Ledger Report'],
      [`Counterparty: ${counterpartyName}`],
      [`Period: ${filters.dateFrom} to ${filters.dateTo}`],
      []
    ];

    exportToExcel(headers, data, `Ledger_${counterpartyName}_${filters.dateTo}`, metaData);
  };

  const getEmailProps = () => {
    if (!report) return {};
    const company = companies.find(c => c._id === filters.companyId);
    let counterpartyName = '';
    let defaultEmail = '';
    
    if (filters.counterpartyType === 'client') {
      const client = clients.find(c => c._id === filters.counterpartyId);
      counterpartyName = client?.clientName || '';
      defaultEmail = client?.email || '';
    } else if (filters.counterpartyType === 'company') {
      const comp = companies.find(c => c._id === filters.counterpartyId);
      counterpartyName = comp?.companyName || '';
      defaultEmail = comp?.email || '';
    } else {
      counterpartyName = ledgers.find(l => l._id === filters.counterpartyId)?.ledgerName || '';
    }

    return {
      title: `Ledger Report - ${counterpartyName}`,
      subTitle: `Period: ${filters.dateFrom} to ${filters.dateTo}`,
      companyName: company?.companyName,
      fileName: `Ledger_${counterpartyName}`,
      defaultEmail: defaultEmail,
      headers: ['Date', 'Particulars', 'Ref #', 'Dr', 'Cr'],
      body: [
        ['', 'Opening Balance', '-', report.openingBalance < 0 ? `₹${formatIndianNumber(Math.abs(report.openingBalance))}` : '-', report.openingBalance >= 0 ? `₹${formatIndianNumber(report.openingBalance)}` : '-'],
        ...report.ledger.map(tr => [
          new Date(tr.dateTime).toLocaleDateString('en-GB'),
          tr.ledger?.ledgerName || 'General Entry',
          tr.receiptNumber || tr.paymentNumber || '-',
          tr.type === 'Payment' ? `₹${formatIndianNumber(tr.amount)}` : '-',
          tr.type === 'Receipt' ? `₹${formatIndianNumber(tr.amount)}` : '-'
        ])
      ]
    };
  };

  const totalDebitBefore = report ? report.totalDebit + (report.openingBalance < 0 ? Math.abs(report.openingBalance) : 0) : 0;
  const totalCreditBefore = report ? report.totalCredit + (report.openingBalance >= 0 ? report.openingBalance : 0) : 0;
  const balancingDebit = report ? (report.closingBalance >= 0 ? report.closingBalance : 0) : 0;
  const balancingCredit = report ? (report.closingBalance < 0 ? Math.abs(report.closingBalance) : 0) : 0;

  const counterpartyOptions = 
    filters.counterpartyType === 'client' ? clients.map(c => ({ value: c._id, label: c.clientName })) :
    filters.counterpartyType === 'company' ? companies.filter(c => c._id !== filters.companyId).map(c => ({ value: c._id, label: c.companyName })) :
    ledgers.map(l => ({ value: l._id, label: l.ledgerName }));

  const counterpartyIcon = 
    filters.counterpartyType === 'client' ? <UserIcon className="auth-input-icon" /> :
    filters.counterpartyType === 'company' ? <CompanyIcon className="auth-input-icon" /> :
    <LedgerIcon className="auth-input-icon" />;

  return (
    <main className="main-content">
      <header className="dashboard-header no-print">
        <div className="welcome-section">
          <h1>Account Ledger</h1>
          <p>Detailed transaction history for counterparties.</p>
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
            <div className="input-field-elite auth-input-group">
              <label>Our Company</label>
              <div className="auth-input-wrapper">
                <CompanyIcon className="auth-input-icon" />
                <EliteSelect
                  options={companies.map(c => ({ value: c._id, label: c.companyName }))}
                  value={filters.companyId}
                  onChange={val => setFilters({...filters, companyId: val})}
                  placeholder="Select Company"
                />
              </div>
            </div>
            <div className="input-field-elite auth-input-group">
              <label>Type</label>
              <div className="auth-input-wrapper">
                <BriefcaseIcon className="auth-input-icon" />
                <EliteSelect
                  options={[
                    { value: 'client', label: 'Client' },
                    { value: 'company', label: 'Internal Company' },
                    { value: 'ledger', label: 'General Ledger' }
                  ]}
                  value={filters.counterpartyType}
                  onChange={val => setFilters({...filters, counterpartyType: val, counterpartyId: ''})}
                  isSearchable={false}
                />
              </div>
            </div>
            <div className="input-field-elite auth-input-group">
              <label>Counterparty</label>
              <div className="auth-input-wrapper">
                {counterpartyIcon}
                <EliteSelect
                  options={counterpartyOptions}
                  value={filters.counterpartyId}
                  onChange={val => setFilters({...filters, counterpartyId: val})}
                  placeholder="Choose..."
                />
              </div>
            </div>
            <div className="date-range-elite">
              <div className="input-field-elite auth-input-group">
                <label>From</label>
                <div className="auth-input-wrapper">
                  <CalendarIcon className="auth-input-icon" />
                  <input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="elite-input-classic" />
                </div>
              </div>
              <div className="input-field-elite auth-input-group">
                <label>To</label>
                <div className="auth-input-wrapper">
                  <CalendarIcon className="auth-input-icon" />
                  <input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="elite-input-classic" />
                </div>
              </div>
            </div>
            <div className="filter-actions-elite" style={{ gridColumn: 'span 4', border: 'none', paddingTop: 0 }}>
               <button className="btn-elite" onClick={fetchLedger} style={{ height: '56px', width: '280px' }}>
                 Generate Report
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
                 <h1>{companies.find(c => c._id === filters.companyId)?.companyName}</h1>
                 <h3>Ledger Report - {filters.dateFrom} to {filters.dateTo}</h3>
               </center>
            </div>

            <div className="summary-cards-grid no-print">
              <div className="summary-card-elite" style={{ borderLeft: '4px solid #64748b' }}>
                <div className="summary-card-icon" style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#64748b' }}>
                  <Wallet size={24} />
                </div>
                <div className="summary-card-info">
                  <span className="label">Opening Balance</span>
                  <span className={`value ${report.openingBalance >= 0 ? 'success' : 'danger'}`}>
                    ₹{formatIndianNumber(Math.abs(report.openingBalance))} {report.openingBalance >= 0 ? 'Cr' : 'Dr'}
                  </span>
                </div>
              </div>
              <div className="summary-card-elite" style={{ borderLeft: '4px solid #ef4444' }}>
                <div className="summary-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <ArrowUpRight size={24} />
                </div>
                <div className="summary-card-info">
                  <span className="label">Total Debit</span>
                  <span className="value danger">₹{formatIndianNumber(report.totalDebit)}</span>
                </div>
              </div>
              <div className="summary-card-elite" style={{ borderLeft: '4px solid #10b981' }}>
                <div className="summary-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <ArrowDownLeft size={24} />
                </div>
                <div className="summary-card-info">
                  <span className="label">Total Credit</span>
                  <span className="value success">₹{formatIndianNumber(report.totalCredit)}</span>
                </div>
              </div>
              <div className="summary-card-elite" style={{ borderLeft: '4px solid #3b82f6' }}>
                <div className="summary-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <CircleDollarSign size={24} />
                </div>
                <div className="summary-card-info">
                  <span className="label">Closing Balance</span>
                  <span className={`value ${report.closingBalance >= 0 ? 'success' : 'danger'}`}>
                    ₹{formatIndianNumber(Math.abs(report.closingBalance))} {report.closingBalance >= 0 ? 'Cr' : 'Dr'}
                  </span>
                </div>
              </div>
            </div>

            <div className="elite-table-container shadow">
              <table className="elite-table day-report-table">
                <thead>
                  <tr>
                    <th style={{ width: '120px' }}>Date</th>
                    <th>Particulars</th>
                    <th style={{ width: '100px' }}>Type</th>
                    <th style={{ width: '150px' }}>Ref #</th>
                    <th className="text-right" style={{ width: '160px' }}>Debit (Dr)</th>
                    <th className="text-right" style={{ width: '160px' }}>Credit (Cr)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Opening Balance Row */}
                  <tr className="opening-balance-row">
                    <td></td>
                    <td colSpan="3" className="font-bold text-right">Opening Balance</td>
                    <td className="text-right font-bold danger-text bg-danger-lightest ledger-divider">{report.openingBalance < 0 ? `₹${formatIndianNumber(Math.abs(report.openingBalance))}` : ''}</td>
                    <td className="text-right font-bold success-text bg-success-lightest">
                      {report.openingBalance >= 0 ? `₹${formatIndianNumber(report.openingBalance)}` : ''}
                    </td>
                  </tr>

                  {report.ledger.map((tr, idx) => (
                    <tr key={idx} className="hoverable">
                      <td className="text-secondary">{new Date(tr.dateTime).toLocaleDateString('en-GB')}</td>
                      <td>
                        <div className="particular-cell">
                           <span className="main">{tr.ledger?.ledgerName || 'General Entry'}</span>
                           <span className="sub">{tr.narration}</span>
                           {tr.bank && <span className="sub bank-badge" style={{ marginTop: '4px' }}>{tr.bank.bankName}</span>}
                        </div>
                      </td>
                      <td><span className={`badge-elite ${tr.type.toLowerCase()}`}>{tr.type}</span></td>
                      <td className="text-secondary font-bold">{tr.receiptNumber || tr.paymentNumber || '-'}</td>
                      <td className="text-right danger-text ledger-divider">{tr.type === 'Payment' ? `₹${formatIndianNumber(tr.amount)}` : ''}</td>
                      <td className="text-right success-text">{tr.type === 'Receipt' ? `₹${formatIndianNumber(tr.amount)}` : ''}</td>
                    </tr>
                  ))}

                  {/* Total Before Balancing */}
                  <tr className="total-before-row font-bold" style={{ backgroundColor: '#f8fafc' }}>
                    <td></td>
                    <td colSpan="3" className="text-right">Total (Before Balancing)</td>
                    <td className="text-right danger-text ledger-divider" style={{ borderTop: '2px solid #94a3b8' }}>₹{formatIndianNumber(totalDebitBefore)}</td>
                    <td className="text-right success-text" style={{ borderTop: '2px solid #94a3b8' }}>₹{formatIndianNumber(totalCreditBefore)}</td>
                  </tr>

                  {/* Closing Balance (Balancing Entry) */}
                  <tr className="closing-balance-row font-bold italic">
                    <td></td>
                    <td colSpan="3" className="text-right">Closing Balance (Balancing Entry)</td>
                    <td className="text-right danger-text bg-danger-lightest ledger-divider">{balancingDebit ? `₹${formatIndianNumber(balancingDebit)}` : ''}</td>
                    <td className="text-right success-text bg-success-lightest">{balancingCredit ? `₹${formatIndianNumber(balancingCredit)}` : ''}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="tally-row font-bold tally-border">
                    <td></td>
                    <td colSpan="3" className="text-right uppercase tracking-wider">Tally</td>
                    <td className="text-right danger-text ledger-divider">₹{formatIndianNumber(totalDebitBefore + balancingDebit)}</td>
                    <td className="text-right success-text">₹{formatIndianNumber(totalCreditBefore + balancingCredit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="print-validation-footer">
              <div className="validation-box">
                <div className="validation-line"></div>
                <div className="validation-label">Prepared By</div>
              </div>
              <div className="validation-box">
                <div className="validation-line"></div>
                <div className="validation-label">Authorized Signatory</div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state-elite">
            <div className="empty-icon">📊</div>
            <h3>No Report Generated</h3>
            <p>Adjust your filters above and click generate to see the ledger details.</p>
          </div>
        )}
      </section>

      <ReportEmailModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        {...getEmailProps()}
        reportType="LedgerReport"
      />
    </main>
  );
};

export default LedgerReport;
