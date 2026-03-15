import React, { useState } from 'react';
import axios from 'axios';
import UserIcon from '../icons/UserIcon';
import CompanyIcon from '../icons/CompanyIcon';
import BriefcaseIcon from '../icons/BriefcaseIcon';
import BankIcon from '../icons/BankIcon';
import RupeeIcon from '../icons/RupeeIcon';
import MapPinIcon from '../icons/MapPinIcon';
import CloseIcon from '../icons/CloseIcon';
import CalendarIcon from '../icons/CalendarIcon';
import MailIcon from '../icons/MailIcon';
import FileIcon from '../icons/FileIcon';
import ShieldIcon from '../icons/ShieldIcon';
import PhoneIcon from '../icons/PhoneIcon';
import './QuickMasterModal.css';

const FINANCIAL_YEARS = ['2023-24', '2024-25', '2025-26', '2026-27'];

const QuickMasterModal = ({ type, isOpen, onClose, onSuccess, companyId, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);

  // Update form data when initialData changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
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
      const res = await axios.get('http://localhost:5000/api/v1/clients', {
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
      const res = await axios.get('http://localhost:5000/api/v1/companies', {
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

      let res;
      if (formData._id) {
        // Edit Mode
        res = await axios.put(`http://localhost:5000/api/v1${endpoint}/${formData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create Mode
        res = await axios.post(`http://localhost:5000/api/v1${endpoint}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      onSuccess(res.data.data);
      onClose();
      setFormData({});
    } catch (err) {
      setError(err.response?.data?.message || `Error creating ${type}`);
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
              <label className="form-label-elite">Cash Opening Balance</label>
              <div className="auth-input-wrapper">
                <RupeeIcon className="auth-input-icon" />
                <input type="number" name="cashOpeningBalance" className="elite-input-classic" placeholder="0.00" value={formData.cashOpeningBalance || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Financial Year</label>
              <div className="auth-input-wrapper">
                <CalendarIcon className="auth-input-icon" />
                <select name="financialYear" className="elite-select-classic" value={formData.financialYear || ''} onChange={handleInputChange} style={{ color: '#0f172a' }} required>
                  <option value="">-- Select --</option>
                  {FINANCIAL_YEARS.map(fy => <option key={fy} value={fy}>{fy}</option>)}
                </select>
              </div>
            </div>
            <div className="auth-input-group elite-full-width">
              <label className="form-label-elite">Address</label>
              <div className="auth-input-wrapper">
                <MapPinIcon className="auth-input-icon" style={{ top: '24px' }} />
                <textarea name="address" className="elite-textarea-classic" style={{ paddingLeft: '48px' }} value={formData.address || ''} onChange={handleInputChange} placeholder="Company Office Address"></textarea>
              </div>
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
              <label className="form-label-elite">Company Name (Optional)</label>
              <div className="auth-input-wrapper">
                <CompanyIcon className="auth-input-icon" />
                <input type="text" name="companyName" className="elite-input-classic" placeholder="Business Name" value={formData.companyName || ''} onChange={handleInputChange} />
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
              <label className="form-label-elite">Email</label>
              <div className="auth-input-wrapper">
                <MailIcon className="auth-input-icon" />
                <input type="email" name="email" className="elite-input-classic" placeholder="email@example.com" value={formData.email || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="auth-input-group elite-full-width">
              <label className="form-label-elite">Address</label>
              <div className="auth-input-wrapper">
                <MapPinIcon className="auth-input-icon" style={{ top: '24px' }} />
                <textarea name="address" className="elite-textarea-classic" style={{ paddingLeft: '48px' }} value={formData.address || ''} onChange={handleInputChange} placeholder="Client Residence Address"></textarea>
              </div>
            </div>
            <div className="auth-input-group elite-full-width">
              <label className="form-label-elite">Documents (PDF, Images Only)</label>
              <div className="auth-input-wrapper file-input-wrapper-elite">
                <FileIcon className="auth-input-icon" />
                <label htmlFor="documents-file" className="file-input-label-elite">
                  <span className="file-name-text">
                    {formData.documents ? (typeof formData.documents === 'string' ? formData.documents : formData.documents.name) : 'Choose File (PDF, Images)'}
                  </span>
                  <span className="file-browse-btn">Browse</span>
                </label>
                <input 
                  id="documents-file"
                  type="file" 
                  name="documents" 
                  className="hidden-file-input"
                  onChange={handleInputChange} 
                  accept=".pdf,image/*" 
                />
              </div>
            </div>
          </div>
        );
      case 'Ledger':
        return (
          <div className="auth-input-group">
            <label className="form-label-elite">Ledger Name</label>
            <div className="auth-input-wrapper">
              <BriefcaseIcon className="auth-input-icon" />
              <input type="text" name="name" className="elite-input-classic" placeholder="Salary / Rent / Misc" value={formData.name || ''} onChange={handleInputChange} required />
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
              <label className="form-label-elite">Opening Balance</label>
              <div className="auth-input-wrapper">
                <RupeeIcon className="auth-input-icon" />
                <input type="text" name="openingBalance" className="elite-input-classic" placeholder="₹0.00" value={formData.openingBalance || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Belongs to Company</label>
              <div className="auth-input-wrapper">
                <CompanyIcon className="auth-input-icon" />
                <select name="companyId" className="elite-select-classic" value={formData.companyId || ''} onChange={handleInputChange} style={{ color: '#0f172a' }} required>
                  <option value="">-- Select Company --</option>
                  {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
                </select>
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Financial Year</label>
              <div className="auth-input-wrapper">
                <CalendarIcon className="auth-input-icon" />
                <select name="financialYear" className="elite-select-classic" value={formData.financialYear || ''} onChange={handleInputChange} style={{ color: '#0f172a' }} required>
                  <option value="">-- Select FY --</option>
                  {FINANCIAL_YEARS.map(fy => <option key={fy} value={fy}>{fy}</option>)}
                </select>
              </div>
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
                <input type="text" name="name" className="elite-input-classic" placeholder="John Doe" value={formData.name || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Username</label>
              <div className="auth-input-wrapper">
                <UserIcon className="auth-input-icon" />
                <input type="text" name="username" className="elite-input-classic" placeholder="johndoe" value={formData.username || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="form-label-elite">Email Address</label>
              <div className="auth-input-wrapper">
                <MailIcon className="auth-input-icon" />
                <input type="email" name="email" className="elite-input-classic" placeholder="john@example.com" value={formData.email || ''} onChange={handleInputChange} required />
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
                <select name="role" className="elite-select-classic" value={formData.role || 'user'} onChange={handleInputChange} style={{ color: '#0f172a' }} required>
                  <option value="user">Standard User</option>
                  <option value="maker">Maker</option>
                  <option value="checker">Checker</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            {formData.role === 'checker' && (
              <div className="auth-input-group">
                <label className="form-label-elite">Assigned Client</label>
                <div className="auth-input-wrapper">
                  <UserIcon className="auth-input-icon" />
                  <select name="clientId" className="elite-select-classic" value={formData.clientId || ''} onChange={handleInputChange} style={{ color: '#0f172a' }} required>
                    <option value="">-- Select Client --</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
                  </select>
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
          </div>
        );
      case 'Counter':
        return (
          <div className="modal-grid-elite">
            <div className="auth-input-group">
              <label className="form-label-elite">Counter Type</label>
              <div className="auth-input-wrapper">
                <FileIcon className="auth-input-icon" />
                <select name="counterName" className="elite-select-classic" value={formData.counterName || ''} onChange={handleInputChange} style={{ color: '#0f172a' }} required>
                  <option value="">-- Select Type --</option>
                  <option value="receipt">Receipt</option>
                  <option value="payment">Payment</option>
                  <option value="investment">Investment</option>
                  <option value="loan">Loan</option>
                </select>
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
                <select name="financialYear" className="elite-select-classic" value={formData.financialYear || ''} onChange={handleInputChange} style={{ color: '#0f172a' }} required>
                  <option value="">-- Select --</option>
                  {FINANCIAL_YEARS.map(fy => <option key={fy} value={fy}>{fy}</option>)}
                </select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getSubTitle = () => {
    switch(type) {
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
          {error && <p className="error-text-elite">{error}</p>}
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
    </div>
  );
};

export default QuickMasterModal;
