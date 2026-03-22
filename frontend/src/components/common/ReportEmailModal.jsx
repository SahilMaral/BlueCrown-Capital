import React, { useState } from 'react';
import axios from 'axios';
import { generatePDF } from '../../utils/reportUtils';
import './ReportEmailModal.css';

const ReportEmailModal = ({ isOpen, onClose, reportData, reportType, fileName, companyName, headers, body, title, subTitle }) => {
  const [emailData, setEmailData] = useState({
    recipientEmail: '',
    subject: `Report: ${title}`,
    message: `Dear Client,\n\nPlease find the attached ${title} for your reference.\n\nRegards,\n${companyName}`
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Generate PDF Blob
      const pdfBlob = generatePDF({ title, subTitle, companyName, headers, body, fileName });
      const pdfFile = new File([pdfBlob], `${fileName}.pdf`, { type: 'application/pdf' });

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append('recipientEmail', emailData.recipientEmail);
      formData.append('subject', emailData.subject);
      formData.append('message', emailData.message);
      formData.append('reportType', reportType);
      formData.append('reportAttachment', pdfFile);

      // 3. Send via backend
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/reports/email`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      alert('Email sent successfully!');
      onClose();
    } catch (err) {
      console.error('Error sending email', err);
      alert('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content elite-modal">
        <header className="modal-header">
          <h2>Send Report by Email</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>
        <form onSubmit={handleSend} className="email-form">
          <div className="input-field-elite">
            <label>Recipient Email(s)</label>
            <input 
              type="text" 
              placeholder="separate by comma if multiple"
              value={emailData.recipientEmail} 
              onChange={(e) => setEmailData({...emailData, recipientEmail: e.target.value})}
              required 
            />
          </div>
          <div className="input-field-elite">
            <label>Subject</label>
            <input 
              type="text" 
              value={emailData.subject} 
              onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              required 
            />
          </div>
          <div className="input-field-elite">
            <label>Message Body</label>
            <textarea 
              rows="5"
              value={emailData.message} 
              onChange={(e) => setEmailData({...emailData, message: e.target.value})}
              required
            ></textarea>
          </div>
          <div className="attachment-info">
            <span>📎 Attachment: {fileName}.pdf</span>
          </div>
          <footer className="modal-footer">
            <button type="button" className="btn-elite secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-elite" disabled={loading}>
              {loading ? 'Sending...' : 'Send Email'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ReportEmailModal;
