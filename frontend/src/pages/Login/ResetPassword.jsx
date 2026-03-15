import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import LockIcon from '../../components/icons/LockIcon';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.put(`http://localhost:5000/api/v1/auth/resetpassword/${token}`, { password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Token is invalid or has expired');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo-container">
             <div style={{ color: '#16a34a', fontSize: '40px' }}>✓</div>
          </div>
          <div className="auth-header">
            <h2 className="auth-title">Success!</h2>
            <p className="auth-subtitle">Your password has been reset.</p>
          </div>
          <p style={{ color: 'var(--elite-text-secondary)', marginBottom: '32px' }}>
            Redirecting you to the portal in a few seconds...
          </p>
          <Link to="/login" className="auth-button" style={{ display: 'block', textDecoration: 'none' }}>
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-container">
          <LockIcon className="auth-logo-icon" />
        </div>

        <div className="auth-header">
          <h2 className="auth-title">Security Reset</h2>
          <p className="auth-subtitle">Set your new access credentials</p>
        </div>
        
        {error && (
          <div className="auth-error">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-input-group">
            <label htmlFor="password">New Security Password</label>
            <div className="auth-input-wrapper">
              <LockIcon className="auth-input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={onChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="auth-input-wrapper">
              <LockIcon className="auth-input-icon" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={onChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button className="auth-button" type="submit" disabled={loading || !password || password !== confirmPassword}>
            {loading ? 'Updating Credentials...' : 'Update Password'}
          </button>
        </form>

        <div className="auth-footer">
          Changed your mind? <Link to="/login" className="auth-link">Return to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
