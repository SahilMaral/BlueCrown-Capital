import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import EmailIcon from '../../components/icons/EmailIcon';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgotpassword`, { email });
      setMessage(res.data.data.message || 'Reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-container">
          <EmailIcon className="auth-logo-icon" />
        </div>

        <div className="auth-header">
          <h2 className="auth-title">Elite Recovery</h2>
          <p className="auth-subtitle">Restore your premier access</p>
        </div>
        
        {error && (
          <div className="auth-error">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {message && (
          <div className="auth-success" style={{ 
            background: 'rgba(34, 197, 94, 0.1)', 
            color: '#16a34a', 
            padding: '12px 16px', 
            borderRadius: '12px', 
            fontSize: '14px', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
             <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {message}
          </div>
        )}
        
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-input-group">
            <label htmlFor="email">Registered Email Address</label>
            <div className="auth-input-wrapper">
              <EmailIcon className="auth-input-icon" />
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button className="auth-button" type="submit" disabled={loading || !email}>
            {loading ? 'Sending Request...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          Remembered your access? <Link to="/login" className="auth-link">Return to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
