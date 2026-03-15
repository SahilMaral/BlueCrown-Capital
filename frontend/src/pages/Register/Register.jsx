import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import '../Login/Auth.css';
import UserIcon from '../../components/icons/UserIcon';
import EmailIcon from '../../components/icons/EmailIcon';
import LockIcon from '../../components/icons/LockIcon';
import ShieldIcon from '../../components/icons/ShieldIcon';
import LogoIcon from '../../components/icons/LogoIcon';

const Register = () => {
  useDocumentTitle('Register');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const { username, email, password, confirmPassword } = formData;
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const validateForm = () => {
    let errors = {};
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordPattern.test(password)) {
      errors.password = 'Password must be at least 8 characters long, contain an uppercase, lowercase, number, and special character.';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
    // Clear validation error when user types
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(registerUser({ username, email, password }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-container">
          <LogoIcon className="auth-logo-icon" />
        </div>

        <div className="auth-header">
          <h2 className="auth-title">BlueCrown Capital</h2>
          <p className="auth-subtitle">Establish Your Premier Membership</p>
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
            <label htmlFor="username">Elite Access Tag (Username)</label>
            <div className="auth-input-wrapper">
              {isLoading ? (
                <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
              ) : (
                <>
                  <UserIcon className="auth-input-icon" />
                  <input
                    type="text"
                    id="username"
                    placeholder="Unique identifier"
                    name="username"
                    value={username}
                    onChange={onChange}
                    required
                  />
                </>
              )}
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="email">Email Address</label>
            <div className="auth-input-wrapper">
              {isLoading ? (
                <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
              ) : (
                <>
                  <EmailIcon className="auth-input-icon" />
                  <input
                    type="email"
                    id="email"
                    placeholder="wealth@bluecrown.com"
                    name="email"
                    value={email}
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
                    placeholder="Create strong password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                  />
                </>
              )}
            </div>
            {validationErrors.password && <div className="auth-validation-error">{validationErrors.password}</div>}
          </div>

          <div className="auth-input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="auth-input-wrapper">
              {isLoading ? (
                <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
              ) : (
                <>
                  <ShieldIcon className="auth-input-icon" />
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Verify password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={onChange}
                    required
                  />
                </>
              )}
            </div>
            {validationErrors.confirmPassword && <div className="auth-validation-error">{validationErrors.confirmPassword}</div>}
          </div>

          {isLoading ? (
            <div className="skeleton skeleton-text" style={{ width: '100%', height: '48px', borderRadius: '12px', marginTop: '32px' }}></div>
          ) : (
            <button className="auth-button" type="submit" disabled={isLoading}>
              Establish Account
            </button>
          )}
        </form>

        <div className="auth-footer">
          Already a Member? <Link to="/login" className="auth-link">Login Access</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
