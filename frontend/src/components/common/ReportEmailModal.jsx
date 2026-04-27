import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { generatePDF } from '../../utils/reportUtils';
import { X, Mail, FileText, Send, Paperclip, Info, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import './ReportEmailModal.css';

const ReportEmailModal = ({ isOpen, onClose, reportData, reportType, fileName, companyName, headers, body, title, subTitle, defaultEmail }) => {
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [emailData, setEmailData] = useState({
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state when props change or modal opens
  useEffect(() => {
    if (isOpen && title) {
      setEmailData({
        subject: `Report: ${title}`,
        message: `Dear Client,\n\nPlease find the attached ${title} for your reference.\n\nRegards,\n${companyName || 'BlueCrown Capital'}`
      });
      
      const initialEmails = defaultEmail ? defaultEmail.split(',').map(e => e.trim()).filter(Boolean) : [];
      setEmails(initialEmails);
      setEmailInput('');
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen, title, companyName, defaultEmail]);

  if (!isOpen) return null;

  const handleEmailInput = (e) => {
    const val = e.target.value;
    if (val.endsWith(',') || val.endsWith(' ')) {
      const email = val.slice(0, -1).trim();
      if (email && !emails.includes(email)) {
        setEmails([...emails, email]);
      }
      setEmailInput('');
    } else {
      setEmailInput(val);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const email = emailInput.trim();
      if (email && !emails.includes(email)) {
        setEmails([...emails, email]);
      }
      setEmailInput('');
    } else if (e.key === 'Backspace' && !emailInput && emails.length > 0) {
      setEmails(emails.slice(0, -1));
    }
  };

  const removeEmail = (index) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const allEmails = [...emails];
    if (emailInput.trim()) allEmails.push(emailInput.trim());
    
    if (allEmails.length === 0) {
      setErrorMessage('Please provide at least one recipient email.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMessage('');
    
    try {
      const pdfBlob = generatePDF({ title, subTitle, companyName, headers, body, fileName });
      
      const formData = new FormData();
      formData.append('recipientEmail', allEmails.join(','));
      formData.append('subject', emailData.subject);
      formData.append('message', emailData.message);
      formData.append('reportType', reportType);
      formData.append('reportAttachment', pdfBlob, `${fileName}.pdf`);

      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/reports/email`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setStatus('success');
    } catch (err) {
      console.error('Error sending email', err);
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to send email. Please check your connection or recipient address.');
    }
  };

  const isSending = status === 'sending';
  const isSuccess = status === 'success';

  if (isSuccess) {
    return (
      <div className="modal-overlay">
        <div className="modal-content elite-modal email-modal-premium success-view">
          <div className="success-content">
            <div className="success-icon-wrapper">
              <CheckCircle size={64} className="checkmark-icon" />
            </div>
            <h2>Email Sent Successfully!</h2>
            <p>The report has been dispatched to <strong>{emails.join(', ') || emailInput}</strong>.</p>
            
            <div className="success-details-card">
              <div className="detail-item">
                <FileText size={16} />
                <span>{fileName}.pdf</span>
              </div>
            </div>

            <button className="btn-elite primary-glow large-btn" onClick={onClose}>
              <ArrowLeft size={18} /> Back to Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content elite-modal email-modal-premium">
        <header className="modal-header">
          <div className="header-title-group">
            <div className="header-icon-pill">
              <Mail size={20} />
            </div>
            <div>
              <h2>Email Report</h2>
              <p className="subtitle">Securely send financial statements</p>
            </div>
          </div>
          <button className="close-btn-elite" onClick={onClose} disabled={isSending}>
            <X size={20} />
          </button>
        </header>

        {status === 'error' && (
          <div className="error-banner-elite">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="email-form-elite">
          <div className="input-field-elite auth-input-group">
            <label>Recipient Email(s)</label>
            <div className="auth-input-wrapper email-chip-container">
              <Mail className="auth-input-icon" size={18} />
              <div className="chips-wrapper">
                {emails.map((email, idx) => (
                  <div key={idx} className="email-chip">
                    <span>{email}</span>
                    {!isSending && (
                      <button type="button" onClick={() => removeEmail(idx)} className="remove-chip">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
                <input 
                  type="text" 
                  placeholder={emails.length === 0 ? "recipient@example.com" : ""}
                  value={emailInput} 
                  onChange={handleEmailInput}
                  onKeyDown={handleKeyDown}
                  className="chip-input"
                  disabled={isSending}
                />
              </div>
            </div>
            <span className="input-hint"><Info size={12} /> Press Enter or Comma to add multiple recipients</span>
          </div>

          <div className="input-field-elite auth-input-group">
            <label>Subject</label>
            <div className="auth-input-wrapper">
              <FileText className="auth-input-icon" size={18} />
              <input 
                type="text" 
                value={emailData.subject} 
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                className="elite-input-classic"
                disabled={isSending}
                required 
              />
            </div>
          </div>

          <div className="input-field-elite auth-input-group">
            <label>Message Body</label>
            <div className="auth-input-wrapper textarea-wrapper">
              <textarea 
                rows="5"
                value={emailData.message} 
                onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                className="elite-input-classic elite-textarea"
                disabled={isSending}
                required
              ></textarea>
            </div>
          </div>

          <div className="attachment-pill-elite">
            <div className="attachment-icon">
              <Paperclip size={16} />
            </div>
            <div className="attachment-details">
              <span className="file-name">{fileName}.pdf</span>
              <span className="file-type">Portable Document Format</span>
            </div>
          </div>

          <footer className="modal-footer-elite">
            <button type="button" className="btn-elite secondary" onClick={onClose} disabled={isSending}>
              Discard
            </button>
            <button type="submit" className="btn-elite primary-glow" disabled={isSending}>
              {isSending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send size={18} /> Send Statement
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ReportEmailModal;
