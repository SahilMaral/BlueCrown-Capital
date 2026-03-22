import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import FileIcon from '../../components/icons/FileIcon';
import SearchIcon from '../../components/icons/SearchIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import CalendarIcon from '../../components/icons/CalendarIcon';
import QuickMasterModal from '../../components/common/QuickMasterModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const CounterManagement = () => {
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState(null); // 'Counter' or null
  const [editData, setEditData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const fetchCounters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/counters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCounters(res.data.data);
    } catch (err) {
      console.error('Error fetching counters', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounters();
  }, []);

  const handleEditClick = (counter) => {
    setEditData(counter);
    setModalType('Counter');
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/counters/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteModal({ show: false, id: null });
      fetchCounters();
    } catch (err) {
      console.error('Error deleting counter', err);
      alert('Failed to delete counter.');
    } finally {
      setDeleting(false);
    }
  };

  const handleModalSuccess = () => {
    fetchCounters();
    setModalType(null);
    setEditData(null);
  };

  const filteredCounters = counters.filter(c => 
    c.counterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.prefix?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.financialYear?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="main-content">
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Voucher Counters</h1>
            <p>Configure automated numbering prefixes and sequences.</p>
          </div>
          <div className="header-actions">
            <button className="btn-elite" onClick={() => { setEditData(null); setModalType('Counter'); }}>
              + Add New Counter
            </button>
          </div>
        </header>

        <section className="content-section" style={{ padding: 0 }}>
          <div className="section-header" style={{ padding: '32px 32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Active Series</h2>
            <div className="search-container-elite">
              <SearchIcon className="search-icon-elite" />
              <input 
                type="text" 
                className="search-input-elite" 
                placeholder="Search series..." 
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
                  <th>Counter Type</th>
                  <th>Prefix</th>
                  <th>Next Number</th>
                  <th>Financial Year</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   [1, 2, 3].map((i) => (
                    <tr key={`sk-${i}`}>
                      <td colSpan="7" style={{ padding: '8px 32px' }}>
                        <div className="skeleton-row skeleton" style={{ margin: 0, height: '60px', borderRadius: '12px' }}></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredCounters.map((c, idx) => (
                    <tr key={c._id}>
                      <td style={{ paddingLeft: '32px', fontWeight: 600 }}>{idx + 1}.</td>
                      <td style={{ 
                        fontWeight: 800, 
                        color: 'var(--elite-blue)',
                        textTransform: 'capitalize' 
                      }}>
                        {c.counterName}
                      </td>
                      <td style={{ fontWeight: 700, letterSpacing: '1px' }}>{c.prefix}</td>
                      <td>
                        <span style={{ 
                             background: 'rgba(37, 99, 235, 0.1)', 
                             color: '#2563eb', 
                             padding: '4px 10px', 
                             borderRadius: '8px', 
                             fontWeight: 700 
                        }}>
                            {String(c.countNumber).padStart(4, '0')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CalendarIcon className="icon-xs" />
                            {c.financialYear}
                        </div>
                      </td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
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
                {!loading && filteredCounters.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: 'var(--elite-text-secondary)' }}>
                      No counters configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <QuickMasterModal 
          type="Counter"
          isOpen={modalType === 'Counter'}
          onClose={() => setModalType(null)}
          onSuccess={handleModalSuccess}
          initialData={editData}
        />

        <ConfirmModal 
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false, id: null })}
          onConfirm={handleDelete}
          title="Delete Counter"
          message="Are you sure you want to delete this counter? This will disrupt automated voucher numbering for this series."
          confirmText="Yes, Delete"
          loading={deleting}
          variant="danger"
        />
      </main>
  );
};

export default CounterManagement;
