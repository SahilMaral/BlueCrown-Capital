import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import UserIcon from '../../components/icons/UserIcon';
import SearchIcon from '../../components/icons/SearchIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import QuickMasterModal from '../../components/common/QuickMasterModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState(null); // 'Client' or null
  const [editData, setEditData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data.data);
    } catch (err) {
      console.error('Error fetching clients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEditClick = (client) => {
    setEditData(client);
    setModalType('Client');
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/clients/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteModal({ show: false, id: null });
      fetchClients();
    } catch (err) {
      console.error('Error deleting client', err);
      alert('Failed to delete client. It might have associated transactions.');
    } finally {
      setDeleting(false);
    }
  };

  const handleModalSuccess = () => {
    fetchClients();
    setModalType(null);
    setEditData(null);
  };

  const filteredClients = clients.filter(c => 
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="main-content">
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Client Directory</h1>
            <p>Manage external partners and individual clients.</p>
          </div>
          <div className="header-actions">
            <button className="btn-elite" onClick={() => { setEditData(null); setModalType('Client'); }}>
              + New Client
            </button>
          </div>
        </header>

        <section className="content-section" style={{ padding: 0 }}>
          <div className="section-header" style={{ padding: '32px 32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>All Clients</h2>
            <div className="search-container-elite">
              <SearchIcon className="search-icon-elite" />
              <input 
                type="text" 
                className="search-input-elite" 
                placeholder="Search Client..." 
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
                  <th>Client Name</th>
                  <th>Company</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   [1, 2, 3].map((i) => (
                    <tr key={`sk-${i}`}>
                      <td colSpan="8" style={{ padding: '8px 32px' }}>
                        <div className="skeleton-row skeleton" style={{ margin: 0, height: '60px', borderRadius: '12px' }}></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredClients.map((c, idx) => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 600 }}>{idx + 1}.</td>
                      <td style={{ fontWeight: 800, color: 'var(--elite-blue)' }}>{c.clientName}</td>
                      <td>{c.companyName || 'Individual'}</td>
                      <td>{c.mobileNo || 'N/A'}</td>
                      <td style={{ opacity: 0.8 }}>{c.email || 'N/A'}</td>
                      <td><span className="status-badge completed">Active</span></td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            className="btn-elite-icon"
                            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Edit"
                            onClick={() => handleEditClick(c)}
                          >
                            <PencilIcon className="icon-xs" />
                          </button>
                          <button 
                            className="btn-elite-icon"
                            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Delete"
                            onClick={() => setDeleteModal({ show: true, id: c._id })}
                          >
                            <TrashIcon className="icon-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filteredClients.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ padding: '60px', textAlign: 'center', color: 'var(--elite-text-secondary)' }}>
                      No clients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <QuickMasterModal 
          type="Client"
          isOpen={modalType === 'Client'}
          onClose={() => setModalType(null)}
          onSuccess={handleModalSuccess}
          initialData={editData}
        />

        <ConfirmModal 
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false, id: null })}
          onConfirm={handleDelete}
          title="Delete Client"
          message="Are you sure you want to delete this client? This will permanently remove the record."
          confirmText="Yes, Delete"
          loading={deleting}
          variant="danger"
        />
      </main>
  );
};

export default ClientManagement;
