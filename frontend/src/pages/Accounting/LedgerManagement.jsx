import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import BriefcaseIcon from '../../components/icons/BriefcaseIcon';
import SearchIcon from '../../components/icons/SearchIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import QuickMasterModal from '../../components/common/QuickMasterModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const LedgerManagement = () => {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState(null); // 'Ledger' or null
  const [editData, setEditData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchLedgers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/ledgers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLedgers(res.data.data);
    } catch (err) {
      console.error('Error fetching ledgers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgers();
  }, []);

  const handleEditClick = (ledger) => {
    setEditData(ledger);
    setModalType('Ledger');
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/ledgers/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteModal({ show: false, id: null });
      fetchLedgers();
    } catch (err) {
      console.error('Error deleting ledger', err);
      alert('Failed to delete ledger. It might have associated transactions.');
    } finally {
      setDeleting(false);
    }
  };

  const handleModalSuccess = () => {
    fetchLedgers();
    setModalType(null);
    setEditData(null);
  };

  const filteredLedgers = ledgers.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="main-content">
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Ledger Management</h1>
            <p>Define and manage your accounting categories.</p>
          </div>
          <div className="header-actions">
            <button className="btn-elite" onClick={() => { setEditData(null); setModalType('Ledger'); }}>
              + New Ledger
            </button>
          </div>
        </header>

        <section className="content-section" style={{ padding: 0 }}>
          <div className="section-header" style={{ padding: '32px 32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>All Ledgers</h2>
            <div className="search-container-elite">
              <SearchIcon className="search-icon-elite" />
              <input 
                type="text" 
                className="search-input-elite" 
                placeholder="Find ledger..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="elite-table-container">
            <table className="elite-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Sr. No.</th>
                  <th>Ledger Name</th>
                  <th>Status</th>
                  <th>Created At</th>
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
                  filteredLedgers.map((l, idx) => (
                    <tr key={l._id}>
                      <td style={{ fontWeight: 600 }}>{idx + 1}.</td>
                      <td style={{ fontWeight: 800, color: 'var(--elite-blue)' }}>{l.name}</td>
                      <td><span className="status-badge completed">{l.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            className="btn-elite-icon"
                            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Edit"
                            onClick={() => handleEditClick(l)}
                          >
                            <PencilIcon className="icon-xs" />
                          </button>
                          <button 
                            className="btn-elite-icon"
                            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Delete"
                            onClick={() => setDeleteModal({ show: true, id: l._id })}
                          >
                            <TrashIcon className="icon-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filteredLedgers.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: 'var(--elite-text-secondary)' }}>
                      No ledgers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <QuickMasterModal 
          type="Ledger"
          isOpen={modalType === 'Ledger'}
          onClose={() => setModalType(null)}
          onSuccess={handleModalSuccess}
          initialData={editData}
        />

        <ConfirmModal 
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false, id: null })}
          onConfirm={handleDelete}
          title="Delete Ledger"
          message="Are you sure you want to delete this ledger? This will permanently remove the category."
          confirmText="Yes, Delete"
          loading={deleting}
          variant="danger"
        />
      </main>
  );
};

export default LedgerManagement;
