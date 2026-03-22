import React from 'react';
import './QuickMasterModal.css';
import CloseIcon from '../icons/CloseIcon';

const EliteStatusModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'success', // 'success', 'error', 'info'
  buttonText = 'Got it'
}) => {
  if (!isOpen) return null;

  const getStatusColor = () => {
    switch(type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const getStatusIcon = () => {
    switch(type) {
      case 'success':
        return (
          <div className="status-icon-wrapper success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="status-icon-wrapper error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        );
      default:
        return (
          <div className="status-icon-wrapper info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="modal-overlay-elite" onClick={onClose} style={{ zIndex: 10001 }}>
      <div 
        className="modal-content-elite" 
        style={{ 
          maxWidth: '400px', 
          borderRadius: '32px', 
          textAlign: 'center',
          padding: '40px 32px' 
        }} 
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="close-btn-elite" 
          onClick={onClose} 
          style={{ position: 'absolute', top: '20px', right: '20px' }}
        >
          <CloseIcon />
        </button>

        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          {getStatusIcon()}
        </div>

        <h3 style={{ 
          fontFamily: 'Outfit, sans-serif', 
          fontSize: '24px', 
          fontWeight: 700, 
          color: '#0f172a',
          marginBottom: '12px' 
        }}>
          {title}
        </h3>

        <p style={{ 
          color: '#64748b', 
          fontSize: '15.5px', 
          lineHeight: '1.6', 
          margin: '0 0 32px 0',
          fontWeight: 500
        }}>
          {message}
        </p>

        <button 
          className="btn-elite" 
          onClick={onClose}
          style={{ 
            background: type === 'error' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            boxShadow: type === 'error' ? '0 8px 20px rgba(239, 68, 68, 0.2)' : '0 8px 20px rgba(37, 99, 235, 0.25)'
          }}
        >
          {buttonText}
        </button>
      </div>

      <style>{`
        .status-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: statusIconPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .status-icon-wrapper svg {
          width: 36px;
          height: 36px;
          color: white;
        }
        .status-icon-wrapper.success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 12px 24px rgba(16, 185, 129, 0.25);
        }
        .status-icon-wrapper.error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 12px 24px rgba(239, 68, 68, 0.25);
        }
        .status-icon-wrapper.info {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 12px 24px rgba(59, 130, 246, 0.25);
        }
        @keyframes statusIconPop {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default EliteStatusModal;
