import React from 'react';
import './QuickMasterModal.css';
import CloseIcon from '../icons/CloseIcon';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  variant = "danger" // 'danger' or 'primary'
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-elite" onClick={loading ? undefined : onClose}>
      <div className="modal-content-elite" style={{ maxWidth: '480px', borderRadius: '24px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header-elite" style={{ padding: '32px 32px 16px' }}>
          <div>
            <h3 style={{ fontSize: '22px' }}>{title}</h3>
          </div>
          {!loading && <button className="close-btn-elite" onClick={onClose}><CloseIcon /></button>}
        </div>
        <div className="modal-body-elite" style={{ padding: '0 32px 32px' }}>
          <p style={{ color: 'var(--elite-text-secondary)', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
            {message}
          </p>
        </div>
        <div className="modal-footer-elite" style={{ 
          padding: '0 32px 32px', 
          flexDirection: 'row', 
          justifyContent: 'flex-end', 
          gap: '12px' 
        }}>
          <button 
            type="button" 
            className="btn-elite-ghost" 
            onClick={onClose} 
            disabled={loading}
            style={{ 
              flex: 'none', 
              padding: '12px 24px', 
              borderRadius: '12px',
              fontSize: '14px',
              width: 'auto',
              margin: 0
            }}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className={`btn-elite`}
            onClick={onConfirm}
            disabled={loading}
            style={{ 
              flex: 'none', 
              padding: '12px 24px', 
              borderRadius: '12px',
              fontSize: '14px',
              width: 'auto',
              margin: 0,
              backgroundColor: variant === 'danger' ? '#ef4444' : '#3b82f6',
              color: '#ffffff',
              boxShadow: variant === 'danger' ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(59, 130, 246, 0.2)'
            }}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
