import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard/Dashboard.css';
import UserIcon from '../../components/icons/UserIcon';
import SearchIcon from '../../components/icons/SearchIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import ShieldIcon from '../../components/icons/ShieldIcon';
import QuickMasterModal from '../../components/common/QuickMasterModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState(null); // 'User' or null
  const [editData, setEditData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/v1/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setEditData(user);
    setModalType('User');
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/v1/users/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteModal({ show: false, id: null });
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user', err);
      alert('Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleBlock = async (user) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/v1/users/${user._id}/toggle-block`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error('Error toggling block status', err);
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleModalSuccess = () => {
    fetchUsers();
    setModalType(null);
    setEditData(null);
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="main-content">
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>User Management</h1>
            <p>Control portal access and user permissions.</p>
          </div>
          <div className="header-actions">
            <button className="btn-elite" onClick={() => { setEditData(null); setModalType('User'); }}>
              + Register New User
            </button>
          </div>
        </header>

        <section className="content-section" style={{ padding: 0 }}>
          <div className="section-header" style={{ padding: '32px 32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>System Users</h2>
            <div className="search-container-elite">
              <SearchIcon className="search-icon-elite" />
              <input 
                type="text" 
                className="search-input-elite" 
                placeholder="Find a user..." 
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
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Designation</th>
                  <th>Role</th>
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
                  filteredUsers.map((u, idx) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{idx + 1}.</td>
                      <td style={{ fontWeight: 800, color: 'var(--elite-blue)' }}>{u.name || `User (${u.username})`}</td>
                      <td>@{u.username}</td>
                      <td style={{ opacity: 0.8 }}>{u.email}</td>
                      <td style={{ fontWeight: 600 }}>{u.designation || '-'}</td>
                      <td>
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          color: u.role === 'admin' ? '#ef4444' : (u.role === 'maker' ? '#8b5cf6' : '#2563eb'),
                          fontWeight: 700,
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          <ShieldIcon className="icon-xs" />
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleToggleBlock(u)}
                          style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                          title={u.isActive ? "Block User" : "Unblock User"}
                        >
                          <span className={`status-badge ${u.isActive ? 'completed' : 'cancelled'}`}>
                              {u.isActive ? 'Active' : 'Blocked'}
                          </span>
                        </button>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            className="btn-elite-icon"
                            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Edit"
                            onClick={() => handleEditClick(u)}
                          >
                            <PencilIcon className="icon-xs" />
                          </button>
                          <button 
                            className="btn-elite-icon"
                            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Delete"
                            onClick={() => setDeleteModal({ show: true, id: u._id })}
                          >
                            <TrashIcon className="icon-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ padding: '60px', textAlign: 'center', color: 'var(--elite-text-secondary)' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <QuickMasterModal 
          type="User"
          isOpen={modalType === 'User'}
          onClose={() => setModalType(null)}
          onSuccess={handleModalSuccess}
          initialData={editData}
        />

        <ConfirmModal 
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false, id: null })}
          onConfirm={handleDelete}
          title="Delete User"
          message="Are you sure you want to delete this user? This will revoke their access to the portal permanently."
          confirmText="Yes, Delete"
          loading={deleting}
          variant="danger"
        />
      </main>
  );
};

export default UserManagement;
