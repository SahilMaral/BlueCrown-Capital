import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Dashboard/Dashboard.css';
import SearchIcon from '../../components/icons/SearchIcon';
import CloseIcon from '../../components/icons/CloseIcon';
import ConfirmModal from '../../components/common/ConfirmModal';
import Skeleton from '../../components/common/Skeleton';


const ReceiptView = () => {
  useDocumentTitle('Receipt Records');
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/v1/receipts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReceipts(res.data.data);
    } catch (err) {
      console.error('Error fetching receipts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const filteredReceipts = receipts.filter(r => 
    r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.payer?.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.payer?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/v1/receipts/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteModal({ show: false, id: null });
      fetchReceipts();
    } catch (err) {
      console.error('Error deleting receipt', err);
      alert('Failed to delete receipt');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="main-content">
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Receipt Records</h1>
            <p>Track all incoming funds and payment vouchers.</p>
          </div>
          <div className="header-actions">
            <button className="btn-elite" onClick={() => navigate('/accounting/receipts/new')}>
              + New Receipt
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
                placeholder="Search Receipt/Payer..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="elite-table-container">
            <table className="elite-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Sr. No.</th>
                  <th>Receipt #</th>
                  <th>Date</th>
                  <th>Payer</th>
                  <th>Receiver</th>
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
                  filteredReceipts.map((r, index) => (
                    <tr key={r._id}>
                      <td style={{ textAlign: 'center', color: 'var(--elite-text-secondary)' }}>{index + 1}</td>
                      <td style={{ fontWeight: 700 }}>{r.receiptNumber}</td>
                      <td>{new Date(r.dateTime).toLocaleDateString('en-GB')}</td>
                      <td style={{ fontWeight: 600, color: 'var(--elite-blue)' }}>
                        {r.payer?.clientName ? `${r.payer.clientName} (Client)` : (r.payer?.companyName || 'Unknown')}
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.receiver?.companyName || 'Unknown'}</td>
                      <td style={{ fontWeight: 800, color: 'var(--success)' }}>₹{r.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td><span className="status-badge completed">{r.paymentMode}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button 
                            className="btn-elite-icon"
                            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Edit"
                            onClick={() => navigate(`/accounting/receipts/edit/${r._id}`)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button 
                            className="btn-elite-icon"
                            style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Print"
                            onClick={() => navigate(`/accounting/receipts/print/${r._id}`)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                          </button>
                          <button 
                            className="btn-elite-icon"
                            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Delete"
                            onClick={() => setDeleteModal({ show: true, id: r._id })}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filteredReceipts.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ padding: '60px', textAlign: 'center', color: 'var(--elite-text-secondary)' }}>
                      No receipts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <ConfirmModal 
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false, id: null })}
          onConfirm={handleDelete}
          title="Delete Receipt"
          message="Are you sure you want to delete this receipt? This action will revert the balances and cannot be undone."
          confirmText="Yes, Delete"
          loading={deleting}
          variant="danger"
        />
      </main>
  );
};

export default ReceiptView;
