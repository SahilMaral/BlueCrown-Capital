import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Dashboard/Dashboard.css';
import SearchIcon from '../../components/icons/SearchIcon';
import CloseIcon from '../../components/icons/CloseIcon';
import ConfirmModal from '../../components/common/ConfirmModal';
import Skeleton from '../../components/common/Skeleton';
import PencilIcon from '../../components/icons/PencilIcon';
import ReceiptIcon from '../../components/icons/ReceiptIcon';
import TrashIcon from '../../components/icons/TrashIcon';


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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/receipts`, {
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
      await axios.delete(`${import.meta.env.VITE_API_URL}/receipts/${deleteModal.id}`, {
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

          <div className="table-responsive-elite">
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
                              className="btn-action-elite btn-action-edit"
                              title="Edit"
                              onClick={() => navigate(`/accounting/receipts/edit/${r._id}`)}
                            >
                              <PencilIcon className="icon-xs" />
                            </button>
                            <button 
                              className="btn-action-elite"
                              style={{ backgroundColor: '#3b82f6' }}
                              title="Print"
                              onClick={() => navigate(`/accounting/receipts/print/${r._id}`)}
                            >
                              <ReceiptIcon className="icon-xs" />
                            </button>
                            <button 
                              className="btn-action-elite btn-action-delete"
                              title="Delete"
                              onClick={() => setDeleteModal({ show: true, id: r._id })}
                            >
                              <TrashIcon className="icon-xs" />
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
