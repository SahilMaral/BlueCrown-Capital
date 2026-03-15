import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import UserIcon from '../../components/icons/UserIcon';
import LockIcon from '../../components/icons/LockIcon';
import LogoIcon from '../../components/icons/LogoIcon';

const Login = () => {
  useDocumentTitle('Login');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const { username, password } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    // Clear errors on mount
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-container">
          <LogoIcon className="auth-logo-icon" />
        </div>

        <div className="auth-header">
          <h2 className="auth-title">BlueCrown Capital</h2>
          <p className="auth-subtitle">Premier Wealth Portal Access</p>
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
            <label htmlFor="username">Elite Access Tag / Username</label>
            <div className="auth-input-wrapper">
              {isLoading ? (
                <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
              ) : (
                <>
                  <UserIcon className="auth-input-icon" />
                  <input
                    type="text"
                    id="username"
                    placeholder="Enter your username"
                    name="username"
                    value={formData.username || ''}
                    onChange={onChange}
                    required
                  />
                </>
              )}
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">Security Password</label>
            <div className="auth-input-wrapper">
              {isLoading ? (
                <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
              ) : (
                <>
                  <LockIcon className="auth-input-icon" />
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                  />
                </>
              )}
            </div>
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <Link to="/forgot-password" style={{ color: 'var(--elite-blue)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="skeleton skeleton-text" style={{ width: '100%', height: '48px', borderRadius: '12px', marginTop: '32px' }}></div>
          ) : (
            <button className="auth-button" type="submit" disabled={isLoading}>
              Access Portal
            </button>
          )}
        </form>

        <div className="auth-footer">
          New to the Elite? <Link to="/register" className="auth-link">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
