import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import api from '../../services/api';
import '../Dashboard/Dashboard.css';
import SearchIcon from '../../components/icons/SearchIcon';
import Skeleton from '../../components/common/Skeleton';

const InvestmentInstallmentList = () => {
  useDocumentTitle('Investment Collections');
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    isPaid: false,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchInstallments();
  }, [filters]);

  const fetchInstallments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        isPaid: filters.isPaid,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(searchTerm && { search: searchTerm })
      }).toString();

      const res = await api.get(`/investments/installments?${queryParams}`);
      setInstallments(res.data);
    } catch (err) {
      console.error('Error fetching installments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchInstallments();
    }
  };

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Investment Collections</h1>
          <p>Track and manage upcoming repayment installments from investors.</p>
        </div>
      </header>

      <section className="content-section" style={{ padding: 0 }}>
        <div className="section-header" style={{ padding: '32px 32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
             <h2 style={{ margin: 0 }}>Pending Installments</h2>
             <select 
               className="btn-elite-ghost" 
               style={{ padding: '8px', border: '1px solid #e2e8f0' }}
               value={filters.isPaid}
               onChange={(e) => setFilters({...filters, isPaid: e.target.value === 'true'})}
             >
                <option value="false">Unpaid Only</option>
                <option value="true">Paid Only</option>
             </select>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="search-container-elite" style={{ width: '250px' }}>
              <SearchIcon className="search-icon-elite" />
              <input 
                type="text" 
                className="search-input-elite" 
                placeholder="Search Client or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
            <input 
              type="date" 
              className="btn-elite-ghost" 
              style={{ padding: '8px', border: '1px solid #e2e8f0' }} 
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
            <span style={{ color: '#64748b' }}>to</span>
            <input 
              type="date" 
              className="btn-elite-ghost" 
              style={{ padding: '8px', border: '1px solid #e2e8f0' }} 
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
        </div>

        <div className="table-responsive-elite">
          <div className="elite-table-container">
            <table className="elite-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Inv Number</th>
                  <th>Client Name</th>
                  <th>Inst #</th>
                  <th>Due Date</th>
                  <th>EMI Amount</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={`sk-row-${i}`}>
                      <td colSpan="9" style={{ padding: '24px 32px' }}>
                        <Skeleton height="50px" borderRadius="10px" />
                      </td>
                    </tr>
                  ))
                ) : (
                  installments.map((inst, idx) => (
                    <tr key={inst._id}>
                      <td>{idx + 1}.</td>
                      <td style={{ fontWeight: 600, color: 'var(--elite-blue)' }}>{inst.investmentId?.investmentNumber}</td>
                      <td style={{ fontWeight: 700 }}>{inst.investmentId?.clientId?.clientName}</td>
                      <td>{inst.installmentNumber}</td>
                      <td style={{ fontWeight: 600 }}>{new Date(inst.dateOfInstallment).toLocaleDateString('en-GB')}</td>
                      <td style={{ fontWeight: 700 }}>₹{inst.emiAmount?.toLocaleString()}</td>
                      <td>₹{inst.principalEmi?.toLocaleString()}</td>
                      <td>₹{inst.interestEmi?.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${inst.isPaid ? 'success' : 'pending'}`}>
                          {inst.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && installments.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ padding: '60px', textAlign: 'center', color: 'var(--elite-text-secondary)' }}>
                      No installments found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
};

export default InvestmentInstallmentList;
