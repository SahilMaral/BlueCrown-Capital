import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../Dashboard/Dashboard.css';
import SearchIcon from '../../components/icons/SearchIcon';
import ConfirmModal from '../../components/common/ConfirmModal';
import Skeleton from '../../components/common/Skeleton';
import PencilIcon from '../../components/icons/PencilIcon';
import ReceiptIcon from '../../components/icons/ReceiptIcon';
import TrashIcon from '../../components/icons/TrashIcon';

const PaymentView = () => {
  useDocumentTitle('Payment Vouchers');
  const { user } = useSelector((state) => state.auth);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelModal, setCancelModal] = useState({ show: false, id: null });
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

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

  const handleCancel = async () => {
    try {
      setCancelling(true);
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/payments/${cancelModal.id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPayments(prev => prev.map(p => p._id === cancelModal.id ? { ...p, isCancelled: true } : p));
      setCancelModal({ show: false, id: null });
    } catch (err) {
      console.error('Error cancelling payment', err);
      alert('Failed to cancel payment');
    } finally {
      setCancelling(false);
    }
  };

  const filteredPayments = payments.filter(p => 
    p.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.receiver?.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.receiver?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="main-content">
        <style>{`
          .status-badge.cancelled {
            background: rgba(239, 68, 68, 0.08);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.1);
          }
          .cancelled-row {
            background-color: rgba(239, 68, 68, 0.04) !important;
          }
          .cancelled-row td {
            color: #ef4444 !important;
            opacity: 0.8;
          }
          .cancelled-row .status-badge {
            opacity: 1 !important;
          }
           .status-badge.completed {
            background: rgba(16, 185, 129, 0.08);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.1);
          }
        `}</style>
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Payment Vouchers</h1>
            <p>Track all outgoing expenses and capital deployments.</p>
          </div>
          <div className="header-actions">
            {(user?.role === 'maker' || isAdmin) && (
              <button className="btn-elite" onClick={() => navigate('/accounting/payments/new')}>
                + New Payment
              </button>
            )}
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
                    <th style={{ width: '60px', textAlign: 'center' }}>Sr. No.</th>
                    <th>Payment #</th>
                    <th>Date</th>
                    <th>Receiver</th>
                    <th>Ledger</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={`sk-${i}`}>
                        <td colSpan="8" style={{ padding: '24px 32px' }}>
                          <Skeleton height="60px" borderRadius="12px" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    filteredPayments.map((p, index) => (
                      <tr key={p._id} className={p.isCancelled ? 'cancelled-row' : ''}>
                        <td style={{ textAlign: 'center', color: 'var(--elite-text-secondary)' }}>{index + 1}</td>
                        <td style={{ fontWeight: 700 }}>{p.paymentNumber}</td>
                        <td>{new Date(p.dateTime).toLocaleDateString('en-GB')}</td>
                        <td style={{ fontWeight: 800, color: p.isCancelled ? 'inherit' : 'var(--elite-blue)' }}>
                          {p.receiver?.clientName || p.receiver?.companyName || 'Unknown'}
                        </td>
                        <td>{p.ledger?.name}</td>
                        <td style={{ fontWeight: 800, color: p.isCancelled ? 'inherit' : 'var(--error)' }}>
                          ₹{p.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span className={`status-badge ${p.isCancelled ? 'cancelled' : 'completed'}`}>
                            {p.isCancelled ? 'Cancelled' : p.paymentMode}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            {isAdmin && !p.isCancelled && (
                              <button 
                                className="btn-action-elite btn-action-edit"
                                title="Edit"
                                onClick={() => navigate(`/accounting/payments/edit/${p._id}`)}
                              >
                                <PencilIcon className="icon-xs" />
                              </button>
                            )}
                            <button 
                              className="btn-action-elite"
                              style={{ backgroundColor: '#3b82f6' }}
                              title="Print"
                              onClick={() => navigate(`/accounting/payments/print/${p._id}`)}
                            >
                              <ReceiptIcon className="icon-xs" />
                            </button>
                            {isAdmin && !p.isCancelled && (
                              <button 
                                className="btn-action-elite btn-action-delete"
                                title="Cancel"
                                onClick={() => setCancelModal({ show: true, id: p._id })}
                              >
                                <TrashIcon className="icon-xs" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  {!loading && filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ padding: '60px', textAlign: 'center', color: 'var(--elite-text-secondary)' }}>
                        No payments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <ConfirmModal 
          isOpen={cancelModal.show}
          onClose={() => setCancelModal({ show: false, id: null })}
          onConfirm={handleCancel}
          title="Cancel Payment"
          message="Are you sure you want to cancel this payment? This action will revert the balances and cannot be undone."
          confirmText="Yes, Cancel"
          loading={cancelling}
          variant="danger"
        />
      </main>
  );
};

export default PaymentView;

