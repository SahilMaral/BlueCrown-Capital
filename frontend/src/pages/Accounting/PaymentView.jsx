import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Dashboard/Dashboard.css';
import SearchIcon from '../../components/icons/SearchIcon';
import CloseIcon from '../../components/icons/CloseIcon';
import Skeleton from '../../components/common/Skeleton';


const PaymentView = () => {
  useDocumentTitle('Payment Vouchers');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(res.data.data);
    } catch (err) {
      console.error('Error fetching payments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p => 
    p.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.receiver?.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.receiver?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="main-content">
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Payment Vouchers</h1>
            <p>Track all outgoing expenses and capital deployments.</p>
          </div>
          <div className="header-actions">
            <button className="btn-elite" onClick={() => navigate('/accounting/payments/new')}>
              + New Payment
            </button>
          </div>
        </header>

        <section className="content-section" style={{ padding: 0 }}>
          <div className="section-header" style={{ padding: '32px 32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Transaction List</h2>
            <div className="search-container-elite">
              <SearchIcon className="search-icon-elite" />
              <input 
                type="text" 
                className="search-input-elite" 
                placeholder="Search Payment/Receiver..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive-elite">
            <div className="elite-table-container">
              <table className="elite-table">
                <thead>
                  <tr>
                    <th>Payment #</th>
                    <th>Date</th>
                    <th>Receiver</th>
                    <th>Ledger</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={`sk-${i}`}>
                        <td colSpan="7" style={{ padding: '24px 32px' }}>
                          <Skeleton height="60px" borderRadius="12px" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 700 }}>{p.paymentNumber}</td>
                        <td>{new Date(p.dateTime).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 800, color: 'var(--elite-blue)' }}>
                          {p.receiver?.clientName || p.receiver?.companyName || 'Unknown'}
                        </td>
                        <td>{p.ledger?.name}</td>
                        <td style={{ fontWeight: 800, color: 'var(--error)' }}>₹{p.amount?.toLocaleString()}</td>
                        <td><span className="status-badge pending">{p.paymentMode}</span></td>
                        <td>
                          <button className="btn-elite-ghost" style={{ padding: '6px 12px', fontSize: '11px' }}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  {!loading && filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: 'var(--elite-text-secondary)' }}>
                        No payments found.
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

export default PaymentView;
