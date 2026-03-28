import React, { useState } from 'react';
import axios from 'axios';
import UserIcon from '../icons/UserIcon';
import CompanyIcon from '../icons/CompanyIcon';
import BriefcaseIcon from '../icons/BriefcaseIcon';
import BankIcon from '../icons/BankIcon';
import RupeeIcon from '../icons/RupeeIcon';
import MapPinIcon from '../icons/MapPinIcon';
import CloseIcon from '../icons/CloseIcon';
import TrashIcon from '../icons/TrashIcon';
import CalendarIcon from '../icons/CalendarIcon';
import MailIcon from '../icons/MailIcon';
import FileIcon from '../icons/FileIcon';
import ShieldIcon from '../icons/ShieldIcon';
import PhoneIcon from '../icons/PhoneIcon';
import EliteSelect from './EliteSelect';
import EliteStatusModal from './EliteStatusModal';
import ConfirmModal from './ConfirmModal';
import { openDocument } from '../../utils/fileUtils';
import './QuickMasterModal.css';

const FINANCIAL_YEARS = ['2023-24', '2024-25', '2025-26', '2026-27'];

const QuickMasterModal = ({ type, isOpen, onClose, onSuccess, companyId, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusConfig, setStatusConfig] = useState({ title: '', message: '', type: 'info' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);

  // Update form data when initialData changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          yearlyBalances: initialData.yearlyBalances || (type === 'Company' ? initialData.yearlyCashBalances : null) || [
            {
              financialYear: initialData.financialYear || '',
              openingBalance: (type === 'Company' ? initialData.cashOpeningBalance : initialData.openingBalance) || 0
            }
          ]
        });
      } else {
        setFormData({
          isActive: true,
          yearlyBalances: [{ financialYear: '', openingBalance: 0 }]
        });
      }
      setError('');
      if (type === 'Bank' || type === 'User') {
        fetchCompanies();
        if (type === 'User') fetchClients();
      }
    }
  }, [isOpen, initialData, type]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data.data);
    } catch (err) {
      console.error('Error fetching clients', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(res.data.data);
    } catch (err) {
      console.error('Error fetching companies', err);
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleReset = () => {
    setFormData({});
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'Client' ? '/clients' :
        type === 'Company' ? '/companies' :
          type === 'Ledger' ? '/ledgers' :
            type === 'User' ? '/users' :
              type === 'Counter' ? '/counters' : '/banks';

      const payload = { ...formData };
      if (type === 'Ledger' && payload.name) {
        payload.name = payload.name.trim();
      }
      if (type === 'Bank' && payload.bankName) {
        payload.bankName = payload.bankName.trim();
      }
      if (type === 'Company') {
        if (payload.companyName) payload.companyName = payload.companyName.trim();
        if (payload.yearlyBalances) {
          payload.yearlyCashBalances = payload.yearlyBalances.map(b => ({
            financialYear: b.financialYear,
            cashOpeningBalance: (typeof b.openingBalance === 'number' ? b.openingBalance : parseFloat(b.openingBalance)) || 0
          }));
        }
      }
      if (type === 'Client' && payload.clientName) {
        payload.clientName = payload.clientName.trim();
      }

      // Ensure financialYear is set for Bank and Company from the first entry of yearlyBalances
      if ((type === 'Bank' || type === 'Company') && payload.yearlyBalances && payload.yearlyBalances.length > 0) {
        payload.financialYear = payload.yearlyBalances[0].financialYear;
      }

      let res;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Use FormData if files are present
      const hasFiles = (type === 'Client' && (payload.documents instanceof FileList || payload.documents instanceof File)) ||
                      (type === 'User' && payload.photo instanceof File);

      if (hasFiles) {
        const formDataPayload = new FormData();

        // Append all regular fields
        Object.keys(payload).forEach(key => {
          if (key !== 'documents' && key !== 'allFiles' && key !== 'photo' && payload[key] !== undefined && payload[key] !== null) {
            formDataPayload.append(key, payload[key]);
          }
        });

        // Append files
        if (type === 'Client') {
          if (payload.documents instanceof FileList) {
            Array.from(payload.documents).forEach(file => {
              formDataPayload.append('documents', file);
            });
          } else {
            formDataPayload.append('documents', payload.documents);
          }
        } else if (type === 'User' && payload.photo instanceof File) {
          formDataPayload.append('photo', payload.photo);
        }

        if (formData._id) {
          res = await axios.put(`${import.meta.env.VITE_API_URL}${endpoint}/${formData._id}`, formDataPayload, config);
        } else {
          res = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, formDataPayload, config);
        }
      } else {
        // Regular JSON submission
        if (formData._id) {
          res = await axios.put(`${import.meta.env.VITE_API_URL}${endpoint}/${formData._id}`, payload, config);
        } else {
          res = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, payload, config);
        }
      }

      onSuccess(res.data.data);
      onClose();
      setFormData({});
    } catch (err) {
      const msg = err.response?.data?.message || `Error creating ${type}`;
      setError(msg);
      setStatusConfig({
        title: 'Action Failed',
        message: msg,
        type: 'error'
      });
      setShowStatusModal(true);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (type) {
      case 'Company':
        return (
          <div className="modal-grid-elite">
            <div className="auth-input-group">
              <label className="form-label-elite">Company Name</label>
              <div className="auth-input-wrapper">
                <CompanyIcon className="auth-input-icon" />
                <input type="text" name="companyName" className="elite-input-classic" placeholder="Elite Traders Ltd" value={formData.companyName || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Contact No</label>
              <div className="auth-input-wrapper">
                <PhoneIcon className="auth-input-icon" />
                <input type="text" name="contactNo" className="elite-input-classic" placeholder="10 Digit Number" value={formData.contactNo || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="auth-input-group elite-full-width">
              <label className="form-label-elite">Email Address</label>
              <div className="auth-input-wrapper">
                <MailIcon className="auth-input-icon" />
                <input type="email" name="email" className="elite-input-classic" placeholder="company@example.com" value={formData.email || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="auth-input-group elite-full-width">
              <label className="form-label-elite">Office Address</label>
              <div className="auth-input-wrapper">
                <MapPinIcon className="auth-input-icon textarea-icon-elite" />
                <textarea name="address" className="elite-textarea-classic" value={formData.address || ''} onChange={handleInputChange} placeholder="Company Office Address"></textarea>
              </div>
            </div>

            <div className="elite-full-width" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <label className="form-label-elite" style={{ margin: 0 }}>Yearly Cash Balances</label>
                <button
                  type="button"
                  className="btn-elite"
                  style={{ padding: '8px 16px', fontSize: '12px', width: 'auto', borderRadius: '12px', height: '36px' }}
                  onClick={() => {
                    const balances = [...(formData.yearlyBalances || [])];
                    balances.push({ financialYear: '', openingBalance: 0 });
                    setFormData({ ...formData, yearlyBalances: balances });
                  }}
                >
                  + Add Year
                </button>
              </div>

              {(formData.yearlyBalances || []).map((bal, index) => (
                <div key={index} className="modal-grid-elite" style={{ gap: '16px', marginBottom: '16px', background: 'rgba(248, 250, 252, 0.5)', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', position: 'relative' }}>
                  <div className="auth-input-group">
                    <label className="form-label-elite">Financial Year</label>
                    <div className="auth-input-wrapper">
                      <CalendarIcon className="auth-input-icon" />
                      <EliteSelect
                        options={FINANCIAL_YEARS.map(fy => ({ value: fy, label: fy }))}
                        value={bal.financialYear}
                        onChange={(val) => {
                          const balances = [...formData.yearlyBalances];
                          balances[index].financialYear = val;
                          setFormData({ ...formData, yearlyBalances: balances });
                        }}
                        isSearchable={false}
                        placeholder="Select Year"
                      />
                    </div>
                  </div>
                  <div className="auth-input-group">
                    <label className="form-label-elite">Cash Opening Balance</label>
                    <div className="auth-input-wrapper">
                      <RupeeIcon className="auth-input-icon" />
                      <input
                        type="number"
                        className="elite-input-classic"
                        placeholder="0.00"
                        value={bal.openingBalance}
                        onChange={(e) => {
                          const balances = [...formData.yearlyBalances];
                          balances[index].openingBalance = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, yearlyBalances: balances });
                        }}
                      />
                    </div>
                  </div>
                  {formData.yearlyBalances.length > 1 && (
                    <button
                      type="button"
                      className="close-btn-elite"
                      style={{ position: 'absolute', top: '12px', right: '12px', background: '#ffffff', border: '1px solid #fee2e2', color: '#ef4444', width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                      onClick={() => {
                        const balances = formData.yearlyBalances.filter((_, i) => i !== index);
                        setFormData({ ...formData, yearlyBalances: balances });
                      }}
                    >
                      <CloseIcon style={{ width: '14px', height: '14px' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'Client':
        return (
          <div className="modal-grid-elite">
            <div className="auth-input-group">
              <label className="form-label-elite">Client Name</label>
              <div className="auth-input-wrapper">
                <UserIcon className="auth-input-icon" />
                <input type="text" name="clientName" className="elite-input-classic" placeholder="Full Name" value={formData.clientName || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Company Name</label>
              <div className="auth-input-wrapper">
                <BriefcaseIcon className="auth-input-icon" />
                <input type="text" name="companyName" className="elite-input-classic" placeholder="Optional" value={formData.companyName || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Mobile No</label>
              <div className="auth-input-wrapper">
                <PhoneIcon className="auth-input-icon" />
                <input type="text" name="mobileNo" className="elite-input-classic" placeholder="10 Digit Number" value={formData.mobileNo || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Email Address</label>
              <div className="auth-input-wrapper">
                <MailIcon className="auth-input-icon" />
                <input type="email" name="email" className="elite-input-classic" placeholder="client@example.com" value={formData.email || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="auth-input-group elite-full-width">
              <label className="form-label-elite">Physical Address</label>
              <div className="auth-input-wrapper">
                <MapPinIcon className="auth-input-icon textarea-icon-elite" />
                <textarea name="address" className="elite-textarea-classic" value={formData.address || ''} onChange={handleInputChange} placeholder="Residence or Office Address"></textarea>
              </div>
            </div>
            <div className="auth-input-group elite-full-width">
              <label className="form-label-elite">Upload Documents (PDF, Images)</label>
              <div className="auth-input-wrapper">
                <FileIcon className="auth-input-icon" />
                <div className="file-input-container-elite">
                  <span className="file-input-text-elite">
                    {formData.documents instanceof FileList
                      ? `${formData.documents.length} files selected`
                      : (formData.documents?.name || 'Choose documents to upload...')}
                  </span>
                  <input
                    id="documents-file"
                    type="file"
                    name="documents"
                    className="file-input-hidden-elite"
                    onChange={(e) => setFormData({ ...formData, documents: e.target.files })}
                    multiple
                    accept=".pdf,image/*"
                  />
                  <div className="file-input-label-elite">Browse</div>
                </div>
              </div>
            </div>
            {formData._id && formData.documents && Array.isArray(formData.documents) && formData.documents.length > 0 && (
              <div className="elite-full-width" style={{ marginTop: '16px' }}>
                <label className="form-label-elite">Existing Documents</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '8px' }}>
                  {formData.documents.map((doc, idx) => (
                    <div key={idx} className="document-chip-elite" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                      <div
                        onClick={() => openDocument(doc)}
                        style={{ fontSize: '11px', fontWeight: 600, color: 'var(--elite-blue)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px', cursor: 'pointer' }}
                        title="View Document"
                      >
                        {doc.startsWith('data:') ? 'View Document' : doc.split('/').pop()}
                      </div>
                      <button
                        type="button"
                        title="Delete Document"
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }}
                        onClick={() => {
                          setConfirmConfig({
                            title: 'Delete Document',
                            message: 'Are you sure you want to delete this document permanently?',
                            onConfirm: async () => {
                              try {
                                const token = localStorage.getItem('token');
                                await axios.delete(`${import.meta.env.VITE_API_URL}/clients/${formData._id}/documents/${idx}`, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                const updatedDocs = formData.documents.filter((_, i) => i !== idx);
                                setFormData({ ...formData, documents: updatedDocs });
                                setStatusConfig({ title: 'Success', message: 'Document deleted successfully', type: 'success' });
                                setShowStatusModal(true);
                              } catch (error) {
                                setStatusConfig({ title: 'Error', message: 'Failed to delete document', type: 'error' });
                                setShowStatusModal(true);
                              }
                              setShowConfirmModal(false);
                            }
                          });
                          setShowConfirmModal(true);
                        }}
                      >
                        <TrashIcon style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'Ledger':
        return (
          <div className="modal-grid-elite">
            <div className="auth-input-group">
              <label className="form-label-elite">Ledger Name</label>
              <div className="auth-input-wrapper">
                <BriefcaseIcon className="auth-input-icon" />
                <input type="text" name="name" className="elite-input-classic" placeholder="Salary / Rent / Misc" value={formData.name || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Status</label>
              <div className="auth-input-wrapper">
                <ShieldIcon className="auth-input-icon" />
                <EliteSelect
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' }
                  ]}
                  value={formData.isActive === false ? 'false' : 'true'}
                  onChange={(val) => setFormData({ ...formData, isActive: val === 'true' })}
                  placeholder="Select Status"
                  isSearchable={false}
                />
              </div>
            </div>
          </div>
        );
      case 'Bank':
        return (
          <div className="modal-grid-elite">
            <div className="auth-input-group">
              <label className="form-label-elite">Bank Name</label>
              <div className="auth-input-wrapper">
                <BankIcon className="auth-input-icon" />
                <input type="text" name="bankName" className="elite-input-classic" placeholder="State Bank of India" value={formData.bankName || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Account Number</label>
              <div className="auth-input-wrapper">
                <BankIcon className="auth-input-icon" />
                <input type="text" name="accountNumber" className="elite-input-classic" placeholder="XXXX XXXX XXXX" value={formData.accountNumber || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">IFSC Code</label>
              <div className="auth-input-wrapper">
                <ShieldIcon className="auth-input-icon" />
                <input type="text" name="ifscCode" className="elite-input-classic" placeholder="SBIN0001234" value={formData.ifscCode || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Belongs to Company</label>
              <div className="auth-input-wrapper">
                <CompanyIcon className="auth-input-icon" />
                <EliteSelect
                  options={companies.map(c => ({ value: c._id, label: c.companyName }))}
                  value={formData.companyId}
                  onChange={(val) => setFormData({ ...formData, companyId: val })}
                  placeholder="Select Company"
                />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Branch Name</label>
              <div className="auth-input-wrapper">
                <MapPinIcon className="auth-input-icon" />
                <input type="text" name="branch" className="elite-input-classic" placeholder="Optional" value={formData.branch || ''} onChange={handleInputChange} />
              </div>
            </div>

            <div className="elite-full-width" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <label className="form-label-elite" style={{ margin: 0 }}>Yearly Opening Balances</label>
                <button
                  type="button"
                  className="btn-elite"
                  style={{ padding: '8px 16px', fontSize: '12px', width: 'auto', borderRadius: '12px', height: '36px' }}
                  onClick={() => {
                    const balances = [...(formData.yearlyBalances || [])];
                    balances.push({ financialYear: '', openingBalance: 0 });
                    setFormData({ ...formData, yearlyBalances: balances });
                  }}
                >
                  + Add Year
                </button>
              </div>

              {(formData.yearlyBalances || []).map((bal, index) => (
                <div key={index} className="modal-grid-elite" style={{ gap: '16px', marginBottom: '16px', background: 'rgba(248, 250, 252, 0.5)', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', position: 'relative' }}>
                  <div className="auth-input-group">
                    <label className="form-label-elite">Financial Year</label>
                    <div className="auth-input-wrapper">
                      <CalendarIcon className="auth-input-icon" />
                      <EliteSelect
                        options={FINANCIAL_YEARS.map(fy => ({ value: fy, label: fy }))}
                        value={bal.financialYear}
                        onChange={(val) => {
                          const balances = [...formData.yearlyBalances];
                          balances[index].financialYear = val;
                          setFormData({ ...formData, yearlyBalances: balances });
                        }}
                        isSearchable={false}
                        placeholder="Select Year"
                      />
                    </div>
                  </div>
                  <div className="auth-input-group">
                    <label className="form-label-elite">Opening Balance</label>
                    <div className="auth-input-wrapper">
                      <RupeeIcon className="auth-input-icon" />
                      <input
                        type="number"
                        className="elite-input-classic"
                        placeholder="0.00"
                        value={bal.openingBalance}
                        onChange={(e) => {
                          const balances = [...formData.yearlyBalances];
                          balances[index].openingBalance = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, yearlyBalances: balances });
                        }}
                      />
                    </div>
                  </div>
                  {formData.yearlyBalances.length > 1 && (
                    <button
                      type="button"
                      className="close-btn-elite"
                      style={{ position: 'absolute', top: '12px', right: '12px', background: '#ffffff', border: '1px solid #fee2e2', color: '#ef4444', width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                      onClick={() => {
                        const balances = formData.yearlyBalances.filter((_, i) => i !== index);
                        setFormData({ ...formData, yearlyBalances: balances });
                      }}
                    >
                      <CloseIcon style={{ width: '14px', height: '14px' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'User':
        return (
          <div className="modal-grid-elite">
            <div className="auth-input-group">
              <label className="form-label-elite">Full Name</label>
              <div className="auth-input-wrapper">
                <UserIcon className="auth-input-icon" />
                <input type="text" name="name" className="elite-input-classic" placeholder="Your Name" value={formData.name || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Username</label>
              <div className="auth-input-wrapper">
                <UserIcon className="auth-input-icon" />
                <input type="text" name="username" className="elite-input-classic" placeholder="username" value={formData.username || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Email Address</label>
              <div className="auth-input-wrapper">
                <MailIcon className="auth-input-icon" />
                <input type="email" name="email" className="elite-input-classic" placeholder="mail@example.com" value={formData.email || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">{formData._id ? 'New Password (Optional)' : 'Security Password'}</label>
              <div className="auth-input-wrapper">
                <ShieldIcon className="auth-input-icon" />
                <input type="password" name="password" className="elite-input-classic" placeholder="••••••••" value={formData.password || ''} onChange={handleInputChange} required={!formData._id} />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Access Role</label>
              <div className="auth-input-wrapper">
                <ShieldIcon className="auth-input-icon" />
                <EliteSelect
                  options={[
                    { value: 'user', label: 'Standard User' },
                    { value: 'maker', label: 'Maker' },
                    { value: 'checker', label: 'Checker' },
                    { value: 'admin', label: 'Administrator' }
                  ]}
                  value={formData.role || 'user'}
                  onChange={(val) => setFormData({ ...formData, role: val })}
                  placeholder="Select Role"
                  isSearchable={false}
                />
              </div>
            </div>

            {formData.role === 'checker' && (
              <div className="auth-input-group">
                <label className="form-label-elite">Assigned Client</label>
                <div className="auth-input-wrapper">
                  <UserIcon className="auth-input-icon" />
                  <EliteSelect
                    options={clients.map(c => ({ value: c._id, label: c.clientName }))}
                    value={formData.clientId}
                    onChange={(val) => setFormData({ ...formData, clientId: val })}
                    placeholder="Select Client"
                  />
                </div>
              </div>
            )}

            <div className="auth-input-group">
              <label className="form-label-elite">Phone Number</label>
              <div className="auth-input-wrapper">
                <PhoneIcon className="auth-input-icon" />
                <input type="text" name="phone" className="elite-input-classic" placeholder="10 Digit Number" value={formData.phone || ''} onChange={handleInputChange} />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="form-label-elite">Designation</label>
              <div className="auth-input-wrapper">
                <BriefcaseIcon className="auth-input-icon" />
                <input type="text" name="designation" className="elite-input-classic" placeholder="Accountant / Manager" value={formData.designation || ''} onChange={handleInputChange} />
              </div>
            </div>

            <div className="auth-input-group elite-full-width">
              <label className="form-label-elite">Profile Photo</label>
              <div className="auth-input-wrapper">
                <FileIcon className="auth-input-icon" />
                <div className="file-input-container-elite">
                   <span className="file-input-text-elite">
                    {formData.photo instanceof File ? formData.photo.name : (formData.photo ? 'Update Photo...' : 'Choose profile photo...')}
                  </span>
                  <input 
                    type="file" 
                    className="file-input-hidden-elite" 
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, photo: e.target.files[0]})}
                  />
                  <button type="button" className="browse-btn-elite">BROWSE</button>
                </div>
              </div>
              {formData.photo && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #f1f5f9' }}>
                    <img 
                      src={formData.photo instanceof File ? URL.createObjectURL(formData.photo) : (formData.photo?.startsWith('data:') ? formData.photo : `${window.location.origin}/uploads/${formData.photo}`)} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Photo Preview</span>
                </div>
              )}
            </div>
          </div>
        );
      case 'Counter':
        return (
          <div className="modal-grid-elite">
            <div className="auth-input-group">
              <label className="form-label-elite">Counter Type</label>
              <div className="auth-input-wrapper">
                <FileIcon className="auth-input-icon" />
                <EliteSelect
                  options={[
                    { value: 'receipt', label: 'Receipt' },
                    { value: 'payment', label: 'Payment' },
                    { value: 'investment', label: 'Investment' },
                    { value: 'loan', label: 'Loan' }
                  ]}
                  value={formData.counterName}
                  onChange={(val) => setFormData({ ...formData, counterName: val })}
                  placeholder="Select Type"
                  isSearchable={false}
                />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Voucher Prefix</label>
              <div className="auth-input-wrapper">
                <BriefcaseIcon className="auth-input-icon" />
                <input type="text" name="prefix" className="elite-input-classic" placeholder="RCP-" value={formData.prefix || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Starting Number</label>
              <div className="auth-input-wrapper">
                <RupeeIcon className="auth-input-icon" />
                <input type="number" name="countNumber" className="elite-input-classic" placeholder="1" value={formData.countNumber || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Financial Year</label>
              <div className="auth-input-wrapper">
                <CalendarIcon className="auth-input-icon" />
                <EliteSelect
                  options={FINANCIAL_YEARS.map(fy => ({ value: fy, label: fy }))}
                  value={formData.financialYear}
                  onChange={(val) => setFormData({ ...formData, financialYear: val })}
                  placeholder="Select"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getSubTitle = () => {
    switch (type) {
      case 'Bank': return "Register a new account for financial management.";
      case 'Client': return "Add a new client to your management portal.";
      case 'Company': return "Establish a new company entity for accounting.";
      case 'Ledger': return "Create a new head of account for tracking.";
      case 'User': return "Grant portal access to a new team member.";
      case 'Counter': return "Configure automated numbering series for vouchers.";
      default: return "";
    }
  };

  return (
    <div className="modal-overlay-elite" onClick={onClose}>
      <div className="modal-content-elite" onClick={e => e.stopPropagation()}>
        <div className="modal-header-elite">
          <div>
            <h3>{formData._id ? 'Edit' : 'Add'} {type === 'Bank' ? 'Bank Account' : (type === 'Client' ? 'Client' : `New ${type}`)}</h3>
            <p className="modal-subtitle-elite">{getSubTitle()}</p>
          </div>
          <button className="close-btn-elite" onClick={onClose}><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body-elite">
            {renderForm()}
          </div>
          <div className="modal-footer-elite">
            <button type="submit" className="btn-elite" disabled={loading}>
              {loading ? 'Saving...' : (formData._id ? 'Update Record' : (type === 'Bank' ? 'Register Account' : 'Save Record'))}
            </button>
            {type !== 'Bank' && (
              <div className="footer-actions-secondary">
                <button type="button" className="btn-elite-ghost btn-elite-danger" onClick={handleReset}>Reset</button>
                <button type="button" className="btn-elite-ghost" onClick={onClose}>Cancel</button>
              </div>
            )}
          </div>
        </form>
      </div>

      <EliteStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={statusConfig.title}
        message={statusConfig.message}
        type={statusConfig.type}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />
    </div>
  );
};

export default QuickMasterModal;
