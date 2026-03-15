import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import BankIcon from '../../components/icons/BankIcon';
import SearchIcon from '../../components/icons/SearchIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import QuickMasterModal from '../../components/common/QuickMasterModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const BankManagement = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState(null); // 'Bank' or null
  const [editData, setEditData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/v1/banks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBanks(res.data.data);
    } catch (err) {
      console.error('Error fetching banks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleEditClick = (bank) => {
    setEditData(bank);
    setModalType('Bank');
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/v1/banks/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteModal({ show: false, id: null });
      fetchBanks();
    } catch (err) {
      console.error('Error deleting bank', err);
      alert('Failed to delete bank. Ensure it has no associated transactions.');
    } finally {
      setDeleting(false);
    }
  };

  const handleModalSuccess = () => {
    fetchBanks();
    setModalType(null);
    setEditData(null);
  };

  const filteredBanks = banks.filter(b => 
    b.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.accountNumber.includes(searchTerm)
  );

  return (
    <main className="main-content">
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Bank Management</h1>
            <p>Maintain accounts and monitor balances.</p>
          </div>
          <div className="header-actions">
            <button className="btn-elite" onClick={() => { setEditData(null); setModalType('Bank'); }}>
              + Add Bank Account
            </button>
          </div>
        </header>

        <section className="content-section" style={{ padding: 0 }}>
          <div className="section-header" style={{ padding: '32px 32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Active Accounts</h2>
            <div className="search-container-elite">
              <SearchIcon className="search-icon-elite" />
              <input 
                type="text" 
                className="search-input-elite" 
                placeholder="Search Account..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="elite-table-container">
            <table className="elite-table">
              <thead>
                <tr>
                  <th>Bank Name</th>
                  <th>Account Number</th>
                  <th>IFSC</th>
                  <th>Current Balance</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   [1, 2, 3].map((i) => (
                    <tr key={`sk-${i}`}>
                      <td colSpan="5" style={{ padding: '8px 32px' }}>
                        <div className="skeleton-row skeleton" style={{ margin: 0, height: '60px', borderRadius: '12px' }}></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredBanks.map((b) => (
                    <tr key={b._id}>
                      <td style={{ fontWeight: 800, color: 'var(--elite-blue)' }}>{b.bankName}</td>
                      <td style={{ letterSpacing: '1px' }}>{b.accountNumber}</td>
                      <td style={{ fontWeight: 600, opacity: 0.7 }}>{b.ifscCode}</td>
                      <td style={{ fontWeight: 700 }}>₹{b.currentBalance?.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            className="btn-elite-icon"
                            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Edit"
                            onClick={() => handleEditClick(b)}
                          >
                            <PencilIcon className="icon-xs" />
                          </button>
                          <button 
                            className="btn-elite-icon"
                            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Delete"
                            onClick={() => setDeleteModal({ show: true, id: b._id })}
                          >
                            <TrashIcon className="icon-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filteredBanks.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: 'var(--elite-text-secondary)' }}>
                      No bank accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <QuickMasterModal 
          type="Bank"
          isOpen={modalType === 'Bank'}
          onClose={() => setModalType(null)}
          onSuccess={handleModalSuccess}
          initialData={editData}
        />

        <ConfirmModal 
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false, id: null })}
          onConfirm={handleDelete}
          title="Delete Bank Account"
          message="Are you sure you want to delete this bank account? This action cannot be undone."
          confirmText="Yes, Delete"
          loading={deleting}
          variant="danger"
        />
      </main>
  );
};

export default BankManagement;
