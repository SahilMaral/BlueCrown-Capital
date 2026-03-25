import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import UserIcon from '../../components/icons/UserIcon';
import SearchIcon from '../../components/icons/SearchIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import FileIcon from '../../components/icons/FileIcon';
import CloseIcon from '../../components/icons/CloseIcon';
import QuickMasterModal from '../../components/common/QuickMasterModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import EliteStatusModal from '../../components/common/EliteStatusModal';
import { openDocument } from '../../utils/fileUtils';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState(null); // 'Client' or null
  const [editData, setEditData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusConfig, setStatusConfig] = useState({ title: '', message: '', type: 'info' });
  const [docModal, setDocModal] = useState({ show: false, documents: [], clientName: '' });

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
      const msg = err.response?.data?.message || 'Failed to delete client. It might have associated records.';
      setStatusConfig({
        title: 'Deletion Failed',
        message: msg,
        type: 'error'
      });
      setShowStatusModal(true);
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
                  <th style={{ width: '80px', paddingLeft: '32px' }}>Sr. No.</th>
                  <th>Client Name</th>
                  <th>Company</th>
                  <th>Mobile & Email</th>
                  <th style={{ textAlign: 'center' }}>Docs</th>
                  <th>Status</th>
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
                      <td style={{ paddingLeft: '32px', fontWeight: 600 }}>{idx + 1}.</td>
                      <td style={{ fontWeight: 800, color: 'var(--elite-blue)' }}>{c.clientName}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>{c.companyName || 'Individual'}</span>
                          <span style={{ fontSize: '11px', opacity: 0.6 }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 500 }}>{c.mobileNo || 'N/A'}</span>
                          <span style={{ fontSize: '12px', opacity: 0.7 }}>{c.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {c.documents && c.documents.length > 0 ? (
                          <div className="flex justify-center">
                            <div 
                              style={{ 
                                background: 'var(--elite-blue-light)', 
                                color: 'var(--elite-blue)', 
                                padding: '4px 10px', 
                                borderRadius: '10px', 
                                fontSize: '11.5px', 
                                fontWeight: 800, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDocModal({ show: true, documents: c.documents, clientName: c.clientName });
                              }}
                              title="View Documents"
                            >
                              <FileIcon style={{ width: '13px' }} />
                              {c.documents.length}
                            </div>
                          </div>
                        ) : (
                          <span style={{ opacity: 0.4, fontSize: '12px' }}>--</span>
                        )}
                      </td>
                      <td><span className="status-badge completed">Active</span></td>
                      <td>
                        <div className="flex justify-center gap-2">
                          <button 
                            className="btn-action-elite btn-action-edit"
                            title="Edit"
                            onClick={() => handleEditClick(c)}
                          >
                            <PencilIcon className="icon-xs" />
                          </button>
                          <button 
                            className="btn-action-elite btn-action-delete"
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
          message="Are you sure you want to delete this client? This will permanently remove the record and all associated documents."
          confirmText="Yes, Delete"
          loading={deleting}
          variant="danger"
        />

        <EliteStatusModal 
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title={statusConfig.title}
          message={statusConfig.message}
          type={statusConfig.type}
        />

        {/* Documents Modal */}
        {docModal.show && (
          <div className="modal-overlay-elite" onClick={() => setDocModal({ ...docModal, show: false })}>
            <div className="modal-content-elite" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header-elite">
                <div>
                  <h3>Client Documents</h3>
                  <p className="modal-subtitle-elite">{docModal.clientName}</p>
                </div>
                <button className="close-btn-elite" onClick={() => setDocModal({ ...docModal, show: false })}>
                  <CloseIcon style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
              <div className="modal-body-elite">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {docModal.documents.map((doc, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => openDocument(doc)}
                      className="doc-item-hover"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px', 
                        padding: '16px 20px', 
                        background: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '16px', 
                        cursor: 'pointer' 
                      }}
                    >
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        background: '#ffffff', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                      }}>
                        <FileIcon style={{ width: '20px', color: 'var(--elite-blue)' }} />
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.split('/').pop()}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
                          Click to View Document
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer-elite">
                <button className="btn-elite" onClick={() => setDocModal({ ...docModal, show: false })}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
  );
};

export default ClientManagement;
